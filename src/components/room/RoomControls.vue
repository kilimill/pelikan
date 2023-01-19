<template>
  <div class="room-controls" id="room-controls" ref="roomControls">
    <nav class="navbar navbar-light">
      <div class="left-controls">
        <span class="time">
          <span ref="hours">{{ timer.hours }}</span>
          <span class="separator">:</span>
          <span ref="minutes">{{ timer.minutes }}</span>
          <span class="separator">:</span>
          <span ref="seconds">{{ timer.seconds }}</span>
        </span>

        <button class="btn btn-default" data-bs-title="Выйти" @click="goToPlanner()">
          <span class="material-icons-outlined">logout</span>
        </button>
        <button
          v-if="showStartButton"
          class="btn btn-default"
          data-bs-title="Запустить"
          @click="play"
        >
          <span class="material-icons-outlined">play_circle</span>
        </button>
        <button
          v-if="showPauseButton"
          class="btn btn-default"
          @click="pause"
          data-bs-title="Поставить на паузу"
        >
          <span class="material-icons-outlined">pause_circle</span>
        </button>
        <button
          v-if="showStopButton"
          class="btn btn-default"
          @click="stop"
          data-bs-title="Остановить мероприятие"
        >
          <span class="material-icons-outlined">stop_circle</span>
        </button>
      </div>
      <div class="middle-controls">
        <template v-if="currentUser.isHost">
          <button
            class="btn mic-off btn-default"
            @click="audioButtonHandler"
            :data-bs-title="
              audioToggleButtonIconCondition ? 'Выключить микрофон' : 'Включить микрофон'
            "
          >
            <span class="material-icons">{{
              audioToggleButtonIconCondition ? "mic" : "mic_off"
            }}</span>
          </button>
          <button
            class="btn camera-off btn-default"
            @click="videoButtonHandler"
            :data-bs-title="
              videoToggleButtonIconCondition ? 'Выключить камеру' : 'Включить камеру'
            "
          >
            <span class="material-icons">{{
              videoToggleButtonIconCondition ? "videocam" : "videocam_off"
            }}</span>
          </button>
        </template>

        <template v-if="!currentUser.isHost">
          <template v-if="!currentUserIsHost && !isPlayback && confActive">
            <button
              v-if="participantCanConnect || participantConnected"
              class="btn btn-default"
              :class="{
                call: !participantConnected,
                'bg-danger': participantConnected,
              }"
              @click="conferenceParticipationToggle()"
              :data-bs-title="participantConnected ? 'Положить трубку' : 'Ответить'"
            >
              <span class="material-icons-outlined" v-if="participantConnected">
                call_end
              </span>
              <span class="material-icons-outlined" v-else> call </span>
            </button>
          </template>
          <input
            class="form-check-input"
            type="checkbox"
            :id="`middle-toggle-user-audio-${currentUser.id}`"
            v-model="userSettings.enableAudio"
            :disabled="!roomSettings.conferenceAudio || !userSettings.allowAudio"
          />
          <label
            class="btn btn-default"
            :for="`middle-toggle-user-audio-${currentUser.id}`"
            :disabled="!roomSettings.conferenceAudio || !userSettings.allowAudio"
            :data-bs-title="
              audioToggleButtonIconCondition ? 'Выключить микрофон' : 'Включить микрофон'
            "
          >
            <span class="material-icons">{{
              userSettings.enableAudio ? "mic" : "mic_off"
            }}</span>
          </label>

          <input
            class="form-check-input"
            type="checkbox"
            :id="`middle-toggle-user-video-${currentUser.id}`"
            v-model="userSettings.enableVideo"
            :disabled="!roomSettings.conferenceVideo || !userSettings.allowVideo"
          />
          <label
            class="btn btn-default"
            :for="`middle-toggle-user-video-${currentUser.id}`"
            :disabled="!roomSettings.conferenceVideo || !userSettings.allowVideo"
            :data-bs-title="
              videoToggleButtonIconCondition ? 'Выключить камеру' : 'Включить камеру'
            "
          >
            <span class="material-icons">{{
              userSettings.enableVideo ? "videocam" : "videocam_off"
            }}</span>
          </label>
        </template>
      </div>
      <div class="middle-controls">
        <button
          v-if="currentUser.isParticipant && !currentUser.isCalled"
          class="btn btn-default"
          :class="{ active: isUserRaiseHand }"
          @click="toggleUserRaiseHand"
          :disabled="cantRaiseHand"
          :data-bs-title="isUserRaiseHand ? 'Опустить руку' : 'Поднять руку'"
        >
          <span class="material-icons">pan_tool</span>
        </button>
        <!-- <span
          v-if="currentUser.isParticipant && !currentUser.isCalled"
          class="btn btn-default"
        >
          <input
            :disabled="cantRaiseHand"
            v-model="toggleUserRaiseHand"
            type="checkbox"
            id="room-controls-nav-rise-hand"
          />
          <label for="room-controls-nav-rise-hand" class="material-icons">pan_tool</label>
        </span> -->
        <!-- <span v-if="currentUser.isParticipant && currentUser.isCalled" class="drop-call">
          <span @click="dropCall" class="material-icons flick">pan_tool</span>
        </span> -->
        <button
          class="btn btn-default"
          @click="onChangeViewMenu"
          :data-bs-title="isHiddenMenu ? 'Открыть меню' : 'Закрыть меню'"
        >
          <span class="material-icons">menu</span>
        </button>
      </div>
    </nav>
  </div>
  <modal-window
    ref="modalRoomFinish"
    id="modalRoomFinish"
    type="dialog"
    name="modalRoomFinish"
    @modal-result="modalResultHandler($event)"
  >
    <template v-slot:message
      >Мероприятие будет завершено. Нажмите на кнопку «Завершить», чтобы подтвердить
      завершение мероприятия.
    </template>
    <template v-slot:button-text-ok>Завершить</template>
    <template v-slot:button-text-cancel>Вернуться</template>
  </modal-window>

  <modal-window
    ref="modalParticipantDropCallDialog"
    id="modalParticipantDropCallDialog"
    type="dialog"
    name="modalParticipantDropCallDialog"
    @modal-result="modalResultHandler($event)"
  >
    <template v-slot:message>Завершить вызов?</template>
    <template v-slot:button-text-ok>Да</template>
    <template v-slot:button-text-cancel>Нет</template>
  </modal-window>
</template>

<script>
import { mapGetters, useStore } from "vuex";
import ModalWindow from "@/components/common/ModalWindow";
import api from "@/api";
import userApi from "@/api/user";
import roomApi from "@/api/room";
import useCurrentRoom from "@/composables/room/useCurrentRoom";
import useConference from "@/composables/room/useConference";
import useRoomSettings from "@/composables/room/useRoomSettings";
import useUserSettings from "@/composables/users/useUserSettings";
import useCurrentUserHandRise from "@/composables/users/useCurrentUserHandRise";
import useBootstrapTooltip from "@/composables/bootstrap/useBootstrapTooltip";
import useCountdownTimer from "@/composables/room/useCountdownTimer";
import { computed, reactive, ref } from "vue";
import useHelpers from "@/composables/useHelpers";
import { throttle } from "lodash";

export default {
  name: "RoomControls",
  props: {
    isHiddenMenu: Boolean,
  },
  components: {
    ModalWindow,
  },
  emits: ["update:isHiddenMenu"],
  setup() {
    const store = useStore();
    const {
      toggleUserRaiseHand,
      cantRaiseHand,
      isUserRaiseHand,
    } = useCurrentUserHandRise();
    const { timer, clearInterval } = useCountdownTimer(store.getters["room/getEndDate"]);
    const { goToPlanner } = useHelpers();

    const {
      roomEnableIpRoomAudio,
      roomEnableSwitchVideo,
      roomEnableUserCallControl,
      roomEnableConferenceAudio,
      roomEnableConferenceVideo,
    } = useRoomSettings();

    const {
      userEnableAudio,
      userEnableVideo,
      userAllowAudio,
      userAllowVideo,
    } = useUserSettings(store.state.user.id);

    const { isPlayback } = useCurrentRoom();

    const {
      confActive,
      participantCanConnect,
      participantConnected,
      conferenceParticipationToggle,
    } = useConference();

    const roomControls = ref();

    useBootstrapTooltip(roomControls, "[data-bs-title]");

    return {
      roomSettings: reactive({
        enableSwitchVideo: roomEnableSwitchVideo,
        enableAudio: roomEnableIpRoomAudio,
        enabledUserCallControl: roomEnableUserCallControl,
        conferenceAudio: roomEnableConferenceAudio,
        conferenceVideo: roomEnableConferenceVideo,
      }),
      userSettings: reactive({
        enableAudio: userEnableAudio,
        enableVideo: userEnableVideo,
        allowAudio: userAllowAudio,
        allowVideo: userAllowVideo,
      }),
      roomControls,
      isPlayback,
      confActive,
      participantCanConnect,
      participantConnected,
      conferenceParticipationToggle,
      toggleUserRaiseHand,
      isUserRaiseHand,
      cantRaiseHand,
      timer,
      clearInterval,
      currentUser: computed(() => store.getters["user/currentUser"]),
      currentRoom: computed(() => store.getters["room/currentRoom"]),
      goToPlanner,
      activeStreams: computed(() => store.getters["room/streams/activeStreams"]),
    };
  },
  data() {
    return {
      modal: {
        result: false,
      },
      result: false,
    };
  },
  computed: {
    ...mapGetters("application", ["constants", "channelPublic"]),
    ...mapGetters("room", ["roomStatusId"]),
    showStartButton() {
      return (
        this.currentUser.isHost &&
        (this.currentRoom.isPending || this.currentRoom.isPaused)
      );
    },
    showPauseButton() {
      return this.currentUser.isHost && this.currentRoom.isActive;
    },
    showStopButton() {
      return this.currentUser.isHost && !this.currentRoom.isFinished;
    },
    modalResult() {
      return this.modal.result;
    },
    audioToggleButtonIconCondition() {
      let cond;
      if (this.currentRoom.isIpCamRoom && this.currentUser.isHost) {
        cond = this.roomSettings.enableAudio;
      } else {
        cond = this.userSettings.enableAudio;
      }
      return cond;
    },
    videoToggleButtonIconCondition() {
      let cond;
      if (this.currentRoom.isIpCamRoom && this.currentUser.isHost) {
        cond = this.activeStreams?.length > 0;
      } else {
        cond = this.userSettings.enableVideo;
      }
      return cond;
    },
  },
  watch: {
    modalResult(newVal) {
      if (newVal) {
        this.sendStatusChangeRequest("finish");
      }
    },
    roomStatusId(newVal) {
      if (newVal === this.constants.room.STATUS_EVENT_FINISHED) {
        this.eventFinishHandler();
      }
    },
  },
  created() {
    this.start = throttle(
      function () {
        this.sendStatusChangeRequest("start");
      },
      2000,
      { trailing: false }
    );
    this.pause = throttle(
      function () {
        this.sendStatusChangeRequest("pause");
      },
      2000,
      { trailing: false }
    );
    this.resume = throttle(
      function () {
        this.sendStatusChangeRequest("resume");
      },
      2000,
      { trailing: false }
    );
  },
  methods: {
    audioButtonHandler() {
      if (this.currentRoom.isIpCamRoom && this.currentUser.isHost) {
        this.roomSettings.enableAudio = !this.roomSettings.enableAudio;
      } else {
        this.userSettings.enableAudio = !this.userSettings.enableAudio;
      }
    },
    videoButtonHandler() {
      if (this.currentRoom.isIpCamRoom && this.currentUser.isHost) {
        this.ipCamerasToggle(this.activeStreams?.length > 0 ? 0 : 1);
      } else {
        this.userSettings.enableVideo = !this.userSettings.enableVideo;
      }
    },
    ipCamerasToggle(value) {
      roomApi.massToggleIpCamVideo(value, this.currentRoom.id);
    },
    onChangeViewMenu() {
      this.$emit("update:isHiddenMenu", !this.isHiddenMenu);
    },
    modalResultHandler(data) {
      if (data.name === "modalRoomFinish") {
        this.modal.result = data.result;
      }

      if (data.name === "modalParticipantDropCallDialog" && data.result) {
        userApi.dropCall(this.currentUser.id);
      }
    },
    dropCall() {
      if (this.currentUser.isParticipant && this.currentUser.isCalled) {
        this.$refs.modalParticipantDropCallDialog.show();
      }
    },
    play() {
      if (this.currentUser.isHost) {
        if (this.currentRoom.isPending) {
          this.start();
        }
        if (this.currentRoom.isPaused) {
          this.resume();
        }
      }
    },
    stop() {
      this.$refs.modalRoomFinish.show();
    },

    sendStatusChangeRequest(action) {
      if (this.currentUser.isHost) {
        api({
          method: "POST",
          url: `/room/${action}`,
          data: {
            roomId: this.currentRoom.id,
          },
        }).catch((data) => console.error(data));
      }
    },

    eventFinishHandler() {
      this.clearInterval();
    },
  },
};
</script>

<style scoped lang="scss">
.form-check-input {
  display: none;
}

nav.navbar {
  height: 50px;
  padding: 0;
  font-size: 1.5rem;
}

.room-controls {
  background-color: #666666;

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
}

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

.drop-call {
  color: red;
  cursor: pointer;
  margin: 0 10px;
}

.flick {
  animation: fadeinout 2s linear forwards infinite;
}

@keyframes fadeinout {
  0%,
  100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}
</style>
