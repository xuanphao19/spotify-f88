// services/httpClient.js
export const BASE_URL = "https://spotify.f8team.dev/api";

async function request(endpoint, { method = "GET", headers = {}, body } = {}) {
  try {
    const token = localStorage.getItem("access_token");

    const config = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (body) {
      config.body = JSON.stringify(body);
    }

    const res = await fetch(`${BASE_URL}${endpoint}`, config);

    if (res.status === 204) {
      return null;
    }

    if (res.status === 401) {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        const newToken = await refreshAccessToken(refreshToken);
        if (newToken) {
          localStorage.setItem("access_token", newToken);
          return request(endpoint, { method, headers, body });
        }
      }
    }

    if (!res.ok) {
      const errorData = await res.text();
      console.error("API Error Response:", errorData);
      throw new Error(`HTTP Error! status: ${res.status}, message: ${JSON.stringify(errorData)}`);
    }

    return res.json();
  } catch (error) {
    console.error("Lỗi trạng thái gọi fetch chung:", error);
    throw error;
  }
}

export default request;
