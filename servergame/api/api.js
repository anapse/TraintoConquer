require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Jugador = require("./model/Jugador");
const app = express();
const { bot } = require("../bot/bot");
const { SECRET_KEY, MONGO_URI } = require('../config/config'); // Asegúrate de que la ruta sea correcta
const jwt = require("jsonwebtoken");
const { handleAction } = require('./controllers/expController'); // Asegúrate de que la ruta sea correcta


mongoose
  .connect(MONGO_URI)
  .then(() => console.log("📡 Conectado a MongoDB"))
  .catch((err) => {
    console.error("❌ Error conectando a MongoDB:", err.message);
    process.exit(1);
  });
// Middleware
app.use(express.json());
app.use(cors());

// Rutas de la API

app.get('/api', (req, res) => {
  res.send('Hola API');
});
app.post("/jugador", async (req, res) => {
  try {
    const nuevoJugador = new Jugador(req.body);
    await nuevoJugador.save();
    res.status(201).json(nuevoJugador);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/jugador/:telegramId', async (req, res) => {
  const telegramId = Number(req.params.telegramId);  // Convertir a número
  if (isNaN(telegramId)) {
    return res.status(400).json({ error: "El ID de Telegram no es un número válido" });
  }
  try {
    const jugador = await Jugador.findOne({ telegram_id: telegramId });
    if (!jugador) {
      return res.status(404).json({ error: "Jugador no encontrado" });
    }
    res.json(jugador);
  } catch (error) {
    console.error("❌ Error buscando jugador:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});
app.get("/api/jugadores", async (req, res) => {
  try {
    const jugadores = await Jugador.find();
    res.json(jugadores);
  } catch (error) {
    console.error("❌ Error obteniendo jugadores:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});
app.post("/api/action", async (req, res) => {
  try {
    const { telegramId } = req.body;

    if (!telegramId) {
      return res.status(400).json({ error: 'telegramId es requerido' });
    }

    const result = await handleAction(telegramId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.post('/api/validate-token', (req, res) => {
  const { token } = req.body;

  try {
    // Verificamos y decodificamos el token
    const decoded = jwt.verify(token, SECRET_KEY);
    // Si el token es válido, devolvemos el Telegram ID
    res.json({ telegramId: decoded.telegramId });
  } catch (error) {
    // Si el token no es válido, respondemos con un error
    res.status(400).json({ error: "Token inválido o expirado" });
  }
});

app.post('/api/refresh-token', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token requerido' });
  }

  try {
    // Verificar el refresh token
    const decoded = jwt.verify(refreshToken, SECRET_KEY);

    // Verificar que el token exista en la base de datos
    const jugador = await Jugador.findOne({
      telegram_id: decoded.telegramId,
      refreshToken: refreshToken
    });

    if (!jugador) {
      return res.status(401).json({ error: 'Refresh token inválido' });
    }

    // Generar NUEVO token de acceso (3 horas otra vez)
    const newAccessToken = jwt.sign(
      { telegramId: decoded.telegramId },
      SECRET_KEY,
      { expiresIn: '3h' }
    );

    res.json({
      accessToken: newAccessToken,
      // Opcional: puedes devolver también un nuevo refresh token si quieres
      // refreshToken: newRefreshToken
    });

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Refresh token expirado' });
    }
    res.status(401).json({ error: 'Token inválido' });
  }
});

app.put("/api/jugador/:telegramId", async (req, res) => {
  try {
    const { telegramId } = req.params;
    const playerData = req.body;
    const player = await Jugador.findOneAndUpdate(
      { telegram_id: telegramId },
      playerData,
      { new: true }
    );
    if (!player) {
      return res.status(404).send({ message: "Jugador no encontrado" });
    }
    res.status(200).send(player);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error al actualizar los datos del jugador" });
  }
});

app.delete("/jugador/:id", async (req, res) => {
  try {
    const jugador = await Jugador.findOneAndDelete({
      telegram_id: Number(req.params.id),
    });
    if (!jugador)
      return res.status(404).json({ error: "Jugador no encontrado" });
    res.json({ message: "Jugador eliminado", jugador });
  } catch (error) {
    console.error("❌ Error eliminando jugador:", error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook de Telegram
app.post('/api/telegramWebhook', async (req, res) => {
  console.log("➡️ [WEBHOOK] Recibiendo actualización de Telegram:", req.body);

  try {
    await bot.handleUpdate(req.body);
    res.sendStatus(200); // Responde con OK
  } catch (err) {
    console.error("❌ [WEBHOOK] Error al manejar la actualización:", err);
    res.sendStatus(500); // Responde con error si hay problemas
  }
});

// Iniciar servidor y configurar Webhook
module.exports = app;