<template>
  <div class="tab-setting">
    <div class="tab-setting-container" v-if="showIPCamSettings">
      Настройка камер
      <div v-for="(item, index) in ipCameras" :key="index" class="form-check">
        <input
          class="form-check-input"
          type="checkbox"
          v-model="item.checked"
          @change="toggleIpCamVideo(item)"
          :id="`setting-camera-${index}`"
        />
        <label class="form-check-label" :for="`setting-camera-${index}`">
          {{ item.name }}
        </label>
      </div>
    </div>
    <div class="tab-setting-container" v-if="showIPCamSettings">
      Настройка звука
      <div class="form-check">
        <input
          class="form-check-input"
          type="checkbox"
          v-model="roomSettings.enableIpRoomAudio"
          :id="`setting-toggle-ip-room-audio`"
        />
        <label class="form-check-label" :for="`setting-toggle-ip-room-audio`">
          Звук камер
        </label>
      </div>
    </div>
    <div class="tab-setting-container" v-if="showWebCamSettings">
      <div class="form-check drop-down-with-check">
        <input
          class="form-check-input"
          type="checkbox"
          v-model="userSettings.enableVideo"
          :disabled="
            (!roomSettings.enableConferenceVideo || !userSettings.allowVideo) &&
            !this.currentUser.isHost
          "
        />
        <drop-down-select
          v-model="videoSelected"
          :default-text="'Камера не выбрана'"
          :options="videoDropDownList"
        />
      </div>
      <div class="tab-setting-video">
        <span v-if="!videoSelected" class="tab-setting-video-label"
          >Камера не выбрана...</span
        >
        <video muted autoplay ref="localPlayer" id="local-player"></video>
      </div>
    </div>
    <div class="tab-setting-container" v-if="showWebCamSettings">
      <div class="form-check drop-down-with-check">
        <input
          class="form-check-input"
          type="checkbox"
          v-model="userSettings.enableAudio"
          :disabled="
            (!roomSettings.enableConferenceAudio || !userSettings.allowAudio) &&
            !this.currentUser.isHost
          "
        />
        <drop-down-select
          v-model="audioSelected"
          :default-text="'Микрофон не выбран'"
          :options="audioDropDownList"
        />
      </div>
      <mic-control />
    </div>
    <div class="tab-setting-container">
      <div class="form-check">
        <input
          class="form-check-input"
          type="checkbox"
          v-model="userSettings.enableTooltips"
          :id="`setting-user-enable-tooltips`"
        />
        <label class="form-check-label" :for="`setting-user-enable-tooltips`">
          Подсказки для кнопок
        </label>
      </div>
    </div>
    <div class="tab-setting-container" v-if="currentUser.isHost">
      Права участников
      <div class="form-check">
        <input
          class="form-check-input"
          type="checkbox"
          v-model="roomSettings.enableSwitchSlide"
          :id="`setting-room-enable-switch-slide`"
        />
        <label class="form-check-label" :for="`setting-room-enable-switch-slide`">
          Переключать слайды
        </label>
      </div>
      <div class="form-check" v-show="!currentRoom.isWebCamRoom">
        <input
          class="form-check-input"
          type="checkbox"
          v-model="roomSettings.enableSwitchVideo"
          :id="`setting-room-enable-switch-video`"
        />
        <label class="form-check-label" :for="`setting-room-enable-switch-video`">
          Переключать камеры
        </label>
      </div>
      <div class="form-check">
        <input
          class="form-check-input"
          type="checkbox"
          v-model="roomSettings.enableChatPublic"
          :id="`setting-room-enable-chat-public`"
        />
        <label class="form-check-label" :for="`setting-room-enable-chat-public`">
          Писать в общий чат
        </label>
      </div>
      <div class="form-check">
        <input
          class="form-check-input"
          type="checkbox"
          v-model="roomSettings.enableChatPrivate"
          :id="`setting-room-enable-chat-private`"
        />
        <label class="form-check-label" :for="`setting-room-enable-chat-private`">
          Писать в личный чат
        </label>
      </div>
      <div class="form-check">
        <input
          class="form-check-input"
          type="checkbox"
          v-model="roomSettings.enableRaiseHand"
          :id="`setting-room-enable-raise-hand`"
        />
        <label class="form-check-label" :for="`setting-room-enable-raise-hand`">
          Поднимать руку
        </label>
      </div>
    </div>
    <div class="tab-setting-container" v-if="currentUser.isHost">
      Вызов участника
      <div class="form-check">
        <input
          class="form-check-input"
          type="checkbox"
          v-model="roomSettings.enableCallDrawMode"
          :id="`setting-room-enable-call-draw-mode`"
        />
        <label class="form-check-label" :for="`setting-room-enable-call-draw-mode`">
          Разрешить рисовать
        </label>
      </div>
    </div>
    <div class="tab-setting-container" v-if="currentUser.isHost">
      Звуковые оповещения
      <div class="form-check">
        <input
          class="form-check-input"
          type="checkbox"
          v-model="roomSettings.enableSoundMessageChatPublic"
          :id="`setting-room-enable-sound-message-chat-public`"
        />
        <label
          class="form-check-label"
          :for="`setting-room-enable-sound-message-chat-public`"
        >
          Сообщение в общий чат
        </label>
      </div>
      <div class="form-check">
        <input
          class="form-check-input"
          type="checkbox"
          v-model="roomSettings.enableSoundMessageChatPrivate"
          :id="`setting-room-enable-sound-message-chat-private`"
        />
        <label
          class="form-check-label"
          :for="`setting-room-enable-sound-message-chat-private`"
        >
          Сообщение в личный чат
        </label>
      </div>
      <div class="form-check">
        <input
          class="form-check-input"
          type="checkbox"
          v-model="roomSettings.enableSoundRaiseHand"
          :id="`setting-room-enable-sound-raise-hand`"
        />
        <label class="form-check-label" :for="`setting-room-enable-sound-raise-hand`">
          Поднятие руки
        </label>
      </div>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapGetters, useStore } from "vuex";
import DropDownSelect from "@/components/common/DropDownSelect";
import { computed, reactive } from "vue";
import useUsersRepository from "@/composables/users/useUsersRepository";
import useUserSettings from "@/composables/users/useUserSettings";
import useRoomSettings from "@/composables/room/useRoomSettings";
import MicControl from "@/components/tabs/settings/MicControl";
import roomApi from "@/api/room";
import useMicController from "@/composables/tabs/useMicController";

export default {
  name: "RoomSettings",
  components: { DropDownSelect, MicControl },
  setup() {
    const store = useStore();
    const events = computed(() => store.state.application.constants.events);

    const { userIsHost, userIsCurrent } = useUsersRepository();

    const {
      userEnableAudio,
      userEnableVideo,
      userChangeMicGainValue,
      userEnableTooltips,
      userAllowAudio,
      userAllowVideo,
    } = useUserSettings(store.state.user.id);

    const {
      roomEnableIpRoomAudio,
      roomEnableSwitchSlide,
      roomEnableSwitchVideo,
      roomEnableChatPublic,
      roomEnableChatPrivate,
      roomEnableRaiseHand,
      roomEnableUserCallControl,
      roomEnableDrawModeUserCall,
      roomEnableSoundMessageChatPublic,
      roomEnableSoundMessageChatPrivate,
      roomEnableSoundRaiseHand,
      roomEnableConferenceAudio,
      roomEnableConferenceVideo,
    } = useRoomSettings();

    const { setMicGainNode, prepareAudioOperations } = useMicController();

    return {
      setMicGainNode,
      prepareAudioOperations,
      events,
      isHost: userIsHost(store.state.user.id),
      currentUserIsHost: userIsHost(store.state.user.id),
      isCurrent: userIsCurrent(store.state.user.id),
      currentUser: computed(() => store.getters["user/currentUser"]),
      currentRoom: computed(() => store.getters["room/currentRoom"]),

      userSettings: reactive({
        enableAudio: userEnableAudio,
        enableVideo: userEnableVideo,
        micGainValue: userChangeMicGainValue,
        enableTooltips: userEnableTooltips,
        allowAudio: userAllowAudio,
        allowVideo: userAllowVideo,
      }),

      roomSettings: reactive({
        enableIpRoomAudio: roomEnableIpRoomAudio,
        enableSwitchSlide: roomEnableSwitchSlide,
        enableSwitchVideo: roomEnableSwitchVideo,
        enableChatPublic: roomEnableChatPublic,
        enableChatPrivate: roomEnableChatPrivate,
        enableRaiseHand: roomEnableRaiseHand,
        enableCallControl: roomEnableUserCallControl,
        enableCallDrawMode: roomEnableDrawModeUserCall,
        enableSoundMessageChatPublic: roomEnableSoundMessageChatPublic,
        enableSoundMessageChatPrivate: roomEnableSoundMessageChatPrivate,
        enableSoundRaiseHand: roomEnableSoundRaiseHand,
        enableConferenceAudio: roomEnableConferenceAudio,
        enableConferenceVideo: roomEnableConferenceVideo,
      }),

      allStreams: computed(() => store.getters["room/streams/allStreams"]),
    };
  },
  data() {
    return {};
  },

  computed: {
    visualizeDeviceStreamMic() {
      let conditions =
        this.currentRoom.isActive && this.userSettings.enableAudio && this.hasAudio;

      conditions =
        conditions && (this.currentUser.isHost || !this.currentUser.isNotCalled);
      return conditions;
    },
    canVisualizeLocalStream() {
      return !!(this.visualizeLocalStreamMic && this.mediaStreamLocal);
    },
    canVisualizeDeviceStream() {
      return !!(
        this.visualizeDeviceStreamMic &&
        this.mediaStreamDevice &&
        this.mediaStreamDevice.getAudioTracks().length > 0
      );
    },
    ipCameras() {
      return this.allStreams.map((val) => ({
        name: val.name,
        checked: val.videoOn === 1,
        id: val.id,
      }));
    },
    showIPCamSettings() {
      return this.currentUser.isHost && this.currentRoom.isIpCamRoom;
    },
    showWebCamSettings() {
      return (
        this.currentUser.isParticipant ||
        (this.currentUser.isHost && this.currentRoom.isWebCamRoom)
      );
    },
    hasAudio() {
      return this.audioList.length > 0;
    },
    hasVideo() {
      return this.videoList.length > 0;
    },
    audioList() {
      return this.mediaDevicesAudioList;
    },
    videoList() {
      return this.mediaDevicesVideoList;
    },
    videoDropDownList() {
      return this.videoList.map((i) => {
        return { name: i.label, value: i.value };
      });
    },
    audioDropDownList() {
      return this.audioList.map((i) => {
        return { name: i.label, value: i.value };
      });
    },
    audioSelected: {
      get() {
        return this.mediaAudioSelected;
      },
      set(value) {
        this.setAudioSelected(value);
      },
    },
    videoSelected: {
      get() {
        return this.mediaVideoSelected;
      },
      set(value) {
        this.setVideoSelected(value);
      },
    },
    ...mapGetters("media", [
      "mediaStreamDevice",
      "mediaStreamLocal",
      "mediaReady",
      "mediaDevicesAudioList",
      "mediaDevicesVideoList",
      "mediaAudioSelected",
      "mediaVideoSelected",
    ]),
    ...mapGetters("application", ["constants"]),
    ...mapGetters("room", ["roomStatusId"]),
  },
  watch: {
    mediaStreamLocal(newVal) {
      if (typeof newVal === "object") {
        this.localStreamHandler(newVal);
      }
      if (newVal === undefined) {
        this.$refs.localPlayer.srcObject = null;
      }
    },
  },

  mounted() {
    this.init();
  },

  methods: {
    ...mapMutations("media", [
      "setMediaReady",
      "setMediaStreamDevice",
      "setMediaStreamLocal",
      "setAudioSelected",
      "setVideoSelected",
    ]),
    localStreamHandler(localStream) {
      if (!this.currentRoom.isFinished) {
        this.$refs.localPlayer.srcObject = localStream;
      }
    },
    init() {
      if (this.mediaStreamLocal) {
        console.error(this.mediaStreamLocal);
        this.$refs.localPlayer.srcObject = this.mediaStreamLocal;
      }
    },

    toggleIpCamVideo(item) {
      roomApi.toggleIpCamVideo(item.id);
    },
  },
};
</script>

<style scoped>
.drop-down-with-check {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
.drop-down-with-check input.form-check-input {
  margin-top: 0;
}
.tab-setting-video-label {
  position: absolute;
  top: 10px;
  left: 10px;
}
.tab-setting-video {
  position: relative;
  width: 100%;
  margin: 5px 0;
}
video {
  background-color: black;
  width: 100%;
}
</style>
