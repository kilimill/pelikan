import {onMounted, onUnmounted, ref, watch, computed} from "vue";
import {Tooltip} from "bootstrap";
import {useStore} from "vuex";
import useTimeoutSingleton from "@/composables/useTimeoutSingleton";

const defaultOptions = {
    trigger: 'hover',
    title() {
        return this.dataset?.bsTitle || this.getAttribute('title') || this.dataset?.bsOriginalTitle
    }
}

/**
 * @typedef {import("@vue/reactivity/dist/reactivity").ToRef} ToRef
 * @typedef {import("@vue/reactivity/dist/reactivity").Ref} Ref
 *
 * @param {Ref<*>} rootElement
 * @param {String} selector
 * @param {*} options
 * @return {{tooltips: Ref<Tooltip[]>}}
 */
export default function useBootstrapTooltip(
    rootElement,
    selector = "[data-bs-toggle]",
    options = {delay: { "show": 1000, "hide": 100 }}
) {
    /** @type {Ref<Tooltip[]>} */
    let tooltips = ref([])
    const settings = {...defaultOptions, ...options}
    const {setTimeout} = useTimeoutSingleton()
    const clickHandler = (element, tooltip) => setTimeout(() => {
        if (tooltip && tooltip.tip && element) {
            tooltip.tip.querySelector('.tooltip-inner').innerText = settings.title.call(element)
        }
    }, 100)

    const store = useStore();
    const currentRoom = computed(() => store.getters["room/currentRoom"])
    const enableTooltips = computed(() => currentRoom.value.isActive ? store.getters['user/settings/enableTooltips'] : store.getters['playback/settings/settingTooltips']);
    
    watch(enableTooltips, val => {
        tooltips.value.forEach(i => val ? i.enable() : i.disable())
    })

    watch(rootElement, () => {
        fillTooltips()
    })

    onMounted(() => {
        fillTooltips()
    })
    
    const fillTooltips = () => {
        tooltips = ref([])
        Array.from(rootElement.value?.querySelectorAll(selector) || []).forEach(element => {

            let tooltip = new Tooltip(element, settings)
            element.addEventListener('click', () => clickHandler(element, tooltip), {passive: true})
            
            if(!enableTooltips.value){
                tooltip.disable();
            }
            tooltips.value.push(tooltip)
        })

    }

    onUnmounted(() => tooltips.value.forEach(i => i.dispose()))

    return {tooltips}
}