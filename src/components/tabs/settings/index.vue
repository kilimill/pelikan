<template>
  <section class="tab-content">
    <scrollable-decorator>
      <span>
        <a target="_blank" class="link-doc" href="https://pelikan.online/pdf/instr/pelikan_instruction_users.pdf">Инструкция СДО Пеликан</a>
         <span> v{{version}}</span>
      </span>
      <room-settings v-if="!isPlayback" />
      <playback-settings v-if="isPlayback" :isHost="isHost.value" />
    </scrollable-decorator>
  </section>
</template>

<script>
import ScrollableDecorator from "@/components/common/ScrollableDecorator";
import RoomSettings from "@/components/tabs/settings/Room";
import PlaybackSettings from "@/components/tabs/settings/Playback";
import useCurrentRoom from '@/composables/room/useCurrentRoom';
import useCurrentUser from '@/composables/users/useCurrentUser';
import { useStore } from "vuex";

export default {
  name: 'TabSettings',
  components: {ScrollableDecorator, RoomSettings, PlaybackSettings},
  icon: "settings",
  visibility: true,
  setup(){
    const {isPlayback} = useCurrentRoom()
    const {isHost} = useCurrentUser()
    const store = useStore();
    
    return {
      isPlayback,
      isHost,
      version: store.getters["application/getVersion"]
    }
  }
};
</script>

<style>
.tab-content{
  padding: 10px;
}
.tab-setting-container{
  text-align: left;
  border-bottom: 1px dashed #4d4d4d;
  display: flex;
  flex-direction: column;
  padding: 10px 0;
}

.link-doc{
  color: lightskyblue;
}
.link-doc:hover{
  color: lightskyblue;
}

</style>