<template>
  <div class="playback-video" ref="content" :key="componentKey">
    <!-- <div class="select-holder">
      <drop-down-select
        class="video-select"
        :disabled="!enabledSelect"
        v-model="selectedVideo"
        :options="selectOptions"
      />
    </div> -->

    <playback-player
      class="video-player"
      :src="currentVideo.link"
      videoType="playbackVideo"
      :current-time="offset"
      :placement="placement"
    />

    <video-controls
      class="video-player-panel video-controls"
      :placement="placement"
      @fullscreen="toggleFullscreen"
    />
  </div>
</template>

<script>
import usePlaybackVideos from "@/composables/playback/usePlaybackVideos";
import PlaybackPlayer from "@/components/playback/PlaybackPlayer";
import VideoControls from "@/components/common/VideoControls";
import useFullscreenToggle from "@/composables/useFullscreenToggle";
import usePlayback from "@/composables/playback/usePlayback";
import { computed, onMounted, onUnmounted } from "vue";
// import DropDownSelect from "@/components/common/DropDownSelect";
import useRoomSettings from "@/composables/room/useRoomSettings";
import usePlaybackSettings from "@/composables/playback/usePlaybackSettings";
import useCurrentRoom from "@/composables/room/useCurrentRoom";
import useCurrentUser from "@/composables/users/useCurrentUser";

export default {
  name: "PlaybackVideo",
  components: {
    // DropDownSelect,
    VideoControls,
    PlaybackPlayer,
  },
  props: { placement: String },
  setup(/*props, {emit}*/) {
    const { timeline, duration, componentKey } = usePlayback();
    const { currentVideo, availableVideo, currentHiddenVideo } = usePlaybackVideos(
      timeline
    );
    const { toggleFullscreen, fullscreenElement } = useFullscreenToggle();
    const { roomEnableSwitchVideo: enabledSelect, mutateSetting } = useRoomSettings();
    const { isPlayback } = useCurrentRoom();
    const { isHost } = useCurrentUser();
    const {
      playbackPermissionSwitchSource: enabledSelectPlayback,
    } = usePlaybackSettings();
    const selectedVideo = computed({
      get: () => currentVideo.value.meta.mountPoint,
      set: (vl) => mutateSetting("activeMountPointId", vl),
    });

    const hideCurrentTime = () => {
      if (document.body.classList.contains("fullscreen")) {
        document.body.classList.remove("fullscreen");
      } else {
        document.body.classList.add("fullscreen");
      }
    };

    onMounted(() => {
      window.addEventListener("fullscreenchange", hideCurrentTime);
    });

    onUnmounted(() => {
      setTimeout(() => {
        window.removeEventListener("fullscreenchange", hideCurrentTime);
      }, 1);
    });

    const selectOptions = computed(() =>
      availableVideo.value.map((i) => ({
        name: i.name,
        value: i.meta.mountPoint,
      }))
    );
    return {
      timeline,
      duration,
      currentVideo,
      selectedVideo,
      enabledSelect: !isPlayback ? enabledSelect : isHost.value || enabledSelectPlayback,
      selectOptions,
      toggleFullscreen,
      currentHiddenVideo,
      offset: computed(() => currentVideo.value.offset),
      content: fullscreenElement,
      componentKey,
    };
  },
};
</script>

<style scoped lang="scss">
.playback-video {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  align-content: center;
  height: 100%;
  padding: 0;
  position: relative;
  overflow: hidden;
}

.playback-video .video-player-panel {
  position: absolute;
  right: 0;
  bottom: 0;
  padding: 0;
  margin: 10px;
  /* z-index: 1001; */
  background: rgba(0, 0, 0, 0.4);
  transition: opacity 0.3s;
  opacity: 0;
}

.playback-video:hover .video-player-panel {
  opacity: 1;
}

.place-holder--small .playback-video {
  .select-holder {
    width: 100%;
  }
}
.place-holder--large .playback-video {
  background-color: #000;
}

.tab-content .playback-video {
  display: flex;
  flex-direction: column;
  // flex: 1 0 100%;

  .select-holder {
    width: 100%;
  }
  .video-player {
    display: flex;
    flex: 1 0 auto;
    flex-direction: column;
    justify-content: center;
    height: auto;
    background: black;
  }
}
</style>
