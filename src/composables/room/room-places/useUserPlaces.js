import { computed } from 'vue'
import useApplicationMode from "@/composables/useApplicationMode";
import useCurrentUser from "@/composables/users/useCurrentUser";
import useRoomSettings from "@/composables/room/useRoomSettings";

export default function useUserPlaces(userId) {
  const { isActivity } = useApplicationMode();
  const { isHost } = useCurrentUser();

  const {
    changeSetting,
    mutateSetting,
    settingsNames,
    roomSettings,
  } = useRoomSettings();

  const enablePlayerUserId = computed(() => roomSettings.value.enablePlayerUserId);

  const softSwitchPlaces = () => {
    let activeUserId = enablePlayerUserId.value ? 0 : userId;
    if (!roomSettings.value.enabledVPDF) {
      mutateSetting(settingsNames.ROOM_CURRENT_V_PDF, true);
    }
    mutateSetting(settingsNames.ROOM_LARGE_PLAYER_USER_ID, activeUserId);
  };

  const hardSwitchPlaces = () => {
    let activeUserId = enablePlayerUserId.value ? 0 : userId;
    if (!roomSettings.value.enabledVPDF) {
      changeSetting(settingsNames.ROOM_CURRENT_V_PDF, true);
    }
    changeSetting(settingsNames.ROOM_LARGE_PLAYER_USER_ID, activeUserId);
  };

  let switchPlaces;

  if (isActivity()) {
    switchPlaces = () =>
      isHost.value ? hardSwitchPlaces() : softSwitchPlaces();
  } else {
    switchPlaces = () => softSwitchPlaces();
  }

  return {
    switchPlaces,
    largePlayerUserId: enablePlayerUserId,
  };
}
