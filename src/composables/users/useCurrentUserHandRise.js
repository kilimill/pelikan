import {useStore} from "vuex";
import {computed} from "vue";

export default function useCurrentUserHandRise() {

    const store = useStore()

    const toggleUserRaiseHand =  () => store.dispatch('user/raiseHand')

    const isUserRaiseHand = computed( () => Boolean(store.state.user.handRaised))

    const lowerHand = (id) => {
        store.dispatch('room/users/lowerHand', id)
    }

    const cantRaiseHand = computed(() => !store.getters["user/canRaiseHand"])
    const blockRoomRaiseHand = computed(() => store.state.room.settings.blockRaiseHand)

    return {
        isUserRaiseHand,
        toggleUserRaiseHand,
        cantRaiseHand,
        blockRoomRaiseHand,
        lowerHand
    }
}