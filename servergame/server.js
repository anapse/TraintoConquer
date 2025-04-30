
const app = require("./api/api");
const Bot = require("./bot/bot");
const { PORT, HOST } = require("./config/config");

app.listen(PORT, "0.0.0.0", async () => {
    console.log(`🔥 API corriendo en http://${HOST}:${PORT}`);

});
