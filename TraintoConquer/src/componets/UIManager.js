import InventoryModal from "./InventoryModal";
import armorData from "../data/armors.json";

export class UIManager extends Phaser.Scene {
  constructor() {
    super({ key: "UIManager" });
  }

  init(data) {
    this.level = data.level; // Recibimos el nivel desde `MenuScene`
  }

  preload() {
    this.load.image("icon_inventory", "assets/inventario.png");
    this.load.image("icon_stats", "assets/shield.png");
    this.load.image("icon_lvl", "assets/caracter.png");
  }

  create() {
    // Crear un contenedor principal para la UI, que abarque el ancho de la pantalla
    const container = this.add.container(this.cameras.main.width / 2, 65);

    // Toma el tamaño de la pantalla
    const fontSize = Math.floor(this.scale.width * 0.035); // Escalar el texto al 4% del ancho de la pantalla
    const iconScale = 0.24; // Escalar los iconos (puedes ajustarlo)

    // El fondo será más pequeño en comparación con el contenedor principal
    const bgWidth = this.cameras.main.width * 0.95; // El fondo ocupará un 95% del ancho de la pantalla
    const bgHeight = 95; // Altura fija para el fondo

    // Fondo (ajustado dentro del contenedor)
    let bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.3); // Fondo translúcido
    bg.fillRoundedRect(-bgWidth / 2, -bgHeight / 2, bgWidth, bgHeight, 10); // Fondo más pequeño que el contenedor
    container.add(bg); // Añadir al contenedor

    // Contenedor de los iconos y textos dentro del fondo
    const iconsContainer = this.add.container(0, 0); // Contenedor de los iconos y texto
    container.add(iconsContainer);

    // Modal de inventario
    this.inventoryModal = new InventoryModal(this, 0, this.cameras.main.height / 2 - 40).setScale(0.8); // Crear la instancia de InventoryModal
    this.inventoryModal.setVisible(false); // Oculto al inicio
    container.add(this.inventoryModal); // Añadir al contenedor

    // Inventario (izquierda)
    const inventoryContainer = this.add.container(-bgWidth / 2.7, -10); // Contenedor para el icono y el texto
    let inventory = this.add.image(0, 0, "icon_inventory").setScale(iconScale);
    let textInventory = this.add
      .text(0, 45, "Inventario", {
        fontSize: fontSize + "px",
        fontStyle: "bold",
        color: "#FFFFFF",
      })
      .setOrigin(0.5);

    inventoryContainer.add(inventory);
    inventoryContainer.add(textInventory);
    iconsContainer.add(inventoryContainer);

    // Stats (centro)
    const statsContainer = this.add.container(0, -10); // Contenedor para el icono y el texto
    let stats = this.add.image(0, 0, "icon_stats").setScale(iconScale);
    let textStats = this.add
      .text(0, 45, "Stats", {
        fontSize: fontSize + "px",
        fontStyle: "bold",
        color: "#FFFFFF",
      })
      .setOrigin(0.5);

    statsContainer.add(stats);
    statsContainer.add(textStats);
    iconsContainer.add(statsContainer);

    // Nivel (derecha)
    const lvlContainer = this.add.container(bgWidth / 2.7, -10); // Contenedor para el icono y el texto
    let lvl = this.add.image(0, 0, "icon_lvl").setScale(iconScale);
    this.levelText = this.add
      .text(0, 45, "Lv: " + this.level, {
        fontSize: fontSize + "px",
        fontStyle: "bold",
        color: "#FFFFFF",
      })
      .setOrigin(0.5);

    lvlContainer.add(lvl);
    lvlContainer.add(this.levelText);
    iconsContainer.add(lvlContainer);

    this.armorData = armorData;
    this.updateInventoryByLevel(this.level);

    // Eventos interactivos
    inventory.setInteractive();
    stats.setInteractive();
    lvl.setInteractive();

    inventory.on("pointerdown", () => {
      this.inventoryModal.setVisible(!this.inventoryModal.visible);
    });
    stats.on("pointerdown", () => console.log("Stats abiertos"));
    lvl.on("pointerdown", () => console.log("LVL abierto"));
  }

  updateLevel(newLevel) {
    this.level = newLevel;
    this.levelText.setText("Lv: " + this.level);
    this.updateInventoryByLevel(this.level);
  }

  updateInventoryByLevel(playerLevel) {
    let selectedArmor = "iron"; // Default

    for (let armor in this.armorData) {
      if (playerLevel >= this.armorData[armor].level) {
        selectedArmor = armor;
      }
    }
    this.inventoryModal.updateArmorType(selectedArmor);

    let armorSet = this.inventoryModal.getArmorPieces(
      this.armorData,
      selectedArmor
    );
    Object.keys(armorSet).forEach((slot) => {
      this.inventoryModal.addItemToInventory(slot, armorSet[slot]);
    });
  }
}
