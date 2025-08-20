// services/user.service.js
import request from "./httpClient.js";

const userService = {
  getProfile: () => request("/users/me"),
  updateProfile: (data) => request("/users/me", { method: "PUT", body: data }),
};

export default userService;
