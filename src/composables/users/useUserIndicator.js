import { useStore } from "vuex";
import { computed } from "vue";

export default function useUserIndicator(id) {
  const store = useStore();
  const user = computed(() => store.getters["room/users/findUser"](id));
  const isUsersAudioOn = (id) => store.getters["room/users/isUsersAudioOn"](id);

  const userConfIndicator = computed(() => {
    if (user.value?.hasAudio) {
      return isUsersAudioOn(id) ? "success" : "warning";
    } else {
      return "error";
    }
  });

  return { userConfIndicator };
}
