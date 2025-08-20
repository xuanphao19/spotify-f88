// services/track.service.js getTrending(limit);
import request from "./httpClient.js";

const trackService = {
  getAll: () => request("/tracks"),
  getTrending: () => request("/tracks/trending"),
  getTrendingLimit: (limit) => request(`/tracks/trending?limit=${limit}`),
  getPopular: () => request("/tracks/popular"),
  getPopularLimit: (limit) => request(`/tracks/popular?limit=${limit}`),
  getAlbums: () => request(`/albums`),
  getPopularAlbums: () => request(`/artists`),

  getById: (id) => request(`/tracks/${id}`),
  play: (id) => request(`/tracks/${id}/play`, { method: "POST" }),
  like: (id) => request(`/tracks/${id}/like`, { method: "POST" }),
  unlike: (id) => request(`/tracks/${id}/like`, { method: "DELETE" }),
  liked: () => request("/me/tracks/liked"),
  recentlyPlayed: () => request("/me/player/recently-played"),
  getAlbumTracks: (id) => request(`/albums/${id}/tracks`),
};

export default trackService;
/* albums/popular */
