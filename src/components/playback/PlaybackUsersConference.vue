<template>
  <div class="user-list w-100 mt-2">
    <div class="scroll-custom">
      <div
        class="user-list__item w-100"
        v-for="player in conferenceUsersPlyer"
        :key="player.id"
        :id="'user' + player.id"
      >
        <playback-user-player
          :src="player.link"
          :current-time="player.offset"
          :fileId="player.id"
        ></playback-user-player>
      </div>
    </div>
  </div>
</template>

<script>
import usePlayback from "@/composables/playback/usePlayback";
import PlaybackUserPlayer from "@/components/playback/PlaybackUserPlayer";
import usePlaybackVideos from "@/composables/playback/usePlaybackVideos";

export default {
  components: { PlaybackUserPlayer },
  setup() {
    const { timeline } = usePlayback();
    const { conferenceUsersPlyer } = usePlaybackVideos(timeline);
    return {
      conferenceUsersPlyer,
    };
  },
};
</script>
