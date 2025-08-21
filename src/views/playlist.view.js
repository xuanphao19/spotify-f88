// views/playlist.view.js
import playback from "../services/player.service.js";

export const playlistView = {
  container: document.querySelector(`.content-wrapper`),
  footerElement: document.querySelector(`.footer-player`),
  detailTrack: document.querySelector(`.detail-track`),
  wrapperTrack: document.querySelector(`.detail-wrapper`),
  playBtn: document.querySelector(`.play-btn`),
  playBtnLarge: document.querySelector(`.play-btn-large`),
  trackLists: document.querySelector(".track-list"),
  isPlaying: false,
  prevCurrentTrack: null,

  async renderList(res, prop, onSelect) {
    const section = document.createElement("section");
    section.className = `${prop.section}`;

    const prevCtrl = document.createElement("button");
    prevCtrl.className = `${prop.ctrl} btn prev-slider`;
    prevCtrl.innerText = `◀`;

    const nextCtrl = document.createElement("button");
    nextCtrl.className = `${prop.ctrl} btn next-slider`;
    nextCtrl.innerText = `▶`;

    const head = document.createElement("div");
    head.className = `${prop.header}`;

    const heading = document.createElement("h2");
    heading.className = `${prop.heading}`;
    heading.innerText = `${prop.headTitle}`;

    head.appendChild(heading);
    section.appendChild(head);

    const listItems = document.createElement("div");
    listItems.className = `${prop.content}`;
    listItems.innerHTML = "";

    const data = res.albums || res.tracks || res.artists;
    data.forEach((track) => {
      const item = document.createElement("div");
      item.className = `${prop.item}`;
      item.setAttribute("data-id", `${track.id}`);
      // Cover
      const coverDiv = document.createElement("div");
      coverDiv.className = `${prop.cover}`;
      const img = document.createElement("img");
      img.src = track.image_url || track.artist_image_url || "placeholder.svg";
      img.alt = track.title;
      const playBtn = document.createElement("button");
      playBtn.className = `${prop.playBtn}`;
      playBtn.innerHTML = `<i class="fas fa-play"></i>`;

      coverDiv.appendChild(img);
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

    section.appendChild(listItems);
    section.appendChild(prevCtrl);
    section.appendChild(nextCtrl);
    this.container.appendChild(section);

    section.addEventListener("click", (event) => {
      const target = event.target;
      const currentSlider = event.currentTarget;

      const item = target.closest(".hit-card");
      if (item && !target.closest(".slider-ctrl")) {
        let hitPlay = target.closest(".hit-play");
        const index = [...listItems.children].indexOf(item);
        const track = data[index];

        const random = Math.floor(Math.random() * (7 - 3) + 2);
        if (onSelect) onSelect(track, hitPlay, random);
      }

      this.moveSlider(target, listItems, currentSlider);
    });
  },

  // moveSlider(parents, event) {}, hit-play-btn
  moveSlider(target, slider, currentSlider) {
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

  async renderTracks(tracks, track, hitPlay, handlePlayer) {
    if (!track || !tracks?.tracks) return;
    const data = tracks.tracks;
    track = !track.audio_url ? data[Math.floor(Math.random() * (data.length - 1)) + 1] : track;
    const filtered = data.filter((item) => item.id !== track.id);
    filtered.unshift(track);

    playback.onStateChange((newState) => {
      this.isPlaying = newState.isPlaying;
      const newTrack = newState.currentTrack;

      if (newTrack !== this.previousCurrentTrack) {
        this.previousCurrentTrack = newTrack;
        this.updatePlayerDetail(newState);
      }

      this.updateCtrlUI({ playBtn: this.playBtn, playBtnLarge: this.playBtnLarge }, newState);
    });

    playback.setTracks(filtered, track);
    this.trackLists.innerHTML = "";
    filtered.forEach((song, i) => {
      const trackItem = document.createElement("div");
      const trackPlays = document.createElement("div");
      const trackPlayBtn = document.createElement("button");
      const trackNumber = document.createElement("div");
      const trackImage = document.createElement("div");
      const img = document.createElement("img");
      const trackInfo = document.createElement("div");
      const trackName = document.createElement("div");
      const trackEncored = document.createElement("div");
      const trackDuration = document.createElement("div");
      const trackMenuBrn = document.createElement("button");

      trackItem.setAttribute("data-id", song.id);
      trackItem.className = `track-item`;
      trackPlays.className = `track-plays`;
      trackNumber.className = `track-number`;
      trackImage.className = `track-image`;
      trackInfo.className = `track-info`;
      trackName.className = `track-name`;
      trackEncored.className = `track-encored`;
      trackDuration.className = `track-duration`;
      trackMenuBrn.className = `track-menu-btn`;

      trackPlayBtn.innerHTML = `<i class="fas fa-play"></i>`;
      trackNumber.innerText = `${i + 1}`;
      img.src = song.image_url || "placeholder.svg";
      trackName.innerText = song.artist_name;
      trackEncored.innerText = `27,498,341`;
      trackDuration.innerText = song.duration;
      trackMenuBrn.innerHTML = `<i class="fas fa-ellipsis-h"></i>`;
      trackPlays.append(trackPlayBtn);
      trackPlays.append(trackNumber);
      trackImage.append(img);
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

    setTimeout(() => {
      if (this.wrapperTrack.classList.contains("show-detail-wrapper")) {
        this.detailTrack.classList.add("show-detail");
      }
    }, 50);

    this.handleEventAnalysis(track, hitPlay, handlePlayer);
  },

  async handleEventAnalysis(track, hitPlay, handlePlayer) {
    const logo = document.querySelector(".logo");
    const homeBtn = document.querySelector(".home-btn");
    const btnPlays = [...document.querySelectorAll(".track-plays button")];

    const audio = await handlePlayer(track);
    if (this.isPlaying) audio.togglePlay(this.isPlaying);

    if (hitPlay) audio.togglePlay(this.isPlaying);

    this.playBtn.onclick = () => audio.togglePlay(this.isPlaying);
    this.playBtnLarge.onclick = () => audio.togglePlay(this.isPlaying);

    logo.onclick = this.goHome.bind(this, audio);
    homeBtn.onclick = this.goHome.bind(this, audio);

    if (btnPlays) {
      btnPlays.forEach((btn) => {
        btn.onclick = (e) => this.handlePlayOnList(e, audio);
      });
    }
  },

  handlePlayOnList(e, audio) {
    const item = e.target.closest(".track-item");
    if (!item) return;

    const state = playback.getState();
    const currentSongId = state.currentTrack?.id;
    const songs = state.tracks;
    const selectSongId = item.dataset.id;

    const songSelect = state.tracks.find((song) => song.id === selectSongId);
    if (!songSelect) return;
    playback.setTracks(songs, songSelect);
    if (currentSongId !== selectSongId && this.isPlaying) {
      audio.togglePlay(!state.isPlaying, songSelect);
    } else {
      audio.togglePlay(state.isPlaying, songSelect);
    }
  },

  goHome(audio) {
    this.detailTrack.classList.remove("show-detail");
    setTimeout(() => {
      this.wrapperTrack.classList.remove("show-detail-wrapper");
    }, 300);
    audio.togglePlay(true);
    this.container.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  },

  updatePlayerDetail(state) {
    const song = state.currentTrack || {};
    const title = document.querySelector(".detail-title");
    const albumTitle = document.querySelector(".album-title");
    const playerTitle = document.querySelector(".player-title");
    const artistName = document.querySelector(".artist-name");
    const playerArtist = document.querySelector(".player-artist");
    const playerImage = document.querySelector(".player-image");
    const imgHero = document.querySelector(".hero-background img");

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

  updateCtrlUI(ctrl, state) {
    const song = state.currentTrack || {};
    const isPlaying = state.isPlaying || false;

    ctrl.playBtn.innerHTML = isPlaying && song.id ? `<i class="fas fa-pause"></i>` : `<i class="fas fa-play"></i>`;
    ctrl.playBtnLarge.innerHTML = isPlaying && song.id ? `<i class="fas fa-pause"></i>` : `<i class="fas fa-play"></i>`;

    const allTrackItems = this.trackLists.querySelectorAll(".track-item");
    allTrackItems?.forEach((item) => {
      const btnPlay = item.querySelector(".track-plays button");
      if (!btnPlay) return;
      const isActive = song.id === item.dataset.id && isPlaying;
      btnPlay.innerHTML = isActive ? `<i class="fas fa-volume-up"></i>` : `<i class="fas fa-play"></i>`;
      item.classList.toggle("active", isActive);
    });
  },
};
