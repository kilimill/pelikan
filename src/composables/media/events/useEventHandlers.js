import useMessageSubscription from '@/composables/useMessageSubscription';
import {useStore} from 'vuex'
import {computed} from 'vue'
import userApi from "@/api/user";
import janusService from '@/services/janus'
import JanusServer from '@/services/janus/servers/JanusServer';
import useMediaHandlers from '@/composables/media/useMediaHandlers';
import useCurrentUser from '@/composables/users/useCurrentUser';
import useJanusHandlers from '@/composables/janus/useJanusHandlers';
import useTimeoutSingleton from '@/composables/useTimeoutSingleton';
import useCurrentRoom from '@/composables/room/useCurrentRoom';
import useConferencePlayers from "@/composables/room/useConferencePlayers";
import useConference from "@/composables/room/useConference";

export default function useEventHandlers(){
  const store = useStore()
  const { on } = useMessageSubscription(store.getters['application/getChannels']);
  const {clearMediaStreams,enumerateDevices,getMediaStream,sourceChangeEvent} = useMediaHandlers()
  const {userCanGetLocalStream,participantIsWaitingForCall} = useCurrentUser()
  const {initJanusInDevice, initJanusOutPrimary,initJanusOutCalled} = useJanusHandlers()
  const constants = store.getters['application/constants']
  const {currentUser} = useCurrentUser()
  const {currentRoom} = useCurrentRoom()
  const {clearTimeout} = useTimeoutSingleton()
  const {getPlayer, destroyPlayer, destroyAllPlayers} = useConferencePlayers()
  const {connectedUsers} = useConference()

  on(constants.events['EVENT_START'], () => {
    eventStartHandler()
  })
  on(constants.events['EVENT_PAUSE'], () => {
    eventPauseHandler()
  })
  on(constants.events['EVENT_RESUME'], () => {
    eventResumeHandler()
  })
  on(constants.events['EVENT_FINISH'], () => {
    eventFinishHandler()
  })
  on('conference.join', e => {
    eventConferenceJoinHandler(e.data);
  })
  on('conference.leave', e => {
    let cu = conferenceUser(e.data.cuId)
    if(cu.value){
      eventDropConferenceUserHandler(cu.value.userId);
    }
  })
  on('conference.remove', (e) => {
    if(e.data?.userId === currentUser.value.id){
      dropConferenceUser()
    }
    janusService.destroyJanusOutCalled(e.data?.userId);
    destroyPlayer(e.data?.userId)
  })
  on('conference.dropConnection', (e) => {
    let cu = conferenceUser(e.data.cuId)
    if(cu){
      janusService.destroyJanusOutCalled(cu.value.userId);
      destroyPlayer(cu.value.userId)
    }
  })
  on('conference.stop', () => {
    dropConferenceUser()
    janusService.destroyOutCalledServers()
    destroyAllPlayers()
  })
  on('room.leaveByDaemon', (e) => {
    if(e.data?.users?.length > 0){
      e.data.users.forEach((val) => {
        if(connectedUsers.value){
          let cu = connectedUsers.value?.find(u => u === val)
          if(cu?.value !== undefined){
            eventDropConferenceUserHandler(val);
          }
        }
      })
    }
  })

  const getMediaStreamHandler = () => {
    if(userCanGetLocalStream.value){
      enumerateDevices().then(() => {
        getMediaStream();
      });
    }
  }

  const conferenceUser = (userId) =>
      computed(() => store.getters['room/conference/conferenceUser'](userId))

  const mountpointUser = (userId) =>
      computed(() => store.getters['room/conference/mountpointByUser'](userId))

  const changedToActiveHandler = () => {
    getMediaStreamHandler()

    if(currentUser.value.isHost && currentRoom.value.isWebCamRoom){
      initJanusInDevice();
    }
    initJanusOutPrimary();
  }

  const eventStartHandler = () => changedToActiveHandler()

  const eventPauseHandler = () => {
    clearMediaStreams();
    store.commit('media/setMediaDeviceReady', false);
    janusService.clearPlayers();
    janusService.stopLocalTracks();
    janusService.destroyOutCalledServers();
    janusService.destroyAllJanusServers();
    getMediaStreamHandler()
  }

  const eventResumeHandler = () => changedToActiveHandler()

  const eventFinishHandler = () => {
    janusService.clearPlayers();
    janusService.destroyOutCalledServers();
    janusService.destroyAllJanusServers();
  }

  const eventConferenceJoinHandler = (data) => {
    let cu = conferenceUser(data.cuId)
    if(currentUser.value.isParticipant && (currentUser.value.id === cu?.value.userId)){
      initJanusInDevice();
    }
      let player = getPlayer(cu?.value.userId)
      initJanusOutCalled(cu?.value.userId, mountpointUser(cu?.value.userId).value, player);
  }
    const eventDropConferenceUserHandler = (userId) => {
    if(currentUser.value.isParticipant && (currentUser.value.id === userId)){
      dropConferenceUser()
    }
    janusService.afterDropUserCallHandler(userId);
    janusService.destroyJanusOutCalled(userId);
    destroyPlayer(userId)
    // janusService.destroyJanus(JanusServer.BASE_TYPE_OUT, JanusServer.TYPE_CALLED);
  }

  const dropConferenceUser = () => {
    if(currentRoom.value.isActive && currentUser.value.isParticipant){
      store.commit('user/call/setCallDialogStatus', false);
      janusService.stopDeviceCapture();
      janusService.destroyJanus(JanusServer.BASE_TYPE_IN, JanusServer.TYPE_DEVICE);
      clearMediaStreams();
      store.commit('media/setMediaDeviceReady', false);
      sourceChangeEvent();
    }
  }

  const modalParticipantCallDialogHandler = async (result) => {
    if(participantIsWaitingForCall.value){
      clearTimeout();
      if(result.result){
        janusService.setParticipantReadyCallback(sourceChangeEvent);
        initJanusInDevice();
      }else{
        userApi.rejectCall(currentUser.value.id);
      }
      store.commit('user/call/setCallDialogStatus', false);
    }
  }

  return {
    modalParticipantCallDialogHandler
  }
}