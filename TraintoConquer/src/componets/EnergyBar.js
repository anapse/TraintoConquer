import { createHexBackground } from "./createHexBackground";

export class EnergyBar {
    constructor(scene, x, y, width, height, maxEnergy = 100, regenTime = 300000, iconKey = 'lightning') {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.maxEnergy = maxEnergy;
        this.energy = maxEnergy;
        this.energyDecreaseRate = 0.1;
        this.regenTime = regenTime;
        this.iconKey = iconKey;

        // Crear elementos gráficos
        this.createBar();

        // Configurar regeneración automática
        this.setupRegeneration();
    }

    createBar() {
        // Fondo de la barra (gris)
        this.bgBar = this.scene.add.graphics();
        this.bgBar.fillStyle(0x333333, 1);
        this.bgBar.fillRoundedRect(this.x, this.y, this.width, this.height, 5);

        // Barra de energía principal (roja)
        this.energyBar = this.scene.add.graphics();

        // Borde de la barra (blanco)
        this.borderBar = this.scene.add.graphics();
        this.borderBar.lineStyle(2, 0xffffff, 1);
        this.borderBar.strokeRoundedRect(this.x, this.y, this.width, this.height, 5);

        const iconSprite = this.scene.add.sprite(0, 0, this.iconKey);
        iconSprite.setDisplaySize(25, 25);

        // Crear contenedor con fondo hexagonal + ícono encima
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

    setupRegeneration() {
        this.scene.time.addEvent({
            delay: this.regenTime,
            callback: () => {
                this.energy = this.maxEnergy;
                this.updateBar();
                this.scene.tweens.add({
                    targets: [this.icon],
                    scale: { from: 1.2, to: 1 },
                    duration: 500,
                    ease: 'Bounce.easeOut'
                });
            },
            callbackScope: this,
            loop: true
        });
    }

    update(delta) {
        if (this.isDraining && this.energy > 0) {
            this.energy -= this.energyDecreaseRate * (delta / 1000);
            this.energy = Math.max(0, this.energy);
            this.updateBar();
        }
    }

    updateBar() {
        // Calcular ancho actual basado en energía
        const currentWidth = (this.energy / this.maxEnergy) * this.width;

        // Actualizar barra de energía
        this.energyBar.clear();
        this.energyBar.fillStyle(this.getEnergyColor(), 1);
        this.energyBar.fillRoundedRect(
            this.x,
            this.y,
            currentWidth,
            this.height,
            5
        );

        // Actualizar texto
        this.energyText.setText(`${Math.floor(this.energy)}/${this.maxEnergy}`);

        // Efecto visual cuando energía baja
        if (this.energy < this.maxEnergy * 0.3) {
            this.energyBar.fillStyle(0xff0000, 0.7 + 0.3 * Math.sin(this.scene.time.now * 0.005));
            this.energyBar.fillRoundedRect(
                this.x,
                this.y,
                currentWidth,
                this.height,
                5
            );
        }
    }

    getEnergyColor() {
        // Cambia el color según el nivel de energía
        const percent = this.energy / this.maxEnergy;
        if (percent > 0.7) return 0x503B8A; // Verde
        if (percent > 0.4) return 0xffff00; // Amarillo
        return 0xff0000; // Rojo
    }

    regenerateEnergy() {
        this.energy = this.maxEnergy;
        this.updateBar();

        // Efecto visual al regenerar
        this.scene.tweens.add({
            targets: [this.energyBar],
            alpha: { from: 0.5, to: 1 },
            duration: 1000,
            ease: 'Power1'
        });
    }

    getEnergy() {
        return this.energy;
    }

    setEnergy(value) {
        this.energy = Phaser.Math.Clamp(value, 0, this.maxEnergy);
        this.updateBar();
    }

    addEnergy(amount) {
        this.setEnergy(this.energy + amount);

        // Efecto visual al añadir energía
        this.scene.tweens.add({
            targets: [this.icon],
            scale: { from: 1.3, to: 1 },
            duration: 300,
            ease: 'Back.easeOut'
        });
    }


    startDrain() {
        this.isDraining = true;
    }

    stopDrain() {
        this.isDraining = false;
    }
}
