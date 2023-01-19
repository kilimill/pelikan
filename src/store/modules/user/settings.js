import {assign} from 'lodash';
import {ROLE_ID_USER} from "@/store/modules/user/roles";

/** @type {import(vuex/types).Module} */

export default {
    namespaced: true,
    state: () => ({
        audioOn: undefined,
        blockPrivateChat: undefined,
        blockPublicChat: undefined,
        blockRaiseHand: undefined,
        hostScreenCapture: undefined,
        micGainValue: undefined,
        videoOn: undefined,
        enableTooltips: undefined,
        blockAudio: undefined,
        blockVideo: undefined,
    }),
    getters:{
        micValue(state){
            return state.micGainValue;
        },
        audioOn(state){
            return state.audioOn;
        },
        videoOn(state){
            return state.videoOn;
        },
        enableTooltips(state){
            return state.enableTooltips;
        },
    },
    actions: {
        initModule: {
            root: true,
            handler: ({commit}, {settings}) => {
                commit('hydrate', settings.user || {})
            },
        },
        eventUserSettingChange: {
            root: true,
            handler: ({commit, rootState}, {data}) => {
                if (rootState.application.currentUser.id === data.userId){
                    commit('changeSetting', data)

                    let name;
                    if (data.settingName === "user.blockAudio" && data.settingValue === true) {
                        name = "user.audioOn";
                    }
                    if (data.settingName === "user.blockVideo" && data.settingValue === true) {
                        name = "user.videoOn";
                    }

                    if (name === undefined) {
                        return
                    }
                    return commit('changeSetting', {
                        settingName: name,
                        settingValue: false
                    })
                }
            }
        },
        eventRoomSettingChange: {
            root: true,
            handler: ({commit, rootState}, {data}) => {
                if (rootState.application.currentUser.roleId !== ROLE_ID_USER) {
                    return
                }

                let name;
                if (data.settingName === "room.conferenceAudio" && data.settingValue === false) {
                    name = "user.audioOn";
                }
                if (data.settingName === "room.conferenceVideo" && data.settingValue === false) {
                    name = "user.videoOn";
                }

                if (name === undefined) {
                    return
                }
                return commit('changeSetting', {
                    settingName: name,
                    settingValue: false
                })
            }
        },
    },
    mutations: {
        hydrate(state, payload) {
            assign(state, payload)
        },
        changeSetting(state, {settingName, settingValue}) {
            state[settingName.replace(/^user\./, '')] = settingValue
        },
    }
}