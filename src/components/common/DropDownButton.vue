<template>
  <div
    class="dropdown-select btn-group dropup"
    :class="{ 'disabled-active': current.disabled }"
    ref="dropdownElement"
  >
    <button
      class="dropdown-link btn btn-secondary"
      type="button"
      :class="{ disabled }"
      data-bs-toggle="dropdown"
      aria-haspopup="true"
      aria-expanded="false"
      ref="dropdownButton"
    >
      <span class="material-icons">expand_more</span>
    </button>
    <ul class="dropdown-menu dropdown-menu-dark">
      <li v-for="(item, index) in options" :key="index" @click="dropDownClick(item)">
        <a class="dropdown-item" :class="classList(item)">{{ item.name }}</a>
      </li>
    </ul>
  </div>
</template>

<script>
import { ref } from "vue";
// import useResizeObserver from "@/composables/useResizeObserver";
import { Dropdown } from "bootstrap";

export default {
  name: "DropDownSelect",
  props: {
    options: {
      type: Array,
      required: true,
      validator(value) {
        return !value.find(
          (i) =>
            !Object.prototype.hasOwnProperty.call(i, "name") ||
            !Object.prototype.hasOwnProperty.call(i, "value")
        );
      },
    },
    name: String,
    defaultText: {
      default: "Не выбрано",
    },
    modelValue: {
      type: [Number, String],
    },
    disabled: {
      type: Boolean,
    },
  },
  emits: ["update:modelValue", "change"],
  setup() {
    /** @type {Ref<HTMLElement|Element>}*/
    const dropdownElement = ref();
    const dropdownButton = ref();
    // const resizeObserver = useResizeObserver();

    // onMounted(() =>
    //   resizeObserver.handleResize(document.body, (bodyRect) => {
    //     const dropdownRect = dropdownElement.value.getBoundingClientRect();
    //     const dropdownMenu = dropdownElement.value.querySelector(".dropdown-menu");
    //     console.log(bodyRect.bottom - dropdownRect.bottom - 5);
    //     // console.log(dropdownRect.bottom);
    //     dropdownMenu.style.maxHeight = `${bodyRect.bottom - dropdownRect.bottom - 5}px`;
    //     // dropdownMenu.style.maxWidth = `${dropdownElement.value.parentElement.clientWidth}px`
    //   })
    // );

    return { dropdownElement, dropdownButton };
  },
  computed: {
    current() {
      return (
        this.options.find((i) => i.value === this.modelValue) || {
          name: this.defaultText,
          value: undefined,
        }
      );
    },
  },
  methods: {
    dropDownClick({ value, disabled = false }) {
      if (!disabled) {
        this.$emit("update:modelValue", value);
      }
    },
    classList(option) {
      return {
        active: option === this.current,
        disabled: option.disabled || false,
      };
    },
  },
  watch: {
    disabled(newVal) {
      if (newVal) {
        let myDropdown = new Dropdown(this.dropdownButton);
        myDropdown.hide();
      }
    },
    current() {
      this.$emit("change");
    },
  },
};
</script>

<style scoped lang="scss">
@import "../../assets/scss/theme";

.dropdown-select {
  position: absolute;
  left: 10px;
  bottom: 10px;
  width: 36px;
  height: 2.1rem;
}

.camera {
  .dropdown-select {
    position: static;
  }
}

.dropdown-select {
  .dropdown-menu {
    &::-webkit-scrollbar {
      width: 6px;
    }
    &::-webkit-scrollbar-thumb {
      background-color: #999;
    }
    &::-webkit-scrollbar-track {
      background-color: #4d4d4d;
    }

    .dropdown-item {
      cursor: pointer;
      user-select: none;
      width: 100%;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
  }
}

.dropdown-link {
  background: #666;
  border-color: #4d4d4d;

  &:hover,
  &:active,
  &:focus {
    background: #666;
    box-shadow: 0 0;
    border-color: #4d4d4d;
  }

  .disabled-active & {
    color: $gray-500;
  }

  .current-value {
    cursor: pointer;
    user-select: none;
    max-width: 100%;
    width: 100%;
  }
}

.btn-secondary {
  padding: 0 5px;
  .material-icons {
    font-size: 1.3rem;
    transition: 300ms;
  }

  &.btn.disabled {
    border-color: #444;
  }
}

.selected {
  background: #999;
  color: #ccc;
}
</style>
