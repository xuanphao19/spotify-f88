// services/player.service.js

let sampleTracks = [];

const playerService = {
  listeners: [],

  onStateChange(callback) {
    this.listeners.push(callback);
  },

  state: new Proxy(
    { tracks: sampleTracks, currentTrack: null, isPlaying: false, position_ms: 0, volume_percent: 50, queue: [] },
    {
      set(target, property, value) {
        // Target: Obj gốc (chứa trạng thái ban đầu)
        // Được gọi khi giá trị thuộc tính thay đổi:
        target[property] = value;
        playerService.listeners.forEach((callback) => callback(target));
        return true;
      },
      get(target, property) {
        // Được gọi khi truy cập thuộc tính:
        if (property === "queue" && Array.isArray(target[property])) {
          return new Proxy(target[property], {
            set(array, index, value) {
              array[index] = value;
              playerService.listeners.forEach((callback) => callback(target));
              return true;
            },
            get(array, method) {
              if (["push", "pop", "shift", "splice"].includes(method)) {
                return function (...args) {
                  const result = Array.prototype[method].apply(array, args);
                  playerService.listeners.forEach((callback) => callback(target));
                  return result;
                };
              }
              return array[method];
            },
          });
        }
        return target[property];
      },
    },
  ),

  setCurrentTrack(track) {
    this.state.currentTrack = track;
  },

  setTracks(data, track) {
    if (!Array.isArray(data)) {
      console.warn("tracks không phải mảng, khởi tạo sampleTracks về rỗng");
      sampleTracks = [];
    } else {
      sampleTracks = data;
      this.state.tracks = data;
      this.state.currentTrack = track;
    }
    return sampleTracks;
  },

  setState(updates) {
    if (typeof updates !== "object" || updates === null) return;
    sampleTracks = updates.tracks;
    Object.entries(updates).forEach(([key, value]) => {
      this.state[key] = value;
    });
    return this.state;
  },

  getState() {
    return this.state;
  },

  getTracks() {
    return sampleTracks || [];
  },

  getTrack() {
    return this.state.currentTrack;
  },

  getIsPlaying() {
    return this.state.isPlaying;
  },

  play(trackId) {
    if (!Array.isArray(sampleTracks)) {
      throw new Error("sampleTracks không được khởi tạo đúng");
    }

    const track = sampleTracks.find((t) => t.id === trackId) || this.state.queue[0];
    if (!track) {
      throw new Error(`Không tìm thấy bài hát với ID: ${trackId}`);
    }
    this.state.isPlaying = true;
    this.state.position_ms = 0;
    return this.state;
  },

  pause() {
    this.state.isPlaying = false;
    // this.state.position_ms = position_ms;
    return this.state;
  },

  next() {
    if (this.state.queue.length > 0) {
      const nextTrack = this.state.queue.shift();
      this.state.currentTrack = nextTrack;
      this.state.isPlaying = true;
      this.state.position_ms = 0;
    } else {
      this.state.currentTrack = null;
      this.state.isPlaying = false;
    }
    return this.state;
  },

  previous() {
    this.state.isPlaying = false;
    return this.state;
  },

  seek(position_ms) {
    if (typeof position_ms !== "number" || position_ms < 0) {
      throw new Error("position_ms phải là số không âm");
    }
    this.state.position_ms = position_ms;
    return this.state;
  },

  setVolume(volume_percent) {
    if (typeof volume_percent !== "number" || volume_percent < 0 || volume_percent > 100) {
      throw new Error("volume_percent phải là số từ 0 đến 100");
    }
    this.state.volume_percent = volume_percent;
    return this.state;
  },

  addToQueue(track_id) {
    if (!Array.isArray(sampleTracks)) {
      throw new Error("sampleTracks không được khởi tạo đúng");
    }
    const track = sampleTracks.find((t) => t.id === track_id);
    if (!track) {
      throw new Error("track_id không hợp lệ");
    }
    this.state.queue.push(track);
    return this.state.queue;
  },

  removeFromQueue(track_id) {
    this.state.queue = this.state.queue.filter((t) => t.id !== track_id);
    return this.state.queue;
  },

  clearQueue() {
    this.state.queue = [];
    return this.state.queue;
  },
};

export default playerService;

// services/player.service.js
// import request from "./httpClient.js";

// const playerService = {
//   getState: () => request("/me/player"),
//   // play: (data) => request("/me/player/play", { method: "PUT", body: data }),
//   // Phát nhạc
//   play(data) {
//     if (!data?.track_id) {
//       throw new Error("track_id là bắt buộc để phát nhạc");
//     }
//     return request("/me/player/play", {
//       method: "PUT",
//       body: {
//         track_id: data.track_id,
//       },
//     });
//   },
//   pause: () => request("/me/player/pause", { method: "PUT" }),
//   next: () => request("/me/player/next", { method: "POST" }),
//   previous: () => request("/me/player/previous", { method: "POST" }),
//   // Tua đến vị trí cụ thể
//   seek(position_ms) {
//     if (typeof position_ms !== "number" || position_ms < 0) {
//       throw new Error("position_ms phải là số không âm");
//     }
//     return request("/me/player/seek", {
//       method: "PUT",
//       body: { position_ms },
//     });
//   },
//   // Điều chỉnh âm lượng
//   setVolume(volume_percent) {
//     if (typeof volume_percent !== "number" || volume_percent < 0 || volume_percent > 100) {
//       throw new Error("volume_percent phải là số từ 0 đến 100");
//     }
//     return request("/me/player/volume", {
//       method: "PUT",
//       body: { volume_percent },
//     });
//   },
//   // Bật/tắt shuffle
//   shuffle(state) {
//     if (typeof state !== "boolean") {
//       throw new Error("state phải là boolean (true/false)");
//     }
//     return request("/me/player/shuffle", {
//       method: "PUT",
//       body: { state },
//     });
//   },
//   // Đặt chế độ lặp
//   repeat(mode) {
//     const validModes = ["track", "context", "off"];
//     if (!validModes.includes(mode)) {
//       throw new Error("mode phải là 'track', 'context', hoặc 'off'");
//     }
//     return request("/me/player/repeat", {
//       method: "PUT",
//       body: { mode },
//     });
//   },

//   // Lấy hàng đợi
//   getQueue() {
//     return request("/me/player/queue");
//   },

//   // Thêm bài vào hàng đợi
//   addToQueue(track_id) {
//     if (!track_id) {
//       throw new Error("track_id là bắt buộc để thêm vào hàng đợi");
//     }
//     return request("/me/player/queue", {
//       method: "POST",
//       body: { track_id },
//     });
//   },

//   // Xóa bài khỏi hàng đợi
//   removeFromQueue(id) {
//     if (!id) {
//       throw new Error("id là bắt buộc để xóa khỏi hàng đợi");
//     }
//     return request(`/me/player/queue/${id}`, { method: "DELETE" });
//   },

//   // Xóa toàn bộ hàng đợi
//   clearQueue: () => request("/me/player/queue", { method: "DELETE" }),
// };

// export default playerService;
