const API_URL = "https://traintoconquer.servegame.com/api"; // URL de la API

// 🟢 Obtener datos del jugador usando el token JWT
export async function fetchPlayerData(token) {
  const telegramId = await getTelegramID(token); // Esperamos a obtener el telegramId
  if (!telegramId) {
    console.error("❌ Error: No se pudo obtener el Telegram ID.");
    return null;
  }

  try {
    const response = await fetch(`/api/jugador/${telegramId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
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
  const telegramId = await getTelegramID(token); // Esperamos a obtener el telegramId
  if (!telegramId) {
    console.error("❌ Error: No se pudo obtener el Telegram ID.");
    return;
  }

  try {
    const response = await fetch(`/api/jugador/${telegramId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(newData),
    });

    if (!response.ok) {
      throw new Error(`Error actualizando los datos: ${response.statusText}`);
    }

    const updatedData = await response.json();

    return updatedData;

  } catch (error) {
    console.error("❌ Error en updatePlayerData:", error);
    throw error;
  }
}

// 🟢 Obtener el Telegram ID usando el token JWT
export async function getTelegramID(token) {
  try {
    const response = await fetch("/api/validate-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }), // Usamos token directamente
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error: ${errorData.error || 'Error al obtener Telegram ID'}`);
    }

    const data = await response.json();
    return data.telegramId;

  } catch (error) {
    console.error("❌ Error al obtener el Telegram ID:", error);
    return null; // Devuelve null si ocurre un error
  }
}

// 🟢 Refrescar el token de acceso usando el refresh token
export async function refreshAccessToken(refreshToken) {
  try {
    const response = await fetch("/api/refresh-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error(`Error al refrescar el token: ${response.statusText}`);
    }

    const data = await response.json();
    return data; // Devuelve el nuevo token o datos relacionados

  } catch (error) {
    console.error("❌ Error al refrescar el token:", error);
    throw error; // Lanza el error para manejarlo externamente
  }
}
// apiService.js
export async function handlePlayerAction(telegramId) {
  const url = "/api/action"; // Cambia la URL a tu API
  const requestBody = {
    telegramId
  };
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      throw new Error('Error al realizar la acción');
    }

    const data = await response.json();

    return data;

  } catch (error) {
    console.error('Error:', error);
  }
}
