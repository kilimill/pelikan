<template>
  <div class="camera-video-btn-panel" ref="userPlayerControls">
    <button
      class="btn btn-indicator"
      :class="userConfIndicator"
      data-bs-title="Индикатор состояния оборудования"
    >
      <span class="material-icons">online_prediction</span>
    </button>
    <button
      @click="switchPlaces"
      class="btn switch-places"
      data-bs-title="Смотреть в большом окне"
    >
      <span class="material-icons">switch_video</span>
    </button>
    <button
      ref="playerToggleFullscreenButton"
      class="btn full-screen"
      data-bs-title="На весь экран"
      @click="fullScreen"
    >
      <span class="material-icons">fullscreen</span>
    </button>
  </div>
</template>

<script>
import { ref } from "vue";
import useBootstrapTooltip from "@/composables/bootstrap/useBootstrapTooltip";
import useUserIndicator from "@/composables/users/useUserIndicator";
export default {
  name: "UserPlayerControls",

  props: {
    userId: {
      type: Number,
    },
  },

  emits: ["fullscreen", "switchPlaces"],

  setup(props, { emit }) {
    const userPlayerControls = ref();
    useBootstrapTooltip(userPlayerControls, "[data-bs-title]");

    const { userConfIndicator } = useUserIndicator(props.userId);

    return {
      userConfIndicator,
      userPlayerControls,
      switchPlaces: () => emit("switchPlaces"),
      fullScreen: () => emit("fullscreen"),
    };
  },
};
</script>

<style scoped lang="scss">
@import "src/assets/scss/theme";

.btn-indicator {
  &.success span {
    color: #00d000;
  }
  &.warning span {
    color: $light-alert;
  }
  &.invited span {
    color: $light-gray;
  }
  &.error span {
    color: red;
  }
}
</style>
