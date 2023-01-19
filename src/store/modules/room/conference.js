import confApi from "@/api/conference";

export default {
    namespaced: true,
    state: () => ({
        active: undefined,
    }),
    mutations: {
        hydrate(state, payload) {
            state.active = payload;
        },
        start(state, payload) {
            state.active = payload;
        },
        stop(state) {
            state.active = undefined;
        },
        join(state, payload) {
            let userConnection = state.active?.connections?.find(c => c.cuId === payload.cuId);
            if (userConnection) {
                state.active.connections = state.active.connections.filter(c => c.cuId !== userConnection.cuId);
            }
            if (!state.active.connections) {
                state.active.connections = [];
            }
            state.active.connections.push(payload);
        },
        leave(state, payload) {
            let cuId = state.active?.users?.find(u => u.id === payload.cuId).id;
            state.active.connections =
                state.active.connections.filter(c => c.cuId !== cuId);
        },
        add(state, payload) {
            state.active.users.push(payload.cu);
            if(!state.active.mountpoints.find(mp => mp.mountpointId === payload.mp.mountpointId)){
                state.active.mountpoints.push(payload.mp)
            }
        },
        remove(state, payload) {
            let cuId = state.active?.users?.find(u => u.userId === payload.userId).id;
            state.active.connections =
                state.active.connections.filter(c => c.cuId !== cuId);
            state.active.users = state.active.users.filter(u => u.userId !== payload.userId);
        },
        toggleConfUser(state, id) {
            if (state.checkedUsers.indexOf(id) !== -1) {
                state.checkedUsers = state.checkedUsers.filter(e => e !== id) ?? [];
            } else {
                state.checkedUsers.push(id);
            }
        },
        clearCheckedUsers(state) {
            state.checkedUsers = [];
        },
        checkUser(state, id) {
            state.checkedUsers.push(id);
        }
    },
    getters: {
        checkedUsers(state) {
            return state.checkedUsers;
        },
        active(state) {
            return state.active !== undefined
                && state.active.timeStart !== null
        },
        pending(state) {
            return state.active !== undefined
                && state.active.timeStart === null
        },
        users(state) {
            return state.active?.users?.map(i => i.userId) ?? [];
        },
        getUser:state => (id) => {
            return state.active?.users?.find(i => i.userId === id);
        },
        connectedUsers(state) {
            let cuIds = state.active?.connections?.map(c => c.cuId);
            return state.active?.users?.filter(u => cuIds.indexOf(u.id) !== -1).map(u => u.userId) ?? [];
        },
        mountpointByUser: state => (userId) => {
            return state.active?.mountpoints?.find(mp => mp.userId === userId).mountpointId;
        },
        conferenceUser: state => (cuId) => {
            return state.active?.users?.find(cu => cu.id === cuId)
        },
        conferenceConnection: state => (id) => {
            return state.active?.connections?.find(cu => cu.cuId === id)
        }
    },
    actions: {
        initModule: {
            root: true,
            handler: (content, {conference}) => content.commit("hydrate", conference)
        },
        eventConferenceStart: {
            root: true,
            handler: ({commit}, {data}) => {
                return commit('start', data);
            },
        },
        eventConferenceStop: {
            root: true,
            handler: ({commit}) => {
                return commit('stop');
            },
        },
        eventConferenceJoin: {
            root: true,
            handler: ({commit}, {data}) => {
                return commit('join', data);
            },
        },
        eventConferenceLeave: {
            root: true,
            handler: ({commit}, {data}) => {
                return commit('leave', data);
            },
        },
        eventConferenceAdd: {
            root: true,
            handler: ({commit}, {data}) => {
                return commit('add', data);
            },
        },
        eventConferenceRemove: {
            root: true,
            handler: ({commit}, {data}) => {
                return commit('remove', data);
            },
        },
        eventConferenceDropConnection: {
            root: true,
            handler: ({commit}, {data}) => {
                return commit('leave', data);
            },
        },
        start: (context, list) => confApi.create(list),
        stop: () => confApi.destroy(),
        join: () => confApi.join(),
        leave: () => confApi.leave(),
        add: (context, id) => confApi.add(id),
        remove: (context, id) => confApi.remove(id),
    }
}