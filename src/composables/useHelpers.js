import {useStore} from 'vuex'
import {activityStop} from "@/store/modules/user/activity";
export default function useHelpers() {

  const store = useStore()

  const goToPlanner = () => {
    activityStop()
    location.href = `${store.getters["application/hostInfo"]}/room/leave?backLink=${store.getters["application/backLink"]}`;
  }

  return {
    goToPlanner
  }
}