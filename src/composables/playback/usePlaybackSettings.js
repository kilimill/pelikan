import {
  useStore
} from "vuex";
import {
  computed
} from "vue";

const settingsNames = {
  PLAYBACK_ACCESS_GENERAL: 'playback.accessGeneral',
  PLAYBACK_PERMISSION_CHAT_PUBLIC: 'playback.permissionChatPublic',
  PLAYBACK_PERMISSION_CHAT_PRIVATE: 'playback.permissionChatPrivate',
  PLAYBACK_PERMISSION_SWITCH_SOURCE: 'playback.permissionSwitchSource',
  PLAYBACK_PERMISSION_SWITCH_SLIDE: 'playback.permissionSwitchSlide',
  PLAYBACK_SETTING_TOOLTIPS: 'playback.settingTooltips',
}

export default function usePlaybackSettings() {

  const store = useStore();
  const settings = store.getters["playback/settings"]

  const playbackSettings = computed(() => ({
    accessGeneral: !settings.accessGeneral,

    permissionChatPublic: settings.permissionChatPublic,
    permissionChatPrivate: settings.permissionChatPrivate,
    permissionSwitchSlide: settings.permissionSwitchSlide,
    permissionSwitchSource: settings.permissionSwitchSource,

    settingTooltips: settings.settingTooltips,
  }))

  const changeSetting = (settingName, settingValue) =>
    store.dispatch('playback/settings/changeSetting', {
      settingName,
      settingValue
    })

  return {
    changeSetting,
    settingsNames,
    playbackSettings,
    playbackAccessGeneral: computed({
      get: () => playbackSettings.value.accessGeneral,
      set: vl => changeSetting(settingsNames.PLAYBACK_ACCESS_GENERAL, !vl)
    }),
    playbackPermissionChatPublic: computed({
      get: () => playbackSettings.value.permissionChatPublic,
      set: vl => changeSetting(settingsNames.PLAYBACK_PERMISSION_CHAT_PUBLIC, vl)
    }),
    playbackPermissionChatPrivate: computed({
      get: () => playbackSettings.value.permissionChatPrivate,
      set: vl => changeSetting(settingsNames.PLAYBACK_PERMISSION_CHAT_PRIVATE, vl)
    }),
    playbackPermissionSwitchSlide: computed({
      get: () => playbackSettings.value.permissionSwitchSlide,
      set: vl => changeSetting(settingsNames.PLAYBACK_PERMISSION_SWITCH_SLIDE, vl)
    }),
    playbackPermissionSwitchSource: computed({
      get: () => playbackSettings.value.permissionSwitchSource,
      set: vl => changeSetting(settingsNames.PLAYBACK_PERMISSION_SWITCH_SOURCE, vl)
    }),
    playbackSettingTooltips: computed({
      get: () => playbackSettings.value.settingTooltips,
      set: vl => changeSetting(settingsNames.PLAYBACK_SETTING_TOOLTIPS, vl)
    }),
    playbackSwitchSourceEvent: computed({
      get: () => sessionStorage.getItem('enableSwitchEventPlace'),
      set: vl => {
        sessionStorage.setItem('enableSwitchEventPlace', vl)
      }
    }),
    // playbackSwitchPlaceEvent: computed({
    //   get: () => JSON.parse(sessionStorage.getItem('enableSwitchEventPlace')).switchEventPlace,
    //   set: vl => {
    //     let obj = JSON.parse(sessionStorage.getItem('enableSwitchEventPlace'))
    //     obj.switchEventPlace = vl
    //     sessionStorage.setItem('enableSwitchEventPlace', JSON.stringify(obj))
    //   }
    // }),
  }
}