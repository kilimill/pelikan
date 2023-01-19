import roomApi from "@/api/room";
import config from "@/api/application/config";
import {
    assign
} from 'lodash';

const enableSwitchEventPlaceList = {
    "room.currentVPDF": "switchEventPlace",
}
/** @type {import(vuex/types).Module} */
export default {
    namespaced: true,
    state: () => ({
        activeBoardId: undefined,
        activeMountPointId: undefined,
        blockPrivateChat: undefined,
        blockPublicChat: undefined,
        blockRaiseHand: undefined,
        boardIsActive: undefined,
        currentPresId: undefined,
        currentSlide: undefined,
        currentVPDF: undefined,
        drawMode: undefined,
        presStrictMode: undefined,
        screenCaptureActive: undefined,
        soundPrivateChatMessage: undefined,
        soundPublicChatMessage: undefined,
        soundRaiseHand: undefined,
        userCallControl: undefined,
        userCallDrawMode: undefined,
        videoStrictMode: undefined,
        typeIpAudioOn: undefined,
        conferenceAudio: undefined,
        conferenceVideo: undefined,
        largePlayerUserId: undefined,
    }),
    getters: {
        settings: state => name => {
            return state[name];
        },
        currentPresentationId(state) {
            return state.currentPresId;
        },
        boardIsActive(state) {
            return state.boardIsActive;
        },
        currentPresentationSlideIndex(state) {
            return state.currentSlide;
        },
        presentationStrictMode(state) {
            return state.presStrictMode;
        },
        activeMountPointId(state) {
            return state.activeMountPointId;
        },
        screenCaptureActive(state) {
            return state.screenCaptureActive;
        },
        typeIpAudioOn(state) {
            return state.typeIpAudioOn;
        },
        conferenceAudio(state){
            return state.conferenceAudio
        },
        conferenceVideo(state){
            return state.conferenceVideo
        },
        largePlayerUserId(state){
            return state.largePlayerUserId
        },
        switchEventPlace() {
            if (sessionStorage.getItem('enableSwitchEventPlace')) {
                let enableSwitchEventPlace = JSON.parse(sessionStorage.getItem('enableSwitchEventPlace'))
                return !enableSwitchEventPlace;
            }

            return false
        }
    },
    actions: {
        initModule: {
            root: true,
            handler: ({
                commit
            }, {
                settings
            }) => {
                commit('hydrate', settings?.room || {})
            },
        },
        resetModule: {
            root: true,
            handler: ({
                commit
            }) => {
                commit('hydrate', config.defaultRoomSettings())
            },
        },
        changeSetting(context, {
            settingName,
            settingValue
        }) {
            return roomApi.changeSetting(settingName, settingValue, context.rootState.room.id)
        },
        eventRoomSettingChange: {
            root: true,
            handler(context, {
                data
            }) {
                if (enableSwitchEventPlaceList[data.settingName] && context.getters[enableSwitchEventPlaceList[data.settingName]]) return
                context.commit('changeSetting', data)
            }
        },

        eventRoomDropUserCall: {
            root: true,
            handler({
                commit
            }, {
                data
            }) {
                commit('changeSetting', {
                    settingName: 'room.activeMountPointId',
                    settingValue: data.activeMountPointId,
                })
            }
        },

        eventStreamWatch: {
            root: true,
            handler(context, {
                data
            }) {
                if (context.getters.switchEventPlace) return
                context.commit('changeSetting', {
                    settingName: 'room.activeMountPointId',
                    settingValue: data.activeMountPointId,
                })
            }
        },
        eventRoomScreenCaptureToggle: {
            root: true,
            handler(
                context, {
                data
            }) {
                if (context.getters.boardIsActive) {
                    context.commit('changeSetting', {
                        settingName: 'room.boardIsActive',
                        settingValue: false,
                    })
                }
                context.commit('changeSetting', {
                    settingName: 'room.screenCaptureActive',
                    settingValue: data.active,
                })
            }
        },
        eventRoomBoardSelect: {
            root: false,
            handler: context => context.commit("changeSetting", {
                settingName: "room.boardIsActive",
                settingValue: true,
            })
        },
        eventRoomBoardDelete: {
            root: false,
            handler: context => {
                context.commit("changeSetting", {
                    settingName: "room.boardIsActive",
                    settingValue: false,
                })
                context.commit("changeSetting", {
                    settingName: "room.activeBoardId",
                    settingValue: undefined,
                })
            }
        },
        eventRoomPresentationSelect: {
            root: true,
            handler: context => context.commit("changeSetting", {
                settingName: "room.boardIsActive",
                settingValue: false,
            })
        },

        setBlockPublicChat(context, payload) {
            return roomApi.setRoom(context.rootState.room.id).changeBlockPublicChat(payload)
        },

        setBlockRaiseHand(context, payload) {
            return roomApi.setRoom(context.rootState.room.id).changeBlockRaiseHand(payload)
        },

        setVideoStrictMode(context, payload) {
            return roomApi.setRoom(context.rootState.room.id).changeVideoStrictMode(payload)
        }
    },
    mutations: {
        hydrate(state, payload) {
            assign(state, payload)
        },
        changeSetting(state, {
            settingName,
            settingValue
        }) {
            state[settingName.replace(/^[^.]+\./, '')] = settingValue
        }
    }
}
