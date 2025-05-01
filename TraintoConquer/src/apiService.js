const API_URL = "https://traintoconquer.servegame.com/api"; // URL de la API

// 🟢 Obtener datos del jugador usando el token JWT
export async function getTelegramID(token) {
  try {
    // Validación básica del token
    if (!token || typeof token !== 'string') {
      throw new Error('Token no proporcionado o inválido');
    }

    const response = await fetch("/api/validate-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`  // Envía el token en el header
      },
      body: JSON.stringify({ token })  // También en el body por compatibilidad
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Detalles del error:", errorData);

      if (response.status === 400) {
        throw new Error('Token malformado');
      } else if (response.status === 401) {
        throw new Error('Token expirado');
      } else {
        throw new Error(`Error del servidor: ${response.statusText}`);
      }
    }

    const data = await response.json();

    if (!data?.telegramId) {
      throw new Error('No se recibió telegramId');
    }

    return data.telegramId;

  } catch (error) {
    console.error("❌ Error al obtener el Telegram ID:", error.message);
    throw error;
  }
}

export async function fetchPlayerData(token) {
  try {
    const telegramId = await getTelegramID(token);
    if (!telegramId) {
      console.error("❌ No se pudo obtener Telegram ID");
      return null;
    }

    const response = await fetch(`/api/jugador/${telegramId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error en fetchPlayerData:", errorData);

      if (response.status === 401) {
        // Token expirado - necesita refrescarse
        throw new Error('TOKEN_EXPIRED');
      }
      throw new Error(errorData.message || 'Error al obtener datos');
    }

    return await response.json();

  } catch (error) {
    console.error("❌ Error en fetchPlayerData:", error.message);

    // Diferenciamos entre errores de token y otros errores
    if (error.message === 'TOKEN_EXPIRED') {
      throw error; // Para que el llamador sepa que debe refrescar
    }

    return null;
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

export async function refreshAccessToken(refreshToken) {
  try {
    const response = await fetch("/api/refresh-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error al refrescar el token: ${response.statusText} - ${errorData.message || 'Sin detalles adicionales'}`);
    }

    const data = await response.json();

    if (!data || !data.accessToken) {
      throw new Error("No se recibió un token de acceso válido.");
    }

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
export async function fetchWithAutoRefresh(url, options = {}) {
  let token = localStorage.getItem('accessToken');
  let refreshToken = localStorage.getItem('refreshToken');

  // Primero intentamos con el token actual
  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  });

  // Si el token expiró (401), intentamos renovarlo
  if (response.status === 401 && refreshToken) {
    try {
      const newTokens = await refreshAccessToken(refreshToken);

      if (newTokens.accessToken) {
        // Guardamos los nuevos tokens
        localStorage.setItem('accessToken', newTokens.accessToken);
        if (newTokens.refreshToken) {
          localStorage.setItem('refreshToken', newTokens.refreshToken);
          refreshToken = newTokens.refreshToken;
        }

        // Reintentamos la petición con el nuevo token
        response = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${newTokens.accessToken}`
          }
        });
      }
    } catch (refreshError) {
      console.error('Error al refrescar token:', refreshError);
      throw new Error('SESSION_EXPIRED');
    }
  }

  return response;
}