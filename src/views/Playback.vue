<template>
  <preloader v-if="loading" />
  <div
    class="playback row"
    :class="{
      'static-left': isActiveConference || isActiveMiroBoard,
    }"
    @drop="onDrop"
    @dragenter.prevent
    @dragover.prevent
    v-else
  >
    <section class="a-side w-100 col bg-light text-dark">
      <!-- <div class=""> -->
      <!-- <div class="d-flex h-100"> -->
      <div class="place-holder__panel">
        <div
          class="place-holder place-holder--small"
          ref="placeHolder"
          draggable="true"
          @dragstart="startDrag"
        >
          <component
            v-if="showPlaces"
            :is="roomPlaces.small"
            data-placement="small"
            placement="small"
          />
        </div>
        <PlaybackUsersConference v-if="isActiveConference" />
      </div>
      <div class="place-holder--large" id="place-holder--large">
        <!-- <div id="inneerer" class="h-100"> -->
        <teleport :to="'#user' + largePlayerUserId" :disabled="!largePlayerUserId">
          <component
            v-if="showPlaces"
            :is="roomPlaces.large"
            data-placement="large"
            placement="large"
          />
        </teleport>
        <!-- </div> -->

        <div class="controls-holder">
          <playback-controls v-model:isHiddenMenu="isHiddenMenu" />
        </div>
      </div>
      <!-- <event-controls /> -->
      <!-- </div> -->
      <!-- </div> -->
    </section>
    <section :class="{ 'b-side': true, hide: isHiddenMenu }">
      <div class="tabs-holder"><tab-components /></div>
    </section>
  </div>
</template>

<script>
import { computed, ref } from "vue";
import { useStore } from "vuex";
import Preloader from "@/components/common/Preloader";
import useRoomPlaces, { components } from "@/composables/room/room-places/useRoomPlaces";
import PlaybackUsersConference from "@/components/playback/PlaybackUsersConference";
import useApplicationError from "@/composables/useApplicationError";
import usePlaybackInitialization from "@/composables/playback/usePlaybackInitialization";
import useViewportMatcher from "@/composables/useViewportMatcher";
import useDraggableCamera from "@/composables/useDraggableCamera";
import PlaybackControls from "@/components/playback/PlaybackControls";
import TabComponents from "@/components/room/TabComponents";

export default {
  name: "Playback",
  components: {
    TabComponents,
    PlaybackControls,
    Preloader,
    PlaybackUsersConference,
    ...components,
  },
  setup() {
    const store = useStore();
    const { initPlayback, loading } = usePlaybackInitialization();
    const applicationError = useApplicationError();
    const { matchViewport: showPlaces } = useViewportMatcher("(min-width: 992px)");
    const { roomPlaces } = useRoomPlaces();

    initPlayback().catch(applicationError.setError);

    const largePlayerUserId = computed(
      () => store.getters["room/settings/largePlayerUserId"]
    );

    const isActiveConference = computed(() => store.getters["room/conference/active"]);
    const isActiveMiroBoard = computed(() => store.getters["room/boards/active"]);

    const isHiddenMenu = ref(false);

    const placeHolder = ref();
    const { startDrag, onDrop } = useDraggableCamera(placeHolder);

    return {
      isActiveMiroBoard,
      isActiveConference,
      largePlayerUserId,
      onDrop,
      startDrag,
      placeHolder,
      isHiddenMenu,
      loading,
      showPlaces,
      roomPlaces,
    };
  },
};
</script>

<style scoped lang="scss">
// @import "../assets/scss/theme";
.controls-holder {
  order: 1;
}
// .inneerer {
//   width: 100%;
//   height: calc(100% - 50px);
// }
// .inneerer div {
//   // display: flex;
//   // flex-direction: column;
//   width: 100%;
//   height: 100%;
// }
//
</style>
