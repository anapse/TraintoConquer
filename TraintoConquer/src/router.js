// router.js
window.addEventListener('load', () => {
    // Detectar la ruta
    const path = window.location.pathname;

    if (path === '/dashboard') {
        // Mostrar el dashboard y ocultar el juego
        document.getElementById('app').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
    } else {
        // Mostrar el juego y ocultar el dashboard
        document.getElementById('app').style.display = 'block';
        document.getElementById('dashboard').style.display = 'none';
    }
});
