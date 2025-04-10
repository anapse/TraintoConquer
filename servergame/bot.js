const { Telegraf } = require('telegraf');

// Reemplaza 'TU_BOT_TOKEN' con el token de tu bot de Telegram
const BOT_TOKEN = 'TU_BOT_TOKEN';

// Reemplaza 'https://traintoconquer.servegame.com' con la URL de tu juego
const GAME_URL = 'https://traintoconquer.servegame.com';

const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) => {
  ctx.reply('¡Haz clic para jugar Train to Conquer!', {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Abrir juego',
            web_app: { url: GAME_URL },
          },
        ],
      ],
    },
  });
});

// Inicia el bot
bot.launch();

console.log('Bot iniciado');