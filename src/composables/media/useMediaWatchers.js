import {computed, watch} from "vue"
import {useStore} from 'vuex'
import useMediaHandlers from '@/composables/media/useMediaHandlers';
import useRoomSettings from '@/composables/room/useRoomSettings';
import JanusServer from '@/services/janus/servers/JanusServer';
import useJanusHandlers from '@/composables/janus/useJanusHandlers';
import janusService from '@/services/janus'
import useCurrentUser from '@/composables/users/useCurrentUser';
import useUserSettings from '@/composables/users/useUserSettings';
import useMicController from '@/composables/tabs/useMicController';
import useDeviceHandlers from "@/composables/media/useDeviceHandlers";


export default function useMediaWatchers(){

  const store = useStore()
  const currentRoom = computed(() => store.getters["room/currentRoom"])
  const {hostCanCaptureScreen, participantCanWatchScreenCapture, isHost} = useCurrentUser()

  const {startScreenCapture, updateScreenCapture, sourceChangeEvent} = useMediaHandlers()
  const {initJanusOutScreen, initJanusInScreen} = useJanusHandlers()
  const {currentBitrate} = useDeviceHandlers()

  const mediaStreamScreen = computed(() => store.getters['media/mediaStreamScreen'])
  const mediaStreamDevice = computed(() => store.getters['media/mediaStreamDevice'])
  const mediaDeviceReady = computed(() => store.getters['media/mediaDeviceReady'])
  const mediaAudioSelected = computed(() => store.getters['media/mediaDevicesAudioSelected'])
  const mediaVideoSelected = computed(() => store.getters['media/mediaDevicesVideoSelected'])

  const {
    userChangeMicGainValue,
    userEnableAudio
  } = useUserSettings(store.state.user.id)

  const {
    changeMicLevel,
  } = useMicController()

  const {
    roomEnableScreenCapture,
  } = useRoomSettings()

  if(participantCanWatchScreenCapture.value){
    initJanusOutScreen();
  }

  watch(hostCanCaptureScreen, (newVal) => {
    if (newVal) {
      startScreenCapture(userEnableAudio.value);
    }
  })

  watch(userEnableAudio, (audioOn) => {
      if(roomEnableScreenCapture.value && isHost.value){
        updateScreenCapture(audioOn);
      }
  })

  watch(roomEnableScreenCapture, (newVal) => {
    if(newVal){
      if(currentRoom.value.isActive){
        initJanusOutScreen();
      }
    }else {
      janusService.destroyJanus(JanusServer.BASE_TYPE_OUT, JanusServer.TYPE_SCREEN);
    }
  })

  watch(userChangeMicGainValue, (newVal, oldVal) => {
    if(oldVal !== undefined){
      newVal = parseInt(newVal);
      changeMicLevel(newVal);
    }
  });

  watch(mediaStreamDevice, (newVal) => {
    if(typeof newVal === 'object' && mediaDeviceReady.value && currentRoom.value.isActive){
      publishStream(newVal, currentBitrate.value);
    }
    if(!newVal && mediaDeviceReady.value && currentRoom.value.isActive){
      janusService.stopDeviceCapture();
    }
  });

  watch(mediaStreamScreen, (newVal) => {
    if(typeof newVal === 'object'){
      console.log('mediaStreamScreen changed.');
      initJanusInScreen();
    }else{
      janusService.destroyJanus(JanusServer.BASE_TYPE_IN, JanusServer.TYPE_SCREEN);
    }
  });

  watch(mediaDeviceReady, (newVal) => {
    if(newVal && currentRoom.value.isActive && mediaStreamDevice.value !== undefined){
      publishStream(mediaStreamDevice.value, currentBitrate.value);
    }
  });

  watch(mediaAudioSelected, (newVal, oldVal) => {
    if(oldVal !== undefined){
      sourceChangeEvent();
    }
  });

  watch(mediaVideoSelected, (newVal, oldVal) => {
    if(oldVal !== undefined){
      sourceChangeEvent();
    }
  });

  const publishStream = (inputStream, currentBitrate) => {
    janusService.publishOwnStream(inputStream, currentBitrate);
  }

}