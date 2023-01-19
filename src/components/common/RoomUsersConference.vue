<template>
  <div class="user-list w-100 mt-2">
    <div class="scroll-custom">
      <div
        class="user-list__item w-100"
        v-for="player in players"
        :key="player.userId"
        :id="'user' + player.userId"
      >
        <room-user-player
          :userId="Number(player.userId)"
          :player="player.player"
        ></room-user-player>
      </div>
    </div>
  </div>
</template>

<script>
import useConferencePlayers from "@/composables/room/useConferencePlayers";
import RoomUserPlayer from "@/components/common/RoomUserPlayer";

export default {
  components: { RoomUserPlayer },
  setup() {
    const { players, playersAll, getPlayers } = useConferencePlayers();

    return {
      players,
      playersAll,
      getPlayers,
    };
  },
};
</script>
