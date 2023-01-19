import timeline from '@/store/modules/playback/timeline';
import files from '@/store/modules/playback/files';
import ranges from '@/store/modules/playback/ranges';
import mountpoints from '@/store/modules/playback/mountpoints';
import messages from '@/store/modules/playback/messages';
import settings from '@/store/modules/playback/settings';
import video from "@/store/modules/playback/video";

export default {
  ready: false,
  error: undefined,
  namespaced: true,
  modules: { timeline, files, ranges, mountpoints, messages, video, settings },
  state: () => ({
    config: {
      backLink: undefined,
      hostInfo: undefined,
      defaultSlideUrl: undefined,
      activeDuration: undefined,
      storageInfo: undefined
    },
    playing: false,
    seekWatcher: {
      playing: false,
      seeked: false
    },
    waiting: {
      video: false,
      events: false,
      screen: false,
    }
  }),
  getters: {
    settings(state){
      return state.settings;
    },
    storageInfo(state){
      return state.config.storageInfo;
    },
    loading(state){
      return !state.ready
    },
    duration(state) {
      return state.config.activeDuration * Math.pow(10, 6);
    },

    waiting: state => {
      return Object.values(state.waiting).reduce((a, i) => a || i, false)
    },

    seekWatcher: state => {
      return state.seekWatcher
    },

  },
  actions: {
    initModule: {
      root: true,
      handler: (content, {config}) => {
        content.commit("hydrate", config)
      }
    },
  },
  mutations: {
    loading: (state, payload) => {state.ready = !payload},
    error: (state, payload) => {state.error = payload},
    hydrate: (state, payload) => state.config = {...state.config, ...payload},
    waiting: (state, waiting) => state.waiting = {...state.waiting, ...waiting},
    playing: (state, playing) => state.playing = Boolean(playing),
    seekWatcher: (state, seekWatcher) => {
      state.seekWatcher = {...state.seekWatcher, ...seekWatcher}
    },
  },
};