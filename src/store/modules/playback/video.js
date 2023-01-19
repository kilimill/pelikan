export default {
    namespaced: true,
    state: () => ({

    }),

    getters: {
        list(state, getters, rootState, rootGetters) {
            let host = rootState.playback.config.storageInfo,
                link = `${host}/storage/file/{id}`;
            return rootGetters["playback/files/available"].map(file => {
                let range = rootGetters["playback/ranges/ranges"].find(i => i.id === file['mediaRangeId']),
                    point = rootGetters["playback/mountpoints/list"].find(i => i.id === range['mountpointId'])
                return {
                    name: file.listName,
                    type: point.type,
                    link: link.replace('{id}', file.id),
                    time: {start: range.timeStart * Math.pow(10, 6), end: range.timeEnd * Math.pow(10, 6)},
                    meta: {file: file.id, range: range.id, mountPoint: point.id},
                }
            })
        },
        // active(state, getters, rootState, rootGetters) {
        //     let mountPoint = rootGetters['playback/mountpoints/active']?.id,
        //         activeItem = mountPoint
        //             ? getters.list.find(i => i.meta.mountPoint === mountPoint)
        //             : getters.list.find(i => i.type === "host")

        //     return {...activeItem, offset: 0}
        // },
        active: (state, getters, rootState, rootGetters) => (time) => {
            let mountPoint = rootGetters['playback/mountpoints/active']?.id,
            activeItem = mountPoint
            ? getters.list.find(i => i.meta.mountPoint === mountPoint && i.time.start <= time && i.time.end >= time)
            : getters.list.find(i => i.type === "host")

            if(activeItem == undefined) {
                activeItem = getters.list.find(i => i.type === "host")
            }

            return {...activeItem, offset: 0}
        },
        available: (state, getters) => (type, time) => getters.list.filter(i => {
            return i.type === type && i.time.start <= time && i.time.end >= time
        }),
        availableHosts: (state, getters) => time => getters.available("host", time),
        availableCalls: (state, getters) => time => getters.available("called", time),
        availableScreens: (state, getters) => time => getters.available("screen", time),
    },
    mutations: {},
    actions: {
        /*initModule: {append
            root: true,
            handler: (context, payload) => {}
        }*/
        eventStreamWatch: {
            root: true,
            handler: (context, {data: {activeMountPointId}}) => {
                let enableSwitchEventPlace = JSON.parse(sessionStorage.getItem('enableSwitchEventPlace'))
                if (!enableSwitchEventPlace) return
                const payload = {settingName: 'room.activeMountPointId', settingValue: activeMountPointId}
                context.commit('room/settings/changeSetting', payload, {root: true})
            }
        }
    },
}