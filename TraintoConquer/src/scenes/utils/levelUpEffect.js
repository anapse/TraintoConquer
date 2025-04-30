export function playLevelUpEffect(scene, newLevel) {
    const particles = scene.add.particles(
        scene.player.x,
        scene.player.y,
        "particle_star",
        {
            speed: { min: 50, max: 150 },
            lifespan: 800,
            scale: { start: 0.8, end: 0 },
            gravityY: -50,
            quantity: 10,
            tint: [0xffd700, 0xffa500, 0xffff00],
            blendMode: "ADD",
            emitting: true,
        }
    );

    scene.time.delayedCall(1000, () => {
        particles.destroy();
    });

    const badge = scene.add
        .image(scene.cameras.main.centerX, scene.cameras.main.centerY, "levelUpBadge")
        .setScale(0.5)
        .setAlpha(1)
        .setVisible(true);

    const levelText = scene.add
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

    const levelUpContainer = scene.add.container(
        scene.cameras.main.centerX,
        scene.cameras.main.centerY,
        [badge, levelText]
    );

    scene.tweens.add({
        targets: levelUpContainer,
        alpha: 1,
        scale: 1.2,
        duration: 800,
        ease: "Power2",
        onComplete: () => {
            scene.time.delayedCall(1000, () => {
                scene.tweens.add({
                    targets: levelUpContainer,
                    alpha: 0,
                    duration: 1000,
                    onComplete: () => {
                        levelUpContainer.destroy();
                    },
                });
            });
        },
    });
}
