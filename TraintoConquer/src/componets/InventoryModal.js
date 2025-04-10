export default class InventoryModal extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);
    this.scene = scene;

    // Agregar imagen de fondo en lugar del rectángulo
    this.background = this.scene.add.image(0, 0, "bg_inventario");
    this.background.setScale(0.7);
    this.background.setOrigin(0.5);
    this.add(this.background);
    this.armorText = this.scene.add
      .text(0, -170, "Armadura: Iron", {
        fontSize: "24px",
        fontFamily: "MedievalSharp, serif",
        color: "#FFD700",
        fontStyle: "bold",
        align: "center",
      })
      .setStroke("#000000", 2)
      .setOrigin(0.5);
    this.add(this.armorText);

    // Agregar texto "INVENTARIO" en la parte superior con estilo medieval
    this.title = this.scene.add
      .text(0, -200, "INVENTARIO", {
        fontSize: "34px",
        fontFamily: "MedievalSharp, serif",
        color: "#FFD700",
        fontStyle: "bold",
        align: "center",
      })
      .setStroke("#000000", 2)
      .setOrigin(0.5);
    this.add(this.title);

    // Definir los slots con nombres específicos
    this.slots = {
      casco: { x: -60, y: -120, label: "Casco" },
      hombreras: { x: 60, y: -120, label: "Hombreras" },
      guantes: { x: -120, y: 0, label: "Guantes" },
      pantalon: { x: -60, y: 150, label: "Pantalón" },
      botas: { x: 60, y: 150, label: "Botas" },
      pechera: { x: 120, y: 0, label: "Pechera" },
      arma: { x: 0, y: -25, label: "Arma" },
      escudo: { x: 0, y: 65, label: "Escudo" },
    };

    this.slotObjects = {};
    this.items = {};

    // Crear los slots visuales
    Object.keys(this.slots).forEach((key) => {
      let pos = this.slots[key];
      let slot = this.scene.add.rectangle(pos.x, pos.y, 50, 50, 0x8b5a2b, 0.7);
      slot.setStrokeStyle(2, 0xffffff);
      this.add(slot);
      this.slotObjects[key] = slot;

      let label = this.scene.add
        .text(pos.x, pos.y + 35, pos.label, {
          fontSize: "14px",
          fontFamily: "MedievalSharp, serif",
          color: "#ffffff",
          fontStyle: "bold",
        })
        .setStroke("#000000", 2)
        .setOrigin(0.5);
      this.add(label);
    });

    this.scene.add.existing(this);
  }

  updateArmorType(armorType) {
    this.armorText.setText(
      `Armadura: ${this.capitalizeFirstLetter(armorType)}`
    );
  }
  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  getArmorPieces(armorData, armorType) {
    const basePath = armorData[armorType].path;
    return {
      casco: `${basePath}casco.png`,
      hombreras: `${basePath}hombreras.png`,
      guantes: `${basePath}guantes.png`,
      pantalon: `${basePath}pantalon.png`,
      botas: `${basePath}botas.png`,
      pechera: `${basePath}pechera.png`,
      arma: `${basePath}arma.png`,
      escudo: `${basePath}escudo.png`,
    };
  }

  updateInventoryByLevel(playerLevel, armorData) {
    let selectedArmor = "iron";

    for (let armor in armorData) {
      if (playerLevel >= armorData[armor].level) {
        selectedArmor = armor;
      }
    }

    console.log(`Mostrando armadura: ${selectedArmor}`);
    let armorSet = this.getArmorPieces(armorData, selectedArmor);

    Object.keys(armorSet).forEach((slot) => {
      this.addItemToInventory(slot, armorSet[slot]);
    });
  }

  addItemToInventory(slotName, textureKey) {
    if (!this.slots[slotName]) {
      console.warn(`El slot '${slotName}' no existe.`);
      return;
    }

    if (this.items[slotName]) {
      this.items[slotName].destroy();
    }

    let pos = this.slots[slotName];

    this.scene.load.image(textureKey, textureKey);
    this.scene.load.once("complete", () => {
      let item = this.scene.add.image(pos.x, pos.y, textureKey);
      item.setScale(0.24);
      this.add(item);
      this.items[slotName] = item;
      this.bringToTop(item);
    });
    this.scene.load.start();
  }
}
