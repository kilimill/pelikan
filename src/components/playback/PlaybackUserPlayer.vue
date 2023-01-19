<template>
  <teleport to="#place-holder--large" :disabled="largePlayerUserId !== Number(fileId)">
    <div class="user-list__inner" ref="container">
      <div class="video-player">
        <canvas ref="playerCanvas"></canvas>
        <user-player-controls
          @fullscreen="toggleFullscreen"
          @switchPlaces="switchPlaces"
        />
      </div>
    </div>
  </teleport>
</template>

<script>
import { computed, ref, onMounted, watch } from "vue";
import videoElement from "@/composables/playback/video/videoElement";
import usePlayback from "@/composables/playback/usePlayback";
import UserPlayerControls from "@/components/common/UserPlayerControls";
import useFullscreenToggle from "@/composables/useFullscreenToggle";
import useUserPlaces from "@/composables/room/room-places/useUserPlaces";
export default {
  name: "PlaybackUserPlayer",
  props: {
    src: String,
    currentTime: { type: Number, default: 0 },
    fileId: Number,
  },
  components: {
    UserPlayerControls,
  },
  emits: ["video:waiting", "video:ready"],
  setup(props) {
    const currentTime = computed(() => props.currentTime);
    const canvasElement = ref();
    const src = computed(() => props.src);
    const { currentElement, currentTime: videoTime, controls } = videoElement(
      src,
      "PlaybackVideo",
      currentTime
    );
    const { playing: playbackPlaying } = usePlayback();

    watch(currentElement, () => {
      render();
    });

    watch(
      playbackPlaying,
      (value) => {
        value ? controls.play() : controls.pause();
      },
      { immediate: true }
    );

    const dimensions = { aspectRatio: 0, width: 0, height: 0 };
    const rootElement = ref();

    const { toggleFullscreen } = useFullscreenToggle(rootElement);

    const { switchPlaces, largePlayerUserId } = useUserPlaces(props.fileId);
    const render = () => {
      let canvas = canvasElement.value,
        ctx = canvas?.getContext("2d");
      if (canvas && ctx) {
        if (currentElement.value.mistake) {
          canvas.width = 372;
          canvas.height = 279;
          ctx.font = "25px Avenir, Helvetica, Arial, sans-serif";
          ctx.fillStyle = "#FFFFFF";
          ctx.fillText("Видео отсутствует", 80, 130);
        } else {
          canvas.width = dimensions.width;
          canvas.height = dimensions.height;
          ctx.drawImage(currentElement.value, 0, 0, dimensions.width, dimensions.height);
        }
      }
    };

    const calculate = () => {
      if (rootElement.value) {
        let boundedRect = rootElement.value.getBoundingClientRect(),
          videoWidth,
          videoHeight;

        videoWidth =
          currentElement.value.videoWidth == 0 ? 640 : currentElement.value.videoWidth;
        videoHeight =
          currentElement.value.videoHeight == 0 ? 480 : currentElement.value.videoHeight;

        dimensions.aspectRatio = Math.min(
          boundedRect.width / videoWidth,
          boundedRect.height / videoHeight
        );
        dimensions.width = Math.floor(videoWidth * dimensions.aspectRatio);
        dimensions.height = Math.floor(videoHeight * dimensions.aspectRatio);
      }
    };

    watch(currentElement, () => {
      calculate();
      render();
    });

    onMounted(() => {
      calculate();
      setInterval(() => render(), 1);
    });

    return {
      toggleFullscreen,
      playerCanvas: canvasElement,
      container: rootElement,
      switchPlaces,
      largePlayerUserId,
      timelinePlayer: computed(() => {
        let time = Math.round(videoTime.value / 1000),
          date = new Date(0);
        date.setSeconds(date.getTimezoneOffset() * 60 + time);
        return date.toLocaleTimeString("ru-RU");
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
