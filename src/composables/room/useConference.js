import {useStore} from "vuex";
import {computed, ref } from "vue";
import useUsersRepository from "@/composables/users/useUsersRepository";
import useCurrentUser from "@/composables/users/useCurrentUser";

const checkedUsers = ref([])
const checkboxAllUsers = ref(false)
export default function useConference() {

    const store = useStore()
    const confActive = computed(() => store.getters['room/conference/active']);
    const confPending = computed(() => store.getters['room/conference/pending']);
    const connectedUsers =  computed(() => store.getters['room/conference/connectedUsers']);
    const conferenceUsers =  computed(() => store.getters['room/conference/users']);

    const activeOrPending = computed(() => confActive.value || confPending.value)

    if (checkedUsers.value.length == 0) {
        checkedUsers.value = conferenceUsers.value ?? [];
    }

    const {participantsList} = useUsersRepository()
    const {currentUser} = useCurrentUser()

    const toggleConf = () => {
        if (activeOrPending.value) {
            store.dispatch('room/conference/stop');
            checkedUsers.value = []
            checkboxAllUsers.value = false
        } else {
            store.dispatch('room/conference/start', checkedUsers.value);
        }
    }

    const toggleConfUser = (id) => {
        store.commit('room/conference/toggleConfUser', id);
    }

    const conferenceParticipationToggle = () =>
        participantConnected.value ? conferenceLeave() : conferenceJoin()
    const conferenceJoin = () => store.dispatch('room/conference/join');
    const conferenceLeave = () => store.dispatch('room/conference/leave');

    const checkAllUsers = (checked) => {
        checkedUsers.value = []
        if (checked) {
            participantsList.value.forEach(item => {
                checkedUsers.value.push(item.id)
            })
        }
    }

    const participantConnected = computed(
        () => connectedUsers.value?.indexOf(currentUser.value.id) !== -1
    )

    const participantCanConnect = computed(
        () => conferenceUsers.value?.indexOf(currentUser.value.id) !== -1
    )

    const userIsChecked = (id) => checkedUsers?.value.find(u => u.id === id) !== undefined;

    const toggleUser = (id, checked) => {
        if(activeOrPending.value){
            let method = checked ? 'add' : 'remove'
            store.dispatch(`room/conference/${method}`, id);
        }
    }

    return {
        userIsChecked,
        checkedUsers,
        disableConfButton: computed(() =>
            checkedUsers.value
            && checkedUsers.value.length === 0
            && !activeOrPending.value
        ),
        toggleConf,
        toggleConfUser,
        checkAllUsers,
        checkboxAllUsers,
        conferenceJoin,
        conferenceLeave,
        conferenceParticipationToggle,
        activeOrPending,
        confActive,
        connectedUsers,
        participantConnected,
        participantCanConnect,
        toggleUser
    }
}