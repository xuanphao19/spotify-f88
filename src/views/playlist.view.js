// views/playlist.view.js

import playback from "../services/player.service.js";

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
  detailTrack: $(`.detail-track`),
  container: $(`.content-wrapper`),
  wrapperTrack: $(`.detail-wrapper`),
  playBtnLarge: $(`.play-btn-large`),
  trackLists: $(".track-list"),
  playBtn: $(`.play-btn`),
  isPlaying: false,
  prevVolume: 50,
  prevCurrentTrack: null,
  audio: null,

  async renderList(res, title, onSelect) {
    const data = res.albums || res.tracks || res.artists;
    const section = this._createSectionTracks(prop, title);
    const listItems = this._createContentSection(data, prop, title);
    section.appendChild(listItems);
    this.container.appendChild(section);

    section.addEventListener("click", (event) => {
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

        if (onSelect) onSelect(track, hitPlay);
      }

      this._moveSlider(target, listItems, currentSlider);
    });
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

  async renderTracks(queues, hitPlay) {
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

    this.handleEventAnalysis(queues[0], hitPlay);
  },

  async handleEventAnalysis(hitPlay) {
    const audio = this.audio;
    const logo = $(".logo");
    const homeBtn = $(".home-btn");
    const btnPlays = [...$$(".track-plays button")];

    logo.onclick = (e) => this.goHome(e, audio);
    homeBtn.onclick = (e) => this.goHome(e, audio);

    if (hitPlay) audio.togglePlay();
    this.playBtn.onclick = () => audio.togglePlay();
    this.playBtnLarge.onclick = () => audio.togglePlay();

    if (btnPlays) {
      btnPlays.forEach((btn) => {
        btn.onclick = (e) => this.handleTrackOnList(e, audio);
      });
    }
  },

  handleTrackOnList(e, audio) {
    const item = e.target.closest(".track-item");
    if (!item) return;
    const selectSongId = item.dataset.id;
    if (!selectSongId) return;
    audio.togglePlay(selectSongId);
  },

  goHome(e, audio) {
    if (e.target.closest(".home-btn") || e.target.closest(".logo")) {
      $(".show-detail")?.classList.remove("show-detail");
      setTimeout(() => {
        $(".show-detail-wrapper")?.classList.remove("show-detail-wrapper");
      }, 300);
      audio.pause();
      $(`.content-wrapper`).scrollTo({
        top: 0,
        behavior: "smooth",
      });
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

  updatePlaybackUI(ctrl, state) {
    const song = state.currentTrack || {};
    const isPlaying = state.isPlaying || false;
    const { playBtn, playBtnLarge } = ctrl;

    playBtn.innerHTML = isPlaying && song.id ? `<i class="fas fa-pause"></i>` : `<i class="fas fa-play"></i>`;
    playBtnLarge.innerHTML = isPlaying && song.id ? `<i class="fas fa-pause"></i>` : `<i class="fas fa-play"></i>`;

    const allTrackItems = $$(".track-item", this.trackLists);
    allTrackItems?.forEach((item, i) => {
      const btnPlay = $(".track-plays button", item);
      if (!btnPlay) return;
      const isActive = song.id === item.dataset.id && isPlaying;
      btnPlay.innerHTML = isActive ? `<i class="fas fa-volume-up"></i>` : `<i class="fas fa-play"></i>`;
      item.classList.toggle("active", isActive);
    });
  },
};

export default playlistView;
