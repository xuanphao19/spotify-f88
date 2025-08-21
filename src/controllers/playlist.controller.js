// controllers/playlist.controller.js
import trackService from "../services/track.service.js";
import { playlistView } from "../views/playlist.view.js";
import playback from "../services/player.service.js";
import artistsService from "../services/artists.service.js";

const trendingProp = {
  selector: "content-wrapper",
  headTitle: "Today's biggest hits",
  section: "hits-section",
  header: "section-header",
  heading: "section-heading",
  content: "hits-grid hits-slider",
  item: "hit-card",
  cover: "hit-card-cover",
  playBtn: "hit-play-btn hit-play",
  info: "hit-card-info",
  title: "hit-card-title",
  artist: "hit-card-artist",
  ctrl: "slider-ctrl",
};

const popularProp = {
  ...trendingProp,
  headTitle: "Featured Albums",
  section: "artists-section",

  content: "artists-grid hits-slider",
  item: "artist-card hit-card",
  cover: "artist-card-cover",
  playBtn: "artist-play-btn hit-play",
  info: "artist-card-info",
  title: "artist-card-name",
  artist: "artist-card-name",
};

const albumsProp = {
  ...trendingProp,
  headTitle: "Popular artists",
  section: "albums-section artists-section",
};

const artistsProp = {
  ...trendingProp,
  headTitle: "Popular albums and singles",
  section: "popular-albums-section",
};

const playlistController = {
  async loadPlaylists() {
    try {
      const trendingTrack = await trackService.getTrendingLimit(50);
      playlistView.renderList(trendingTrack, trendingProp, this.handleSelectPlaylist);

      const popularArtists = await trackService.getPopularLimit(50);
      playlistView.renderList(popularArtists, popularProp, this.handleSelectPlaylist);

      const albums = await trackService.getAlbums();
      playlistView.renderList(albums, albumsProp, this.handleSelectPlaylist);

      const artistsStars = await artistsService.getArtists();
      playlistView.renderList(artistsStars, artistsProp, this.handleSelectPlaylist);
    } catch (err) {
      console.error("❌ Failed to load playlists:", err.message);
    }
  },

  async handleSelectPlaylist(track, hitPlay, n) {
    try {
      // if (track.album_id) {
      //   const tracks = await trackService.getAlbumTracks(track.album_id);
      //   playlistView.renderTracks(tracks, track, playlistController.handlePlaySong);
      // } else if (track.artist_id) {
      //   const tracks = await artistsService.getArtistsTrending();
      //   playlistView.renderTracks(tracks, track, playlistController.handlePlaySong);
      // } else {
      //   const tracks = await playlistService.getPlaylistsLimit(n);
      //   playlistView.renderTracks(tracks, track, playlistController.handlePlaySong);
      // }
      const tracks = await trackService.getTrendingLimit(n);
      playlistView.renderTracks(tracks, track, hitPlay, playlistController.handlePlaySong);
    } catch (err) {
      console.error("❌ Failed to load tracks:", err.message);
    }
  },

  async handlePlaySong(track) {
    try {
      const audioElement = document.querySelector("audio");
      audioElement.src = track.audio_url;

      const audio = {
        togglePlay(isPlaying) {
          console.log("str1", 123456789);
          if (isPlaying) {
            playback.pause();
            audioElement.pause();
          } else {
            playback.play(track.id);
            audioElement.play();
          }
        },
      };

      audioElement.onplay = () => {
        // console.log("audioElement.onplay");
      };

      return audio;
    } catch (error) {
      console.log("error at handlePlaySong() : ", error);
    }
  },

  async rerenderPlaylists() {
    await this.loadPlaylists();
  },
};

export default playlistController;
