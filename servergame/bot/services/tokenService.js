const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../../config/config'); // Asegúrate que la ruta esté correcta

function generateToken(telegramId) {
    return jwt.sign({ telegramId }, SECRET_KEY, { expiresIn: '3h' });
}

function verifyToken(token) {
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        return { valid: true, decoded };
    } catch (error) {
        return { valid: false, error };
    }
}

function refreshToken(telegramId) {
    return generateToken(telegramId); // En este caso igual que generateToken
}

module.exports = {
    generateToken,
    verifyToken,
    refreshToken,
};
