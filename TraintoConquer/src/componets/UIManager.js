import InventoryModal from "./InventoryModal";
import armorData from "../data/armors.json";

export class UIManager extends Phaser.Scene {
  constructor() {
    super({ key: "UIManager" });
  }
  init(data) {
    this.level = data.level; // 🔹 Recibimos el nivel desde `MenuScene`
  }
  preload() {
    this.load.image("icon_inventory", "assets/inventario.png"); // 👜 Maletín
    this.load.image("icon_stats", "assets/shield.png"); // 💪 Escudo/Brazo fuerte
    this.load.image("icon_lvl", "assets/caracter.png"); // 👤 Carita de jugador
  }

  create() {
    const centerX = this.cameras.main.width / 2;

    this.inventoryModal = new InventoryModal(
      this,
      this.scale.width / 2,
      this.scale.height / 2 + 30
    );
    this.inventoryModal.setVisible(false); // Oculto al inicio
    this.add.existing(this.inventoryModal);

    // 🔥 Escuchar el evento cuando el jugador sube de nivel
    this.scene.get("MenuScene").events.on("playerLevelUp", (newLevel) => {
      this.updateLevel(newLevel);
    });

    let bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.3); // Color negro con transparencia
    bg.fillRoundedRect(5, -10, centerX * 2 - 10, 105, 10); // (x, y, width, height, radio)

    // 📦 Inventario (izquierda)
    let inventory = this.add
      .image(centerX - 180, 40, "icon_inventory")
      .setScale(0.25);
    let textInventory = this.add
      .text(inventory.x, inventory.y + 45, "Inventario", {
        fontSize: "16px",
        fontStyle: "bold",
        color: "#FFFFFF",
      })
      .setOrigin(0.5);

    // 💪 Stats (centro)
    let stats = this.add.image(centerX, 40, "icon_stats").setScale(0.25);
    let textStats = this.add
      .text(stats.x, stats.y + 45, "Stats", {
        fontSize: "16px",
        fontStyle: "bold",
        color: "#FFFFFF",
      })
      .setOrigin(0.5);

    // 👤 Nivel (derecha)
    let lvl = this.add.image(centerX + 180, 40, "icon_lvl").setScale(0.25);
    this.levelText = this.add
      .text(lvl.x - 10, lvl.y + 45, "Lv: " + this.level, {
        fontSize: "16px",
        fontStyle: "bold",
        color: "#FFFFFF",
      })
      .setOrigin(0.5);
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
    this.level = newLevel; // Actualiza el nivel
    this.levelText.setText("Lvl: " + this.level); // Refleja el cambio en UI
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
