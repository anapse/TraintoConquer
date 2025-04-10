// vite.config.js
export default {
  server: {
    hmr: {
      overlay: false, // Desactiva el overlay de errores
    },
    host: '0.0.0.0', // Permitir conexiones desde cualquier IP
    port: 5173, // El puerto donde se ejecuta Vite
    allowedHosts: ['traintoconquer.servegame.com'], // Asegúrate de agregar tu dominio aquí
    cors: {
      origin: 'https://traintoconquer.servegame.com', // Permitir solo desde tu dominio
    },
  },
};