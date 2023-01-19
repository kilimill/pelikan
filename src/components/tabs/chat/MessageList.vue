<template>
  <div
    v-for="message of messages"
    :key="message.eventId"
    class="chat-message"
    :class="{ system: message.system }"
    ref="userNames"
  >
    <header>
      <button
        v-if="showDeleteButton(message)"
        class="delete-message btn"
        @click="deletePublicMessage(message.eventId)"
      >
        <span class="material-icons">clear</span>
      </button>
      <time :class="{ 'text-alert': message.userIsHost }">{{
        message.time
      }}</time>
      <div :class="{ 'text-alert': message.userIsHost }" class="title">
        <span :data-bs-title="message.alias">{{ message.alias }}</span>
      </div>
    </header>
    <div class="message-content">{{ this.printMessage(message) }}</div>
  </div>
</template>

<script>
import { useStore } from "vuex";
import useCurrentUser from "@/composables/users/useCurrentUser";
import { computed, ref } from "vue";
import useBootstrapTooltip from "@/composables/bootstrap/useBootstrapTooltip";
import { ROLE_ID_HOST } from "@/store/modules/user/roles";
export default {
  name: "Message",
  props: {
    messages: { type: Array, required: true },
    isPrivateChat: { type: Boolean, required: true },
  },
  setup(props) {
    const userNames = ref();
    const store = useStore();
    let mode = computed(() => store.state.application.mode);
    const isPublicChat = computed(() => !props.isPrivateChat);
    const isPrivateChat = computed(() => !isPublicChat.value);
    const deletePublicMessage = (id) =>
      store.dispatch("tabs/chat/public/deleteMessage", id);
    const {
      currentUser: {
        value: { id, isHost },
      },
    } = useCurrentUser();
    const showDeleteButton = ({ userId, deleted }) => {
      if (mode.value == "mode.playback") {
        return false;
      }
      return isPrivateChat.value || deleted ? false : isHost || userId === id;
    };

    const printMessage = (msg) => {
      if (!msg.deleted) {
        return msg.message;
      }
      return `Удалено ${
        msg.deletedByRoleId === ROLE_ID_HOST ? "модератором" : "пользователем"
      }`;
    };

    useBootstrapTooltip(userNames, "[data-bs-title]");

    return {
      deletePublicMessage,
      showDeleteButton,
      printMessage,
      userNames,
      mode,
    };
  },
};
</script>

<style scoped lang="scss">
header {
  display: flex;
  flex-direction: row;
  align-items: center;
  color: #cccccc;

  button {
    .material-icons:hover {
      color: #999;
    }

    &.delete-message {
      background: transparent;
      border: none;
      color: white;
      margin: 0;
      padding: 0;
    }
  }

  time {
    margin-right: 5px;
  }
}

.message-content {
  word-wrap: break-word;
}

.chat-message {
  margin-bottom: 7px;
  line-height: normal;

  &.system {
    .title {
      font-style: italic;
    }
  }

}
.title {
  overflow: hidden;
  span {
    display: block;
    text-overflow: ellipsis;
    overflow: hidden;
  }
}
</style>