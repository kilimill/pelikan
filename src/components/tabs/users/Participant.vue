<template>
  <div v-if="!isHost || !isCurrent" class="user accordion-item" ref="userParticipant">
    <div class="user-header accordion-header">
      <div class="checkbox">
        <input
          :id="'participant' + participant.id"
          v-if="currentUserIsHost"
          class="custom-checkbox"
          type="checkbox"
          name="checkedUsers[]"
          :value="participant.id"
          v-model="checkedUsers"
          :disabled="checkedUsers.length === 5 && !checkedUsers.includes(participant.id)"
          @click="toggleUser(participant.id, $event.target.checked)"
        />
        <label :for="'participant' + participant.id"></label>
      </div>
      <button
        v-if="currentUserIsHost && participant.handRaised"
        class="btn"
        :class="{
          highlight: participant.handRaised,
        }"
        title="Опустить руку"
        @click="lowerHand"
      >
        <span class="material-icons" :class="{ flick: isResolvingCall }">{{
          isCalled ? "online_prediction" : "pan_tool"
        }}</span>
      </button>
      <button
        v-if="currentUserIsHost || (!currentUserIsHost && isHost)"
        class="btn"
        :class="{ highlight: highlightMessage }"
        @click.prevent.stop="toPrivateChat"
      >
        <span class="material-icons">textsms</span>
      </button>
      <div
        class="accordion-button accordion-info collapsed"
        aria-expanded="false"
        role="button"
        data-bs-toggle="collapse"
        :class="{ 'cant-expand': !expand, 'accordion-button-playback': isPlayback }"
        :data-bs-target="`#collapse-${participant.id}`"
        aria-controls="collapseOne"
      >
        <div class="user-name" :class="{ 'text-alert': isHost }">
          <span :data-bs-title="participant.alias">{{ participant.alias }}</span>
        </div>
      </div>
    </div>
    <div
      v-if="expand && !isPlayback"
      :id="`collapse-${participant.id}`"
      class="accordion-collapse collapse"
      aria-labelledby="headingOne"
      data-bs-parent="#accordionExample"
    >
      <div class="accordion-body">
        <input
          type="checkbox"
          class="d-none"
          :id="`allow-user-audio-${participant.id}`"
          v-model="userSettings.allowAudio"
          :disabled="!roomSettings.conferenceAudio"
        />
        <label class="btn shadow-none" :for="`allow-user-audio-${participant.id}`">
          <span class="material-icons">{{
            userSettings.allowAudio ? "mic" : "mic_off"
          }}</span>
        </label>
        <input
          type="checkbox"
          class="d-none"
          :id="`allow-user-video-${participant.id}`"
          v-model="userSettings.allowVideo"
          :disabled="!roomSettings.conferenceVideo"
        />
        <label class="btn shadow-none" :for="`allow-user-video-${participant.id}`">
          <span class="material-icons">{{
            userSettings.allowVideo ? "videocam" : "videocam_off"
          }}</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import { computed, reactive, ref } from "vue";
import { useStore } from "vuex";
import useUsersRepository from "@/composables/users/useUsersRepository";
import useUsersCall from "@/composables/users/useUsersCall";
import useUserSettings from "@/composables/users/useUserSettings";
import useCurrentUserHandRise from "@/composables/users/useCurrentUserHandRise";
import useBootstrapTooltip from "@/composables/bootstrap/useBootstrapTooltip";
import useCurrentRoom from "@/composables/room/useCurrentRoom";
import useConference from "@/composables/room/useConference";
import useRoomSettings from "@/composables/room/useRoomSettings";
/**
 * @property {Function} changeCurrentTab
 */
export default {
  name: "User",
  props: {
    participant: {
      type: Object,
      required: true,
    },
    expand: {
      type: Boolean,
      default: false,
    },
  },
  inject: ["changeCurrentTab"],
  setup(props) {
    const store = useStore();

    const userParticipant = ref();
    const { userIsHost, userIsCurrent } = useUsersRepository();
    const { canCallUser, userIsCalled, userIsResolvingCall } = useUsersCall();
    const { blockRoomRaiseHand, lowerHand } = useCurrentUserHandRise();
    const highlightMessage = computed(() =>
      Boolean(~store.state.room.users.highlight.indexOf(props.participant.id))
    );

    const { isPlayback } = useCurrentRoom();

    const {
      userEnableAudio,
      userEnableVideo,
      userEnablePrivateChat,
      userEnablePublicChat,
      userChangeMicGainValue,
      userEnableScreenCapture,
      userEnableRaiseHand,
      userAllowAudio,
      userAllowVideo,
    } = useUserSettings(props.participant.id);

    const { roomEnableConferenceAudio, roomEnableConferenceVideo } = useRoomSettings();

    useBootstrapTooltip(userParticipant, "[data-bs-title]");

    const { toggleConfUser, userIsChecked, checkedUsers, toggleUser } = useConference();
    return {
      isPlayback,
      toggleUser,
      userIsChecked,
      toggleConfUser,
      lowerHand: () => lowerHand(props.participant.id),
      canToggleCall: computed(
        () => canCallUser.value || userIsCalled(props.participant.id)
      ),
      isCalled: computed(
        () => store.state.room.users.called?.id === props.participant.id
      ),
      isResolvingCall: computed(() => userIsResolvingCall(props.participant.id)),
      isHost: userIsHost(props.participant.id),
      currentUserIsHost: userIsHost(store.state.user.id),
      isCurrent: userIsCurrent(props.participant.id),
      highlightMessage,
      blockRoomRaiseHand,
      userSettings: reactive({
        enableAudio: userEnableAudio,
        enableVideo: userEnableVideo,
        enablePrivateChat: userEnablePrivateChat,
        enablePublicChat: userEnablePublicChat,
        changeMicGainValue: userChangeMicGainValue,
        enableScreenCapture: userEnableScreenCapture,
        enableRaiseHand: userEnableRaiseHand,
        allowAudio: userAllowAudio,
        allowVideo: userAllowVideo,
      }),
      roomSettings: reactive({
        conferenceAudio: roomEnableConferenceAudio,
        conferenceVideo: roomEnableConferenceVideo,
      }),
      currentRoom: computed(() => store.getters["room/currentRoom"]),
      currentUser: computed(() => store.getters["room/currentUser"]),
      props: props.participant,
      userParticipant,
      checkedUsers,
    };
  },
  computed: {
    // cantUserRiseHand() {
    //   return !this.userSettings.enableRaiseHand || this.blockRoomRaiseHand;
    // },
    hostCanCallUser() {
      return this.currentUserIsHost && this.currentRoom.isActive;
    },
  },
  methods: {
    ...mapActions("room/users", { changeUserSetting: "changeSetting" }),
    toPrivateChat() {
      this.changeCurrentTab("TabChat", { userId: this.participant.id });
    },
  },
};
</script>

<style lang="scss" scoped>
@import "src/assets/scss/external/tabs-user";

.btn {
  color: #ffffff;
}
</style>
