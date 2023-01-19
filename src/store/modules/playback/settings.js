import playbackApi from '@/api/playback';
import { assign } from 'lodash';

export default {
  namespaced: true,
  state: () => ({
    accessGeneral: undefined,
    permissionChatPrivate: undefined,
    permissionChatPublic: undefined,
    permissionSwitchSlide: undefined,
    permissionSwitchSource: undefined,
    settingTooltips: undefined,
  }),
  getters: {
    settings: state => name => {
      return state[name];
    },
    accessGeneral(state){
      return state.accessGeneral;
    },
    permissionChatPublic(state){
      return state.permissionChatPublic;
    },
    permissionChatPrivate(state){
      return state.permissionChatPrivate;
    },
    permissionSwitchSlide(state){
      return state.permissionSwitchSlide;
    },
    permissionSwitchSource(state){
      return state.permissionSwitchSource;
    },
    settingTooltips(state){
      return state.settingTooltips;
    }
  },
  actions:{
    initModule: {
      root: true,
      handler: ({commit}, {settings}) => {
        commit('hydrate', settings?.playback || {})
      },
    },
    changeSetting(context, {settingName, settingValue}) {
      return playbackApi.changeSetting(settingName, settingValue, context.rootState.room.id)
    },
    eventPlaybackSettingChange: {
      root: true,
      handler({commit}, {data}){
        commit('changeSetting', data)
      }
    },
  },
  mutations: {
    hydrate(state, payload) {
      assign(state, payload)
    },
    changeSetting(state, {settingName, settingValue}) {
      state[settingName.replace(/^[^.]+\./, '')] = settingValue
    }
  }
}