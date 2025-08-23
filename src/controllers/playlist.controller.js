// controllers/playlist.controller.js
import trackService from "../services/track.service.js";
import viewer from "../views/playlist.view.js";
import playback from "../services/player.service.js";
import artistsService from "../services/artists.service.js";

const playlistCtrl = {
  audioEle: null,

  async init() {
    this.audioEle = document.querySelector("audio");
    if (!this.audioEle) {
      this.audioEle = document.createElement("audio");
      document.body.appendChild(this.audioEle);
    }

    playback.onStateChange((newState) => {
      const newTrack = newState.currentTrack;

      if (newTrack !== viewer.prevCurrentTrack) {
        viewer.prevCurrentTrack = newTrack;
        viewer.updatePlayerDetail(newState);
      }

      if (viewer.isPlaying !== newState.isPlaying || viewer.isPlaying) {
        viewer.updatePlaybackUI({ playBtn: viewer.playBtn, playBtnLarge: viewer.playBtnLarge }, newState);
      }

      viewer.isPlaying = newState.isPlaying;
    });

    await this.loadPlaylists();
  },

  async loadPlaylists() {
    try {
      const trendingTracks = await trackService.getTrendingLimit(50);
      viewer.renderList(trendingTracks, "Today's biggest hits", this.handleSelectTracks.bind(this));

      const popularArtists = await trackService.getPopularLimit(50);
      viewer.renderList(popularArtists, "Featured Albums", this.handleSelectTracks.bind(this));

      const albums = await trackService.getAlbums();
      viewer.renderList(albums, "Popular artists", this.handleSelectTracks.bind(this));

      const artistsStars = await artistsService.getArtists();
      viewer.renderList(artistsStars, "Popular albums and singles", this.handleSelectTracks.bind(this));
    } catch (err) {
      console.error("❌ Failed to load playlists:", err.message);
    }
  },

  async handleSelectTracks(track, hitPlay) {
    try {
      // if (track.album_id) {
      //   const tracks = await trackService.getAlbumTracks(track.album_id);
      //   viewer.renderTracks(tracks, track, playlistCtrl.handlePlaySong);
      // } else if (track.artist_id) {
      //   const tracks = await artistsService.getArtistsTrending();
      //   viewer.renderTracks(tracks, track, playlistCtrl.handlePlaySong);
      // } else {
      //   const tracks = await playlistService.getPlaylistsLimit(n);
      //   viewer.renderTracks(tracks, track, playlistCtrl.handlePlaySong);
      // queue}

      const random = Math.floor(Math.random() * (7 - 3) + 3);
      const response = await trackService.getTrendingLimit(random);
      const res = [...response.tracks];

      track = !track.audio_url ? res[Math.floor(Math.random() * (res.length - 1)) + 1] : track;
      const queues = res.filter((item) => item.id !== track.id);
      queues.unshift(track);

      const updates = {
        ...playback.state,
        currentTrack: queues[0],
        tracks: queues,
        queue: queues,
      };
      playback.setState(updates);

      playlistCtrl.handlePlaySong();
      viewer.renderTracks(queues, hitPlay);
    } catch (err) {
      console.error("❌ Failed to load tracks:", err.message);
    }
  },

  async handlePlaySong() {
    try {
      const state = playback.state;
      const tracks = state.tracks;
      const track = state.currentTrack;
      if (!track || !tracks.length) return;

      const audioEle = this.audioEle;
      audioEle.src = track.audio_url;
      let currentTrack = track;

      const audio = {
        togglePlay(songId) {
          const song = songId && tracks.find((song) => song.id === songId);
          if (song && song !== currentTrack) {
            currentTrack = song;
            playback.setTracks(tracks, currentTrack);
            audioEle.src = currentTrack.audio_url;
            this.play(true);
          } else if (!state.isPlaying) {
            this.play();
          } else {
            this.pause();
          }
        },
        play(isNewTrack = false) {
          playback.play(currentTrack.id);
          if (isNewTrack) {
            audioEle.oncanplay = () => audioEle.play();
          } else {
            audioEle.play();
          }
        },
        pause() {
          playback.pause();
          audioEle.pause();
        },
      };

      viewer.audio = audio;
      return audio;
    } catch (error) {
      console.log("error at handlePlaySong() : ", error);
    }
  },

  async updateNewSong() {},
};

export default playlistCtrl;
