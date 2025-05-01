export default function preloadAssets(scene) {


    scene.load.image("background", "assets/backgrounds/menu.png");
    scene.load.image("coin", "assets/coin.png");
    scene.load.image("bg_inventario", "assets/backgrounds/bg_inventario.png");
    scene.load.image("particle_star", "assets/particle_star.png");
    scene.load.image("levelUpBadge", "assets/lvlup.png");
    scene.load.image('expicon', 'assets/exp_icon.png');
    scene.load.image('lightning', 'assets/rayito.png');
    scene.load.image('fondopreventa', 'assets/backgrounds/fondopreventa.png');
    scene.load.spritesheet("slash", "assets/anis/slash_oversize.png", {
        frameWidth: 192,
        frameHeight: 192,
    });
    scene.load.spritesheet(
        "slash_reverse",
        "assets/anis/slash_reverse_oversize.png",
        {
            frameWidth: 192,
            frameHeight: 192,
        }
    );
    scene.load.spritesheet("thrust", "assets/anis/thrust_oversize.png", {
        frameWidth: 192,
        frameHeight: 192,
    });
    scene.load.spritesheet("walk", "assets/anis/walk.png", {
        frameWidth: 64,
        frameHeight: 64,
    });

}