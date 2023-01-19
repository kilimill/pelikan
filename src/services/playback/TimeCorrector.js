import InvalidTypeError from "@/services/playback/exception/InvalidTypeError";

export default class TimeCorrector {
    /** @type {Number} Первый ключ */
    #timeStart

    /** @type {Number[]} Время простоя для корректировки */
    #idleTimes

    /** @type {Boolean} Возвращает направление перемотки */
    #rewindForward

    constructor() {
        this.reset()
    }

    reset() {
        this.#idleTimes = []
    }

    saveFirst() {
        this.#idleTimes.splice(1)
    }

    get timeStart() {
        return this.#timeStart
    }

    get idleTimes() {
        return this.#idleTimes
    }

    set timeStart(value) {
        this.#timeStart = this.#timeStart || value
    }

    /**
     *
     * @param {number} value
     */
    set idleTime(value) {
        if (Number.isInteger(value)) {
            if (!this.#idleTimes.includes(value)) {
                this.#idleTimes.push(value)
            }
        } else throw new InvalidTypeError(`Invalid type ${typeof value}; Integer expected`)
    }

    /**
     *
     * @return {number}
     */
    get idleTime() {
         return Math.abs(this.#idleTimes.reduce((previousValue, currentValue) => {
            return previousValue - currentValue
        }, 0)) 
    }

    get rewindForward() {
        return this.#rewindForward
    }

    set rewindForward(value) {
        this.#rewindForward = value
    }

    /**
     * TODO: хз пока зачем
     * @return {number}
     */
    get correctTime() {
        if (this.#timeStart && this.#idleTimes.length) {
            return this.#timeStart + this.idleTime
        }

        return 0
    }
}