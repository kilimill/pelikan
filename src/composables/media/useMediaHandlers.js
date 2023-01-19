import {useStore} from 'vuex'
import {computed, reactive} from "vue"
import useDeviceHandlers from '@/composables/media/useDeviceHandlers';
import useUserSettings from '@/composables/users/useUserSettings';
import useMicController from '@/composables/tabs/useMicController';
import userApi from "@/api/user";
import {
  PREDEFINED_CONTENT_BACKGROUND,
} from '@/store/modules/room/content';
import roomApi from "@/api/room";
import useCurrentUser from '@/composables/users/useCurrentUser';
import janusService from '@/services/janus'


export default function useMediaHandlers(){

  const currentRoom = computed(() => store.getters["room/currentRoom"])
  const {currentUser, participantIsWaitingForCall, userCanGetDeviceStream} = useCurrentUser()

  const store = useStore()

  const {
    enumerateDevices: deviceEnumerateDevices,
    getMediaStream: deviceGetMediaStream,
    getFilteredStream,
    devicesChangeHandler,
    getScreenMedia,
    getUserMedia
  } = useDeviceHandlers()

  const audioList = []
  const videolist = []

  const hasAudio = computed(() => Boolean(store.getters['media/mediaDevicesAudioList']))
  const hasVideo = computed(() => Boolean(store.getters['media/mediaDevicesVideoList']))
  const mediaAudioSelected = computed(() => store.getters['media/mediaDevicesAudioSelected'])
  const mediaVideoSelected = computed(() => store.getters['media/mediaDevicesVideoSelected'])
  const mediaDevicesAudioList = computed(() => store.getters['media/mediaDevicesAudioList'])
  const mediaDevicesVideoList = computed(() => store.getters['media/mediaDevicesVideoList'])
  const {setMicGainNode, changeMicLevel, prepareAudioOperations} = useMicController()

  const {
    userEnableAudio,
    userEnableVideo,
    userChangeMicGainValue
  } = useUserSettings(store.state.user.id)

  const userSettings = reactive({
    enableAudio: userEnableAudio,
    enableVideo: userEnableVideo,
    micGainValue: userChangeMicGainValue
  })

  const updateScreenCapture = async (audio = true) => {
    let streamScreen = computed(() => store.getters["media/mediaStreamScreen"]);
    if(streamScreen.value.getAudioTracks()[0]){
        streamScreen.value.getAudioTracks()[0].enabled = audio;
    }
  }

  const startScreenCapture = async (audio = true) => {
    if (
      currentUser.value.isHost
      && currentRoom.value.isActive
      && navigator.mediaDevices
      && navigator.mediaDevices.getDisplayMedia
    ) {
      await getScreenMedia(mediaAudioSelected.value).then(
        (stream) => {
          getUserMedia({
            audio: {
              deviceId:{
                exact: mediaAudioSelected.value
              }
            },
            video: false
          }).then((streamAudio) => {
            if(streamAudio){
              stream.addTrack(streamAudio.getAudioTracks()[0]);
              stream.getAudioTracks()[0].enabled = audio;
            }

            stream.getVideoTracks()[0].addEventListener('ended', () => {
              store.commit('media/setMediaStreamScreen' ,undefined);
            })

            if(currentUser.value.isHost){
              store.commit('media/setMediaStreamScreen' ,stream);
              roomApi.toggleScreenCapture(true);
            }
          });
        }).catch(() => {
        store.commit('room/content/selectedContentValue', PREDEFINED_CONTENT_BACKGROUND)
        store.commit('media/setMediaStreamScreen' ,undefined);
      });
    }
  }

  const enumerateDevices = async () => {
    await deviceEnumerateDevices(audioList, videolist).then((media) => {
      store.commit('media/setMediaDevices', media)
    }).catch((error) => console.error(error));
  }

  const getMediaStream = async () => {
    if(
      mediaDevicesAudioList.value.length === 0 &&
      mediaDevicesVideoList.value.length === 0
    ){
      return false;
    }
    await deviceGetMediaStream()
    .then((data) => {
      if(data?.stream){
        streamHandler(data.stream);
      }
      store.commit('media/setMediaReady', true);
      if(data?.media){
        store.commit('media/setMediaDevices', data.media);
      }

    }).catch((error) => console.error(error));
  }

  const streamHandler = (localStream) => {
    let stream = localStream;

    if(stream.getAudioTracks().length > 0){
      stream = setMicGainNode(stream, userSettings.micGainValue);
    }
    stream = prepareAudioOperations(stream, userSettings.micGainValue)
    let local = stream;
    if(userCanGetDeviceStream.value){
      stream = getFilteredStream(
        userSettings.enableAudio,
        userSettings.enableVideo,
        stream
      );

      store.commit('media/setMediaStreamDevice', stream);
    }
    store.commit('media/setMediaStreamLocal', local);
  }

  const sourceChangeEvent = () => {
    devicesChangeHandler(
      mediaDevicesAudioList.value.length > 0,
      mediaDevicesVideoList.value.length > 0,
      mediaAudioSelected?.value,
      mediaVideoSelected?.value
    ).then((localStream) => {
      if(localStream){
        streamHandler(localStream);
      }
      if(participantIsWaitingForCall.value){
        userApi.sendParticipantStreamEvent();
      }
    }).catch((error) => {
      console.error(error);
      store.commit('media/setMediaStreamDevice', undefined);
      store.commit('media/setMediaStreamLocal', undefined);
      janusService.stopLocalTracks();
      if(participantIsWaitingForCall.value){
        userApi.dropCall(currentUser.value.id);
      }
    });
  }

  const clearMediaStreams = () => {
    store.commit('media/setMediaStreamEcho', undefined)
    store.commit('media/setMediaStreamDevice', undefined)
    store.commit('media/setMediaStreamScreen', undefined)
  }

  return{
    enumerateDevices,
    hasAudio: hasAudio.value,
    hasVideo: hasVideo.value,
    listAudio: computed(() => store.getters['media/mediaDevicesAudioList']),
    listVideo: computed(() => store.getters['media/mediaDevicesVideoList']),
    selectedAudio: computed({
      get: () => store.getters['media/mediaDevicesAudioSelected'],
      set: vl => store.commit('media/setAudioSelected',vl)
    }),
    selectedVideo: computed({
      get: () => store.getters['media/mediaDevicesVideoSelected'],
      set: vl => store.commit('media/setVideoSelected',vl)
    }),
    getMediaStream,
    changeMicLevel,
    sourceChangeEvent,
    startScreenCapture,
    updateScreenCapture,
    clearMediaStreams
  }
}