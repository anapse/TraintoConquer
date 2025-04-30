const mongoose = require('mongoose');

const jugadorSchema = new mongoose.Schema({
  telegram_id: {
    type: Number,
    required: true,
    unique: true,
  },
  player_name: {
    type: String,
    required: true,
  },
  first_name: String,
  last_name: String,
  exp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  coins: { type: Number, default: 100 },
  energy: { type: Number, default: 100 }, // Agregado
  lastEnergySpentAt: { type: Date, default: null } // Agregado
});

const Jugador = mongoose.model("jugador", jugadorSchema, "jugadores");

module.exports = Jugador;
