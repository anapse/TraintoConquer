const API_URL = "https://traintoconquer.servegame.com/api"; // URL de la API
let telegramId = null;

// 🟢 Obtener datos del jugador usando el token JWT
export async function fetchPlayerData(token) {
  telegramId = await getTelegramID(token); // Esperamos a obtener el telegramId
  try {

    // Asegúrate de obtener el token actualizado
    const response = await fetch(`${API_URL}/jugador/${telegramId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // Si la respuesta no es exitosa (404, 401, etc.)
      if (response.status === 404) {
        console.warn("⚠️ Jugador no encontrado. Puede haber sido eliminado.");
        return null;
      }
      throw new Error(`Error: ${response.statusText}`);
    }
    const data = await response.json();
    return data;

  } catch (error) {
    console.error("❌ Error en fetchPlayerData:", error);
    throw error;
  }
}

// 🟢 Actualizar datos del jugador usando el token JWT
export async function updatePlayerData(token, newData) {
  telegramId = await getTelegramID(token); // Esperamos a obtener el telegramId
  try {
    const response = await fetch(`${API_URL}/jugador/${telegramId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`  // Enviar el token en el encabezado Authorization
      },
      body: JSON.stringify(newData), // Los datos que quieres actualizar
    });

    if (!response.ok) throw new Error("Error actualizando los datos");


  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// 🟢 Obtener el Telegram ID usando el token JWT
export async function getTelegramID(token) {
  try {
    const response = await fetch("/api/validate-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: token }), // Usamos token directamente
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);

    telegramId = data.telegramId; // Actualizamos telegramId con el valor recibido

    return telegramId; // Devolvemos el telegramId para usarlo en las otras funciones
  } catch (error) {
    console.error("❌ Error al obtener el Telegram ID:", error);
  }
}
