import {useStore} from "vuex";
import {computed, reactive, ref} from "vue";
import useCurrentRoom from '@/composables/room/useCurrentRoom';
import miroBoardsApi from "@/api/miroBoards";

/**
 * @type {{enabled: boolean|undefined}}
 */
const filterDefaults = {
    enabled: undefined,
}

/**
 * @param {filterDefaults|{}} filter
 */
export default function useMiroBoards(filter = {}) {
    const store = useStore()
    const boardsFilter = reactive({...filterDefaults, ...filter})
    const boardsList = computed(() => store.state.room.boards.list)
    const {isPlayback} = useCurrentRoom()

    const filteredList = computed(() => boardsList.value.filter(i => {
        return boardsFilter.enabled === undefined || (i.enabled) === boardsFilter.enabled
    }))

    const hasFilteredResults = computed(() => Boolean(filteredList.value.length))
    const findBoard = id => boardsList.value.find(i => i.id === id)
    const deleteBoard = board => {
        if(isPlayback.value){
            return miroBoardsApi.playbackDelete(board.id)
            .then(() => store.dispatch('room/boards/unlink', board.id));
        }
         return store.dispatch("room/boards/delete", board.id)
    }
    const deleteItem = ref()

    const toggleVisibility = item => {
        if(isPlayback.value){
            return miroBoardsApi.playbackUpdate(item.id)
            .then(board => {
                store.commit("room/boards/update", board.data);
            });
        }
        return store.dispatch("room/boards/update", {id: item.id, status: item.statusId === 3 ? 2: 3});
    };

    const copyText = board => {
        navigator.clipboard.writeText(board.url).catch((e) => console.error(e))
    }

    return {
        boardsList,
        boardsFilter,
        filteredList,
        hasFilteredResults,
        deleteItem,
        deleteBoard,
        findBoard,
        toggleVisibility,
        copyText
    }
}