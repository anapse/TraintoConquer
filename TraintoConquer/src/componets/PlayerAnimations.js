class PlayerAnimations {
    constructor(scene) {
        this.scene = scene;
        this.setup();
    }

    setup() {
        // Verifica que 'scene' y 'scene.anims' existen
        if (!this.scene || !this.scene.anims) {
            console.error("❌ La escena no está correctamente definida en PlayerAnimations.");
            return;
        }

        this.scene.anims.create({
            key: "walk",
            frames: this.scene.anims.generateFrameNumbers("walk", { start: 27, end: 35 }),
            frameRate: 8,
            repeat: -1,
        });

        this.scene.anims.create({
            key: "slash",
            frames: this.scene.anims.generateFrameNumbers("slash", { start: 18, end: 23 }),
            frameRate: 16,
            repeat: 0,
        });

        this.scene.anims.create({
            key: "slash_reverse",
            frames: this.scene.anims.generateFrameNumbers("slash_reverse", { start: 18, end: 23 }),
            frameRate: 16,
            repeat: 0,
        });

        this.scene.anims.create({
            key: "thrust",
            frames: this.scene.anims.generateFrameNumbers("thrust", { start: 24, end: 31 }),
            frameRate: 16,
            repeat: 0,
        });
    }
}

export default PlayerAnimations;
