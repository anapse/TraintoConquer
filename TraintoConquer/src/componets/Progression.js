class Progression {
    constructor(playerData) {
        this.level = playerData.level || 1;
        this.exp = playerData.exp || 0;
        this.coins = playerData.coins || 0;
        this.maxExp = 1000; // Esto lo puedes hacer dinámico si es necesario
    }

    gainExp(amount) {
        this.exp += amount;
        if (this.exp >= this.maxExp) {
            this.levelUp();
        }
    }

    levelUp() {
        this.level++;
        this.exp = 0; // O puedes reducir la exp al sobrante si deseas
        return this.level;
    }

    getProgress() {
        return { level: this.level, exp: this.exp, coins: this.coins };
    }

    updatePlayerData(newData) {
        // Lógica para actualizar los datos del jugador en el servidor
    }
}

export default Progression;
