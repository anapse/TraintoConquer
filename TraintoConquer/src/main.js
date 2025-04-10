import Phaser from "phaser";
import MenuScene from "./scenes/MenuScene.js";
import GameScene from "./scenes/GameScene.js";
import { UIManager } from "./componets/UIManager.js";
import { ErrorScene } from "./scenes/ErrorScene.js";

const config = {
  type: Phaser.AUTO,
  width: 480, // Ancho estándar para móviles en vertical
  height: 640, // Alto
  parent: "app",
  scale: {
    mode: Phaser.Scale.FIT, // Ajusta el tamaño sin distorsionar
    autoCenter: Phaser.Scale.CENTER_BOTH, // Centra el juego en la pantalla
  },
  scene: [
    MenuScene,ErrorScene,
    UIManager,
    //  GameScene
  ],
};

const game = new Phaser.Game(config);
