const API_URL = "https://traintoconquer.servegame.com/api"; // URL de la API

// 🟢 Obtener datos del jugador
 async function fetchPlayerData2(telegramId) {
  try {
    const response = await fetch(`${API_URL}/jugador/${telegramId}`);

    // Verificar si la respuesta es JSON (como antes)
    const contentType = response.headers.get("Content-Type");
    if (!contentType || !contentType.includes("application/json")) {
      const textResponse = await response.text(); // Obtener como texto
      console.error("❌ No se recibió JSON, sino HTML o texto:", textResponse);
      throw new Error("La respuesta no es JSON");
    }
    // Si la respuesta es JSON, procesarla
    return await response.json();
  } catch (error) {
    console.error("❌ Error:", error);
    return null;
  }
}

// 🟢 Actualizar datos del jugador
 async function updatePlayerData(telegramId, newData) {
  try {
    const response = await fetch(`${API_URL}/jugador/${telegramId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newData),
    });

    if (!response.ok) throw new Error("Error actualizando los datos");

    console.log("✅ Datos actualizados:", await response.json());
  } catch (error) {
    console.error("❌ Error:", error);
  }
}
module.exports = { fetchPlayerData2 , updatePlayerData};