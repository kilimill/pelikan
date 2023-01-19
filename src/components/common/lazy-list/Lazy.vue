<!-- HTML -->
<template>
  <div id="lazyContainer" ref="lazyContainer" :class="`${containerClasses}`">
    <!-- items rendering -->
    <template v-for="item in itemsToDisplay">
      <slot :item="item"></slot>
    </template>

    <template v-if="loading">
      <!-- Loading component -->
      <div v-if="defaultLoading" id="loading-wrapper">
        <Loading :color="defaultLoadingColor" />
      </div>
      <div v-else id="loading-wrapper">
        <slot name="loading"></slot>
      </div>
    </template>

    <!-- list footer -->
    <div
      v-show="page !== items.length - 1 || !loading"
      id="end-of-list"
      ref="end-of-list"
    />
  </div>
</template>

<!-- JAVASCRIPT -->
<script>
import chunkArray from "@/composables/useLazyListArray.js";
import Loading from "@/components/common/lazy-list/Loading.vue";
export default {
  name: "LazyList",
  components: { Loading },
  props: {
    data: {
      type: Array,
      default: () => [],
    },
    itemsPerRender: {
      type: Number,
      default: 3,
    },
    containerClasses: {
      type: String,
      default: "",
    },
    defaultLoading: {
      type: Boolean,
      default: true,
    },
    defaultLoadingColor: {
      type: String,
      default: "#18191A",
    },
  },
  created() {
    this.updateList();
    this.$watch(
      "data",
      function () {
        this.page = 0;
        this.updateList();
      },
      { deep: true }
    );
  },
  mounted() {
    this.$refs["lazyContainer"].addEventListener("scroll", this.loadItems);
    this.loadItems();
  },
  beforeUnmount() {
    this.$refs["lazyContainer"].removeEventListener("scroll", this.loadItems);
  },
  data() {
    return {
      items: [],
      page: 0, // page represents the index of last small array in the list
      loading: false,
      itemsToDisplay: [], // the list of items to be rendered
    };
  },
  methods: {
    // set the list and update it when data changes
    updateList() {
      const chunckedArray = chunkArray(this.data, this.itemsPerRender); // chunkArray(data,itemsPerRender) to get array of small arrays
      this.items = chunckedArray;
      this.itemsToDisplay = chunckedArray[0];
    },

    // load more items when scrolling to the end of the list
    loadItems() {
      if (this.page >= this.items.length - 1) return;

      const element = this.$refs["end-of-list"]; //this.endOfList;
      if (!element) return;

      const position = element.getBoundingClientRect();

      // checking whether fully visible
      if (position.top >= 0 && position.bottom <= window.innerHeight && !this.loading) {
        this.loading = true;
        this.page++;
        setTimeout(() => {
          if (!this.items[this.page]) {
            this.loading = false;
            return;
          }

          this.itemsToDisplay = [...this.itemsToDisplay, ...this.items[this.page]];
          this.loading = false;
          this.loadItems();
        }, 500);
      }
    },
  },
};
</script>

<style scoped lang="scss">
.hidden {
  display: none;
}

/* List container style */
#lazyContainer {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  scroll-behavior: smooth;
  scrollbar-width: thin;
}
#end-of-list {
  height: 32px;
  width: 100%;
}
#loading-wrapper {
  width: 100%;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
