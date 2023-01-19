<template>
  <section class="tab-content" ref="content">
    <header v-if="!isPlayback && currentUserIsHost">
      <div class="btn-group btn-group_tabs" role="group">
        <input
          type="radio"
          class="btn-check"
          name="sort"
          id="sort-name"
          autocomplete="off"
          v-model="sortOrder"
          :value="sortOrders.SORT_ORDER_NAME"
        />
        <label
          class="btn btn-tab_button shadow-none"
          for="sort-name"
          data-bs-title="По алфавиту"
        >
          <span class="material-icons">arrow_upward</span>&nbsp;<span
            class="material-icons"
            >account_circle</span
          >
        </label>
        <input
          type="radio"
          class="btn-check"
          name="sort"
          id="sort-hand"
          autocomplete="off"
          v-model="sortOrder"
          :value="sortOrders.SORT_ORDER_HAND"
        />
        <label
          class="btn btn-tab_button shadow-none"
          for="sort-hand"
          data-bs-title="По поднятым рукам"
        >
          <span class="material-icons">arrow_upward</span>&nbsp;<span
            class="material-icons"
            >pan_tool</span
          >
        </label>
        <button
          class="btn btn-tab_button shadow-none"
          data-bs-title="Опустить руки"
          @click="lowerAllHandsInRoom()"
        >
          <span class="material-icons">close</span
          ><span class="material-icons">pan_tool</span>
        </button>
        <input
          type="checkbox"
          class="btn-check"
          id="disable-hands"
          autocomplete="off"
          v-model="blockRaiseHand"
        />
        <label
          class="btn btn-tab_button shadow-none"
          for="disable-hands"
          :data-bs-title="labelRaiseHandBlocking"
        >
          <span class="material-icons">block</span
          ><span class="material-icons">pan_tool</span>
        </label>
        <div class="tab-content__conference">
          <div class="user-controls">
            <input
              type="checkbox"
              class="d-none"
              id="vc-video-toggle"
              autocomplete="off"
              v-model="roomSettings.enableConferenceVideo"
            />
            <label
              class="btn btn-default me-3"
              for="vc-video-toggle"
              :data-bs-title="
                +roomSettings.enableConferenceVideo
                  ? 'Запретить камеру'
                  : 'Разрешить камеру'
              "
            >
              <span class="material-icons">{{
                roomSettings.enableConferenceVideo ? "videocam" : "videocam_off"
              }}</span>
            </label>
            <input
              type="checkbox"
              class="d-none"
              id="vc-audio-toggle"
              autocomplete="off"
              v-model="roomSettings.enableConferenceAudio"
            />
            <label
              class="btn btn-default"
              for="vc-audio-toggle"
              :data-bs-title="
                roomSettings.enableConferenceAudio
                  ? 'Запретить микрофон'
                  : 'Разрешить микрофон'
              "
            >
              <span class="material-icons">{{
                roomSettings.enableConferenceAudio ? "mic" : "mic_off"
              }}</span>
            </label>
          </div>
          <div>
            <span class="me-3">{{ checkedUsers.length }}/5</span>
            <button
              class="btn btn-default"
              :disabled="disableConfButton"
              :data-bs-title="activeOrPending ? 'Остановить' : 'Конференция'"
              @click="toggleConf"
            >
              {{ activeOrPending ? "Остановить" : "Конференция" }}
            </button>
          </div>
        </div>
      </div>
    </header>

    <div
      class="d-flex align-items-center mb-2"
      v-if="currentUserIsHost && participantsList.length && !isPlayback"
    >
      <!-- <input
        class="form-check-input"
        id="allUsers"
        type="checkbox"
        @change="checkAllUsers($event.target.checked)"
        v-model="checkboxAllUsers"
        hidden
      />
      <label class="btn user-controls__item" for="allUsers">
        <span class="material-icons">
          {{ checkboxAllUsers ? "group" : "group_off" }}
        </span>
      </label> -->
      <label class="tab-content__search">
        <input
          name="searchUser"
          autocomplete="off"
          placeholder="Поиск по имени..."
          v-model="searchUsers"
        />
      </label>
    </div>

    <LazyList
      id="accordionExample"
      :data="participants"
      :itemsPerRender="15"
      containerClasses="lazi-list scroll-custom"
      defaultLoadingColor="#222"
    >
      <template v-slot="{ item }">
        <participant :participant="item" :expand="currentUserIsHost" />
      </template>
    </LazyList>

    <footer>
      <span>Участников: {{ participantsCount }}</span>
      <span v-if="currentUserIsHost">Поднятых рук: {{ raisedHandsCount }}</span>
    </footer>
  </section>
</template>
<script>
import LazyList from "../../common/lazy-list/Lazy.vue";
import { useStore } from "vuex";
import { reactive, computed, ref } from "vue";
import participant from "@/components/tabs/users/Participant";
import { SORT_ORDER_HAND, SORT_ORDER_NAME } from "@/store/modules/tabs/users";
import useUsersRepository from "@/composables/users/useUsersRepository";
import useBootstrapTooltip from "@/composables/bootstrap/useBootstrapTooltip";
import useCurrentRoom from "@/composables/room/useCurrentRoom";
import useRoomSettings from "@/composables/room/useRoomSettings";
import useConference from "@/composables/room/useConference";
import useUserSettings from "@/composables/users/useUserSettings";
import useCurrentUser from "@/composables/users/useCurrentUser";

export default {
  name: "TabUsers",
  components: { participant, LazyList },
  icon: "account_circle",
  visibility: true,
  setup() {
    const store = useStore();
    const rootElement = ref();
    const {
      sortOrder,
      participants,
      participantsList,
      raisedHandsCount,
      participantsCount,
      searchUsers,
    } = useUsersRepository();

    const { isPlayback } = useCurrentRoom();

    useBootstrapTooltip(rootElement, "[data-bs-title]");

    const { roomEnableConferenceAudio, roomEnableConferenceVideo } = useRoomSettings();

    const { userEnableAudio, userEnableVideo } = useUserSettings(store.state.user.id);

    const {
      checkedUsers,
      disableConfButton,
      toggleConf,
      toggleConfUser,
      checkAllUsers,
      checkboxAllUsers,
      conferenceParticipationToggle,
      confActive,
      activeOrPending,
      participantConnected,
      participantCanConnect,
    } = useConference();

    const { currentUser } = useCurrentUser();

    return {
      currentUser,
      checkedUsers,
      disableConfButton,
      checkboxAllUsers,
      toggleConf,
      toggleConfUser,
      checkAllUsers,
      conferenceParticipationToggle,
      confActive,
      activeOrPending,
      participantConnected,
      participantCanConnect,
      isPlayback,
      sortOrder,
      participants,
      participantsList,
      raisedHandsCount,
      searchUsers,
      participantsCount,
      content: rootElement,
      currentUserIsHost: computed(() => store.getters["user/isHost"]),

      lowerAllHandsInRoom: () => store.dispatch("room/lowerAllHands"),

      roomSettings: reactive({
        enableConferenceAudio: roomEnableConferenceAudio,
        enableConferenceVideo: roomEnableConferenceVideo,
      }),

      userSettings: reactive({
        enableAudio: userEnableAudio,
        enableVideo: userEnableVideo,
      }),

      blockRaiseHand: computed({
        get: () => store.state.room.settings.blockRaiseHand,
        set: (vl) => store.dispatch("room/settings/setBlockRaiseHand", vl),
      }),
    };
  },
  data: () => ({
    sortOrders: { SORT_ORDER_HAND, SORT_ORDER_NAME },
  }),
  computed: {
    labelRaiseHandBlocking() {
      return this.blockRaiseHand
        ? "Разрешить поднимать руки"
        : "Запретить поднимать руки";
    },
  },
};
</script>

<style scoped lang="scss">
@import "src/assets/scss/external/tabs-user";
header,
footer {
  padding: 10px 0;
}

footer {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
</style>
