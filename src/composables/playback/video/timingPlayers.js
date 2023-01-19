import {
  useStore
} from "vuex";
import {
  computed,
  ref
} from "vue";
let promiseList = [],
  promiseAnswers = new Map(),
  counter = ref(1),
  actionsDraw = [],
  messageList = [],
  presList = []
export default function () {
  const store = useStore()

  const playing = computed({
    get: () => store.state.playback.playing,
    set: vl => store.commit("playback/playing", vl)
  })

  const seekWatcher = computed({
    get: () => store.getters["playback/seekWatcher"],
    set: vl => store.commit("playback/seekWatcher", vl)
  })

  const timing = (element, countPlayers, time) => {
    if (!element?.value || promiseAnswers.get(element.value) || playing.value === true) {
      return
    }

    counter.value = countPlayers

    let promise = {}
    promise = new Promise((res, rej) => {
      promiseAnswers.set(element.value, {
        resolve: res,
        reject: rej
      })
    })

    promiseList.push(promise)

    // console.log(promiseList.length)
    // console.log(element.value)
    // console.log(counter.value)
    
    element.value.addEventListener('canplay', canPlayHandler)
    if (element.value.mistake) {
      canPlayHandler()
    } else {
      element.value.addEventListener('error', canPlayHandler)
    }
    
    checkPromiseAmount(time)
    element.value.currentTime = time / Math.pow(10, 6)

    function canPlayHandler() {
      // console.log(element.value.src)
      promiseAnswers.get(element.value).resolve();
      element.value.removeEventListener('canplay', canPlayHandler)
      element.value.removeEventListener('error', canPlayHandler)
    }
  }

  const checkPromiseAmount = (time) => {
    if (promiseList.length == counter.value) {
      
      Promise.all(promiseList).then(() => {
        if (seekWatcher.value.playing === true && time !== 0) {
          setTimeout(() => playing.value = true)
        }

        seekWatcher.value = {
          seeked: false
        }
        
        promiseList = []
        promiseAnswers.clear()
        counter.value = 1
        
        if (presList.length !== 0) {
          store.commit('room/presentations/presentationSelect', presList[presList.length - 1])
          presList = []
        }
  
        if (actionsDraw.length !== 0) {
          actionsDraw.forEach(item => {
            store.commit(`room/presentations/draw/${item.event}`, item.data)
          })
          actionsDraw = []
        }
  
        if (messageList.length !== 0) {
          store.commit('tabs/chat/public/append', messageList)
          messageList = []
        }
      })
    }
  }

  const collectDrawActions = (data, specialEventList) => {
    if (specialEventList.undo === data.name) {
      if (actionsDraw.find(item => item.data?.id === data.message.drawActionId)) {
        actionsDraw.pop()
      } else {
        actionsDraw.push({
          event: 'undoAction',
          data: data.message
        })
      }
    } else if (specialEventList.delete === data.name) {
      actionsDraw = []
      actionsDraw.push({
        event: 'deleteActions',
        data: data.message
      })
    } else {
      actionsDraw.push({
        event: 'drawAction',
        data: data.message
      })
    }
  }

  const collectMessages = (data) => {
    messageList.push(data.message)
  }

  const collectPresentation = (data) => {
    presList.push(data.message)
  }

  const resetCollects = () => {
    actionsDraw = [],
    messageList = [],
    presList = []
  }

  return {
    timing,
    collectDrawActions,
    collectMessages,
    collectPresentation,
    resetCollects,
  }
}