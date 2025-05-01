import { fetchPlayerData } from '../apiService';  // Asegúrate de importar la función

export class preventaModal {
    constructor(scene, x, y) {
        this.scene = scene;
        this.container = this.scene.add.container(x, y); // Usamos un contenedor para agrupar los elementos
        this.container.setDepth(1000);

        // Crear fondo semitransparente con bordes redondeados
        const bgWidth = this.scene.cameras.main.width * 0.95;
        const bgHeight = 570;

        // Fondo con bordes redondeados
        const background = this.scene.add.graphics(); // Usamos gráficos para crear un fondo redondeado
        background.fillStyle(0x000000, 0.5); // Fondo negro translúcido
        background.fillRoundedRect(-bgWidth / 2, -bgHeight / 2, bgWidth, bgHeight, 20); // Bordes redondeados
        // Coloca el fondo en la posición del contenedor

        // Imagen de fondo con bordes redondeados y translúcida
        const panel = this.scene.add.image(0, 0, 'fondopreventa') // Asegúrate de haber precargado la imagen
            .setOrigin(0.5)
            .setDisplaySize(bgWidth - 30, bgHeight - 30) // Ajustar al tamaño que quieras
            .setAlpha(1); // Hacerla translúcida con alpha



        // Botones
        const playButton = this.createButton(0, -30, 'Jugar');
        const preSaleButton = this.createButton(0, 30, 'Preventa');

        // Añadir todos los elementos al contenedor
        this.container.add([background, panel, playButton, preSaleButton]);

        // Configurar interacciones
        playButton.on('pointerdown', () => this.onPlayClick());
        preSaleButton.on('pointerdown', () => this.onPreSaleClick());
    }

    createButton(x, y, text) {
        const button = this.scene.add.text(x, y, text, {
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#007bff',
            padding: { x: 20, y: 10 },
        }).setOrigin(0.5).setInteractive();

        return button;
    }

    onPlayClick() {
        const token = this.scene.getToken();
        if (!token) {
            alert("No se encontró el token. Por favor, inicia sesión nuevamente.");
            return;
        }

        // Llamamos a fetchPlayerData para obtener los datos del jugador
        fetchPlayerData(token).then(jugador => {
            if (!jugador) {
                alert("No se pudo obtener los datos del jugador.");
                return;
            }

            if (jugador.isTester) {
                // Si el jugador es tester, iniciar el juego
                this.hide();
                if (!this.scene.scene.isActive('UIManager')) {  // Usar Scene Manager para verificar si está activa
                    this.scene.scene.launch("UIManager", { level: this.scene.currentLevel });  // Pasa el nivel actual como parámetro
                }

            } else {
                // Si no es tester, mostrar mensaje de error
                alert("No tienes acceso al juego. Solo testers pueden jugar.");
            }
        }).catch(error => {
            console.error("Error al obtener los datos del jugador:", error);
            alert("Hubo un error al verificar tu acceso.");
        });



    }

    onPreSaleClick() {
        this.hide();
        this.scene.scene.stop("UIManager"); // Cierra la UI superpuesta
        this.scene.scene.start("PreSaleScene");
    }

    hide() {
        this.container.setVisible(false);
    }

    show() {
        this.container.setVisible(true);
    }

}
