export function drawButton(scene, color = 0xffffff, alpha = 1) {
    scene.buttonGraphics.clear();
    scene.buttonGraphics.fillStyle(color, alpha);
    scene.buttonGraphics.fillCircle(scene.scale.width / 2, scene.scale.height / 2, 100);
}
