export default class ExpFloatingText extends Phaser.GameObjects.Text {
  constructor(scene, x, y, amount) {
    // Rango aleatorio para la posición inicial
    const offsetX = Phaser.Math.Between(-50, 50); // Desplazamiento horizontal
    const offsetY = Phaser.Math.Between(-40, 40); // Desplazamiento vertical

    super(scene, x + offsetX, y + offsetY, `+${amount}`, {
      fontSize: "20px",
      fontFamily: "Arial",
      color: "#ffcc00",
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 4,
    });

    scene.add.existing(this);
    this.setOrigin(0.5);
    this.setDepth(10);

    // Animación: sube más y se desvanece
    scene.tweens.add({
      targets: this,
      y: y - 80, // Subir más alto
      alpha: 0, // Desvanecer
      duration: 1200, // Duración más larga
      ease: "Power1",
      onComplete: () => this.destroy(), // Destruir después de la animación
    });
  }
}
