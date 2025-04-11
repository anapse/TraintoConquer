import exp_required from "../data/exp_lvl.json";
import { createHexBackground } from "./createHexBackground";

export default class ExpBar extends Phaser.GameObjects.Container {
  constructor(scene, x, y, exp = 0, level = 1,iconKey = 'expicon') {
    super(scene, x, y);
    this.scene = scene;
    this.level = level;
    this.width = 180;
    this.height = 20;
    this.currentExp = exp;
    this.maxExp = 1000; // Se actualizará con loadExpData()
    this.iconKey = iconKey;
    
  // Icono de energía

    // 🟢 Crear UI (borde, barra, texto)
    this.border = this.scene.add.graphics();
    this.border.lineStyle(2, 0xffffff, 1);
    this.border.strokeRoundedRect(
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height,5
    );
    this.add(this.border);

    this.expBar = this.scene.add.graphics();
    this.expBar.fillStyle(0x33cc33, 1);
    this.expBar.fillRoundedRect(-this.width / 2, -this.height / 2, 0, this.height, 5);
    this.add(this.expBar);

    this.expText = this.scene.add
      .text(0, -this.height + 20, `${this.currentExp} / ${this.maxExp}`, {
        fontSize: "16px",
        color: "#ffffff",
        align: "center",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    this.add(this.expText);
    const iconSprite = this.scene.add.sprite(0, 0, this.iconKey);
    iconSprite.setDisplaySize(25, 25);
    
    // Crear contenedor con fondo hexagonal + ícono encima
    this.iconContainer = createHexBackground(iconSprite, this.scene, -this.width / 2 - 15, 0);
    this.add(this.iconContainer);   // 🔥 Añadir al contenedor!
    // Agregar a la escena y asegurar visibilidad
    this.setDepth(1); // Asegura que la barra no quede oculta
    this.scene.add.existing(this);

    // 🔄 Cargar datos iniciales
    this.loadExpData(this.level).then(() => this.updateExpBar());
  }

  // Cargar datos de experiencia desde JSON
  async loadExpData(level) {
    return new Promise((resolve) => {
  

      if (exp_required?.exp_required?.[level] !== undefined) {
        this.maxExp = exp_required.exp_required[level];
      } else {
        console.warn(
          `⚠️ Nivel ${level} no encontrado en exp_lvl.json, usando 1000 por defecto.`
        );
        this.maxExp = 1000;
      }

     
      resolve();
    });
  }

  // Actualizar la experiencia y la barra
  async updateExp(exp, level) {
   

    this.currentExp = exp;
    this.level = level; // Actualiza el nivel actual

    await this.loadExpData(level);
    this.updateExpBar();
  }

  // Redibujar la barra según la experiencia actual
  updateExpBar() {
    this.expBar.clear();
    this.expBar.fillStyle(0x33cc33, 1);

    let fillWidth = (this.currentExp / this.maxExp) * this.width;
    fillWidth = Math.max(0, Math.min(this.width, fillWidth)); // Evita valores fuera de rango

   

    this.expBar.fillRoundedRect(
      -this.width / 2,
      -this.height / 2,
      fillWidth,
      this.height,5
    );
    this.expText.setText(`${this.currentExp} / ${this.maxExp}`);
  }
}
