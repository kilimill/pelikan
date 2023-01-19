<template>
  <section class="tab-content">
    <scrollable-decorator>
      <div class="tab-info" id="tab-info">
        <div class="tab-info-logo">
          <a href="https://pelikan.online/">
          </a>
        </div>
        <div class="tab-info-about">
          <div class="row mb-2">
            {{ hostName? hostName.alias : '' }}
          </div>
          <div class="row mb-2">
            {{ roomName }}
          </div>
        </div>

        <info-files v-if="isPlaybackHost" class="info-files-list" />

        <div id="formsBlock" :class="{'border-bottom-dashed': isPlayback}">
          <h5 v-if="isPlayback">Дополнительные материалы</h5>

          <template v-if="showForms">
            <materials form @form:error="formError" :disabled="isDisabledMaterialsBtn" class="button-container" :class="{'border-bottom-dashed': !isPlayback}"/>
            <presentations :form="!isPlayback" @form:error="formError" :disabled="isDisabledPdfBtn" class="button-container" :class="{'border-bottom-dashed': !isPlayback, 'hidden': isPlayback}" />
            <miro-boards :button="!isPlayback" :disabled="isDisabledMiroBtn" class="button-container" :class="{'border-bottom-dashed': !isPlayback, 'hidden': isPlayback}" />
          </template>

          <span id="materials-list-playback-placeholder"></span>
        </div>

        <h5 v-if="isPlayback">Материалы мероприятия</h5>

        <div id="lists-holder" class="lists-holder" :class="{empty: listsIsEmpty}">
          <span id="materials-list-room-placeholder"></span>
          <materials list :disabled="disableActions" class="materials-list"/>
          <presentations list :disabled="disableActions" class="presentations-list"/>
          <miro-boards list :disabled="disableActions" class="boards-list" />
          <media-files v-if="isPlayback" :disabled="disableActions" class="files-list" />
        </div>
      </div>
    </scrollable-decorator>
    <modal-alert v-model:message="formsErrorMessage.reason">
      <template v-slot:title>{{formsErrorMessage.title}}</template>
    </modal-alert>
  </section>
  <!-- <materials-list /> -->
</template>

<script>
import {computed, reactive} from 'vue'
import ScrollableDecorator from "@/components/common/ScrollableDecorator";
import ModalAlert from "@/components/common/ModalAlert";
import MiroBoards from "@/components/tabs/info/MiroBoards";
import Presentations from "@/components/tabs/info/Presentations";
import Materials from "@/components/tabs/info/materials";
import MediaFiles from "@/components/tabs/info/MediaFiles";
import InfoFiles from "@/components/tabs/info/InfoFiles";
import useMiroBoards from "@/composables/room/miro-boards/useMiroBoards";
import useMaterials from "@/composables/room/useMaterials";
import usePlaybackFiles from "@/composables/playback/usePlaybackFiles";
import usePresentationsList from "@/composables/room/presentations/usePresentationsList";
import useCurrentUser from "@/composables/users/useCurrentUser";
import useCurrentRoom from "@/composables/room/useCurrentRoom";
// import MaterialsList from '@/components/tabs/info/materials/List';
import { mapGetters } from 'vuex'

export default {
  name: "TabInfo",
  components: {
    // MaterialsList,
    ModalAlert, Materials, Presentations, MiroBoards, ScrollableDecorator, MediaFiles, InfoFiles},
  icon: "info",
  visibility: true,
  setup() {
    const {isHost, isParticipant} = useCurrentUser()
    const {isPlayback, currentRoom} = useCurrentRoom()
    const disableActions = computed(() => !isHost.value)
    const {hasFilteredResults: hasMaterials, materialsFilter} = useMaterials()
    const {hasFilteredResults: hasPresentations, presentationsFilter} = usePresentationsList()
    const {hasFilteredResults: hasMiroBoards, boardsFilter} = useMiroBoards()
    const {hasFilteredResults: hasPlaybackFiles} = usePlaybackFiles()
    const listsIsEmpty = computed(() => !(hasMiroBoards.value || hasPresentations.value || hasMaterials.value || hasPlaybackFiles.value))
    const formsErrorMessage = reactive({title: undefined, reason: undefined})
    const formError = ({reason, title}) => {
      formsErrorMessage.title = title
      formsErrorMessage.reason = reason
    }
    materialsFilter.enabled =
        presentationsFilter.enabled =
            boardsFilter.enabled = isParticipant.value || undefined

    return {
      disableActions,
      listsIsEmpty,
      formsErrorMessage,
      formError,
      showForms: isHost,
      isPlayback,
      isPlaybackHost: isPlayback.value && isHost.value,
      roomName: currentRoom.value.name,
    }
  },
  computed: {
    isDisabledMaterialsBtn() {
      return false
    },
    isDisabledPdfBtn() {
      return false
    },
    isDisabledMiroBtn() {
      return false
    },
    ...mapGetters('room/users', {
      hostName: 'host',
    })
  },
  data() {
    return {
      about: {
        teacherName: false,
      },
    }
  },
}
</script>
<style lang="scss" src="../../../assets/scss/external/tabs-info.scss" />

<style scoped>
.hidden{
  display: none !important;
}

.tab-content{
  padding: 10px;
}
.tab-info {
  position: relative;
}

.tab-info-logo {
  position: absolute;
  right: 15px;
  top: 3px;
  width: 30px;
}

.tab-info-about .row {
  margin: 0;
  text-align: left;
}
.tab-info-about{
  border-bottom: 1px dashed #4d4d4d;
}
.lists-holder{
  border-bottom: 1px dashed #4d4d4d;
}

</style>