export class ErrorScene extends Phaser.Scene {
    constructor() {
      super({ key: 'ErrorScene' });
    }
  
    preload() {
      // Cargar fondo de la escena
      this.load.image('background', 'assets/backgrounds/menu.png');  // Usamos el mismo fondo
    }
  
    create() {
      // Fondo de la escena
      this.add.image(400, 300, 'background');
      
      // Mensaje de error
      const errorMessage = this.add.text(this.scale.width / 2, this.scale.height / 2 - 200, '❌ !!!Error!!! ❌\n \n❌ al cargar los datos! ❌', {
        font: 'bold 32px Arial',
        fill: '#ff0000',
        align: 'center',
     
        
      }).setOrigin(0.5);
  
      // Crear rectángulo de fondo para el mensaje de error
      const errorBackground = this.add.graphics();
      errorBackground.lineStyle(4, 0x000000, 1); // Borde negro
      errorBackground.fillStyle(0x000000, 0.3);  // Fondo semitransparente
      errorBackground.fillRoundedRect(errorMessage.x - errorMessage.width / 2 - 10, errorMessage.y - errorMessage.height / 2 - 10, errorMessage.width + 20, errorMessage.height + 20, 10); // Borde redondeado
      errorBackground.strokeRoundedRect(errorMessage.x - errorMessage.width / 2 - 10, errorMessage.y - errorMessage.height / 2 - 10, errorMessage.width + 20, errorMessage.height + 20, 10); // Borde
  
      // Crear el mensaje de error
      this.add.text(this.scale.width / 2, this.scale.height / 2 , 'No se pudo obtener \n sus datos o hubo un error.\n Intenta nuevamente.', {
        font: 'bold 24px Arial',
        fill: '#ffffff',
        align: 'center',
      }).setOrigin(0.5);
  
      // Crear fondo translúcido para el mensaje
      const errorTextBackground = this.add.graphics();
      errorTextBackground.lineStyle(4, 0x000000, 1); 
      errorTextBackground.fillStyle(0x000000, 0.3);  // Fondo translúcido
      errorTextBackground.fillRoundedRect(this.scale.width / 2 - 160, this.scale.height / 2 - 60, 320, 120, 10);  // Ajustar tamaño y borde redondeado
      errorTextBackground.strokeRoundedRect(errorMessage.x - errorMessage.width / 2 - 10, errorMessage.y - errorMessage.height / 2 - 10, errorMessage.width + 20, errorMessage.height + 20, 10); // Borde
  
      // Crear botón de "Recargar juego"
      const retryButton = this.add.text(this.scale.width / 2, this.scale.height / 2 + 150, 'Recargar juego', {
        font: '28px Arial',
        fill: '#ffffff',
        align: 'center',
      }).setOrigin(0.5).setInteractive();
  
      // Crear fondo del botón con borde
      const buttonBackground = this.add.graphics();
      buttonBackground.lineStyle(4, 0x00ff00, 0.8); // Borde verde
      buttonBackground.fillStyle(0x00ff00, 0.3);  // Fondo verde translúcido
      buttonBackground.fillRoundedRect(retryButton.x - retryButton.width / 2 - 10, retryButton.y - retryButton.height / 2 - 10, retryButton.width + 20, retryButton.height + 20, 10); // Borde redondeado
      buttonBackground.strokeRoundedRect(retryButton.x - retryButton.width / 2 - 10, retryButton.y - retryButton.height / 2 - 10, retryButton.width + 20, retryButton.height + 20, 10); // Borde
  
      // Efecto al pasar el ratón (hover)
      retryButton.on('pointerover', () => {
        retryButton.setStyle({ fill: '#00ff00' });  // Cambiar color cuando se pasa el ratón
      });
      retryButton.on('pointerout', () => {
        retryButton.setStyle({ fill: '#ffffff' });  // Volver al color original
      });
  
      // Efecto al hacer clic en el botón
      retryButton.on('pointerdown', () => {
        retryButton.setStyle({ fill: '#FF0000' });  // Efecto visual cuando se hace clic
        location.reload();  // Recargar la página cuando se hace clic
      });
    }
  }
  