export function createPlayerAnimations(scene) {
    scene.anims.create({
        key: "slash",
        frames: scene.anims.generateFrameNumbers("slash", { start: 18, end: 23 }),
        frameRate: 16,
        repeat: 0,
    });

    scene.anims.create({
        key: "slash_reverse",
        frames: scene.anims.generateFrameNumbers("slash_reverse", { start: 18, end: 23 }),
        frameRate: 16,
        repeat: 0,
    });

    scene.anims.create({
        key: "thrust",
        frames: scene.anims.generateFrameNumbers("thrust", { start: 24, end: 31 }),
        frameRate: 16,
        repeat: 0,
    });

    scene.anims.create({
        key: "walk",
        frames: scene.anims.generateFrameNumbers("walk", { start: 27, end: 35 }),
        frameRate: 8,
        repeat: -1,
    });
    scene.attackAnimations = ["slash", "thrust", "slash_reverse", "thrust"];
    scene.attackIndex = 0;
    return {
        // Función para avanzar el índice de las animaciones
        attackAnimations: ["slash", "thrust", "slash_reverse", "thrust"],
        attackIndex: 0,

        // Función para avanzar el índice de las animaciones
        atackanis() {
            const anim = this.attackAnimations[this.attackIndex];
            this.attackIndex = (this.attackIndex + 1) % this.attackAnimations.length;
            return anim;
        }
    };
}
