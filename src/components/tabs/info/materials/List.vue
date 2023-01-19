<template>
  <teleport :to="`#materials-list-${isPlayback ? `playback` : `room`}-placeholder`">
    <materials list :disabled="disableActions" class="materials-list" />
  </teleport>
</template>

<script>
import {computed} from "vue";
import useCurrentUser from "@/composables/users/useCurrentUser";
import useCurrentRoom from "@/composables/room/useCurrentRoom";
import Materials from "@/components/tabs/info/materials";

export default {
  name: 'MaterialsList',
  components: {Materials},
  setup(){
    const {isHost} = useCurrentUser()
    const {isPlayback} = useCurrentRoom()
    const disableActions = computed(() => !isHost.value)
    return {
      isPlayback,
      disableActions
    }
  }
};

</script>

<style scoped>

</style>