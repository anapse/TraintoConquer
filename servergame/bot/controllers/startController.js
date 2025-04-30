const Jugador = require('../../api/model/Jugador.js');
const { generateToken, verifyToken, refreshToken } = require('../services/tokenService.js');

async function startCommand(ctx) {
    console.log("Comando /start recibido:", ctx.from);

    try {
        const { telegramId, firstName, lastName, username, language } = extractUserData(ctx.from);

        if (!ctx.session) ctx.session = {};

        let jugador = await Jugador.findOne({ telegram_id: telegramId });
        let token;
        let isNewPlayer = false;
        let nombrePlayer = firstName;

        if (!jugador) {
            ({ jugador, nombrePlayer } = await createNewPlayer({ telegramId, firstName, lastName, username }));
            isNewPlayer = true;
        }

        token = await getToken({ ctx, telegramId, isNewPlayer });

        const welcomeMessage = isNewPlayer
            ? `¡Bienvenido, ${nombrePlayer}! 🎮 Has sido registrado como nuevo jugador. ¿Listo para jugar?`
            : `¡Bienvenido de nuevo, ${nombrePlayer}! 🚀`;

        return ctx.replyWithPhoto('https://traintoconquer.servegame.com/img/launch.png', {
            caption: welcomeMessage,
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "🎮 Jugar ahora",
                            web_app: {
                                url: `https://traintoconquer.servegame.com?token=${token}`,
                            }
                        }
                    ]
                ]
            }
        });

    } catch (error) {
        console.error("❌ Error en el comando /start:", error);
        return ctx.reply("❌ Ocurrió un error al iniciar. Inténtalo de nuevo más tarde.");
    }
}

function extractUserData(from) {
    return {
        telegramId: from.id,
        firstName: from.first_name || "",
        lastName: from.last_name || "",
        username: from.username || `user_${from.id}`,
        language: from.language_code || "es",
    };
}

async function createNewPlayer({ telegramId, firstName, lastName, username }) {
    console.log("Jugador no encontrado, creando uno nuevo...");

    const nombrePlayer = [firstName, lastName].filter(Boolean).join(" ") || username;

    const jugador = new Jugador({
        telegram_id: telegramId,
        player_name: nombrePlayer,
        first_name: firstName,
        last_name: lastName,
        exp: 0,
        level: 1,
        coins: 100,
    });

    await jugador.save();
    console.log("Jugador guardado:", jugador);

    return { jugador, nombrePlayer };
}

async function getToken({ ctx, telegramId, isNewPlayer }) {
    if (isNewPlayer || !ctx.session.token) {
        const token = generateToken(telegramId);
        ctx.session.token = token;
        console.log("Token generado:", token);
        return token;
    }

    const { valid } = verifyToken(ctx.session.token);
    if (valid) {
        console.log("Token existente válido");
        return ctx.session.token;
    } else {
        console.log("Token expirado o inválido, generando uno nuevo...");
        const token = refreshToken(telegramId);
        ctx.session.token = token;
        return token;
    }
}

module.exports = {
    startCommand,
};
