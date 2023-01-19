<template>
  <div class="playback-controls d-flex justify-content-between align-items-center">
    <playback-seekbar class="playback-seekbar" :value="progress" @seeked="seeked" />
    <div class="player">
      <div class="controls-holder d-flex align-items-center">
        <time class="playback-timeline">
          <span class="playback-timeline--current">{{ time.current }}</span>
          <span class="playback-timeline--separator">/</span>
          <span class="playback-timeline--duration">{{ time.duration }}</span>
        </time>
        <button class="btn btn-default" @click="logout">
          <span class="material-icons-outlined">logout</span>
        </button>
        <button class="btn btn-default" :disabled="seekWatcher.seeked">
          <span
            v-if="!seekWatcher.seeked"
            class="material-icons-outlined"
            @click="togglePlay"
            >{{ buttonIcon }}</span
          >
          <span v-else class="btn-loader">
            <Preloader></Preloader>
          </span>
        </button>
      </div>
    </div>
    <button class="btn btn-default" @click="onChangeViewMenu">
      <span class="material-icons">menu</span>
    </button>
  </div>
</template>

<script>
import { computed, watch } from "vue";
import playbackService from "@/services/playback";
import PlaybackSeekbar from "@/components/playback/PlaybackSeekbar";
import useApplicationLogout from "@/composables/useApplicationLogout";
import usePlayback from "@/composables/playback/usePlayback";
import Preloader from "@/components/common/Preloader";
import { EVENT_SEEKING, EVENT_TIMEUPDATE } from "@/services/playback/PlaybackService";
import { useStore } from "vuex";
export default {
  name: "PlaybackControls",
  components: { PlaybackSeekbar, Preloader },
  emits: ["play", "stop", "seek"],
  props: {
    isHiddenMenu: Boolean,
  },
  setup() {
    const store = useStore();
    const seekWatcher = computed({
      get: () => store.getters["playback/seekWatcher"],
    });
    const {
      eventSource,
      duration,
      progress,
      timeline,
      time,
      controls,
      playing,
    } = usePlayback();
    const { logout } = useApplicationLogout();
    const seeked = (time) => {
      if (!seekWatcher.value.seeked) {
        time = (duration.value / 100) * time;
        if (time < timeline.value) {
          store.commit("room/settings/changeSetting", {
            settingName: "room.currentVPDF",
            settingValue: false,
          });
          store.commit("tabs/chat/public/append", []);
          store.commit("room/presentations/draw/hydrate", []);
          store.commit("room/presentations/resetCurrentPres");
          store.commit("room/users/clear", []);
          store.commit("room/conference/hydrate", undefined);
        }

        eventSource.dispatchEvent(EVENT_SEEKING, { seek: time });
      }
    };
    playbackService.addEventSource(eventSource);
    watch(timeline, (value) => {
      value ? eventSource.dispatchEvent(EVENT_TIMEUPDATE, { currentTime: value }) : null;
    });

    return {
      value: 30,
      togglePlay: controls.toggle,
      seekWatcher: seekWatcher,
      logout,
      playing,
      duration,
      timeline,
      progress,
      time,
      seeked,
      buttonIcon: computed(() => (playing.value ? "pause_circle" : "play_circle")),
    };
  },
  methods: {
    onChangeViewMenu() {
      this.$emit("update:isHiddenMenu", !this.isHiddenMenu);
    },
  },
};
</script>

<style scoped lang="scss">
.btn-play {
  max-height: 36px;
}

.playback-controls {
  position: relative;
  // display: flex;
  // align-items: flex-start;
  color: white;
  padding-bottom: 0;
  height: 50px;
  order: 1;
  // z-index: 1001;
  // user-select: none;

  .btn-default {
    margin: 0 9px;

    &.active .material-icons {
      color: #6ee7b7;
    }

    &:disabled + label {
      color: #999;
      cursor: default;
    }
  }

  .playback-seekbar {
    position: absolute;
    z-index: 1001;
    bottom: 100%;
    transition: height 0.15s;
  }

  .playback-seekbar:hover,
  :hover .playback-seekbar {
    height: 0.6em;
  }

  .player {
    display: flex;
    // flex-direction: column;
    // flex: 1 0 auto;
    justify-content: space-between;

    padding: 0 10px;
  }

  .player .playback-timeline {
    display: flex;
    font-size: 1.5em;
    * > {
      display: flex;
    }
    // &--current,
    // &--duration {
    // }

    &--separator {
      margin: 0 5px;
    }
  }

  .player .controls-holder {
    display: flex;
  }
}

.playback-controls {
  background-color: #666666;

  button,
  .form-check-input + label {
    color: #fff;
    font-size: 1.5rem;
    padding: 0.25rem;
    line-height: 1;
  }

  button:focus {
    box-shadow: none;
  }

  // button:hover {
  //   color: #999;
  // }

  .time {
    color: #fff;
    padding: 0.25rem;
  }
}

button.btn {
  font-size: 1.5rem;
  padding: 0.25rem;
  line-height: 1;
  color: white;

  &.logout {
    padding: 1px;
  }

  :hover {
    color: #999;
  }
}
</style>
