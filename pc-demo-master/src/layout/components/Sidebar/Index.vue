<template>
  <div
    class="menu-wrapper"
    :class="{ 'has-logo': showLogo }"
    :style="{ backgroundColor: variables.menuBackground }"
  >
    <logo v-if="showLogo" :collapse="isCollapse" />
    <SearchBar @searchOpen="onSearchOpen" />
    <el-scrollbar
      class="theme-dark"
      wrap-class="scrollbar-wrapper"
      height="calc(100vh - 80px - 50px)"
    >
      <el-menu
        id="elMenu"
        ref="Menu"
        mode="vertical"
        :default-active="activeMenu"
        :collapse="isCollapse"
        :background-color="variables.menuBackground"
        :text-color="variables.menuColor"
        :unique-opened="false"
        active-text-color="#FFFFFFFF"
        :collapse-transition="false"
      >
        <SidebarItem
          v-for="(route, index) in sidebarRouters"
          :key="route.path + index"
          :item="route"
          :base-path="route.path"
          @openSubmenu="openSubmenu"
        />
      </el-menu>
    </el-scrollbar>
    <Hamburger
      id="hamburger-container"
      :is-active="appStore.sidebar.opened"
      class="hamburger-container"
      @toggleClick="toggleSideBar"
    />
  </div>
</template>

<script setup lang="ts">
import type { ElMenu } from "element-plus"

import variables from "@/assets/styles/variables.module.scss"
import Hamburger from "@/components/HamburgerArea/index.vue"
import useAppStore from "@/store/modules/app"
import usePermissionStore from "@/store/modules/permission"

import Logo from "./Logo.vue"
import SearchBar from "./SearchBar.vue"
import SidebarItem from "./SidebarItem.vue"

defineOptions({
  name: "SidebarComponent"
})

const showLogo = ref(true)
const permissionStore = usePermissionStore()
const appStore = useAppStore()

const route = useRoute()
const sidebarRouters = computed(() => permissionStore.sidebarRouters)
const isCollapse = computed(() => !appStore.sidebar.opened)
const Menu = ref<InstanceType<typeof ElMenu>>()
const isSearch = ref(false)
const isInit = ref(true)

// 首次和没有内容不触发搜索标记
const onSearchOpen = (value: string) => {
  if (isInit.value) {
    isInit.value = false
    return
  }
  if (value) {
    isSearch.value = true
  } else {
    isSearch.value = false
  }
}

const openSubmenu = (index: string) => {
  nextTick(() => {
    // 菜单折叠时不触发
    if (isCollapse.value) return
    if (isSearch.value) {
      // @ts-ignore
      Menu.value?.open(index)
      nextTick(() => {
        isSearch.value = false
      })
    }
  })
}

const activeMenu = computed(() => {
  const { meta, path } = route
  // if set path, the sidebar will highlight the path you set
  if (meta.activeMenu) {
    return meta.activeMenu
  }
  return path
})

function toggleSideBar() {
  appStore.toggleSideBar()
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/variables.module.scss";

#elMenu .el-menu-item.is-active {
  background-color: $base-menu-background-active !important;
}

.menu-wrapper {
  &:deep(.theme-dark) {
    .el-menu--collapse .el-sub-menu .el-sub-menu__icon-arrow {
      right: 2px;
    }
  }
}

.hamburger-container {
  line-height: 46px;
  height: 46px;
  position: absolute;
  bottom: 0;
  right: 0;
  cursor: pointer;
  transition: background 0.3s;
  -webkit-tap-highlight-color: transparent;

  &:hover {
    background: rgba(0, 0, 0, 0.025);
  }
}
</style>
