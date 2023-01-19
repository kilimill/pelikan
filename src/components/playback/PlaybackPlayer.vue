<template>
  <div class="video-player" :class="videoType" ref="container">
    <span class="player-overlay"></span>
    <canvas ref="canvas"></canvas>
    <time class="current-time">{{ timelinePlayer }}</time>
  </div>
</template>

<script>
import playbackService from "@/services/playback";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import useIntervalSingleton from "@/composables/useIntervalSingleton";
import videoElement from "@/composables/playback/video/videoElement";
import usePlayback from "@/composables/playback/usePlayback";
import usePlaybackVideos from "@/composables/playback/usePlaybackVideos";
import { EVENT_SEEKING } from "@/services/playback/PlaybackService";
import { useStore } from "vuex";
export default {
  name: "PlaybackPlayer",
  props: {
    src: String,
    currentTime: { type: Number, default: 0 },
    id: { type: String },
    videoType: String,
    placement: String
  },
  emits: ["video:waiting", "video:ready"],
  setup(props) {
    const store = useStore();
    const seekWatcher = computed({
      get: () => store.getters["playback/seekWatcher"],
      set: (vl) => store.commit("playback/seekWatcher", vl),
    });
    const isOldRecord = computed(() => store.getters["application/isOldRecord"]);
    const currentTime = computed(() => props.currentTime);
    const canvasElement = ref();
    const rootElement = ref();
    const src = computed(() => props.src);
    const videoType = computed(() => props.videoType)
    const {
      currentElement,
      playing: videoPlaying,
      currentTime: videoTime,
      controls,
      canPlay,
    } = videoElement(src, videoType, currentTime, isOldRecord);
    
    const { playing: playbackPlaying, waiting, timeline } = usePlayback();
    const { playlist } = usePlaybackVideos();
    const files = computed(() => store.getters["playback/files/files"]);
    const currentVideo = computed(() =>
      playlist.value.find((i) => i.link === currentElement.value.src)
    );
    
    const elemWidth = ref(currentElement.value.videoWidth)

    const { clearInterval, setInterval } = useIntervalSingleton();
    const dimensions = { aspectRatio: 0, width: 0, height: 0 };
    const checkerForDeleted = id => {
      const file = files.value.find(i => i.id === id)
      if (file.deleted === 1) {
        currentElement.value.mistake = true
      }
    }

    if (currentVideo.value) {
      checkerForDeleted(currentVideo.value.meta.file)
    }

    const watingPlayers = () => {
      if (!currentVideo.value || seekWatcher.value.seeked === true) {
        return;
      }

      controls.pause();
      playbackPlaying.value = false;

      seekWatcher.value = {
        seeked: true,
        playing: timeline.value === 0 ? false : true,
      };

      controls.waiting();
    };

    const seekEventHandler = () => {
      if (seekWatcher.value.seeked === true) {
        return;
      }

      seekWatcher.value = { seeked: true };

      if (playbackPlaying.value == true) {
        seekWatcher.value = { playing: true };
      } else {
        seekWatcher.value = { playing: false };
      }

      controls.pause();
      playbackPlaying.value = false;

      controls.seek();
    };

    const render = () => {
      let canvas = canvasElement.value,
        ctx = canvas?.getContext("2d");
      if (canvas && ctx) {
        if (currentElement.value.mistake) {
          canvas.width = 372;
          canvas.height = 279;
          ctx.font = '25px Avenir, Helvetica, Arial, sans-serif';
          ctx.fillStyle = '#FFFFFF';
          ctx.fillText('Видео отсутствует', 80, 130);
        } else {
          if (elemWidth.value !== currentElement.value.videoWidth) {
            calculate()
            elemWidth.value = currentElement.value.videoWidth
          }
          
          canvas.width = dimensions.width;
          canvas.height = dimensions.height;
          ctx.drawImage(
            currentElement.value,
            0,
            0,
            dimensions.width,
            dimensions.height
          );
        }
      }
    };

    const calculate = () => {
      if (rootElement.value) {
        let boundedRect = rootElement.value.getBoundingClientRect(),
          videoWidth,
          videoHeight;

        if (videoType.value === "playbackVideo") {
          videoWidth = currentElement.value.videoWidth == 0
              ? 640
              : currentElement.value.videoWidth;
          videoHeight = currentElement.value.videoHeight == 0
                ? 480
                : currentElement.value.videoHeight;
        } else {
          videoWidth = currentElement.value.videoWidth == 0
              ? 1100
              : currentElement.value.videoWidth;
          videoHeight = currentElement.value.videoHeight == 0
                ? 550
                : currentElement.value.videoHeight;
        }
      

        dimensions.aspectRatio = Math.min(
          boundedRect.width / videoWidth,
          boundedRect.height / videoHeight
        );
        dimensions.width = Math.floor(videoWidth * dimensions.aspectRatio);
        dimensions.height = Math.floor(videoHeight * dimensions.aspectRatio);
      }
    };

    watch(currentElement, () => {
      if (currentVideo.value && playbackPlaying.value) {
        watingPlayers();
      }
      calculate();
      render();
    });

    watch(videoPlaying, (value) => (playbackPlaying.value = value));
    watch(
      playbackPlaying,
      (value) => {
        value ? controls.play() : controls.pause();
      },
      { immediate: true }
    );

    watch(canPlay, (value) => (waiting.value = { [props.id]: value }));

    
    onMounted(() => {
      calculate();
      setInterval(() => render(), 1);
      if (playbackPlaying.value || timeline.value === 0) {
        watingPlayers();
      }
      window.addEventListener("fullscreenchange", calculate);
      playbackService.addEventListener(EVENT_SEEKING, seekEventHandler);
    });

    onUnmounted(() => {
      clearInterval();
      playbackService.removeEventListener(EVENT_SEEKING, seekEventHandler);
    });

    return {
      seekEventHandler,
      canvas: canvasElement,
      container: rootElement,
      dimensions,
      timelinePlayer: computed(() => {
        let time = Math.round(videoTime.value / 1000),
          date = new Date(0);
        date.setSeconds(date.getTimezoneOffset() * 60 + time);
        return date.toLocaleTimeString('ru-RU');
      }),
    };
  },
};
</script>

<style scoped lang="scss">
.video-player {
  display: flex;
  position: relative;
  overflow: hidden;
  width: 100%;
  max-height: 100%;
  height: 100%;
}

.fullscreen {
  .current-time {
    display: block;
  }

  .video-player canvas {
    width: auto;
  }
}
.current-time {
  display: none;
}

.place-holder--small,
.tab-content {
  .video-player canvas {
    width: 100%;
  }
}

.video-player canvas {
  width: auto;
  max-width: 100%;
  max-height: 100%;
  margin: 0 auto;
  height: auto;
  object-fit: contain;
  background-color: black;
}

.video-player .current-time {
  position: absolute;
  bottom: 10px;
  left: 10px;
  color: rgba(255, 255, 255, 0.6);
  z-index: 1;
}
</style>