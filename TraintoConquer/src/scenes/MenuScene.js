import CoinDisplay from "../componets/CoinDisplay";
import ExpBar from "../componets/ExpBar";
import ExpFloatingText from "../componets/ExpFloatingText";
import { fetchPlayerData, updatePlayerData, handlePlayerAction, getTelegramID } from "../apiService.js";
import { EnergyBar } from "../componets/EnergyBar.js";
import preloadAssets from "../componets/Preload.js";
import { createPlayerAnimations } from "./utils/animationUtils.js";
import Button from "../componets/Button.js";
import Background from "../componets/Background.js";


export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "MenuScene" });
    this.token = null; // Definimos el token como una propiedad de la clase
  }

  preload() {
    preloadAssets(this);
  }

  async create() {
    this.bgComponent = new Background(this, 'background');  // 'background' es la clave de la imagen
    this.bgComponent.create();  // Crear el fondo


    await this.validateTokenAndLoadPlayerData();

    // Crear el botón gráfico

    this.boton = new Button(this, this.scale.width / 2, this.scale.height / 2, 100, 0xffffff, this.onButtonClick.bind(this));
    this.boton.drawButton(0xffffff, 1);

    // Crear animaciones
    this.createanis = createPlayerAnimations(this);

    // Crear personaje
    this.player = this.add
      .sprite(this.scale.width / 2, this.scale.height / 2 + 40, "slash")
      .setScale(2.5)
      .setDepth(1)
      .play("walk");

  }


  async validateTokenAndLoadPlayerData() {
    try {
      let token = this.getTokenFromUrl() || this.getTokenFromStorage();

      if (!token) {
        token = await this.getTokenFromInitData();
      }

      if (!token) {
        console.warn("⚠️ No se recibió un Token.");
        return this.redirectToErrorScene();
      }

      let playerData = await this.fetchPlayerDataWithToken(token);

      if (!playerData) {
        console.warn("⛔ Token expirado o inválido. Intentando refrescar...");
        token = await this.refreshAccessToken(this.getRefreshToken());

        if (!token) return this.redirectToErrorScene();

        playerData = await this.fetchPlayerDataWithToken(token);
        if (!playerData) return this.redirectToErrorScene();
      }

      this.loadPlayerData(playerData);

    } catch (error) {
      console.error("❌ Error general:", error);
      this.redirectToErrorScene();
    }
  }

  getTokenFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    if (token) this.setToken(token);
    return token;
  }

  getTokenFromStorage() {
    return localStorage.getItem("accessToken");
  }

  getTokenFromInitData() {
    if (!window.Telegram?.WebApp?.initData) return null;

    const initData = new URLSearchParams(window.Telegram.WebApp.initData);
    const telegramId = JSON.parse(initData.get("user") || "{}").id;

    if (!telegramId) return null;

    return fetch("/api/validate-id", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telegramId }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.token) {
          this.setToken(data.token);
          this.setRefreshToken(data.refreshToken);
          return data.token;
        }
        return null;
      });
  }

  fetchPlayerDataWithToken(token) {
    return fetchPlayerData(token);
  }

  refreshAccessToken(refreshToken) {
    return fetch("/api/refresh-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.token) {
          this.setToken(data.token);
          return data.token;
        }
        return null;
      });
  }

  redirectToErrorScene() {
    this.scene.start("ErrorScene");
  }

  loadPlayerData(playerData) {
    this.currentExp = playerData.exp;
    this.currentLevel = playerData.level;
    this.coins = playerData.coins;
    this.currentenergy = playerData.energy;
    console.log(playerData);
    this.scene.launch("UIManager", { level: playerData.level });
    this.coinDisplay = new CoinDisplay(this, 50, this.coins);
    this.expBar = new ExpBar(
      this,
      this.cameras.main.centerX,
      this.cameras.main.centerY + 195,
      playerData.exp,
      playerData.level
    );

    this.energyBar = new EnergyBar(this, playerData.level, playerData.energy,);

  }


  // Función para obtener el token
  getToken() {
    return this.token;
  }

  // Función para actualizar el token
  setToken(newToken) {
    this.token = newToken;
  }

  async processPlayerAction(telegramId) {
    // Guardar el telegramId en la instancia de la clase
    const response = await handlePlayerAction(telegramId);

    if (response) {
      const { totalExp, totalCoins, totalEnergy, newLevel, leveledUp, expEarned, coinsEarned } = response;
      new ExpFloatingText(this, this.player.x, this.player.y - 20, expEarned);
      console.log("este es el total de energis " + totalEnergy);
      this.energyBar.setEnergy(totalEnergy);
      this.expBar.updateExp(totalExp, newLevel);
      if (this.player.level <= newLevel) {
        // Resta lo que sobró en vez de resetear a 0
        this.events.emit("playerLevelUp", newLevel);

        this.playLevelUpEffect(this.currentLevel);
        this.coinDisplay.updateAmount(totalCoins);
      }

    }
  }


  async onButtonClick() {
    this.player.stop();
    const anim = this.createanis.atackanis();
    this.player.play(anim);
    this.processPlayerAction(await getTelegramID(this.getToken()));
    this.boton.drawButton(0x002200, 0.9);

    this.player.once("animationcomplete", () => {
      this.boton.drawButton(0xffffff, 1);
      this.player.play("walk");
    });
  }












  playLevelUpEffect(newLevel) {
    // Crear el sistema de partículas
    const particles = this.add.particles(
      this.player.x,
      this.player.y,
      "particle_star",
      {
        speed: { min: 50, max: 150 }, // Ajusta la velocidad para que no sea tan brusco
        lifespan: 800, // Duración más corta para un efecto más limpio
        scale: { start: 0.8, end: 0 }, // Hace que se desvanezcan suavemente
        gravityY: -50, // Eleva ligeramente las partículas
        quantity: 10, // Menos partículas para que no se vea sobrecargado
        tint: [0xffd700, 0xffa500, 0xffff00], // Colores dorados para el efecto de nivel
        blendMode: "ADD",
        emitting: true, // Ahora se maneja con `emitting` en Phaser 3.60+
      }
    );
    console.log("este es el new level  " + newLevel);
    // Apagar partículas después de 1 segundo
    this.time.delayedCall(1000, () => {
      particles.destroy();
    });
    let centerX = this.cameras.main.centerX;
    let centerY = this.cameras.main.centerY;

    // Crear la imagen del badge (inicialmente transparente)
    let badge = this.add
      .image(centerX, centerY, "levelUpBadge")
      .setScale(0.5)
      .setAlpha(1);
    badge.setVisible(true); // Asegúrate de que sea visible al crearla
    console.log("Badge creado:", badge); // Esto imprimirá el objeto de la imagen
    // Crear el texto del nivel
    let levelText = this.add
      .text(0, 30, newLevel, {
        fontSize: "80px",
        fontStyle: "bold",
        color: "#fff",
        stroke: "#000",
        strokeThickness: 8,
        align: "center",
      })
      .setOrigin(0.5)
      .setAlpha(0);

    // Crear un contenedor y agregar la imagen + texto
    let levelUpContainer = this.add.container(centerX, centerY, [
      badge,
      levelText,
    ]);
    levelUpContainer.setScale(1);
    levelUpContainer.setAlpha(1);
    levelUpContainer.setPosition(centerX, centerY);
    // Animación de aparición y crecimiento

    // Mantén la posición de inicio del contenedor y solo cambia la escala y opacidad
    this.tweens.add({
      targets: levelUpContainer,
      alpha: 1,
      scale: 1.2,
      duration: 800,
      ease: "Power2",
      onStart: () => {
        console.log("Animación de LevelUp comenzada");
      },
      onComplete: () => {
        console.log("Animación de LevelUp completada");

        // Mantener en pantalla unos segundos
        this.time.delayedCall(1000, () => {
          // Desvanecer lentamente
          this.tweens.add({
            targets: levelUpContainer,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
              console.log("El contenedor ha desaparecido");
              levelUpContainer.destroy();
            },
          });
        });
      },
    });
  }


}
