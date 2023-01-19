import {onBeforeUnmount, onMounted, ref} from "vue";
import {useStore} from "vuex";
import useCurrentRoom from '@/composables/room/useCurrentRoom';

export default function useFilesForm(requestMethod, formElement = ref()) {
    const store = useStore()
    const {isPlayback} = useCurrentRoom()
    const formLoading = ref(false)
    const fileInput = ref()

    const errorHandlers = []
    const handleError = message => errorHandlers.forEach(i => i(message))  
    
    const inputHandler = ({target: {files: fileList}}) => {
        if (fileList.length) {
            const formData = new FormData(formElement.value)
            formLoading.value = true
            requestMethod(formData).then(response => {
                if (response.data.success !== true) {
                    handleError(response.data.text)
                    formLoadingOff()
                }
                if(response.data.success === true && isPlayback.value){
                    store.dispatch('eventRoomMaterialUpdate', {data:{new: response.data.data.new}});
                }
                
                formElement.value.reset()
            }).catch(reason => handleError(reason.message))
        }
    }
    
    const formLoadingOff = () => {
        formLoading.value = false
    }

    

    onMounted(() => fileInput.value?.addEventListener('change', inputHandler))
    onBeforeUnmount(() => fileInput.value?.removeEventListener('change', inputHandler))

    return {
        formElement,
        formLoading,
        fileInput,
        formLoadingOff,
        setErrorHandler: handler => errorHandlers.push(handler),
    }
}