export const SORT_ORDER_NAME = "name"
export const SORT_ORDER_HAND = "hand"
export const SORT_ORDER_SEARCH = "search"
const AVAILABLE_SORT_ORDERS = [SORT_ORDER_HAND, SORT_ORDER_NAME, SORT_ORDER_SEARCH]

export default {
    namespaced: true,
    state: () => ({
        sortOrder: SORT_ORDER_NAME,
        canCallUser: true,
        canDropCall: true
    }),
    getters: {
        canCallUser(state){
            return state.canCallUser;
        },
        canDropCall(state){
            return state.canDropCall;
        },
    },
    mutations: {
        sortOrder(state, order) {
            state.sortOrder = AVAILABLE_SORT_ORDERS.includes(order) ? order : state.sortOrder
        },
        canCallUser(state, value){
            state.canCallUser = value;
        },
        canDropCall(state, value){
            state.canDropCall = value;
        }
    },
    actions: {
        eventRoomDropUserCall: {
            root: true,
            handler: ({commit}) => {
                commit('canCallUser', true)
                commit('canDropCall', true)
            },
        },
    }
}
