const { Telegraf } = require('telegraf');
const jwt = require("jsonwebtoken");
const Jugador = require("../api/model/Jugador");
const bot = new Telegraf(process.env.BOT_TOKEN);
const SECRET_KEY = process.env.SECRET_KEY;
const { startCommand } = require('./controllers/startController');
const session = require('telegraf').session; // Middleware de sesión
// Verificar variables críticas al inicio
const requiredEnvVars = ['BOT_TOKEN', 'SECRET_KEY', 'MONGO_URI'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
const fs = require('fs');
const path = require('path');
const energyLevelPath = path.join(__dirname, '../data/energy_lvl.json');

function getEnergyLevelConfig() {
  return JSON.parse(fs.readFileSync(energyLevelPath)).energy_required;
}

if (missingVars.length > 0) {
  console.error(`❌ ERROR: Faltan variables de entorno requeridas: ${missingVars.join(', ')}`);
  process.exit(1);
}

bot.use(session());
bot.command('start', startCommand);
bot.on('message', async (ctx) => {
  try {
    const telegramId = ctx.from.id;
    const firstName = ctx.from.first_name || "";
    const lastName = ctx.from.last_name || "";
    const username = ctx.from.username || `user_${telegramId}`;

    // Verificar si el jugador existe en la base de datos
    let jugador = await Jugador.findOne({ telegram_id: telegramId });

    if (!jugador) {
      // Si el jugador no existe, guardarlo y responder con los datos iniciales
      const mensaje = await handleNewPlayer(telegramId, firstName, lastName);
      return ctx.reply(mensaje, { parse_mode: 'Markdown' }); // Usamos Markdown para formato
    } else {
      // Si el jugador ya existe, responder con su información
      const mensaje =
        `¡Hola de nuevo, *${jugador.player_name}*! 🎮\n\n` +
        `📊 *Datos del Jugador*:\n` +
        `🪙 **Monedas**: ${jugador.coins}\n` +
        `🌟 **Experiencia**: ${jugador.exp}\n` +
        `🔓 **Nivel**: ${jugador.level}`;
      return ctx.reply(mensaje, { parse_mode: 'Markdown' });
    }
  } catch (error) {
    console.error("Error al manejar el mensaje:", error);
    ctx.reply("❌ Ocurrió un error al procesar tu mensaje. Inténtalo de nuevo.");
  }
});

// Función para manejar el nuevo jugador
async function handleNewPlayer(telegramId, firstName, lastName) {
  try {
    const nombrePlayer = `${firstName} ${lastName}`;
    const energyLevels = getEnergyLevelConfig();
    const initialEnergy = energyLevels["1"] || 1000;
    const nuevoJugador = new Jugador({
      telegram_id: telegramId,
      player_name: nombrePlayer,
      first_name: firstName,
      last_name: lastName,
      exp: 0,
      level: 1,
      coins: 100,  // Inicializamos con 100 monedas
      energy: 100, // energía inicial (puedes ajustar según tu lógica)
      lastEnergySpentAt: null // aún no ha gastado energía
    });

    // Guardar el nuevo jugador en la base de datos
    await nuevoJugador.save();
    console.log("Jugador guardado:", nuevoJugador);

    // Responder con un mensaje bonito y formateado
    return `¡Hola, *${nombrePlayer}*! 🎮 Bienvenido. Tus datos iniciales son:\n\n` +
      `📊 *Datos del Jugador*:\n` +
      `🪙 **Monedas**: 100\n` +
      `🌟 **Experiencia**: 0\n` +
      `🔓 **Nivel**: 1`;
  } catch (err) {
    console.error("Error al guardar el jugador:", err);
    throw new Error("❌ Ocurrió un error al registrar al jugador. Inténtalo de nuevo más tarde.");
  }
}

// Manejador de otros mensajes
bot.on('text', (ctx) => {
  console.log("Mensaje recibido:", ctx.message.text);
  ctx.reply('Mensaje recibido: ' + ctx.message.text);
});
async function setWebhook() {
  try {
    await bot.telegram.setWebhook(`https://traintoconquer.servegame.com/api/telegramWebhook`);
    console.log('Webhook de Telegram configurado correctamente.');
  } catch (error) {
    console.error('Error al configurar el webhook:', error);
  }
}

// Lanzar bot
setWebhook().then(() => {
  bot.launch();
});


console.log('Bot iniciado');
module.exports = { bot };