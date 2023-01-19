<template>
  <div class="tab-setting">
    <div class="tab-setting-container" v-if="isHost">
      Чаты
      <div class="form-check">
        <input
          class="form-check-input"
          type="checkbox"
          v-model="playbackSettings.enablePublicChat"
          :id="`setting-playback-enable-chat-public`"
        />
        <label
          class="form-check-label"
          :for="`setting-playback-enable-chat-public`"
        >
          Общий чат
        </label>
      </div>
    </div>
    <div class="tab-setting-container">
      Общие настройки
      <div class="form-check">
        <input
          class="form-check-input"
          type="checkbox"
          v-model="playbackSettings.enableSwitchEvent"
          :id="`setting-playback-enable-switch-source`"
        />
        <label
          class="form-check-label"
          :for="`setting-playback-enable-switch-source`"
        >
          Переключать камеры
        </label>
      </div>

      <div class="form-check" v-if="isHost">
        <input
          class="form-check-input"
          type="checkbox"
          v-model="playbackSettings.enableAccess"
          :id="`setting-playback-enable-access`"
        />
        <label class="form-check-label" :for="`setting-playback-enable-access`">
          Закрыть доступ к архиву
        </label>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive } from "vue";
import usePlaybackSettings from "@/composables/playback/usePlaybackSettings";
// import store from '@/store';

export default {
  name: "PlaybackSettings",
  props: {
    isHost: Boolean
  },
  setup() {
    const {
      playbackAccessGeneral,
      playbackPermissionChatPublic,
      playbackPermissionChatPrivate,
      playbackPermissionSwitchSlide,
      playbackPermissionSwitchSource,
      playbackSettingTooltips,
      playbackSwitchSourceEvent,
      playbackSwitchPlaceEvent
    } = usePlaybackSettings();
    // const ranges = store.getters["playback/ranges/ranges"];
    // const filteredMountpoints = store.getters["playback/mountpoints/byExcludeType"](4);

    // console.error(filteredMountpoints);
    // const mpsId = filteredMountpoints.map(m => m.id);
    // console.error(mpsId);

    // const filteredRanges = ranges.filter(r => mpsId.indexOf(r.mountPointId) !== -1);
    //
    // const filenameByRangeId = store.getters["playback/files/filenameByRangeId"];

    return {
      playbackSettings: reactive({
        enableAccess: playbackAccessGeneral,
        enablePublicChat: playbackPermissionChatPublic,
        enablePrivateChat: playbackPermissionChatPrivate,
        enableSwitchSource: playbackPermissionSwitchSource,
        enableSwitchSlide: playbackPermissionSwitchSlide,
        enableTooltips: playbackSettingTooltips,
        enableSwitchEvent: playbackSwitchSourceEvent,
        enablekSwitchPlaceEvent: playbackSwitchPlaceEvent,
      }),
      // filteredRanges,
      // filenameByRangeId
    };
  },
};
</script>

<style scoped>
.tab-setting-container {
  text-align: left;
  border-bottom: 1px dashed #4d4d4d;
  display: flex;
  flex-direction: column;
  padding: 10px 0;
}
</style>