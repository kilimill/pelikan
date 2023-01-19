<template>
  <teleport to="#room-place--large" :disabled="largePlayerUserId !== userId">
    <div class="user-list__inner" ref="content">
      <p class="user-list__name" v-show="!videoOn">{{ user.alias }}</p>
      <div ref="playerCanvasWrapper" v-show="videoOn" class="h-100 w-100">
        <div ref="playerCanvasAreaWrapper" class="user-list__video">
          <canvas ref="playerCanvas"></canvas>
        </div>
      </div>
      <user-player-controls
        @fullscreen="toggleFullscreen"
        @switchPlaces="switchPlaces"
        :userId="userId"
      />
    </div>
  </teleport>
</template>

<script>
import { MainPlayer } from "@/services/janus/Player";
import { Janus } from "janus-gateway";
import { useStore } from "vuex";
import { computed, onUnmounted } from "vue";
import UserPlayerControls from "@/components/common/UserPlayerControls";
import useUserPlaces from "@/composables/room/room-places/useUserPlaces";
import useFullscreenToggle from "@/composables/useFullscreenToggle";

export default {
  name: "RoomUserPlayer",
  props: {
    userId: { type: Number, default: 0 },
    player: { type: Object },
  },
  components: { UserPlayerControls },

  setup(props) {
    const store = useStore();
    const user = store.getters["room/users/findUser"](props.userId);
    const videoOn = computed(() => user.settings.videoOn);
    const { switchPlaces, largePlayerUserId } = useUserPlaces(props.userId);

    const { toggleFullscreen, fullscreenElement } = useFullscreenToggle();

    onUnmounted(() => {
      if (largePlayerUserId.value == props.userId) {
        store.dispatch("room/settings/changeSetting", {
          settingName: "room.largePlayerUserId",
          settingValue: 0,
        });
      }
    });

    return {
      largePlayerUserId,
      switchPlaces,
      props,
      user,
      videoOn,
      toggleFullscreen,
      content: fullscreenElement,
    };
  },
  computed: {
    video() {
      return this.videoOn;
    },
  },
  watch: {
    video(val) {
      if (val) {
        this.playerUser.setSnapshotInterval();
      } else {
        this.playerUser.stopInterval();
      }
    },
  },
  methods: {
    startPlayer() {
      this.playerUser = new MainPlayer(this.$refs, this.props.player);
      // this.props.player.play();
      this.playerUser.setSnapshotInterval();
    },
  },

  mounted() {
    if (this.props.player) {
      this.startPlayer();
    }
  },
  unmounted() {
    if (this.playerUser) {
      this.playerUser.stopInterval();
      Janus.attachMediaStream(this.playerUser, null);
      this.playerUser = undefined;
    }
  },
};
</script>

<style scoped lang="scss">
.user-list__name {
  font-weight: 900;
  color: #fff;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
</style>
