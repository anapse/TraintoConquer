require('dotenv').config(); // Esto carga el archivo .env una sola vez


const requiredEnvVars = ['SECRET_KEY', 'MONGO_URI', 'BOT_TOKEN'];

requiredEnvVars.forEach((varName) => {
    if (!process.env[varName]) {
        console.error(`❌ ERROR: La variable ${varName} no está definida en el entorno.`);
        process.exit(1);
    }
});


const SECRET_KEY = process.env.SECRET_KEY;
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || `localhost`;
const MONGO_URI = process.env.MONGO_URI;
const BOT_TOKEN = process.env.BOT_TOKEN;


module.exports = {
    SECRET_KEY, PORT, HOST, MONGO_URI, BOT_TOKEN
};