<template>
  <div class="layout-container">
    <div class="layout-tree">
      <TreeMenu
        class="tree-sidebar"
        :menuItems="menuItems"
        :horizonScroll="true"
        hideAfterIcon
        iconStyle="star"
        @toggle-favorite="toggleFavorite"
        @delete-click="refreshList"
      />
    </div>
    <div class="layout-main-page">
      <CustomTitle title="已收藏菜单" />
      <FavoriteMenuList :favoriteMenus="favoriteMenus" @delete-click="refreshList" />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  queryFavoriteMenuList,
  queryUserFavoriteMenuList,
  requestCreateFavorite
} from "@/api/favorite"
import CustomTitle from "@/components/CustomTitle/index.vue"
import type { ITableItem, ITreeMenuItem, ITreeMenuItemResult } from "@/types/personal/collect"
import emitter from "@/utils/mitt"

import FavoriteMenuList from "./components/FavoriteMenuList.vue"
import TreeMenu from "./components/TreeMenu.vue"

defineOptions({
  name: "CollectManage"
})

// 初始菜单数据
const menuItems = ref<ITreeMenuItem[]>([])

// 已收藏菜单列表数据
const favoriteMenus = ref<ITableItem[]>([])

// 收藏菜单的逻辑实现
const toggleFavorite = async (menuItem: any) => {
  if (menuItem.levelTree.includes("L")) {
    await requestCreateFavorite({ menuId: menuItem?.value })
    refreshList()
  }
}

/** 构建菜单树 */
const buildFavoriteTree = (data: ITreeMenuItemResult[], parentId?: string) => {
  const result: ITreeMenuItem[] = []
  for (const item of data) {
    if (item.parentId == parentId) {
      const newItem: ITreeMenuItem = {
        id: item.id,
        label: item.menuName,
        value: item.id,
        path: item.path,
        levelTree: item.levelTree,
        checkedStatus: item.checkedStatus,
        children: buildFavoriteTree(data, item.id)
      }
      result.push(newItem)
    }
  }
  return result
}

/** 获取菜单列表 */
const getMenuList = async () => {
  const data = await queryFavoriteMenuList()
  menuItems.value = buildFavoriteTree(data)
}

/** 获取已经收藏菜单列表 */
const getFavoriteList = async () => {
  const data = await queryUserFavoriteMenuList()
  favoriteMenus.value = data
}

/** 刷新页面菜单及列表数据 */
const refreshList = () => {
  getMenuList()
  getFavoriteList()
  emitter.emit("addFavorite", true)
}

const init = () => {
  getMenuList()
  getFavoriteList()
}
init()
</script>

<style lang="scss" scoped>
.layout-container {
  flex-direction: row;
  overflow: hidden;

  .layout-tree {
    width: 330px;
    height: 100%;
    padding: 14px 8px 0 8px;
    border-right: 10px solid #e2e2e2;
  }
  .layout-main-page {
    flex: 1;
    overflow: hidden;
    padding: 0 20px 16px;
  }
}

.tree-sidebar {
  height: 100%;
  overflow-y: auto;

  &:deep(.el-button + .el-button) {
    margin-left: 0px;
  }
}
</style>
