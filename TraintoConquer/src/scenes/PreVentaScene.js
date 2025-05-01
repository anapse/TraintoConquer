export default class PreVentaScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreSaleScene' });
        this.currentIndex = 0;
        this.armorTypes = ['iron', 'steel', 'copper', 'silver', 'gold'];
        this.armorSprites = []; // Array para guardar referencias a los sprites
    }

    preload() {
        this.load.image('fondopreventa', 'assets/backgrounds/fondopreventa.png');

        // Cargar spritesheets
        this.load.spritesheet('armor_iron', 'assets/anis/iron/walk.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('armor_steel', 'assets/anis/steel/walk.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('armor_copper', 'assets/anis/copper/walk.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('armor_silver', 'assets/anis/silver/walk.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('armor_gold', 'assets/anis/gold/walk.png', { frameWidth: 64, frameHeight: 64 });
    }

    create() {
        // Fondo
        this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'fondopreventa').setScale(0.57);

        this.slides = [];
        this.isChanging = false;

        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        this.container = this.add.container(centerX, centerY);

        // Crear animaciones
        this.armorTypes.forEach((type, index) => {
            const animKey = `walk_${type}`;

            // Verificar si la animación ya existe y eliminarla si es necesario
            if (this.anims.exists(animKey)) {
                this.anims.remove(animKey);
            }

            // Crear animación nueva
            this.anims.create({
                key: animKey,
                frames: this.anims.generateFrameNumbers(`armor_${type}`, { start: 27, end: 35 }), // Ajusta estos valores según tu spritesheet
                frameRate: 8,
                repeat: -1
            });

            const slide = this.createArmorSlide(type, index);
            slide.setVisible(index === 0); // Solo el primero visible
            this.slides.push(slide);
            this.container.add(slide);
        });

        // Iniciar la primera animación explícitamente
        if (this.armorSprites[0]) {
            this.armorSprites[0].play(`walk_${this.armorTypes[0]}`);
            console.log(`Iniciando animación inicial: walk_${this.armorTypes[0]}`);
        }

        this.createNavigationTriangles();
    }

    createNavigationTriangles() {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        // Flecha izquierda (triángulo)
        this.leftArrow = this.add.graphics()
            .fillStyle(0xffffff, 1)
            .fillTriangle(
                centerX - 120, centerY - 30,
                centerX - 150, centerY,
                centerX - 120, centerY + 30
            )
            .setInteractive(
                new Phaser.Geom.Triangle(
                    centerX - 120, centerY - 30,
                    centerX - 150, centerY,
                    centerX - 120, centerY + 30
                ),
                Phaser.Geom.Triangle.Contains
            )
            .on('pointerdown', () => this.changeArmor(-1))
            .on('pointerover', () => this.leftArrow.fillStyle(0xcccccc, 1).fillTriangle(
                centerX - 120, centerY - 30,
                centerX - 150, centerY,
                centerX - 120, centerY + 30
            ))
            .on('pointerout', () => this.leftArrow.fillStyle(0xffffff, 1).fillTriangle(
                centerX - 120, centerY - 30,
                centerX - 150, centerY,
                centerX - 120, centerY + 30
            ));

        // Flecha derecha (triángulo)
        this.rightArrow = this.add.graphics()
            .fillStyle(0xffffff, 1)
            .fillTriangle(
                centerX + 120, centerY - 30,
                centerX + 150, centerY,
                centerX + 120, centerY + 30
            )
            .setInteractive(
                new Phaser.Geom.Triangle(
                    centerX + 120, centerY - 30,
                    centerX + 150, centerY,
                    centerX + 120, centerY + 30
                ),
                Phaser.Geom.Triangle.Contains
            )
            .on('pointerdown', () => this.changeArmor(1))
            .on('pointerover', () => this.rightArrow.fillStyle(0xcccccc, 1).fillTriangle(
                centerX + 120, centerY - 30,
                centerX + 150, centerY,
                centerX + 120, centerY + 30
            ))
            .on('pointerout', () => this.rightArrow.fillStyle(0xffffff, 1).fillTriangle(
                centerX + 120, centerY - 30,
                centerX + 150, centerY,
                centerX + 120, centerY + 30
            ));
    }

    createArmorSlide(type, index) {
        const name = type.charAt(0).toUpperCase() + type.slice(1);
        const slide = this.add.container(0, 0);

        // Título
        const title = this.add.text(0, -150, `${name} Armor`, {
            fontSize: '28px',
            fontStyle: 'bold',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Sprite animado
        const sprite = this.add.sprite(0, -20, `armor_${type}`)
            .setScale(2);

        // Guardar referencia al sprite
        this.armorSprites[index] = sprite;

        // Añadir listeners para depuración
        sprite.on('animationstart', (animation) => {
            console.log(`Animación iniciada: ${animation.key} en ${type}`);
        });

        sprite.on('animationcomplete', (animation) => {
            console.log(`Animación completada: ${animation.key} en ${type}`);
        });

        sprite.on('animationupdate', () => {
            // Solo para verificación si es necesario
        });

        // Caja de descripción
        const descriptionBox = this.add.graphics();
        descriptionBox.fillStyle(0x000000, 0.6);
        descriptionBox.lineStyle(2, 0xffffff);
        descriptionBox.strokeRoundedRect(-140, 50, 280, 70, 10);
        descriptionBox.fillRoundedRect(-140, 50, 280, 70, 10);

        // Texto de descripción
        const descriptionText = this.add.text(0, 85, `Esta es la poderosa armadura de ${name}`, {
            fontSize: '16px',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: 260 }
        }).setOrigin(0.5);

        // Botón de compra
        const buyButton = this.add.graphics();
        buyButton.fillStyle(0x28a745, 1);
        buyButton.fillRoundedRect(-60, 140, 120, 40, 10);
        buyButton.lineStyle(2, 0xffffff);
        buyButton.strokeRoundedRect(-60, 140, 120, 40, 10);

        const buyText = this.add.text(0, 160, 'COMPRAR', {
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Hacer todo el botón interactivo
        const buyHitArea = this.add.zone(0, 160, 120, 40)
            .setInteractive()
            .on('pointerdown', () => {
                console.log(`Compraste ${name}`);
                this.tweens.add({
                    targets: [buyButton, buyText],
                    scale: 0.9,
                    duration: 100,
                    yoyo: true
                });
            });

        slide.add([title, sprite, descriptionBox, descriptionText, buyButton, buyText, buyHitArea]);

        return slide;
    }

    changeArmor(direction) {
        if (this.isChanging) return;
        this.isChanging = true;

        // Ocultar slide actual
        this.slides[this.currentIndex].setVisible(false);

        // Cambiar índice
        this.currentIndex = Phaser.Math.Wrap(
            this.currentIndex + direction,
            0,
            this.armorTypes.length
        );

        // Mostrar nuevo slide
        this.slides[this.currentIndex].setVisible(true);

        // Asegurarse de que la animación esté reproduciéndose
        const currentType = this.armorTypes[this.currentIndex];
        const currentSprite = this.armorSprites[this.currentIndex];

        if (currentSprite && currentSprite.anims) {
            const animKey = `walk_${currentType}`;
            // Reiniciar la animación (detener y volver a iniciar)
            currentSprite.stop();
            currentSprite.play(animKey);
            console.log(`Iniciando animación para ${currentType}: ${animKey}`);
        }

        this.isChanging = false;
    }

    update() {
        // No necesitamos actualizar manualmente las animaciones
        // Phaser lo hace automáticamente
    }
}