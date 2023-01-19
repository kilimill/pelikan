import {
    watch,
    computed,
    reactive,
    ref
} from "vue";
import timingPlayers from "@/composables/playback/video/timingPlayers.js";
import {
    collection,
    isOld
} from "@/composables/playback/video/videoElement";
import usePlayback from "@/composables/playback/usePlayback";

import usePlaybackVideos from "@/composables/playback/usePlaybackVideos";
/**
 *
 * @param {ComputedRef<HTMLVideoElement>} element
 * @return {{play: Function, stop: Function, pause: Function}}
 */

const muteState = ref(false);
export default function (element) {
    let promiseList = {}
    let elementId = null
    const {
        timeline: generalTime
    } = usePlayback()
    const find = src => collection.find(i => i.src === src)
    const {
        currentVideo,
        currentScreen,
        conferenceUsersPlyer
    } = usePlaybackVideos(generalTime)
    const screenCapture = computed(() => currentScreen.value.hasContent ? true : false)
    const availableHiddenVideos = computed(() => conferenceUsersPlyer.value?.length ? true : false)
    const {
        timing
    } = timingPlayers()


    const countPlayers = () => {
        let amountAvailableElems = 1
        if (screenCapture.value) amountAvailableElems++;
        if (availableHiddenVideos.value) amountAvailableElems = amountAvailableElems + conferenceUsersPlyer.value.length
        // arr.forEach(item => {
        //     if (item.hasContent) amountAvailableElems++
        // })

        return amountAvailableElems
    }

    if (element) {
        watch(element, value => {
            elementId = value.src
        }, {
            immediate: true
        })
    }

    const play = () => {
        if (!element.value?.mistake) {
            promiseList[elementId] = element.value.play()
                .catch(e => console.error(e))
        }
    }

    const muteSettings = reactive({
        state: muteState,
        handler(wasOn) {
            let switchMuteState = false
            let arrVideos = [currentVideo.value]
            // if (availableHiddenVideos.value) {
            //     arrVideos.push(currentHiddenVideo.value)
            // }
            
            if(isOld && screenCapture.value) {
                arrVideos.push(currentScreen.value)
            }
            arrVideos.forEach(item => {
                let findedElem = find(item.link);
                findedElem.muted = wasOn ? muteState.value : !muteState.value
                switchMuteState = findedElem.muted
            })
            muteState.value = switchMuteState
        },
    })

    const pause = () => {
        if (promiseList[elementId]) {
            promiseList[elementId].then(() => element.value.pause())
        }
    }

    const stop = () => console.log('stop: ', elementId)

    const synchronizationLauncher = (delay) => {
        setTimeout(() => {
            if (screenCapture.value) {
                let screenElement = computed(() => find(currentScreen.value.link))
                // if (screenElement.value.muted !== muteState.value && isOld) {
                    // muteSettings.handler(true)
                // }

                timing(screenElement, countPlayers(), currentScreen.value.offset)
            }

            if (availableHiddenVideos.value) {
                conferenceUsersPlyer.value.forEach(item => {
                    let hiddenElement =  computed(() => find(item.link))
                    // if (hiddenElement.value.muted !== muteState.value) {
                    //     muteSettings.handler(true)
                    // }
                    timing(hiddenElement, countPlayers(), item.offset)
                })
            }
            let speakerElement = computed(() => find(currentVideo.value.link))

            // if (speakerElement.value.muted !== muteState.value) {
            //     muteSettings.handler(true)
            // }

            timing(speakerElement, countPlayers(), currentVideo.value.offset)
        }, delay)
    }

    const waiting = () => {
        synchronizationLauncher(100)
    };

    const seek = () => {
        synchronizationLauncher(1000)
    }

    return {
        play,
        pause,
        stop,
        seek,
        waiting,
        muteSettings
    }
}