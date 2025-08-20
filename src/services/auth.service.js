// services/auth.service.js
import request from "./httpClient.js";

const authService = {
  register: (data) => request("/auth/register", { method: "POST", body: data }),
  login: (data) => request("/auth/login", { method: "POST", body: data }),

  changePassword: (data) => request("/auth/change-password", { method: "POST", body: data }),
  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },
};

export default authService;
