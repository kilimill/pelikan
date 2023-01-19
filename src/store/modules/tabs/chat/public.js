import chatApi from "@/api/chat";

export const
    SORT_TIME = "time",
    SORT_USER = "user"
export const
    AVAILABLE_MESSAGES_SORT = [SORT_TIME, SORT_USER],
    DEFAULT_MESSAGES_ORDER = SORT_TIME


/** @type {import('vuex/types').Module} */
const module = {
    namespaced: true,

    state: () => ({
        sortOrder: DEFAULT_MESSAGES_ORDER,
        messages: [],
    }),

    getters: {
        timeOrderedList: (state) => {
            return state.messages.map(i => i).sort((a, b) => a.eventId - b.eventId)
        },
        userOrderedList: (state) => {
            return state.messages.map(i => i).sort((a, b) => a.userId - b.userId)
        },
        orderedMessageList: (state, getters) => {
            return ({
                [SORT_USER]: getters.userOrderedList,
                [SORT_TIME]: getters.timeOrderedList,
            })[state.sortOrder]
        },

        isBlocked: (state, getters, rootState) => {
            return rootState.room.settings.blockPublicChat || rootState.user.settings.blockPublicChat
        }
    },

    actions: {
        resetModule: {
            root: true,
            handler: ({commit}) => {
                commit('hydrate', [])
            },
        },
        sendMessage(context, payload) {
            let from = context.rootState.application.currentUser.id,
                message = payload
            return chatApi.sendPublicMessage({from, message})
        },

        deleteMessage(context, payload) {
            return chatApi.deletePublicMessage(payload)
        },

        eventRoomMessagePublic: {
            root: true,
            handler({commit}, {data}) {
                commit('pushMessage', data)
                commit('tabs/highlightComponent', {name: 'TabChat', highlight: true}, {root: true})
            }
        },

        eventRoomMessagePublicDelete: {
            root: true,
            handler({commit}, {data}) {
                commit('deleteMessage', data)
            }
        }
    },

    mutations: {
        pushMessage(state, payload) {
            state.messages.push(payload)
        },
        deleteMessage(state, payload) {
            let msg = state.messages.find(m => m.eventId === payload.eventId);
            if(msg){
                msg.deleted = 1
                msg.deletedByRoleId = payload.deletedByRoleId
            }
        },
        setNewPublicMessageExists(state, payload) {
            state.newPublicMessageExists = payload
        },
        hydrate(state, payload) {
            state.messages = [...Object.values(payload || {})]
        },
        append(state, payload) {
            state.messages = Object.values(payload).length !== 0 ? state.messages.concat(payload) : []
        },

        /**
         * @param state
         * @param {String|undefined} [order]
         */
        sortOrder(state, order) {
            if (!AVAILABLE_MESSAGES_SORT.includes(order)) {
                order = DEFAULT_MESSAGES_ORDER
            }
            state.sortOrder = order
        }
    },
}

export default module