// controllers/playlist.controller.js
import trackService from "../services/track.service.js";
import viewer from "../views/playlist.view.js";
import playback from "../services/player.service.js";
import artistsService from "../services/artists.service.js";

const $ = (selector, p = document) => p.querySelector(selector);
const $$ = (selector, p = document) => p.querySelectorAll(selector);

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
        viewer.updatePlaybackUI(newState);
      }

      viewer.isPlaying = newState.isPlaying;
    });

    await this.loadPlaylists();
  },

  async loadPlaylists() {
    try {
      const trendingTracks = await trackService.getTrendingLimit(50);
      await viewer.renderList(trendingTracks, "Today's biggest hits", this.selectTracks.bind(this));

      const popularArtists = await trackService.getPopularLimit(50);
      await viewer.renderList(popularArtists, "Featured Albums", this.selectTracks.bind(this));

      const albums = await trackService.getAlbums();
      await viewer.renderList(albums, "Popular artists", this.selectTracks.bind(this));

      const artistsStars = await artistsService.getArtists();
      await viewer.renderList(artistsStars, "Popular albums and singles", this.selectTracks.bind(this));

      const updates = {
        ...playback.state,
        tracks: trendingTracks.tracks,
        currentTrack: trendingTracks.tracks[3],
      };

      playback.setState(updates);
      playlistCtrl.handlePlaySong();

      viewer.connectActionControl(playlistCtrl.updateNewSong);
    } catch (err) {
      console.error("❌ Failed to load playlists:", err.message);
    }
  },

  async selectTracks(track) {
    try {
      const random = Math.floor(Math.random() * (8 - 3) + 3);
      const response = await trackService.getTrendingLimit(random);
      const res = [...response.tracks];
      track = !track.audio_url ? res[Math.floor(Math.random() * (res.length - 1))] : track;

      const queues = [track, ...res.filter((item) => item.id !== track.id)];
      playback.setState({
        ...playback.state,
        currentTrack: queues[0],
        tracks: queues,
        queue: queues,
      });

      await viewer.renderTracks(queues);

      return {
        track: playback.getTrack(),
        tracks: playback.getTracks(),
      };
    } catch (err) {
      console.error("❌ Failed to load tracks:", err.message);
    }
  },

  async handlePlaySong() {
    try {
      const audioEle = this.audioEle;
      let currentTrack = playback.state.currentTrack;
      audioEle.src = currentTrack.audio_url;

      const audio = {
        togglePlay(songId) {
          let song = songId && playback.state.tracks.find((s) => s.id === songId);
          if (songId && song !== currentTrack) {
            currentTrack = song ? song : playback.state.currentTrack;
            playback.setCurrentTrack(currentTrack);
            audioEle.src = currentTrack.audio_url;
            this.play(true);
          } else if (!playback.state.isPlaying) {
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

  async updateNewSong() {
    const isplay = playback.getIsPlaying();
    console.log("state.isPlaying: ", isplay);
  },
};

export default playlistCtrl;
