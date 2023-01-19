<template>
  <div class="files">
    <section class="files--list">
      <div class="list-item" v-for="file of files" :key="file.id">
        <div class="item-actions">
          <button v-if="actionsEnabled" name="visibility" type="button" class="btn action-button"
                  :class="{visible: file.active && !file.deleted}"
                  @click="toggleFile(file)">
            <span class="material-icons material-icons--visibility-on"></span>
            <span class="material-icons material-icons--visibility-off"></span>
          </button>
          <button v-if="actionsEnabled" name="delete" type="button" class="btn action-button"
                  @click="confirmDeletion = file">
            <span class="material-icons material-icons--delete-item"></span>
          </button>
          <button name="download" type="button" class="btn action-button btn-download"
                  @click="downloadFile($event,file)">
            <span class="material-icons">download</span>
          </button>
          <a :data-file-id="file.id" class="hide" :href="getHref(file)"></a>
        </div>
        <span class="item-name">{{ file.listName }}</span>
      </div>
    </section>
    <modal-alert v-model:message="fileError.message">
    </modal-alert>
    <modal-confirm @confirmed="deleteFile" v-model:confirm="confirmDeletion">
      <template v-slot:message>Вы действительно хотите удалить "{{ confirmDeletion?.listName }}"?</template>
    </modal-confirm>
  </div>
</template>

<script>
import usePlaybackFiles from "@/composables/playback/usePlaybackFiles";
import {computed, reactive, ref} from "vue";
import {useStore} from "vuex";
import fileApi from "@/api/mediaFile";
import storageApi from "@/api/storage";
import ModalConfirm from "@/components/common/ModalConfirm";
import ModalAlert from "@/components/common/ModalAlert";
import useCurrentUser from "@/composables/users/useCurrentUser";
export default {
  name: 'Files',
  props: {
    list: Boolean,
    disabled: Boolean
  },
  components: {ModalConfirm, ModalAlert},
  setup(props){
    const store = useStore()

    const {isHost} = useCurrentUser()
    const {filteredFiles} = usePlaybackFiles({enabled: !isHost.value || undefined})
    const actionsEnabled = computed(() => !props.disabled)
    const files = computed(() => filteredFiles.value
    .map(i => i).sort((a, b) => a.listName.localeCompare(b.listName)))

    const confirmDeletion = ref()
    const fileError = reactive({message: undefined})
    const toggleFile = item => fileApi.toggleFile(item.id, Number(!item.active))
    .then(() => store.dispatch('eventRoomMediaFileToggle',
        {data: {id: item.id, activity: !item.active}}))
    const deleteFile = (item) => fileApi.deleteFile(item.id).then(() => {
      store.dispatch('eventRoomMediaFileDelete',
          {data: {id: item.id}})
    })
    const downloadFile = (e, {id}) => {
      storageApi.downloadFile(id).then(() => {
        document.querySelector(`[data-file-id="${id}"]`).click();
      }).catch(() => {
        fileError.message = "Скачивание невозможно, файл отсутствует!"
      })
    }

    const getHref = (file) => {
      return `${process.env.VUE_APP_STORAGE}storage/file/${file.id}`;
    }

    return {
      actionsEnabled,
      files,
      toggleFile,
      deleteFile,
      downloadFile,
      getHref,
      confirmDeletion,
      fileError
    }
  }
};
</script>