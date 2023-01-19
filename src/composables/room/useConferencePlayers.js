import {computed,ref} from "vue";
import useCurrentUser from "@/composables/users/useCurrentUser";

const players = ref([])

export default function useConferencePlayers() {

    const {currentUser} = useCurrentUser()

    const getPlayer = (uid) => {
        let player = players.value.find(p => p.userId === uid);
        if(player === undefined){
            player = document.createElement('video');
            player.autoplay = true;
            if(currentUser.value.id === uid){
                player.muted = true;
            }
            let data = {
                player: player,
                userId: uid,
                video: player.srcObject
            }
            players.value.push(data)
        }

        return player;
    }

    const destroyPlayer = (uid) => {
        let player = players.value.find(p => p.userId === uid);
        if(player !== undefined){
            players.value = players.value.filter(p => p.userId !== uid)
        }
    }

    const destroyAllPlayers = () => {
        players.value = []
    }

    const getPlayers = () => {
        return players.value
    }

    return {
        getPlayer,
        destroyPlayer,
        destroyAllPlayers,
        playersAll: computed(() => {
            let arr = [];
            for (const [key, value] of Object.entries(players.value)) {
                arr.push({
                    userId: key,
                    player: value
                });
            }
            return arr;
        }),
        players,
        getPlayers
    }
}