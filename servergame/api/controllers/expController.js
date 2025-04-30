// controllers/expController.js
const fs = require('fs');
const path = require('path');
const Player = require('../model/Jugador'); // Tu modelo Mongoose

const configPath = path.join(__dirname, '../data/exp_config.json');
const expRequiredPath = path.join(__dirname, '../data/exp_lvl.json');
const energyLevelPath = path.join(__dirname, '../data/energy_lvl.json');

function getConfig() {
    return JSON.parse(fs.readFileSync(configPath));
}

function getExpRequired() {
    return JSON.parse(fs.readFileSync(expRequiredPath)).exp_required;
}

function getEnergyLevelConfig() {
    return JSON.parse(fs.readFileSync(energyLevelPath)).energy_required;
}

function getLevelMultiplier(level, multipliers) {
    const levels = Object.keys(multipliers).map(Number).sort((a, b) => b - a);
    for (let lvl of levels) {
        if (level >= lvl) return multipliers[lvl];
    }
    return 1;
}

function getRandomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function handleAction(telegram_id) {
    const config = getConfig();
    const expRequired = getExpRequired();
    const energyLevelConfig = getEnergyLevelConfig();

    const player = await Player.findOne({ telegram_id });
    if (!player) throw new Error('Jugador no encontrado');

    if (player.energy <= 0) {
        return {
            newLevel: player.level,
            leveledUp: false,
            expEarned: 0,
            coinsEarned: 0,
            energyUsed: 0,
            totalExp: player.exp,
            totalCoins: player.coins,
            totalEnergy: player.energy
        };
    }

    // Calcular energía usada
    const energyUsed = getRandomBetween(
        config.energy_per_action.energy_per_action_min,
        config.energy_per_action.energy_per_action_max
    );

    let actualEnergyUsed = energyUsed;

    if (player.energy < energyUsed) {
        actualEnergyUsed = player.energy; // Solo puede gastar lo que tiene
    }
    // Obtener multiplicador por nivel
    const multiplier = getLevelMultiplier(player.level, config.exp_percentage_per_level);

    // Calcular EXP ganada
    const baseExp = getRandomBetween(
        config.exp_per_action.exp_per_action_min,
        config.exp_per_action.exp_per_action_max
    );
    const expEarned = Math.floor(baseExp * multiplier);

    // Calcular coins ganados
    const coinsEarned = getRandomBetween(
        config.coin_per_action.coin_per_action_min,
        config.coin_per_action.coin_per_action_max
    );

    // Sumar exp y coins
    let newExp = player.exp + expEarned;
    let newLevel = player.level;
    let leveledUp = false;

    while (expRequired[newLevel] && newExp >= expRequired[newLevel]) {
        newExp -= expRequired[newLevel];
        newLevel++;
        leveledUp = true;
    }

    // Actualizar datos del jugador
    player.level = newLevel;
    player.exp = newExp;
    player.coins += coinsEarned;
    player.energy -= actualEnergyUsed;
    player.lastEnergySpentAt = new Date();

    if (leveledUp && energyLevelConfig[newLevel]) {
        player.energy = energyLevelConfig[newLevel]; // Restaurar energía al máximo del nuevo nivel
    }

    await player.save();

    // Retornar los datos actualizados
    return {
        newLevel,
        leveledUp,
        expEarned,
        coinsEarned,
        energyUsed,
        totalExp: player.exp,
        totalCoins: player.coins,
        totalEnergy: player.energy
    };
}

module.exports = {
    handleAction
};
