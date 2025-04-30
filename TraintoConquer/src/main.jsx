import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MenuScene from "./scenes/MenuScene.js";
import { UIManager } from "./componets/UIManager.js";
import { ErrorScene } from "./scenes/ErrorScene.js";
import Dashboard from './Dashboard.jsx';
import Phaser from "phaser";

const GameComponent = () => {
  const gameContainer = useRef(null);
  const gameInstance = useRef(null);

  useEffect(() => {
    // Configuración de Phaser
    const config = {
      type: Phaser.AUTO,
      width: 480,
      height: 640,
      parent: gameContainer.current,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: [MenuScene, ErrorScene, UIManager],
    };

    // Inicializar Phaser solo cuando el componente se monta
    gameInstance.current = new Phaser.Game(config);

    // Limpieza al desmontar
    return () => {
      if (gameInstance.current) {
        gameInstance.current.destroy(true);
        gameInstance.current = null;
      }
    };
  }, []);

  return <div ref={gameContainer} style={{ width: "100%", height: "100%" }} />;
};

ReactDOM.createRoot(document.getElementById('app')).render(
  <Router>
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/" element={<GameComponent />} />
    </Routes>
  </Router>
);