// Background.js
export default class Background {
    constructor(scene, imageKey) {
        this.scene = scene;  // La escena en la que se va a agregar el fondo
        this.imageKey = imageKey; // La clave de la imagen a usar
        this.bg = null;  // Referencia al objeto fondo
    }

    create() {
        // Agregar la imagen de fondo en el centro
        this.bg = this.scene.add
            .image(this.scene.scale.width / 2, this.scene.scale.height / 2, this.imageKey)
            .setOrigin(0.5);

        // Ajustar el fondo a la pantalla sin deformarlo
        const scaleX = this.scene.scale.width / this.bg.width;
        const scaleY = this.scene.scale.height / this.bg.height;
        const scale = Math.max(scaleX, scaleY);
        this.bg.setScale(scale);
    }
}
