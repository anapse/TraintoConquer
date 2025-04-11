import CoinDisplay from "../componets/CoinDisplay";
import ExpBar from "../componets/ExpBar";
import ExpFloatingText from "../componets/ExpFloatingText";
import { fetchPlayerData, updatePlayerData } from "../apiService.js";
import { EnergyBar } from "../componets/EnergyBar.js";


export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "MenuScene" });
    this.token = null; // Definimos el token como una propiedad de la clase
  }

  preload() {
    this.load.image("background", "assets/backgrounds/menu.png");
    this.load.image("coin", "assets/coin.png");
    this.load.image("bg_inventario", "assets/backgrounds/bg_inventario.png");
    this.load.image("particle_star", "assets/particle_star.png");
    this.load.image("levelUpBadge", "assets/lvlup.png");
    this.load.image('expicon', 'assets/exp_icon.png');
    this.load.image('lightning', 'assets/rayito.png');  // Cargar el ícono del rayo
    this.load.spritesheet("slash", "assets/anis/slash_oversize.png", {
      frameWidth: 192,
      frameHeight: 192,
    });
    this.load.spritesheet(
      "slash_reverse",
      "assets/anis/slash_reverse_oversize.png",
      {
        frameWidth: 192,
        frameHeight: 192,
      }
    );
    this.load.spritesheet("thrust", "assets/anis/thrust_oversize.png", {
      frameWidth: 192,
      frameHeight: 192,
    });
    this.load.spritesheet("walk", "assets/anis/walk.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
  }

  async create() {
    this.bg = this.add
      .image(this.scale.width / 2, this.scale.height / 2, "background")
      .setOrigin(0.5);
    await this.validateTokenAndLoadPlayerData();


    // Ajustar el fondo a la pantalla sin deformarlo
    const scaleX = this.scale.width / this.bg.width;
    const scaleY = this.scale.height / this.bg.height;
    const scale = Math.max(scaleX, scaleY);
    this.bg.setScale(scale);

    this.energyBar = new EnergyBar(this, this.scale.width / 2 - 90, 550, 180, 20);

    function update(time, delta) {
      // Actualizar la barra de energía
      energyBar.update(delta);
    }


    // Crear el botón gráfico
    this.buttonGraphics = this.add.graphics();

    // Dibujar el botón
    this.drawButton();

    // Agregar interacción invisible sobre el botón
    this.buttonArea = this.add
      .circle(this.scale.width / 2, this.scale.height / 2, 100, 0xffffff, 0)
      .setInteractive({ useHandCursor: true });

    // Crear animaciones
    this.createAnimations();

    // Crear personaje
    this.player = this.add
      .sprite(this.scale.width / 2, this.scale.height / 2 + 40, "slash")
      .setScale(2.5)
      .setDepth(1)
      .play("walk");

    // Manejo de eventos
    this.buttonArea.on("pointerdown", this.onButtonClick, this);
    this.buttonArea.on("pointerover", () => this.drawButton(0xaaaaaa, 1));
    this.buttonArea.on("pointerout", () => this.drawButton(0xffffff, 1));
  }

  createAnimations() {
    this.anims.create({
      key: "slash",
      frames: this.anims.generateFrameNumbers("slash", { start: 18, end: 23 }),
      frameRate: 16,
      repeat: 0,
    });

    this.anims.create({
      key: "slash_reverse",
      frames: this.anims.generateFrameNumbers("slash_reverse", {
        start: 18,
        end: 23,
      }),
      frameRate: 16,
      repeat: 0,
    });

    this.anims.create({
      key: "thrust",
      frames: this.anims.generateFrameNumbers("thrust", { start: 24, end: 31 }),
      frameRate: 16,
      repeat: 0,
    });

    this.anims.create({
      key: "walk",
      frames: this.anims.generateFrameNumbers("walk", { start: 27, end: 35 }),
      frameRate: 8,
      repeat: -1,
    });

    this.attackAnimations = ["slash", "thrust", "slash_reverse", "thrust"];
    this.attackIndex = 0;
  }

  generateExp() {
    const values = [10, 10, 20, 20, 30, 30, 40, 50]; // Más probabilidad de 1, 2 y 3
    return Phaser.Math.RND.pick(values);
  }

  gainExp() {
    const expGained = this.generateExp();
    this.currentExp += expGained;
    this.addExp(expGained);
    this.updateCoins(expGained);

    if (this.currentExp >= this.expBar.maxExp) {
      this.currentLevel++;
      this.currentExp -= this.expBar.maxExp; // Resta lo que sobró en vez de resetear a 0
      this.events.emit("playerLevelUp", this.currentLevel);
      this.playLevelUpEffect(this.currentLevel);
    }
 
    this.expBar.updateExp(this.currentExp, this.currentLevel);

    // 🔥 Guardar en MongoDB una sola vez después de todos los cálculos
    const token = this.getToken(); // Obtener el token actualizado
    updatePlayerData(token, {
      level: this.currentLevel,
      exp: this.currentExp,
      coins: this.coins,
    });
  }

  addExp(amount) {
    this.currentExp += amount;
    new ExpFloatingText(this, this.player.x, this.player.y - 20, amount);
  }

  updateCoins(amount) {
    this.coins += amount;
    this.coinDisplay.updateAmount(this.coins); // 🔹 Solo actualiza la UI

    const token = this.getToken(); // Obtener el token actualizado
    updatePlayerData(token, {
      coins: this.coins,
    }); // 🔹 Aquí se actualiza la API


  }

  async validateTokenAndLoadPlayerData() {


    // 1. Intenta obtenerlo desde la URL
    const urlParams = new URLSearchParams(window.location.search);
    this.setToken(urlParams.get("token"));
  
    let token = this.getToken();

    // 2. Si no hay token, intenta obtenerlo desde initData
    if (!token && window.Telegram?.WebApp?.initData) {
      const initData = new URLSearchParams(window.Telegram.WebApp.initData);
      const telegramId = JSON.parse(initData.get("user") || "{}").id;

      if (telegramId) {
        const res = await fetch("/api/validate-id", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ telegramId }),
        });
        const data = await res.json();
        this.setToken(data.token);
      }
    }

    if (!token) {
      console.warn("⚠️ No se recibió un Token.");
      // Si no hay token, lanzamos la escena de error
      this.scene.start("ErrorScene");
      return;
    }

  

    try {
      const playerData = await fetchPlayerData(this.token);
      if (playerData) {
        // Inicializa el juego con los datos del jugador
        this.currentExp = playerData.exp;
        this.currentLevel = playerData.level;
        this.coins = playerData.coins;

        this.scene.launch("UIManager", { level: playerData.level });
        this.coinDisplay = new CoinDisplay(this, 50, this.coins);
        this.expBar = new ExpBar(
          this,
          this.cameras.main.centerX,
          this.cameras.main.centerY + 195,
          playerData.exp,
          playerData.level
        );
      } else {
        console.log("⛔ No se encontró el jugador, redirigiendo a escena de error...");
        this.scene.start("ErrorScene");
        return;
      }
    } catch (error) {
      console.error("❌ Error validando el token:", error);
      // Si ocurre un error al validar el token, lanzamos la escena de error
      this.scene.start("ErrorScene");
    }
  }


  // Función para obtener el token
  getToken() {
    return this.token;
  }

  // Función para actualizar el token
  setToken(newToken) {
    this.token = newToken;
  }




  onButtonClick() {
    if (this.energyBar.getEnergy() <= 0) return; // Opcional: evita atacar sin energía
    if (!this.energyBar) {
      console.error('EnergyBar no está inicializado');
      return;
    }

    // Acceder al método getEnergy de EnergyBar

    // Resto del código...
    this.player.stop();
    // Comenzar a gastar energía
    this.energyBar.startDrain();

    this.player.play(this.attackAnimations[this.attackIndex]);
    this.gainExp();
    this.drawButton(0x002200, 0.9);

    this.player.once("animationcomplete", () => {
      this.drawButton(0xffffff, 1);
      // Detener gasto de energía
      this.energyBar.stopDrain();
      this.attackIndex = (this.attackIndex + 1) % this.attackAnimations.length;
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

  drawButton(color = 0xffffff, porsentage = 1) {
    this.buttonGraphics.clear();
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2 + 50;
    this.buttonGraphics.fillStyle(0xffddaa, 0.5);
    this.buttonGraphics.fillCircle(centerX, centerY, 120 * porsentage);
    this.buttonGraphics.fillStyle(color, 0.3);
    this.buttonGraphics.fillCircle(centerX, centerY, 110 * porsentage);
  }
}
