<template>
  <div class="playback-seekbar" ref="seekbarElement">
    <!--    <div class="seekbar-layer" @mousedown="seekbarMousedown"></div>-->
    <div class="seekbar-value" :style="progressStyles"></div>
  </div>
</template>

<script>
import { computed, watch } from "vue";
import usePlaybackSeekbar from "@/composables/playback/controls/usePlaybackSeekbar";

export default {
  name: "PlaybackSeekbar",
  props: {
    value: { type: Number, default: 0 },
    modelValue: { type: Number, default: 0 },
  },
  emits: ["update:modelValue", "seeked"],
  setup(props, { emit }) {
    const modelValue = computed({
      get: () => props.modelValue,
      set: (vl) => emit("update:modelValue", vl),
    });

    const { seeking, element } = usePlaybackSeekbar();
    const progressStyles = computed(() => {
      let value = props.value;
      return { width: `${value}%` };
    }); /*({paddingLeft: `${props.value}%`}))*/

    watch(seeking, ({ start, value }) => {
      if (start === false) {
        emit("seeked", value);
      }
    });
    //watchEffect(() => modelValue.value = seeking.value)
    /*watch(seeking, ({value}) => {
      modelValue.value = value
      console.log({value})
    })*/

    return {
      progressStyles,
      seeking,
      progress: modelValue,
      seekbarElement: element,
    };
  },
};
</script>

<style scoped lang="scss">
@import "../../assets/scss/theme";

$background: $middle-gray;
$foreground: #6ee7b7;

.playback-seekbar {
  height: 0.25em;
  width: 100%;
  background-color: $foreground;
  background-color: rgba(255, 255, 255, 0.3);
  cursor: pointer;

  // &:after {
  //   content: "";
  //   display: block;
  //   // background-color: $background;

  //   width: 100%;
  //   height: 100%;
  // }
}

.seekbar-value {
  background-color: $foreground;
  height: 100%;
  top: 0;
  left: 0;
  transition: width 0.3s;
}
</style>
