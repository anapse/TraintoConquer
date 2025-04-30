class Button {
    constructor(scene, x, y, radius, color = 0xffffff, onClickCallback = null) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.graphics = this.scene.add.graphics();
        this.buttonArea = this.scene.add.circle(x, y, radius, 0xffffff, 0).setInteractive({ useHandCursor: true });
        this.drawButton();
        this.onClickCallback = onClickCallback;
        this.setupEvents();
    }

    drawButton(color = 0xffffff, porsentage = 1) {
        this.graphics.clear();
        const centerX = this.scene.scale.width / 2;
        const centerY = this.scene.scale.height / 2 + 50;
        this.graphics.fillStyle(0xffddaa, 0.5);
        this.graphics.fillCircle(centerX, centerY, 120 * porsentage);
        this.graphics.fillStyle(color, 0.3);
        this.graphics.fillCircle(centerX, centerY, 110 * porsentage);
    }

    setupEvents() {
        this.buttonArea.on('pointerdown', () => {
            if (this.onClickCallback) {
                this.onClickCallback(); // Ejecuta la función pasada
            }
        });
        this.buttonArea.on("pointerover", () => this.drawButton(0xaaaaaa, 1));
        this.buttonArea.on("pointerout", () => this.drawButton(0xffffff, 1));
    }





}

export default Button;
