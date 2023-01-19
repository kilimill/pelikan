import Middleware from "@/services/playback/middleware/Middleware";

export default class SkipMiddleware extends Middleware {
    skipList = [
        'room.leaveByDaemon',
        'event.pause',
        'event.resume',
        "room.board.create",
        "room.board.update",
        "room.board.delete",
        "room.board.enable",
        "room.board.disable",
        "room.presentation.toggle",
        "room.presentation.update",
        "room.presentation.delete",
        "room.presentation.activate",
        "room.presentation.deactivate",
        "room.presentation.convertSuccess",
        "room.presentation.convertError",
        "room.material.update",
        "room.material.delete",
        "room.material.toggle",
    ]
    dispatch(message) {
        if (this.skipList.includes(message.data.name)) {
            return Promise.resolve(undefined)
        }

        return this.next(message)
    }
}