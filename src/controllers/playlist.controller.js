// controllers/playlist.controller.js
import trackService from "../services/track.service.js";
import viewer from "../views/playlist.view.js";
import playback from "../services/player.service.js";
import artistsService from "../services/artists.service.js";

const $ = (selector, p = document) => p.querySelector(selector);
const $$ = (selector, p = document) => p.querySelectorAll(selector);

const playlistCtrl = {
  audioEle: null,
  currentSong: null,

  async init() {
    this.audioEle = document.querySelector("audio");
    if (!this.audioEle) {
      this.audioEle = document.createElement("audio");
      document.body.appendChild(this.audioEle);
    }
    viewer.playback = playback;
    viewer.audioEle = this.audioEle;

    playback.onStateChange((newState) => {
      const newTrack = newState.currentTrack;
      let newVolume = newState.volume_percent ?? 50;
      let newProgress = newState.position_ms ?? 0;

      if (viewer.isPlaying !== newState.isPlaying || newTrack !== viewer.prevCurrentTrack) {
        viewer.updatePlaybackUI(newState);
      }

      if (newTrack !== viewer.prevCurrentTrack) {
        viewer.prevCurrentTrack = newTrack;
        viewer.updatePlayerDetail(newState);
      }

      if (viewer.prevVolume !== newVolume) {
        viewer.prevVolume = newVolume;
        viewer.updateVolumeUI(newState);
        if (this.audioEle) this.audioEle.volume = newVolume * 0.01;
      }

      if (viewer.prevProgress !== newProgress) {
        viewer.prevProgress = newProgress;
        viewer.updateProgressUI(newState);
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
      viewer.updateNewSong = playlistCtrl.updateNewSong;

      viewer.connectActionControl(this.audioEle);
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

  async updateNewSong(songId) {
    let currentSong = playback.state.currentTrack;
    let newSong = songId && playback.state.tracks.find((song) => song.id === songId);
    if (songId && newSong !== currentSong) {
      currentSong = newSong || currentSong;
      try {
        await playback.setCurrentTrack(currentSong);
      } catch (error) {
        console.error("Lỗi khi cập nhật bản nhạc:", error);
      }
    }

    return currentSong;
  },

  async handlePlaySong() {
    try {
      const audioEle = this.audioEle;
      let currentTrack = playback.state.currentTrack;
      audioEle.src = currentTrack.audio_url;
      let positionMs = 0;
      let durationMs = 0;
      audioEle.ontimeupdate = () => {
        if (!isNaN(audioEle.duration)) {
          const currentTime = audioEle.currentTime;
          const duration = audioEle.duration;
          positionMs = currentTime * 1000;
          durationMs = duration * 1000;
          playback.state.position_ms = positionMs;
          playback.state.duration_ms = durationMs;
        }
      };

      const audio = {
        togglePlay(isNewTrack = false) {
          let newSong = playback.state.currentTrack;

          if (isNewTrack && newSong !== this.currentSong) {
            this.play(isNewTrack);
            this.currentSong = newSong;
          } else if (isNewTrack && !playback.state.isPlaying) {
            this.play();
          } else if (playback.state.isPlaying) {
            this.pause();
          } else if (!playback.state.isPlaying) {
            this.play();
          }
        },

        play(isNewTrack = false) {
          const currentTrack = playback.state.currentTrack;
          if (!currentTrack || !currentTrack.audio_url) {
            console.warn("Không có bài hát để phát!");
            return;
          }

          playback.play(currentTrack.id);
          if (isNewTrack) {
            audioEle.src = currentTrack.audio_url;
            audioEle.oncanplay = () => {
              audioEle.play();
              audioEle.oncanplay = null;
            };
          } else {
            audioEle.play();
          }

          playback.state.position_ms = positionMs;
          playback.state.duration_ms = durationMs;
        },

        pause() {
          playback.pause();
          audioEle.pause();
        },

        onend(cb) {
          audioEle.onended = () => {
            playback.pause();
            viewer.isPlaying = false;
            if (typeof cb === "function") cb();
          };
        },
      };

      viewer.audio = audio;
      return audio;
    } catch (error) {
      console.log("error at handlePlaySong() : ", error);
    }
  },
};

export default playlistCtrl;
