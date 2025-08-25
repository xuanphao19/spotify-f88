// views/playlist.view.js

const $ = (selector, p = document) => p.querySelector(selector);
const $$ = (selector, p = document) => p.querySelectorAll(selector);

const prop = {
  selector: "content-wrapper",
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
  ctrl: "slider-ctrl",
};

const artistProp = {
  ...prop,
  content: "artists-grid hits-slider",
  item: "artist-card hit-card",
  cover: "artist-card-cover",
  playBtn: "hit-play artist-play-btn",
  info: "artist-card-info",
  title: "artist-card-name",
  artist: "artist-card-name",
};

const playlistView = {
  playback: null,
  audioEle: null,
  detailTrack: $(`.detail-track`),
  container: $(`.content-wrapper`),
  wrapperTrack: $(`.detail-wrapper`),
  playBtnLarge: $(`.play-btn-large`),
  trackLists: $(".track-list"),
  playBtnCtrl: $(`.play-btn-ctrl`),
  volumeContainer: $(".volume-container"),
  volumeHandle: $(".volume-handle"),
  volumeDown: $(".volume-down"),
  volumeBar: $(".volume-bar"),
  volumeFill: $(".volume-fill"),

  progressBar: $(".progress-bar"),
  progressFill: $(".progress-fill"),
  progressHandle: $(".progress-handle"),
  currentTime: $(".current-time"),
  durationTime: $(".duration-time"),
  totalDuration: $(".volume-handle"),

  audio: null,
  isPlaying: false,
  prevVolume: 40,
  prevProgress: 0,
  prevCurrentTrack: null,
  updateNewSong: null,

  async renderList(res, title, onSelectTrack) {
    const data = res.albums || res.tracks || res.artists;
    const section = this._createSectionTracks(prop, title);
    const listItems = this._createContentSection(data, prop, title);
    section.appendChild(listItems);
    this.container.appendChild(section);

    section.addEventListener("click", async (event) => {
      const target = event.target;
      const currentSlider = event.currentTarget;

      const item = target.closest(".hit-card");
      if (item && !target.closest(".slider-ctrl")) {
        // Send DOMnode => not selectorAll & forEach
        const hitPlay = target.closest(".hit-play");
        // Cách lấy phần tử DOM để truy xuất phần tử
        // tương ứng từ mảng mà không dùng vòng lặp thủ công
        const index = [...listItems.children].indexOf(item);
        const track = data[index];

        if (onSelectTrack) await onSelectTrack(track);
        if (hitPlay) {
          await this.updateNewSong(item.dataset.id);
          this.audio.togglePlay(true);
        }
        if (!hitPlay && this.isPlaying) this.audio.pause();
      }

      this._moveSlider(target, listItems, currentSlider);
    });
  },

  _likedSongsClick() {
    const likedSongs = $(".liked-songs");
    likedSongs.onclick = () => {
      this.audio.togglePlay();
    };
  },

  _createSectionTracks(prop, title) {
    prop = title === "Featured Albums" ? artistProp : prop;
    const { prevCtrl, nextCtrl } = this._createCtrlSlider(prop);

    const section = document.createElement("section");
    section.className = `${prop.section}`;
    const head = document.createElement("div");
    head.className = `${prop.header}`;

    const heading = document.createElement("h2");
    heading.className = `${prop.heading}`;
    heading.innerText = `${title}`;
    head.appendChild(heading);

    section.appendChild(head);
    section.appendChild(prevCtrl);
    section.appendChild(nextCtrl);

    return section;
  },

  _createCtrlSlider(prop) {
    const prevCtrl = document.createElement("button");
    prevCtrl.className = `${prop.ctrl} btn prev-slider`;
    prevCtrl.innerText = `◀`;

    const nextCtrl = document.createElement("button");
    nextCtrl.className = `${prop.ctrl} btn next-slider`;
    nextCtrl.innerText = `▶`;
    return { prevCtrl, nextCtrl };
  },

  _createDivImages(selector, url, alt) {
    const wrapImage = document.createElement("div");
    wrapImage.className = `${selector}`;
    const img = document.createElement("img");
    img.src = `${url}` || "placeholder.svg";
    img.alt = alt;
    wrapImage.appendChild(img);
    return wrapImage;
  },

  _createContentSection(data, prop, title) {
    prop = title === "Featured Albums" ? artistProp : prop;
    const listItems = document.createElement("div");
    listItems.className = `${prop.content}`;

    listItems.innerHTML = "";
    data.forEach((track) => {
      const item = document.createElement("div");
      item.className = `${prop.item}`;
      item.setAttribute("data-id", `${track.id}`);
      // Cover
      const imgUrl = track.image_url || track.artist_image_url;
      const coverDiv = this._createDivImages(prop.cover, imgUrl, track.title);
      const playBtn = document.createElement("button");
      playBtn.className = `${prop.playBtn}`;
      playBtn.innerHTML = `<i class="fas fa-play"></i>`;
      coverDiv.appendChild(playBtn);
      // Info
      const infoDiv = document.createElement("div");
      infoDiv.className = `${prop.info}`;
      const title = document.createElement("h3");
      title.className = `${prop.title}`;
      title.textContent = track.title || track.name;
      const artist = document.createElement("p");
      artist.className = `${prop.artist}`;
      artist.textContent = track.artist_name || track.bio;

      infoDiv.appendChild(title);
      infoDiv.appendChild(artist);

      // Gắn vào item
      item.appendChild(coverDiv);
      item.appendChild(infoDiv);
      listItems.appendChild(item);
    });

    return listItems;
  },

  _moveSlider(target, slider, currentSlider) {
    const nextBtn = currentSlider.querySelector(".next-slider");
    const prevBtn = currentSlider.querySelector(".prev-slider");
    if (target.closest(".prev-slider")) {
      slider.scrollBy({ left: -500 });
      nextBtn.disabled = false;
      prevBtn.disabled = slider.scrollLeft <= 0;
    } else if (target.closest(".next-slider")) {
      slider.scrollBy({ left: 500 });
      prevBtn.disabled = false;
      nextBtn.disabled = slider.scrollLeft + slider.clientWidth >= slider.scrollWidth;
    }
  },

  /* =================== */
  /* ==== renderTracks ===== */
  /* =================== */

  async renderTracks(queues) {
    if (!Array.isArray(queues)) return;

    this.trackLists.innerHTML = "";
    queues.forEach((song, i) => {
      const trackItem = document.createElement("div");
      const trackPlays = document.createElement("div");
      const trackPlayBtn = document.createElement("button");
      const trackNumber = document.createElement("div");
      const trackInfo = document.createElement("div");
      const trackName = document.createElement("div");
      const trackEncored = document.createElement("div");
      const trackDuration = document.createElement("div");
      const trackMenuBrn = document.createElement("button");

      trackItem.setAttribute("data-id", song.id);
      trackItem.className = `track-item`;
      trackPlays.className = `track-plays`;
      trackNumber.className = `track-number`;
      trackInfo.className = `track-info`;
      trackName.className = `track-name`;
      trackEncored.className = `track-encored`;
      trackDuration.className = `track-duration`;
      trackMenuBrn.className = `track-menu-btn`;
      const url = song.image_url;
      const trackImage = this._createDivImages(`track-image`, url, song.artist_name);

      trackPlayBtn.innerHTML = `<i class="fas fa-play"></i>`;
      trackNumber.innerText = `${i + 1}`;
      trackName.innerText = song.artist_name;
      trackEncored.innerText = `27,498,341`;
      trackDuration.innerText = song.duration;
      trackMenuBrn.innerHTML = `<i class="fas fa-ellipsis-h"></i>`;
      trackPlays.append(trackPlayBtn);
      trackPlays.append(trackNumber);
      trackInfo.append(trackName);

      trackItem.append(trackPlays);
      trackItem.append(trackImage);
      trackItem.append(trackInfo);
      trackItem.append(trackEncored);
      trackItem.append(trackDuration);
      trackItem.append(trackMenuBrn);

      this.trackLists.append(trackItem);
    });

    this.wrapperTrack.classList.add("show-detail-wrapper");
    this.container.scrollTo({ top: 0 });
    setTimeout(() => this.detailTrack.classList.add("show-detail"), 50);

    this.handleEventAnalysis();
  },

  async handleEventAnalysis() {
    const logo = $(".logo");
    const homeBtn = $(".home-btn");
    const btnPlays = [...$$(".track-plays button")];

    logo.onclick = this._goHome.bind(this);
    homeBtn.onclick = this._goHome.bind(this);
    this.playBtnLarge.onclick = this._handleBtnPlayClick.bind(this);

    if (btnPlays) {
      btnPlays.forEach((btn) => {
        btn.onclick = this._handleTrackOnList.bind(this);
      });
    }
  },

  _handleBtnPlayClick() {
    if (this.audio) this.audio.togglePlay();
  },

  async _handleTrackOnList(e) {
    const item = e.target.closest(".track-item");
    if (!item) return;
    const selectSongId = item.dataset.id;
    if (!selectSongId) return;
    await this.updateNewSong(selectSongId);
    await this.audio.togglePlay(true);
    if (this.isPlaying === true) this.container.scrollTo({ top: 0 });
  },

  _goHome(e) {
    if (e.target.closest(".home-btn") || e.target.closest(".logo")) {
      this.audio.pause();
      this.container.scrollTo({ top: 0 });
      this.detailTrack.classList.remove("show-detail");
      setTimeout(() => this.wrapperTrack.classList.remove("show-detail-wrapper"), 300);
    }
  },

  updatePlayerDetail(state) {
    const song = state.currentTrack || {};
    const title = $(".detail-title");
    const albumTitle = $(".album-title");
    const playerTitle = $(".player-title");
    const artistName = $(".artist-name");
    const playerArtist = $(".player-artist");
    const playerImage = $(".player-image");
    const imgHero = $(".hero-background img");

    if (song.title) {
      title.innerText = song.title || "";
      playerTitle.innerText = song.title || "";
      imgHero.src = song.image_url || song.album_cover_image_url || "favicon.ico";
      playerImage.src = song.album_cover_image_url || song.image_url || "favicon.ico";
      playerArtist.innerText = song.artist_name || "";
      artistName.innerText = song.artist_name || "";
      albumTitle.innerText = song.album_title || "";
    } else {
      title.innerText = "";
      playerTitle.innerText = "";
      imgHero.src = "favicon.ico";
      playerImage.src = "favicon.ico";
      playerArtist.innerText = "";
      artistName.innerText = "";
      albumTitle.innerText = "";
    }
  },

  updatePlaybackUI(state) {
    const song = state.currentTrack || {};
    const isPlaying = state.isPlaying || false;

    this.playBtnCtrl.innerHTML = isPlaying && song.id ? `<i class="fas fa-pause"></i>` : `<i class="fas fa-play"></i>`;
    this.playBtnLarge.innerHTML = isPlaying && song.id ? `<i class="fas fa-pause"></i>` : `<i class="fas fa-play"></i>`;

    const allTrackItems = [...this.trackLists.children];
    allTrackItems?.forEach((item, i) => {
      const btnPlay = $(".track-plays button", item);
      if (!btnPlay) return;
      const isActive = song.id === item.dataset.id && isPlaying;
      btnPlay.innerHTML = isActive ? `<i class="fas fa-volume-up"></i>` : `<i class="fas fa-play"></i>`;
      item.classList.toggle("active", isActive);
    });
  },

  handleVolume() {
    let isDragging = false;
    const setNewVolume = (e) => {
      const barRect = this.volumeBar.getBoundingClientRect();
      const clickX = e.clientX - barRect.left;
      const barWidth = barRect.width;
      const newVolume = Math.max(0, Math.min(100, (clickX / barWidth) * 100));
      playback.setVolume(Math.round(newVolume));
    };

    this.volumeBar.onmousedown = (e) => {
      isDragging = true;
      setNewVolume(e);
    };
    document.onmousemove = (e) => {
      if (isDragging) {
        setNewVolume(e);
      }
    };
    document.onmouseup = () => {
      isDragging = false;
    };

    this.volumeContainer.addEventListener("wheel", (e) => {
      e.preventDefault();
      let step = 5;
      let delta = e.deltaY < 0 ? step : -step;
      let current = this.playback.getState().volume_percent ?? 50;
      let newVolume = Math.min(100, Math.max(0, current + delta));

      this.playback.setVolume(newVolume);
    });
  },

  updateVolumeUI(state) {
    const volume = state.volume_percent;
    if (this.volumeDown) {
      this.volumeDown.children[0].classList.remove("fa-volume-mute", "fa-volume-down", "fa-volume-up");
      this.volumeDown.children[0].classList.add(
        volume === 0 ? "fa-volume-mute" : volume < 20 ? "fa-volume-down" : "fa-volume-up",
      );
    }

    if (this.volumeFill && this.volumeHandle) {
      const root = this.volumeContainer.style;
      root.setProperty("--volume-width", `${volume}%`);
      root.setProperty("--hue", `${160 - volume * 1.3}deg`);
      root.setProperty("--handle-hue", `${120 - volume}deg`);
      root.setProperty("--icon-hue", `${140 - volume}deg`);
      root.setProperty("--grad-pos", `${(volume + -130) * -1}%`);
    }

    if (volume !== 0) {
      this.prevVolume = volume;
    }
  },

  registerInteractiveBar({ container, onChange, wheelStep = 0, toggleBtn = null }, isProgress = false) {
    let isDragging = false;
    let isDraProg = false;
    const handleInteractive = (e) => {
      const rect = container.getBoundingClientRect();
      const pos = e.clientX - rect.left;
      const percent = Math.max(0, Math.min(100, (pos / rect.width) * 100));

      onChange(Math.round(percent));
    };

    container.onmousedown = (e) => {
      isDragging = true;
      if (isProgress) isDraProg = true;
      handleInteractive(e);

      const onMouseMove = (e) => {
        if (isDragging) handleInteractive(e);
        if (isDraProg) this.audioEle.pause();
      };

      const onMouseUp = () => {
        isDragging = false;
        if (isDraProg) this.audioEle.play();
        isDraProg = false;
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    };

    if (wheelStep > 0) {
      container.addEventListener("wheel", (e) => {
        e.preventDefault();
        let delta = e.deltaY < 0 ? wheelStep : -wheelStep;
        onChange(delta, true);
      });
    }

    if (toggleBtn) {
      toggleBtn.onclick = () => {
        const current = this.playback.getState().volume_percent;
        onChange(current === 0 ? this.prevVolume || 50 : 0);
      };
    }
  },

  updateProgressUI(state) {
    const { position_ms, duration_ms } = state;
    const percent = duration_ms ? (position_ms / duration_ms) * 100 : 0;

    if (this.progressFill && this.progressHandle) {
      const root = this.progressBar.style;
      root.setProperty("--progress-width", `${percent}%`);
    }

    if (this.currentTime) {
      this.currentTime.textContent = this._formatTime(position_ms / 1000);
    }
    if (this.durationTime) {
      this.durationTime.textContent = this._formatTime(duration_ms / 1000);
    }
  },

  _formatTime(sec) {
    if (!sec || isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  },

  connectActionControl() {
    // const player = $(".player");
    // const redo = $(".redo");
    // const expand = $(".expand");
    // const forward = $(".forward");
    // const backward = $(".backward");
    // const random = $(".random-tracks");
    // const microphone = $(".microphone");

    this.playBtnCtrl.onclick = this._handleBtnPlayClick.bind(this);

    this.registerInteractiveBar({
      container: this.volumeBar,
      onChange: this._setVolumeValue.bind(this),
      wheelStep: 5,
      toggleBtn: this.volumeDown,
    });

    this.registerInteractiveBar(
      {
        container: this.progressBar,
        onChange: this._setProgressValue.bind(this),
      },
      true,
    );

    this._likedSongsClick();
  },
  _setVolumeValue(val, isDelta) {
    let current = this.playback.getState().volume_percent;
    let newVolume = isDelta ? Math.min(100, Math.max(0, current + val)) : val;

    this.playback.setVolume(newVolume);
  },

  _setProgressValue(percent) {
    const { duration_ms = 0 } = this.playback.state;
    if (!duration_ms) return;

    const seekToMs = Math.min(duration_ms, Math.max(0, (percent / 100) * duration_ms));
    const seekToSec = seekToMs / 1000;

    if (this.audioEle.readyState >= 1) {
      this.audioEle.currentTime = seekToSec;
    } else {
      console.warn("Audio chưa sẵn sàng để set currentTime");
    }

    this.playback.seek(seekToMs);
  },
};

export default playlistView;
