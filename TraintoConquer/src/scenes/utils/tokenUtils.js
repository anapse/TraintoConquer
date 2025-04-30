import { fetchPlayerData } from "../../apiService";

export async function getTokenFromUrl(scene) {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    if (token) scene.setToken(token);
    return token;
}

export function getTokenFromStorage() {
    return localStorage.getItem("accessToken");
}

export async function getTokenFromInitData(scene) {
    if (!window.Telegram?.WebApp?.initData) return null;

    const initData = new URLSearchParams(window.Telegram.WebApp.initData);
    const telegramId = JSON.parse(initData.get("user") || "{}").id;

    if (!telegramId) return null;

    const response = await fetch("/api/validate-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telegramId }),
    });
    const data = await response.json();
    if (data.token) {
        scene.setToken(data.token);
        scene.setRefreshToken(data.refreshToken);
        return data.token;
    }
    return null;
}

export async function refreshAccessToken(scene, refreshToken) {
    const response = await fetch("/api/refresh-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
    });
    const data = await response.json();
    if (data.token) {
        scene.setToken(data.token);
        return data.token;
    }
    return null;
}

export async function fetchPlayerDataWithToken(token) {
    return fetchPlayerData(token);
}
