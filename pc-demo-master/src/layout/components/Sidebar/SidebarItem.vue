<template>
  <div v-if="!item.hidden">
    <template v-if="!renderChild">
      <AppLink v-if="onlyOneChild.meta" :to="resolvePath(onlyOneChild.path, onlyOneChild.query)">
        <el-menu-item
          :index="resolvePath(onlyOneChild.path)"
          :class="{ 'submenu-title-noDropdown': !isNest }"
        >
          <svg-icon
            :icon-class="onlyOneChild.meta.icon || (item.meta && item.meta.icon)"
            :size="20"
            class="menu-icon"
          />
          <template #title>
            <span class="menu-title" :title="hasTitle(onlyOneChild.meta.title)">
              {{ onlyOneChild.meta.title }}
            </span>
          </template>
        </el-menu-item>
      </AppLink>
    </template>

    <el-sub-menu v-else ref="subMenu" :index="resolvePath(item.path)" teleported>
      <template v-if="item.meta" #title>
        <svg-icon :icon-class="item.meta && item.meta.icon" :size="20" class="menu-icon" />
        <span class="menu-title" :title="hasTitle(item.meta.title)">{{ item.meta.title }}</span>
      </template>

      <SidebarItem
        v-for="child in item.children"
        :key="child.path"
        :is-nest="true"
        :item="child"
        :base-path="resolvePath(child.path) as string"
        class="nest-menu"
        @openSubmenu="(val: string) => emit('openSubmenu', val)"
      />
    </el-sub-menu>
  </div>
</template>

<script setup lang="ts">
import { getNormalPath, isExternal } from "@/utils/index"

import AppLink from "./Link.vue"

const props = defineProps({
  // route object
  item: {
    type: Object,
    required: true
  },
  isNest: {
    type: Boolean,
    default: false
  },
  basePath: {
    type: String,
    default: ""
  }
})
const emit = defineEmits<{
  (event: "openSubmenu", value: string): void
}>()

const onlyOneChild = ref<any>({})

const renderChild = ref(false)

function hasOneShowingChild(children: any, parent: any) {
  if (!children) {
    children = []
  }
  const showingChildren = children.filter((item: any) => {
    if (item.hidden) {
      return false
    } else {
      // Temp set(will be used if only has one showing child)
      onlyOneChild.value = item
      return true
    }
  })

  // When there is only one child router, the child router is displayed by default
  // if (showingChildren.length === 1) {
  //   if (
  //     (!onlyOneChild.value.children || onlyOneChild.value.noShowingChildren) &&
  //     !props.item.alwaysShow
  //   ) {
  //     renderChild.value = false
  //     return
  //   }
  // }

  // Show parent if there are no child router to display
  if (showingChildren.length === 0) {
    onlyOneChild.value = { ...parent, path: "", noShowingChildren: true }
    if (!props.item.alwaysShow) {
      renderChild.value = false
      return
    }
  }

  renderChild.value = true
  emit("openSubmenu", resolvePath(parent.path) as string)
}

function resolvePath(routePath: string, routeQuery?: string) {
  if (isExternal(routePath)) {
    return routePath
  }
  if (isExternal(props.basePath)) {
    return props.basePath
  }
  if (routeQuery) {
    let query = JSON.parse(routeQuery)
    return { path: getNormalPath(props.basePath + "/" + routePath), query: query }
  }
  return getNormalPath(props.basePath + "/" + routePath)
}

function hasTitle(title: string) {
  if (title.length > 5) {
    return title
  } else {
    return ""
  }
}

hasOneShowingChild(props.item.children, props.item)
</script>

<style lang="scss" scoped>
.menu-icon {
  width: 20px !important;
  height: 20px !important;
  margin-right: 16px;
  vertical-align: middle;
}

.menu-title {
  display: inline-block;
  vertical-align: middle;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 160px;
}

:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  display: flex;
  align-items: center;
  padding-right: 8px;

  &.is-active {
    font-weight: bold;

    .menu-title {
      color: #fff;
    }
  }
}

.nest-menu {
  :deep(.el-menu-item) {
    // padding-left: 48px !important;

    &.is-active {
      background-color: rgba(64, 158, 255, 0.1) !important;
    }
  }
}
</style>
