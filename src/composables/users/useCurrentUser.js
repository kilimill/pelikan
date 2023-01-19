import {useStore} from "vuex";
import {computed, reactive} from "vue";
import { PREDEFINED_CONTENT_DESKTOP } from '@/store/modules/room/content';
import useMainPanelContent from '@/composables/room/useMainPanelContent';
import useRoomSettings from '@/composables/room/useRoomSettings';

export default function useCurrentUser() {
    const store = useStore()
    const currentUser = computed(() =>store.getters["user/currentUser"])
    const currentRoom = computed(() =>store.getters["room/currentRoom"])
    const conferenceUsers = computed(() =>store.getters["room/conference/connectedUsers"])
    const {selectedContentValue} = useMainPanelContent()

    const userAffectedByCallControl = computed(() => {
        return currentUser.value.isParticipant &&
          currentUser.value.isNotCalled;
    })

    const {
        roomEnableScreenCapture,
    } = useRoomSettings()

    const roomSettings = reactive({
        screenCaptureActive: roomEnableScreenCapture,
    })

    const hostCanCaptureScreen = computed(() => {
        return currentUser.value.isHost &&
          currentRoom.value.isActive &&
          currentRoom.value.isWebCamRoom &&
          selectedContentValue.value === PREDEFINED_CONTENT_DESKTOP &&
          !roomSettings.screenCaptureActive;
    })

    const participantCanWatchScreenCapture = computed(() => {
        return currentUser.value.isParticipant &&
          currentRoom.value.isActive &&
          roomSettings.screenCaptureActive &&
          selectedContentValue.value === PREDEFINED_CONTENT_DESKTOP;
    })

    const participantIsNotCalled = computed(() => {
        return currentUser.value.isParticipant &&
            !conferenceUsers.value.find(item => item === currentUser.value.id);
    })

    const participantIsCalled = computed(() => {
        return currentUser.value.isParticipant && conferenceUsers.value.find(item => item === currentUser.value.id);
    })

    const participantIsWaitingForCall = computed(() => {
        return currentUser.value.isParticipant
          && currentUser.value.isCallWaiting;
    });

    const hostCanStream = computed(() => {
        return currentUser.value.isHost &&
          currentRoom.value.isWebCamRoom &&
          currentRoom.value.isActive;
    })

    const userCanGetLocalStream = computed(() => {
        return (currentUser.value.isHost && currentRoom.value.isWebCamRoom) ||
          currentUser.value.isParticipant;
    })

    const userCanGetDeviceStream = computed(() => {
        return userCanGetLocalStream.value && currentRoom.value.isActive;
    })

    const mustPassEchoTest = computed(() => {
        return (currentUser.value.isHost && currentRoom.value.isWebCamRoom) ||
        currentUser.value.isParticipant;
    })

    return {
        currentUser,
        isHost: computed(() => currentUser.value.isHost),
        isParticipant: computed(() => currentUser.value.isParticipant),
        userAffectedByCallControl,
        hostCanCaptureScreen,
        hostCanStream,
        participantCanWatchScreenCapture,
        participantIsNotCalled,
        participantIsCalled,
        participantIsWaitingForCall,
        userCanGetLocalStream,
        userCanGetDeviceStream,
        mustPassEchoTest
    }
}