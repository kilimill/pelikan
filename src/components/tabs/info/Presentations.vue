<template>
  <div class="presentations">
    <form ref="formElement" v-if="form" @submit.prevent>
      <label class="btn add-button" :class="{ disabled: formDisabled }">
        <span v-if="formDisabled" class="btn-loader">
          <Preloader></Preloader>
        </span>
        <span v-else class="material-icons">add_circle_outline</span>
        <span class="tab-info-btn-text">Добавить презентацию PDF</span>
        <input
          name="presentation"
          type="file"
          ref="fileInput"
          accept="application/pdf"
          :disabled="formDisabled"
        />
      </label>
      <div class="form-text">
        До {{ pdfTotalFilesLimit }} файлов, каждый до {{ pdfFileLimitMB }} МБ,
        до {{ pdfPageLimit }} слайдов
      </div>
    </form>
    <template v-if="list">
      <section class="presentations--list">
        <div
          class="list-item"
          v-for="presentation of presentations"
          :key="presentation.id"
        >
          <div class="item-actions">
            <button
              v-if="actionsEnabled"
              name="visibility"
              type="button"
              class="btn action-button"
              :class="{ visible: presentation.activity }"
              @click="togglePresentation(presentation)"
            >
              <span class="material-icons material-icons--visibility-on"></span>
              <span
                class="material-icons material-icons--visibility-off"
              ></span>
            </button>
            <button
              v-if="actionsEnabled"
              name="delete"
              type="button"
              class="btn action-button"
              @click="confirmDeletion = presentation"
            >
              <span class="material-icons material-icons--delete-item"></span>
            </button>
            <button
              name="download"
              type="button"
              class="btn action-button btn-download"
              @click="downloadPresentation($event, presentation)"
            >
              <span class="material-icons">download</span>
              <span class="btn-loader">
                <Preloader></Preloader>
              </span>
            </button>
          </div>
          <span class="item-name">{{ presentation.listName }}</span>
        </div>
      </section>
      <modal-confirm
        @confirmed="deletePresentation"
        v-model:confirm="confirmDeletion"
      >
        <template v-slot:message
          >Вы действительно хотите удалить "{{
            confirmDeletion?.listName
          }}"?</template
        >
      </modal-confirm>
    </template>
  </div>
</template>

<script>
import { computed, ref } from "vue";
import { useStore } from "vuex";
import usePresentationsList from "@/composables/room/presentations/usePresentationsList";
import useCurrentUser from "@/composables/users/useCurrentUser";
import useCurrentRoom from "@/composables/room/useCurrentRoom";
import presentationApi from "@/api/presentation";
import storageApi from "@/api/storage";
import ModalConfirm from "@/components/common/ModalConfirm";
import useFilesForm from "@/composables/tabs/useFilesForm";
import useMessageSubscription from "@/composables/useMessageSubscription";

import Preloader from "@/components/common/Preloader";
export default {
  name: "Presentations",
  components: { ModalConfirm, Preloader },
  props: {
    form: Boolean,
    list: Boolean,
    disabled: Boolean,
  },
  emits: ["form:error"],
  setup(props, { emit }) {
    const store = useStore();

    const presentationForm = useFilesForm(presentationApi.createPresentation);
    const actionsEnabled = computed(() => !props.disabled);
    const formDisabled = computed(
      () => props.disabled || presentationForm.formLoading.value
    );

    const { isHost } = useCurrentUser();
    const { isPlayback } = useCurrentRoom();
    const { filteredPresentations } = usePresentationsList({
      enabled: !isHost.value || undefined,
    });
    const presentations = computed(() => {
      return filteredPresentations.value
        .map((i) => i)
        .sort((a, b) => a.listName.localeCompare(b.listName));
    });

    const confirmDeletion = ref();
    const deletePresentation = (presentation) =>
      presentationApi.deletePresentation(presentation.id).then(() => {
        if (isPlayback.value) {
          store.dispatch("eventRoomPresentationDelete", {
            data: { deletedId: presentation.id },
          });
        }
      });

    const togglePresentation = (presentation) => {
      return presentationApi
        .togglePresentation(presentation.id, Number(!presentation.activity))
        .then(() => {
          if (isPlayback.value) {
            store.dispatch("eventRoomPresentationToggle", {
              data: {
                presentationId: presentation.id,
                activity: !presentation.activity,
              },
            });
          }
        });
    };
    const { on } = useMessageSubscription(
      store.getters["application/getChannels"]
    );

    const downloadPresentation = (e, presentation) => {
      const btnClassList = e.target.classList;
      btnClassList.add("load");
      const api = isPlayback.value ? storageApi : presentationApi;
      api
        .downloadPresentation(presentation.id)
        .then((response) => {
          let link = document.createElement("a");
          link.href = URL.createObjectURL(response.data);
          link.download = presentation.listName;
          link.click();
        })
        .finally(() => btnClassList.remove("load"));
    };

    on("room.presentation.convertError", (e) => {
      emit("form:error", {
        reason: e.data.error,
        title: "Ошибка загрузки презентаций",
      });
      presentationForm.formLoadingOff();
    });
    on("room.presentation.update", () => {
      presentationForm.formLoadingOff();
    });
    presentationForm.setErrorHandler((reason) => {
      emit("form:error", { reason, title: "Ошибка загрузки презентаций" });
    });

    const pdfFileLimitMB = store.getters["application/pdfFileLimitMB"];
    const pdfPageLimit = store.getters["application/pdfPageLimit"];
    const pdfTotalFilesLimit = store.getters["application/pdfTotalFilesLimit"];

    return {
      ...presentationForm,
      formDisabled,
      actionsEnabled,
      confirmDeletion,
      deletePresentation,
      togglePresentation,
      downloadPresentation,
      presentations,
      pdfFileLimitMB,
      pdfPageLimit,
      pdfTotalFilesLimit,
    };
  },
};
</script>

<style scoped>
label.add-button input[type="file"] {
  display: none;
}
</style>
