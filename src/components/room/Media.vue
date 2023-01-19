<template>
  <audio ref="player" id="main-player" autoplay></audio>
  <audio ref="secondaryPlayer" id="secondary-player" autoplay></audio>
  <modal-window ref="modalParticipantCallDialog"
                type="dialog"
                @modal-result="modalParticipantCallDialogHandler($event)">
    <template v-slot:message>Вас вызывают для общения. Вы можете принять вызов или отклонить.</template>
    <template v-slot:button-text-ok>Принять</template>
    <template v-slot:button-text-cancel>Отклонить</template>
  </modal-window>

</template>

<script>
import ModalWindow from '@/components/common/ModalWindow';
import {mapGetters, mapMutations, useStore} from 'vuex'
import {computed, reactive} from "vue"
import janusService from '@/services/janus'
import useUserSettings from "@/composables/users/useUserSettings";
import useRoomSettings from "@/composables/room/useRoomSettings";
import roomApi from "@/api/room";
import useJanusHandlers from '@/composables/janus/useJanusHandlers';
import useMediaHandlers from '@/composables/media/useMediaHandlers';
import useMediaWatchers from '@/composables/media/useMediaWatchers';
import useEventHandlers from '@/composables/media/events/useEventHandlers';
import confApi from '@/api/conference';
import useConference from "@/composables/room/useConference";

export default {
  name: 'Media',
  components:{ModalWindow},
  setup(){
    useMediaWatchers()
    const {modalParticipantCallDialogHandler} = useEventHandlers()
    const store = useStore();

    const events = computed(() => store.state.application.constants.events)
    const {
      userEnableAudio,
      userEnableVideo,
      userChangeMicGainValue
    } = useUserSettings(store.state.user.id)
    const {
      roomEnableIpRoomAudio,
      roomEnableScreenCapture,
      roomEnableUserCallControl
    } = useRoomSettings()

    const {sourceChangeEvent} = useMediaHandlers()
    const {initJanus} = useJanusHandlers()

    const {participantConnected} = useConference()

    return {
      userSettings: reactive({
        enableAudio: userEnableAudio,
        enableVideo: userEnableVideo,
        micGainValue: userChangeMicGainValue
      }),
      roomSettings: reactive({
        enableAudio: roomEnableIpRoomAudio,
        screenCaptureActive: roomEnableScreenCapture,
        enabledUserCallControl: roomEnableUserCallControl
      }),
      events,
      calledUser: computed(() => store.getters["room/users/calledUser"]),
      currentUser: computed(() => store.getters["user/currentUser"]),
      currentRoom: computed(() => store.getters["room/currentRoom"]),
      initJanus,
      sourceChangeEvent,
      modalParticipantCallDialogHandler,
      participantConnected
    }
  },
  created(){
    window.removeEventListener('beforeunload', this.beforeUnloadHandler);
    window.addEventListener('beforeunload', this.beforeUnloadHandler);
  },
  computed:{
    ...mapGetters('application', [
      'constants',
      'mountPoints',
      'userCallControlInProgress',
      'userCallControlTimeout',
      'isOnline'
    ]),
    ...mapGetters('room/streams', [
        'activeStreams'
    ]),
    ...mapGetters('user/call', [
      'callDialog'
    ]),
    ...mapGetters('media', [
      'mediaDevicesAudioList',
      'mediaDevicesVideoList',
      'mediaAudioSelected',
      'mediaVideoSelected',
      'mediaReady',
      'mediaStreamDevice',
      'mediaStreamLocal',
      'mediaStreamScreen',
      'mediaDevicesAudioSelected'
    ]),
    hasAudio () {
      return this.mediaDevicesAudioList.length > 0;
    },
    hasVideo () {
      return this.mediaDevicesVideoList.length > 0;
    },
    hostCanStream () {
      return this.currentUser.isHost &&
          this.currentRoom.isWebCamRoom &&
          this.currentRoom.isActive;
    },
    roomIsActive(){
      return this.currentRoom.isActive;
    },
    participantCanWatchVideo(){
      return this.currentUser.isParticipant &&
          this.currentRoom.isActive;
    },
    participantCanWatchScreenCapture(){
      return this.currentUser.isParticipant &&
          this.currentRoom.isActive &&
          this.screenCaptureActive;
    },
    roomHasUserCallActive(){
      return !!(this.calledUser || this.currentUser.isCalled)
    },
    userAudioOn(){
      return this.userSettings.enableAudio;
    },
    userVideoOn(){
      return this.userSettings.enableVideo;
    },
    micGainValue(){
      return this.userSettings.micGainValue;
    },
    userCanGetLocalStream(){
     return (this.currentUser.isHost && this.currentRoom.isWebCamRoom) ||
         this.currentUser.isParticipant;
    },
    userCanGetDeviceStream () {
      let conditions = this.currentRoom.isActive;
      if (this.currentUser.isParticipant) {
        conditions = conditions && !this.currentUser.isNotCalled;
      }
      return this.userCanGetLocalStream && conditions;
    },
    participantIsWaitingForCall(){
      return this.currentUser.isParticipant
          && this.currentUser.isCallWaiting;
    },
    participantIsCalled(){
      return this.currentUser.isParticipant
          && this.currentUser.isCalled;
    },
    ipRoomAudio(){
      return this.roomSettings.enableAudio;
    },
  },
  watch: {
    callDialog(newVal){
      let dialog = this.$refs.modalParticipantCallDialog;
      if(newVal){
        dialog.show();
      }else{
        dialog.hide();
      }
    },
    ipRoomAudio(newVal){
      if(this.currentUser.isParticipant && this.currentRoom.isIpCamRoom){
        if(newVal){
          janusService.roomAudioOn();
        }else{
          janusService.roomAudioOff();
        }
      }
    },
    userAudioOn(){
      if(this.currentRoom.isActive){
        this.sourceChangeEvent();
      }
    },
    userVideoOn(){
      if(this.currentRoom.isActive){
        this.sourceChangeEvent();
      }
    },
  },
  methods: {
    ...mapMutations('media', [
      'setPlayer',
      'setMediaReady',
      'setMediaDeviceReady',
      'setMediaStarted',
      'setMediaStreamEcho',
      'setMediaStreamDevice',
      'setMediaStreamScreen',
      'setMediaStreamLocal',
      'setMediaDevices',
    ]),
    beforeUnloadHandler(){
      if (this.currentUser.isParticipant) {
        if (this.participantConnected) {
          confApi.dropConnection()
        }
        roomApi.sendEchoTestResults(
            0,
            0,
            true
        );
      }
    },
    init(){
      this.setMediaStreamEcho(undefined);
      if(
          this.roomSettings.screenCaptureActive &&
          this.currentUser.isHost
      ){
        roomApi.toggleScreenCapture(false);
      }

      janusService.setPlayer('main', this.$refs.player);
      janusService.setPlayer('secondary', this.$refs.secondaryPlayer);

      this.initJanus();
      this.beforeUnloadHandler.bind(this)
    },
  },
  mounted(){
    this.init();
  },
  unmounted(){
    janusService.unsetPlayer('main');
    janusService.unsetPlayer('secondary');
    janusService.destroyAllJanusServers();
  }


};
</script>

<style scoped>

</style>