<template>
  <div
    class="room row"
    :class="{
      'whole-height': echoTestRequired,
      'static-left': activeOrPending || isActiveMiroBoard,
    }"
    @drop="onDrop"
    @dragenter.prevent
    @dragover.prevent
  >
    <preloader v-if="loading" />
    <echo-test v-else-if="echoTestRequired" />
    <template v-else>
      <media />
      <section class="a-side w-100 col bg-light text-dark">
        <!-- <div class="place-holder--large"> -->
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
          <room-users-conference v-if="activeOrPending" />
        </div>
        <div class="place-holder--large" id="room-place--large">
          <!-- <div id="inneerer"> -->
          <teleport :to="'#user' + largePlayerUserId" :disabled="!largePlayerUserId">
            <component
              v-if="showPlaces"
              :is="roomPlaces.large"
              data-placement="large"
              placement="large"
            />
          </teleport>
          <div class="controls-holder">
            <room-controls v-model:isHiddenMenu="isHiddenMenu" />
          </div>
        </div>
        <!-- </div> -->
        <!-- <event-controls /> -->
        <!-- </div> -->
        <!-- </div> -->
      </section>
      <section :class="{ 'b-side': true, hide: isHiddenMenu }">
        <!-- <div class="place-holder place-holder--small">
          <component
            v-if="showPlaces"
            :is="roomPlaces.small"
            data-placement="small"
            placement="small"
          />
        </div> -->
        <div class="tabs-holder"><tab-components /></div>
      </section>
      <sound-alert />
      <modal-windows />
    </template>
  </div>
</template>

<script>
import { computed, ref } from "vue";
import { useStore } from "vuex";
import RoomControls from "@/components/room/RoomControls";
import Media from "@/components/room/Media";
import RoomUsersConference from "@/components/common/RoomUsersConference";
import EventControls from "@/components/common/EventControls";
import SoundAlert from "@/components/room/SoundAlert";
import ModalWindows from "@/components/room/ModalWindows";
import TabComponents from "@/components/room/TabComponents";
import Preloader from "@/components/common/Preloader";
import useViewportMatcher from "@/composables/useViewportMatcher";
import useApplicationError from "@/composables/useApplicationError";
import useRoomInitialization from "@/composables/room/useRoomInitialization";
import useDraggableCamera from "@/composables/useDraggableCamera";
import useRoomPlaces, { components } from "@/composables/room/room-places/useRoomPlaces";
import useEchoTester from "@/composables/room/useEchoTester";
import EchoTest from "@/views/EchoTest";
import useConference from "@/composables/room/useConference";

export default {
  name: "Room",
  components: {
    EchoTest,
    Preloader,
    TabComponents,
    RoomControls,
    Media,
    SoundAlert,
    ModalWindows,
    RoomUsersConference,
    EventControls,
    ...components,
  },

  setup() {
    const store = useStore();
    const isActiveConference = computed(() => store.getters["room/conference/active"]);
    const {activeOrPending} = useConference()
    const { initRoom, loading } = useRoomInitialization();
    const applicationError = useApplicationError();
    const largePlayerUserId = computed(
      () => store.getters["room/settings/largePlayerUserId"]
    );
    const { matchViewport: showPlaces } = useViewportMatcher("(min-width: 992px)");
    const { echoTestRequired, require: requireEchoTest } = useEchoTester();
    const { roomPlaces } = useRoomPlaces();
    const isHiddenMenu = ref(false);
    initRoom().then(requireEchoTest).catch(applicationError.setError);

    const isActiveMiroBoard = computed(() => store.state.room.settings.boardIsActive);

    const placeHolder = ref();
    const { startDrag, onDrop } = useDraggableCamera(placeHolder);

    return {
      isActiveMiroBoard,
      largePlayerUserId,
      onDrop,
      startDrag,
      placeHolder,
      isHiddenMenu,
      loading,
      showPlaces,
      roomPlaces,
      echoTestRequired,
      isActiveConference,
      activeOrPending
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
