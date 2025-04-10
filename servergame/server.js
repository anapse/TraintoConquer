require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Jugador = require("./Jugador");
const { Telegraf } = require('telegraf');
const jwt = require("jsonwebtoken");
const app = express();
const BOT_TOKEN = process.env.BOT_TOKEN;
const PORT = process.env.PORT || 3000;
const bot = new Telegraf(BOT_TOKEN);
const SECRET_KEY = process.env.SECRET_KEY;

// Verificar que la URI esté definida
const uri = process.env.MONGO_URI;
if (!uri) {
    console.error("❌ ERROR: La variable MONGO_URI no está definida en el entorno.");
    process.exit(1);
}

// Conexión a MongoDB
console.log("🔍 Conectando a MongoDB...");

mongoose
    .connect(uri)
    .then(() => console.log("📡 Conectado a MongoDB"))
    .catch((err) => {
        console.error("❌ Error conectando a MongoDB:", err.message);
        process.exit(1);
    });
// Middleware
app.use(express.json());
app.use(cors());

// Rutas de la API
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
app.post('/api/telegramWebhook', (req, res) => {
    console.log("➡️ [WEBHOOK] Recibiendo actualización de Telegram:", req.body);
    bot.handleUpdate(req.body)
        .catch(err => {
            console.error("❌ [WEBHOOK] Error al manejar la actualización:", err);
        });
    res.sendStatus(200); // Responde inmediatamente a Telegram con OK
});

// Iniciar servidor y configurar Webhook
app.listen(PORT, "0.0.0.0", async () => {
    console.log(`🔥 API corriendo en http://${process.env.HOST || "localhost"}:${PORT}`);
    try {
        await bot.telegram.setWebhook(`https://traintoconquer.servegame.com/api/telegramWebhook`);
        console.log('Webhook de Telegram configurado correctamente.');
    } catch (error) {
        console.error('Error al configurar el webhook:', error);
    }
});



bot.command('start', async (ctx) => {
    try {
        const telegramId = ctx.from.id;
        const firstName = ctx.from.first_name || "";
        const lastName = ctx.from.last_name || "";
        const username = ctx.from.username || `user_${telegramId}`;
        const language = ctx.from.language_code || "es";

        console.log(`✅ Comando /start recibido de ${username} (ID: ${telegramId})`);

        // Buscar si ya existe el jugador en la base de datos
        let jugador = await Jugador.findOne({ telegram_id: telegramId });

        if (!jugador) {
            // Si no se encuentra el jugador, se crea un nuevo jugador con el nombre del usuario
            console.log("Jugador no encontrado, creando uno nuevo...");
            
            const nombrePlayer = `${firstName} ${lastName}`;  // Se combina el nombre y apellido de Telegram
            
            // Crear nuevo jugador con el nombre tomado de Telegram
            const nuevoJugador = new Jugador({
                telegram_id: telegramId,
                player_name: nombrePlayer,  // Aquí guardamos el nombre completo del jugador
                first_name: firstName,
                last_name: lastName,
                exp: 0,
                level: 1,
                coins: 100,  // Inicializamos con 100 monedas
            });

            // Guardar el nuevo jugador en la base de datos
            try {
                await nuevoJugador.save();
                console.log("Jugador guardado:", nuevoJugador);
            } catch (err) {
                console.error("Error al guardar el jugador:", err);
                return ctx.reply("❌ Ocurrió un error al registrar al jugador. Inténtalo de nuevo más tarde.");
            }

            // Crear el token para el nuevo jugador
            const token = jwt.sign({ telegramId }, SECRET_KEY, { expiresIn: "3h" });

            console.log("Token generado:", token);

            // Enviar la foto y el botón de "Jugar ahora"
            return ctx.replyWithPhoto('https://traintoconquer.servegame.com/img/launch.png', {
                caption: `¡Bienvenido, ${nombrePlayer}! 🎮 Has sido registrado como nuevo jugador. ¿Listo para jugar?`,
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

        } else {
            // Si el jugador ya existe, verificamos el token actual
            console.log("Jugador encontrado, verificando token...");

            // Verificar si el token de la sesión está expirado
            const token = ctx.session.token;  // El token almacenado en la sesión del bot

            try {
                if (token) {
                    // Intentamos decodificar el token
                    const decoded = jwt.verify(token, SECRET_KEY);  // Verificar si el token es válido

                    // Si el token es válido, simplemente continuamos con el token existente
                    console.log("Token existente válido");

                    return ctx.replyWithPhoto('https://traintoconquer.servegame.com/img/launch.png', {
                        caption: `¡Bienvenido de nuevo, ${firstName}! 🚀\nHas recibido 100 monedas 🪙 como regalo de inicio.`,
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
                }
            } catch (error) {
                // Si el token está expirado o inválido, generamos uno nuevo
                console.log("Token expirado o inválido, generando uno nuevo...");

                // Generar un nuevo token
                const newToken = jwt.sign({ telegramId }, SECRET_KEY, { expiresIn: "3h" });

                console.log("Nuevo token generado:", newToken);

                // Actualizar el token en la sesión (si lo estás almacenando en la sesión)
                ctx.session.token = newToken;

                return ctx.replyWithPhoto('https://traintoconquer.servegame.com/img/launch.png', {
                    caption: `¡Bienvenido de nuevo, ${firstName}! 🚀\nHas recibido 100 monedas 🪙 como regalo de inicio.`,
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: "🎮 Jugar ahora",
                                    web_app: {
                                        url: `https://traintoconquer.servegame.com?token=${newToken}`,
                                    }
                                }
                            ]
                        ]
                    }
                });
            }
        }
    } catch (error) {
        console.error("❌ Error en el comando /start:", error);
        return ctx.reply("❌ Ocurrió un error al iniciar. Inténtalo de nuevo más tarde.");
    }
});

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

        const nuevoJugador = new Jugador({
            telegram_id: telegramId,
            player_name: nombrePlayer,
            first_name: firstName,
            last_name: lastName,
            exp: 0,
            level: 1,
            coins: 100,  // Inicializamos con 100 monedas
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

// Lanzar bot
bot.launch();
