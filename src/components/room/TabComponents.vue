<template>
  <div class="tabs">
    <nav ref="tabs">
      <div class="nav nav-tabs nav-justified" role="tablist">
        <button v-for="component of componentsList" :key="component.name"
                type="button" class="nav-link" role="tab"
                :class="getComponentClasses(component)"
                :aria-selected="component.name === currentComponent.name"
                @click="setCurrentComponent(component)"
        ><span class="material-icons">{{component.icon}}</span>
        </button>
      </div>
    </nav>
    <div class="tabs-content">
      <TabContent v-if='isSmallScreen' :class='currentComponent.name === "TabContent" ? "tabs__active" : "tabs__hidden"'></TabContent>
      <TabVideo v-if='isSmallScreen' :class='currentComponent.name === "TabVideo" ? "tabs__active" : "tabs__hidden"'></TabVideo>

      <div class="tabs-content" v-if='currentComponent.name == "TabChat"' :class='currentComponent.name === "TabChat" ? "tabs__active" : "tabs__hidden"' >
        <TabChat v-bind="componentOptions" ></TabChat>
      </div>

      <TabUsers :class='currentComponent.name === "TabUsers" ? "tabs__active" : "tabs__hidden"' ></TabUsers>
      <!-- <component :is="'TabUsers'"  v-bind="componentOptions"/> -->

      <TabSettings :class='currentComponent.name == "TabSettings" ? "tabs__active" : "tabs__hidden"'></TabSettings>
      <div class="tabs-content" :class='currentComponent.name == "TabInfo" ? "tabs__active" : "tabs__hidden"' >
        <TabInfo></TabInfo>
      </div>
    </div>
  </div>
</template>

<script>
// import components from "@/store/modules/tabs/components";
import {ref, unref, watch} from "vue";
import useViewportMatcher from "@/composables/useViewportMatcher";
import useTabComponents from "@/composables/tabs/useTabComponents";

import TabContent from "@/components/tabs/TabContent"
import TabVideo from "@/components/tabs/TabVideo"
import TabChat from "@/components/tabs/chat"
import TabUsers from "@/components/tabs/users"
import TabSettings from "@/components/tabs/settings"
import TabInfo from "@/components/tabs/info"
import useCurrentRoom from '@/composables/room/useCurrentRoom';

export default {
  name: "TabComponents",
    // components,
  components: {
    TabContent,
    TabVideo,
    TabChat,
    TabUsers,
    TabSettings,
    TabInfo,
  },
  setup() {
    const {matchViewport} = useViewportMatcher('(max-width: 992px)')
    const {currentComponent, componentsList, toDefaultTab} = useTabComponents()
    const {isPlayback} = useCurrentRoom()
    watch(matchViewport, value => {
      if (!(currentComponent.value.visible || value)) {
        toDefaultTab()
      }
    })

    return {
      isSmallScreen: matchViewport,
      componentsList: componentsList,
      currentComponent,
      componentOptions: ref({}),
      isPlayback
    }
  },

  provide() {
    return {
      changeCurrentTab: (name, options) => {
        this.componentOptions = {...(options || {})}
        this.currentComponent = unref(name)
      }
    }
  },
  methods: {
    getComponentClasses(component) {
      return {
        active: this.currentComponent.name === component.name,
        highlight: this.isPlayback ? false : component.highlight,
        'd-lg-none': !component.visible,
      }
    },
    setCurrentComponent({name}) {
      this.componentOptions = {}
      this.currentComponent = name
    }
  }
}
</script>

<style scoped lang="scss">
@import "src/assets/scss/theme";

.tabs {
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
}

.nav-tabs {
  border-bottom-color: $middle-gray;

  .nav-link{
    border: none;
    color: $light;

    &.active {
      color: $light;
      background-color: $middle-gray;
    }

    &.highlight {
      color: $highlight;
    }

    .material-icons {
      font-size: 1.5rem;
    }
  }
}

.tabs-content {
  background-color: $middle-gray;
  display: flex;
  flex-grow:  1;
  flex-direction: column;
  overflow: hidden;

  .tab-content {
    display: flex;
    flex-direction: column;
  }
}
</style>

<!-- Стили в глобальной области видимости -->
<style lang="scss">
@import "src/assets/scss/theme";
.tabs-content {
  position: relative;
}

.tabs-content > .tab-content {
  font-size: 15px;
  overflow: hidden;
  text-align: start;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.tabs-content > .tabs__active {
  flex-grow: 1;
  position: absolute;
  z-index: 2;
  width: 100%;
  height: 100%;
}
.tabs__hidden {
  opacity: 0;
  pointer-events: none;
  overflow: hidden;
  padding: 0;
}

.btn-group.btn-group_tabs {
  display: block;
  width: 100%;
  .btn.btn-tab_button {width: 25%}
}
.btn.btn-tab_button {
  $background: $middle-gray;
  $border: darken($background, 10);
  $color: lighten($background, 20);
  $hover-color: lighten($color, 10);
  @include button-variant($background, $border, $color, $background, $border, $hover-color, $background, $border, $light);
  font-size: 1.5rem;
  padding: 2px 0;
}
</style>