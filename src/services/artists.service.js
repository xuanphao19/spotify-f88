// services/track.service.js getTrending(limit);
import request from "./httpClient.js";

const artistsService = {
  getArtists: () => request("/artists"),
  getArtistsTrending: () => request("/artists/trending"),
  getArtistsStars: (id) => request(`/artists/${id}`),
  getTracksPopularOfArtists: () => request("/artists/:id/tracks/popular"),
  getArtistsAlbums: (id) => request(`/artists/${id}/albums`),
  followArtists: (id) => request(`/artists/${id}/follow`, { method: "POST" }),
  unFollow: (id) => request(`/artists/${id}/follow`, { method: "DELETE" }),
  createArtists: () => request("/artists", { method: "POST" }), // (admin)
  getUpdateArtists: (id) => request(`/artists/${id}, { method: "PUT" }`), //  (admin)
  deleteArtists: (id) => request(`/artists/${id}`, { method: "DELETE" }), //  (admin)
};

export default artistsService;
