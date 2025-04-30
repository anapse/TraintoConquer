import { createHexBackground } from "./createHexBackground";
import energy_required from "../data/energy_lvl.json";

export class EnergyBar {
    constructor(scene, level = 1, currentEnergy = 1000, iconKey = 'lightning') {
        this.scene = scene;
        this.x = this.scene.scale.width / 2 - 90;
        this.y = 550;
        this.width = 180;
        this.height = 20;
        this.energy = currentEnergy;
        this.iconKey = iconKey;
        this.level = level;

        this.loadEnergyData(level).then(() => this.updateBar());
        this.createBar();

    }

    createBar() {
        // Fondo gris
        this.bgBar = this.scene.add.graphics();
        this.bgBar.fillStyle(0x333333, 1);
        this.bgBar.fillRoundedRect(this.x, this.y, this.width, this.height, 5);

        // Barra de energía
        this.energyBar = this.scene.add.graphics();

        // Borde blanco
        this.borderBar = this.scene.add.graphics();
        this.borderBar.lineStyle(2, 0xffffff, 1);
        this.borderBar.strokeRoundedRect(this.x, this.y, this.width, this.height, 5);

        // Ícono con fondo hexagonal
        const iconSprite = this.scene.add.sprite(0, 0, this.iconKey);
        iconSprite.setDisplaySize(25, 25);
        this.iconContainer = createHexBackground(iconSprite, this.scene, this.x - 15, this.y + this.height / 2);
        // Texto de energía
        this.energyText = this.scene.add.text(
            this.x + this.width - 120,
            this.y + this.height / 2,
            `${Math.floor(this.energy)}/ ${this.maxEnergy}`,
            {
                fontSize: "16px",
                color: "#ffffff",
                align: "center",
                fontStyle: "bold",
            }
        );
        this.energyText.setOrigin(0, 0.5);
        this.updateBar();
    }
    async loadEnergyData(level) {
        return new Promise((resolve) => {
            if (energy_required?.energy_required?.[level] !== undefined) {
                this.maxEnergy = energy_required.energy_required[level];
            } else {
                console.warn(
                    `⚠️ Nivel ${level} no encontrado en energy_lvl.json, usando 1000 por defecto.`
                );
                this.maxEnergy = 1000;
            }
            resolve();
        });
    }
    updateBar() {
        const percent = this.energy / this.maxEnergy;
        const currentWidth = percent * this.width;

        let color = 0x503B8A; // verde
        if (percent < 0.3) color = 0xff0000; // rojo
        else if (percent < 0.7) color = 0xffff00; // amarillo

        this.energyBar.clear();
        this.energyBar.fillStyle(color, 1);
        this.energyBar.fillRoundedRect(this.x, this.y, currentWidth, this.height, 5);
    }

    async setEnergy(currentEnergy) {
        console.log("setEnergy", currentEnergy);
        this.energy = Phaser.Math.Clamp(currentEnergy, 0, this.maxEnergy);
        this.energyText.setText(`${Math.floor(this.energy)}/${this.maxEnergy}`);
        this.updateBar();
    }
}
