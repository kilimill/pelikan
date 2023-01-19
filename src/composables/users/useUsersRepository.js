import {
    SORT_ORDER_HAND,
    SORT_ORDER_NAME,
    SORT_ORDER_SEARCH
} from "@/store/modules/tabs/users";
import {
    useStore
} from "vuex";
import {
    watch,
    computed,
    ref
} from "vue";


export default function useUsersRepository() {
    const store = useStore()
    const searchUsers = ref('')

    const sortOrder = computed({
        get: () => store.state.tabs.users.sortOrder,
        set: vl => store.commit("tabs/users/sortOrder", vl)
    })
    
    watch(searchUsers, (e) => {
        if (e !== '') {
            if (sortOrder.value !== SORT_ORDER_SEARCH) {
                sortOrder.value = SORT_ORDER_SEARCH
            }
        } else {
            sortOrder.value = SORT_ORDER_NAME
        }
    })

    const userIsHost = (id) => store.getters["room/users/isHost"](id)
    const userIsCurrent = (id) => store.getters["room/users/isCurrent"](id)
    const userIsCalled = (id) => store.getters["room/users/isCalled"](id)

    const usersList = computed(() => store.getters["room/users/list"])

    const headerLiners = computed(() => [
        store.state.room.users.host,
        store.state.room.users.called,
        store.state.room.users.current,
    ].filter(i => Boolean(i)))

    const participantsList = computed(() => [
        ...store.state.room.users.participants,
        store.state.room.users.called,
        store.state.room.users.current
    ].filter(i => Boolean(i)))

    const unsortedList = computed(() => usersList.value.filter(i => !headerLiners.value.includes(i)))
    const nameSortedList = computed(() => {
        return unsortedList.value.map(i => i).sort((a, b) => a.alias.localeCompare(b.alias))
    })
    const handSortedList = computed(() => [
        ...nameSortedList.value.filter(i => i.handRaised)
        .sort((a, b) => a.handRaised > b.handRaised ? 1 : b.handRaised > a.handRaised ? -1 : 0),
        ...nameSortedList.value.filter(i => !i.handRaised)
    ])

    const searchSortedList = computed(() => [
        ...nameSortedList.value.filter(i => {
            if (searchUsers.value == '') return 

            return i.alias.toLowerCase().indexOf(searchUsers.value.toLowerCase()) !== -1
        })
    ])

    const participants = computed(() => ([
        ...headerLiners.value,
        ...{
            [SORT_ORDER_NAME]: nameSortedList.value,
            [SORT_ORDER_HAND]: handSortedList.value,
            [SORT_ORDER_SEARCH]: searchSortedList.value,
        } [sortOrder.value]
    ]))

    // const participantsOnly = computed(() => ([
    //     ...{
    //         [SORT_ORDER_NAME]: nameSortedList.value,
    //         [SORT_ORDER_HAND]: handSortedList.value,
    //         [SORT_ORDER_SEARCH]: searchSortedList.value,
    //     } [sortOrder.value]
    // ]))

    return {
        sortOrder,
        userIsHost,
        userIsCurrent,
        userIsCalled,
        searchUsers,
        participants,
        participantsList,
        raisedHandsCount: computed(() => participants.value.filter(i => i.handRaised).length),
        participantsCount: computed(() => participantsList.value.length),
        userIsHighlighted: (id) => store.getters["room/users/isHighlighted"](id),
        findUser: (id) => participants.value.find(i => i.id === id),
        getParticipants: () => computed(() => {
            return userIsHost ? participantsList.value : participants.value
        })
    }
}