import api from "@/api/index";

export default {
    create(list) {
        return api.post('conference/create', {list})
    },
    destroy() {
        return api.post('conference/destroy')
    },
    join() {
        return api.post('conference/join')
    },
    leave() {
        return api.post('conference/leave')
    },
    add(userId) {
        return api.post('conference/add', {userId})
    },
    remove(userId) {
        return api.post('conference/remove', {userId})
    },
    dropConnection() {
        return api.post('conference/drop-connection')
    },
}