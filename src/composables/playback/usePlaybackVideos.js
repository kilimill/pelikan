import {
    useStore
} from "vuex";
import {
    computed,
    ref
} from "vue";

export default function usePlaybackVideos(timeline = ref(0)) {
    const store = useStore()

    const playlist = computed(() => store.getters["playback/video/list"])
    const mountpoints = computed(() => store.getters["playback/mountpoints/list"])
    const availableCalls = computed(() => store.getters["playback/video/availableCalls"](timeline.value))
    const availableHosts = computed(() => store.getters["playback/video/availableHosts"](timeline.value))
    const availableScreens = computed(() => store.getters["playback/video/availableScreens"](timeline.value))

    const availableVideo = computed(() => [...availableHosts.value, ...availableCalls.value])
    const active = computed(() => store.getters["playback/video/active"](timeline.value))


    const hiddenVideo = computed(() => {
        return availableVideo.value.filter(item => {
            if (item.type == 'called') {
                const mountpoint = mountpoints.value.find(mountpoint => mountpoint.id === item.meta.mountPoint)
                item.id = Number(mountpoint.name.split(' ')[1])
                return item.offset = calcOffset(item.time.start)
            }
        })
    })


    const offset = computed(() => calcOffset(active.value.time.start))
    const offsetHiddenVideo = computed(() => {
        return hiddenVideo.value.forEach(item => {
            item.offset = calcOffset(item.time.start)
        })
    })
    const offsetCurrentScreen = computed(() => calcOffset(availableScreens.value[0]?.time.start))

    const calcOffset = (elemTimeStart) => Math.max(timeline.value - (elemTimeStart ? elemTimeStart : 0), 0)

    return {
        playlist,
        timeline,
        availableCalls,
        availableHosts,
        availableScreens,
        availableVideo,
        currentHiddenVideo: computed(() => ({
            ...hiddenVideo.value[0],
            offset: offsetHiddenVideo.value,
            hasContent: hiddenVideo.value.length
        })),
        conferenceUsersPlyer: hiddenVideo,
        currentVideo: computed(() => ({
            ...active.value,
            offset: offset.value
        })),
        currentScreen: computed(() => ({
            ...availableScreens.value[0],
            offset: offsetCurrentScreen.value,
            hasContent: availableScreens.value.length
        })),
    }
}