<template>
  <div class="video-controls" ref="rootElement">
    <div class="video-player-panel">
      <button class="btn mic-off" v-if="placement == 'small'" @click="mut.handler(false)">
        <span class="material-icons">{{ mut.state ? "volume_off" : "volume_up" }}</span>
      </button>
      <button
        v-if="placement == 'small'"
        @click="switchPlaces"
        class="btn switch-places"
        data-bs-title="Смотреть в большом окне"
      >
        <span class="material-icons">switch_video</span>
      </button>
      <button class="btn full-screen" data-bs-title="На весь экран" @click="fullScreen">
        <span class="material-icons">fullscreen</span>
      </button>
    </div>
  </div>
</template>

<script>
import usePlacesInjection from "@/composables/room/room-places/usePlacesInjection";
import { ref, computed } from "vue";
import useBootstrapTooltip from "@/composables/bootstrap/useBootstrapTooltip";
import videoElementControls from "@/composables/playback/video/videoElementControls";

export default {
  name: "VideoControls",
  props: { placement: String },
  emits: ["fullscreen"],
  setup(props, { emit }) {
    const { isLargePlace, switchPlaces } = usePlacesInjection(
      computed(() => props.placement)
    );

    const intermediateSwitch = () => {
      switchPlaces();
      if (document.body.classList.contains("fullscreen")) {
        document.body.classList.remove("fullscreen");
      }
    };

    const { muteSettings } = videoElementControls();

    const rootElement = ref();

    useBootstrapTooltip(rootElement, "[data-bs-title]");
    return {
      switchPlaces: intermediateSwitch,
      isLargePlace,
      rootElement,
      fullScreen: () => emit("fullscreen"),
      mut: muteSettings,
    };
  },
};
</script>

<style scoped lang="scss">
.video-controls {
  /*position: absolute;
  right: 0;
  bottom: 0;
  padding: 10px;
  z-index: 1001;*/

  button {
    color: #fff;
    cursor: pointer;
    font-size: 1.3em;
    padding: 0 5px;
    &:hover {
      color: #aaa;
    }
    &:focus {
      box-shadow: none;
    }
  }
}
</style>
