<template>
  <section class="search-bar">
    <el-input
      v-model="searchKeyword"
      placeholder="关键字搜索"
      :prefix-icon="Search"
      clearable
    ></el-input>
  </section>
</template>

<script setup lang="ts">
import { Search } from "@element-plus/icons-vue"

import { type RouteConfig } from "@/router/index"
import usePermissionStore from "@/store/modules/permission"

defineOptions({
  name: "SearchBarComponent"
})

const permissionStore = usePermissionStore()

const emits = defineEmits<{
  (e: "searchOpen", value: string): void
}>()

// 搜索关键字
const searchKeyword = ref("")

// 所有的路由信息
const routers = computed(() => permissionStore.topbarRouters as RouteConfig[])

// 获取当前菜单路由，默认取全部
const activeMenus = ref<RouteConfig[]>([])

// 按关键词过滤菜单
function filterMenu(menu: RouteConfig[], searchText: string) {
  try {
    return menu
      .map((item) => {
        let newItem = { ...item }
        // 如果二级菜单标题包含关键词则返回整个二级菜单
        if (newItem.meta?.title && newItem.meta?.title.includes(searchText)) return newItem
        if (newItem.children && newItem.children.length) {
          newItem.children = filterMenu(newItem.children, searchText)
        }
        return newItem
      })
      .filter((item) => {
        const labelContains = item.meta?.title && item.meta?.title.includes(searchText)
        return labelContains || (item.children && item.children.length > 0)
      })
  } catch (error) {
    console.log(error)
    return []
  }
}

// 当前菜单路由赋值
function activeRoutes() {
  let routes: RouteConfig[] = activeMenus.value
  // if (routes.length > 0) {
  permissionStore.setSidebarRouters(routes)
  // } else {
  // appStore.toggleSideBarHide(true) // 折叠菜单
  // }
  emits("searchOpen", searchKeyword.value)
}

// 仅路由变化后才改变默认菜单
watch(
  [() => routers.value, () => searchKeyword.value],
  () => {
    activeMenus.value = filterMenu(routers.value, searchKeyword.value)
    activeRoutes()
  },
  {
    immediate: true,
    deep: true
  }
)

onMounted(() => {})
</script>

<style lang="scss" scoped>
.search-bar {
  height: 30px;
  margin: 10px;
}
</style>
