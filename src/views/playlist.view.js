// views/playlist.view.js
import playback from "../services/player.service.js";
import controller from "../controllers/playlist.controller.js";

export const playlistView = {
  container: document.querySelector(`.content-wrapper`),
  footerElement: document.querySelector(`.footer-player`),
  detailTrack: document.querySelector(`.detail-track`),
  wrapperTrack: document.querySelector(`.detail-wrapper`),
  playBtn: document.querySelector(`.play-btn`),
  playBtnLarge: document.querySelector(`.play-btn-large`),
  isPlaying: false,
  prevCurrentTrack: null,

  renderList(res, prop, onSelect) {
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
        const index = [...listItems.children].indexOf(item);
        const track = data[index];

        const random = Math.floor(Math.random() * (7 - 3) + 2);
        if (onSelect) onSelect(track, random);
      }

      this.handleEventAnalysis(target, listItems, currentSlider);
    });
  },

  // moveSlider(parents, event) {},
  handleEventAnalysis(target, slider, currentSlider) {
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

  async renderTracks(tracks, track, handlePlayer) {
    if (!track) return;

    playback.onStateChange((newState) => {
      this.isPlaying = newState.isPlaying;
      const newTrack = newState.currentTrack;

      if (newTrack !== this.previousCurrentTrack) {
        this.previousCurrentTrack = newTrack;
        this.updatePlayerDetail({}, newState);
      }

      this.updateCtrlUI({ playBtn: this.playBtn, playBtnLarge: this.playBtnLarge }, newState);
    });

    const data = tracks.tracks;
    track = !track.audio_url ? data[0] : track;
    data.push(track);
    playback.setTracks(data, track);

    this.wrapperTrack.classList.add("show-detail-wrapper");
    this.container.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    setTimeout(() => {
      if (this.wrapperTrack.classList.contains("show-detail-wrapper")) {
        this.detailTrack.classList.add("show-detail");
      }
    }, 50);

    const audio = await handlePlayer(track);
    if (this.isPlaying) audio.togglePlay(this.isPlaying);

    this.handleEventPlayer(audio);

    // this.highlightPlaying(track.id);
    // await this.renderFooterPlayer();
  },

  handleEventPlayer(audio) {
    const logo = document.querySelector(".logo");
    const homeBtn = document.querySelector(".home-btn");
    this.playBtn.onclick = () => {
      audio.togglePlay(this.isPlaying);
    };
    this.playBtnLarge.onclick = () => {
      audio.togglePlay(this.isPlaying);
    };

    logo.onclick = this.goHome.bind(this, audio);
    homeBtn.onclick = this.goHome.bind(this, audio);
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

  updatePlayerDetail({}, state) {
    const song = state.currentTrack;
    const imgHero = document.querySelector(".hero-background img");
    const artistName = document.querySelector(".artist-name");
    const title = document.querySelector(".detail-title");
    const albumTitle = document.querySelector(".album-title");
    imgHero.src = song.image_url;
    artistName.innerText = song.artist_name;
    albumTitle.innerText = song.album_title;
    title.innerText = song.title;
  },

  updateCtrlUI(ctrl, state) {
    if (state.currentTrack) {
      ctrl.playBtn.innerHTML = state.isPlaying ? `<i class="fas fa-pause"></i>` : `<i class="fas fa-play"></i>`;
      ctrl.playBtnLarge.innerHTML = state.isPlaying ? `<i class="fas fa-pause"></i>` : `<i class="fas fa-play"></i>`;
    }
  },
};
