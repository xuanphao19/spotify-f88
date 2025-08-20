// services/playlist.service.js
import request from "./httpClient.js";

const playlistService = {
  // Lấy danh sách playlist công khai (có thể truyền query param: ?q=keyword)
  getAll: () => request("/playlists"),
  getPlaylistsLimit: (limit = 20) => request(`/playlists?limit=${limit}`),

  // Lấy playlist chi tiết danh sách phát
  getById: (id) => request(`/playlists/${id}`),

  // Lấy danh sách track trong playlist (danh sách phát)
  getTracks: (id) => request(`/playlists/${id}/tracks`),

  // Playlist của user hiện tạiLấy Danh sách phát của tôi
  getMyPlaylists: () => request("/me/playlists"),
  // Lấy Danh sách phát được tôi theo dõi
  getFollowedPlaylists: () => request("/me/playlists/followed"),

  // Tạo mới playlist (danh sách phát)
  create: (data) => request("/playlists", { method: "POST", body: data }),

  // Cập nhật playlist (chỉ owner)
  update: (id, data) => request(`/playlists/${id}`, { method: "PUT", body: data }),

  // Xoá playlist (chỉ owner)
  remove: (id) => request(`/playlists/${id}`, { method: "DELETE" }),

  // Thêm track vào playlist
  addTrack: (playlistId, trackId) =>
    request(`/playlists/${playlistId}/tracks`, {
      method: "POST",
      body: { trackId },
    }),

  // Xoá track khỏi playlist
  removeTrack: (playlistId, trackId) =>
    request(`/playlists/${playlistId}/tracks/${trackId}`, {
      method: "DELETE",
    }),

  // Reorder track (Sắp xếp lại bài hát) trong playlist
  reorderTrack: (playlistId, trackId, position) =>
    request(`/playlists/${playlistId}/tracks/${trackId}/position`, {
      method: "PUT",
      body: { position },
    }),

  // Follow / Unfollow playlist
  follow: (id) => request(`/playlists/${id}/follow`, { method: "POST" }),
  unfollow: (id) => request(`/playlists/${id}/follow`, { method: "DELETE" }),
};

export default playlistService;
