export default class CoinDisplay {
  constructor(scene, y, initialAmount) {
    this.scene = scene;
    this.amount = initialAmount;

    // Ancho de la pantalla para centrar
    const centerX = scene.scale.width / 2 - 10;
    console.log(
      "✅ Creando barra con cantidad:",
      this.amount,
      "- Tipo:",
      typeof this.amount
    );

    // Crear el texto
    this.text = scene.add
      .text(centerX, y + 150, this.formatNumber(this.amount), {
        fontSize: "36px",
        fontFamily: "Arial Black",
        fontStyle: "bold",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 6,
      })
      .setOrigin(0.5, 0.5); // Centrado

    // Agregar la imagen de la moneda DESPUÉS de que el texto esté listo
    this.coin = scene.add
      .image(centerX, y + 150, "coin")
      .setOrigin(0.5, 0.5)
      .setScale(0.07);

    // Esperar un frame para corregir la posición de la moneda
    scene.time.delayedCall(10, () => {
      this.coin.setX(this.text.x + this.text.width / 2 + 45);
    });

    // Animación de giro
    this.scene.tweens.add({
      targets: this.coin,
      angle: 360,
      duration: 5000,
      repeat: -1,
    });
  }

  updateAmount(newAmount) {
    this.amount = newAmount;
    this.text.setText(this.formatNumber(this.amount));

    // Ajustar la posición de la moneda
    this.scene.time.delayedCall(10, () => {
      this.coin.setX(this.text.x + this.text.width / 2 + 45);
    });

    // Hacer que la moneda gire un poco con cada actualización
    this.scene.tweens.add({
      targets: this.coin,
      angle: this.coin.angle + 180,
      duration: 500,
      ease: "Cubic.easeOut",
    });
  }

  formatNumber(value) {
    let numberValue = Number(value) || 0; // Asegurar conversión válida
    return numberValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
}
