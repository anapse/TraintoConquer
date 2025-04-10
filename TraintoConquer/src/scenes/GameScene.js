export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
  }

  preload() {
    this.load.image("background", "assets/background.png");
    this.load.image("player", "assets/player.png");
  }

  create() {
    this.add
      .image(this.scale.width / 2, this.scale.height / 2, "background")
      .setOrigin(0.5)
      .setScale(1);

    this.player = this.physics.add
      .sprite(100, this.scale.height - 150, "player")
      .setScale(0.5);
    this.player.setCollideWorldBounds(true);

    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
    } else {
      this.player.setVelocityX(0);
    }
  }
}
