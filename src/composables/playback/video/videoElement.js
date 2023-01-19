import {
    computed,
    ref,
    watch
} from "vue";
import videoElementControls from "@/composables/playback/video/videoElementControls";
let collection = [],
    isOld = null
const elements = (() => {
    const find = src => collection.find(i => i.src === src)
    const make = (src, videoType) => {
        const element = document.createElement('video')
        element.autoplay = false
        element.controls = false
        element.src = src

        if (videoType === "screenCapture" && !isOld) {
            element.muted = true
        }
        
        collection.push(element)
        return element
    }

    return function (src, videoType) {
        return find(src) || make(src, videoType)
    }
})()
const resetCollection = () => {
    collection = []
}
/**
 *
 * @param {Ref<String>} src,
 * @param {Ref<String>} timeline
 */
export default function (src, videoType, timeline, isOldRecord) {
    if (isOld == null) {
        isOld = isOldRecord.value
    }
    const currentElement = computed(() => elements(src.value, videoType.value))
    const controls = videoElementControls(currentElement)
    const currentTime = ref(0)
    const duration = ref(0)
    let playing = ref(false)
    const canPlay = ref(false)
    let waitHandler = () => canPlay.value = false,
        // playHandler = () => {
        //     if (playing.value) {
        //         controls.play()
        //     }
        //     canPlay.value = true
        // },
        timeHandler = () => {
            currentTime.value = currentElement.value.currentTime * 1000
        },
        loadHandler = () => {
            duration.value = currentElement.value.duration * 1000
        },
        errorHandler = event => {
            event.preventDefault()
            canPlay.value = false
            if (event.path[0].error.code == 4) {
                currentElement.value.mistake = true
            }
            console.error(event)
        }

    watch(currentElement, (newElement, oldElement) => {
        playing = ref(false)
        newElement.addEventListener('timeupdate', timeHandler)
        // newElement.addEventListener('canplaythrough', playHandler)
        newElement.addEventListener('waiting', waitHandler)
        newElement.addEventListener('loadeddata', loadHandler)
        newElement.addEventListener('error', errorHandler)
        newElement.currentTime = timeline.value / Math.pow(10, 6)

        canPlay.value = newElement.readyState > 2

        if (canPlay.value && playing.value) {
            canPlay.value = true
            controls.play()
        }

        if (oldElement === undefined) {
            return
        }

        try {
            oldElement.removeEventListener('timeupdate', timeHandler)
            // oldElement.removeEventListener('canplaythrough', playHandler)
            oldElement.removeEventListener('waiting', waitHandler)
            oldElement.removeEventListener('loadeddata', loadHandler)
            oldElement.removeEventListener('error', errorHandler)
            oldElement.pause()
        } catch (error) {
            console.error("VideoElement: oldElement exception", error)
        }

    }, {
        immediate: true
    })

    return {
        src,
        playing,
        canPlay,
        timeline,
        currentElement,
        currentTime,
        controls: {
            play: () => {
                playing.value = true
                controls.play()
            },
            pause: () => {
                if (playing.value) {
                    playing.value = false
                    controls.pause()
                }
            },
            seek: controls.seek,
            waiting: controls.waiting
        }
    }
}

export {
    collection,
    isOld,
    resetCollection
}