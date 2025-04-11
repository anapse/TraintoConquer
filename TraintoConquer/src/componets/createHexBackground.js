export function createHexBackground(icon, scene, x, y, options = {}) {
    const {
        radius = 20,
        fillColor = 0xffffff,    // Fondo oscuro
        borderColor = 0x8B4513,  // Borde marrón
        borderWidth = 2
    } = options;

    // Dibujar el hexágono en (0,0)
    const hex = scene.add.graphics();
    hex.lineStyle(borderWidth, borderColor, 1);
    hex.fillStyle(fillColor, 0.7);

    const points = [];
    for (let i = 0; i < 6; i++) {
        const angle = Phaser.Math.DegToRad(60 * i - 30);
        points.push({
            x: radius * Math.cos(angle),
            y: radius * Math.sin(angle)
        });
    }

    hex.beginPath();
    hex.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        hex.lineTo(points[i].x, points[i].y);
    }
    hex.closePath();
    hex.strokePath();
    hex.fillPath();

    // Asegúrate de centrar el ícono en el contenedor
    icon.setPosition(0, 0);

    // Crear y retornar el contenedor con hexágono + ícono
    const container = scene.add.container(x, y, [hex, icon]);
    container.setSize(radius * 2, radius * 2);

    return container;
}
