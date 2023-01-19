import Rewinder, {EVENT_READY} from "@/services/playback/rewinder/Rewinder";
import timingPlayers from "@/composables/playback/video/timingPlayers.js";
const specialEventList = {
    undo: 'room.presentation.canvas.action.undo',
    action: 'room.presentation.canvas.action.draw',
    delete: 'room.presentation.canvas.action.delete'
}
const {
    collectMessages,
    collectDrawActions,
    collectPresentation,
    resetCollects
} = timingPlayers()

let beginningTimestamp = 0;

export default class SeekRewinder extends Rewinder {

    #timetampSeek;

    checkOptions(options) {
        return "seek" in options
    }

    handleRequest(receiver) {
        this.#timetampSeek = this.options.seek + this.manager.idleTime.correctTime
        return new Promise((resolve, reject) => this.process(receiver, resolve, reject))
    }

    /**
     *
     * @param {Function} receiver
     * @param {Function} resolve
     * @param {Function} reject
     */
    process(receiver, resolve, reject) {
        let request,
        message = undefined
        if (this.manager.idleTime.rewindForward) {
            request = this.manager.cursor(IDBKeyRange.lowerBound(this.manager.timestamp));
        } else {
            request = this.manager.cursor(IDBKeyRange.lowerBound(beginningTimestamp));
        }

        request.addEventListener('success', () => {
            let cursor = request.result
            message  = cursor?.value
            if (cursor && message) {
                if (message.time_created <= this.#timetampSeek) {
                    if(Object.values(specialEventList).includes(message.data.name)) {
                        collectDrawActions(message.data, specialEventList)
                            
                        cursor.continue()
                        return Promise.resolve(undefined)
                    }

                    if (message.data.name === 'room.messagePublic') {
                        collectMessages(message.data)

                        cursor.continue()
                        return Promise.resolve(undefined)
                    }

                    if (message.data.name === 'room.presentation.select') {
                        collectPresentation(message.data)

                        cursor.continue()
                        return Promise.resolve(undefined)
                    }

                    if (message.data.name === 'event.finish') {
                        resetCollects();
                    }

                    receiver(message)
                    cursor.continue()
                } else resolve(message.time_created)
            } else {
                resolve(this.manager.timestamp)
                this.manager.dispatchEvent(EVENT_READY)
            }
        })
        request.addEventListener('error', event => reject(event))
    }
}