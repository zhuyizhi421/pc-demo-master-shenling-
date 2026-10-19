<template>
  <div class="app-wrapper" :class="classObj">
    <Sidebar v-if="!sidebar.hide" class="sidebar-container" />
    <div :class="{ hasTagsView: needTagsView, sidebarHide: sidebar.hide }" class="main-container">
      <div :class="{ 'fixed-header': fixedHeader }">
        <Navbar @setLayout="setLayout" />
        <TagsView v-if="needTagsView" />
      </div>
      <AppMain />
    </div>
  </div>
</template>

<script lang="ts" setup>
import useAppStore from "@/store/modules/app"

import AppMain from "./components/AppMain.vue"
import Navbar from "./components/Navbar.vue"
import Sidebar from "./components/Sidebar/Index.vue"
import TagsView from "./components/TagsView/Index.vue"

defineOptions({
  name: "LayoutComponent"
})

const needTagsView = ref(false)
const fixedHeader = ref(true)
const sidebar = computed(() => useAppStore().sidebar)
const classObj = computed(() => ({
  hideSidebar: !sidebar.value.opened,
  openSidebar: sidebar.value.opened,
  withoutAnimation: sidebar.value.withoutAnimation
}))

function setLayout() {}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/mixin.scss";
@import "@/assets/styles/variables.module.scss";

.app-wrapper {
  @include clearfix;
  position: relative;
  height: 100%;
  width: 100%;

  &.mobile.openSidebar {
    position: fixed;
    top: 0;
  }
}

.drawer-bg {
  background: #000;
  opacity: 0.3;
  width: 100%;
  top: 0;
  height: 100%;
  position: absolute;
  z-index: 999;
}

.fixed-header {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 9;
  width: calc(100% - #{$base-sidebar-width});
  transition: width 0.28s;
}

.hideSidebar .fixed-header {
  width: calc(100% - #{$base-hide-sidebar-width});
}

.sidebarHide .fixed-header {
  width: 100%;
}

.mobile .fixed-header {
  width: 100%;
}
</style>
