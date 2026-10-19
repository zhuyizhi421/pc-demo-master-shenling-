<template>
  <div id="tags-view-container" class="tags-view-container">
    <ScrollPane ref="scrollPaneRef" class="tags-view-wrapper" @scroll="handleScroll">
      <router-link
        v-for="tag in visitedViews"
        :key="tag.fullPath"
        :data-path="tag.fullPath"
        :class="isActive(tag) ? 'active' : ''"
        :to="tag.fullPath"
        class="tags-view-item"
        :style="activeStyle(tag)"
        @click.middle="!isAffix(tag) ? closeSelectedTag(tag) : ''"
        @contextmenu.prevent="openMenu(tag, $event)"
      >
        <el-tooltip effect="dark" content="右键操作页签" placement="top">
          {{ tag.title }}
        </el-tooltip>
        <close
          v-if="!isAffix(tag)"
          @click.prevent.stop="closeSelectedTag(tag)"
          class="el-icon-close"
          style="width: 1em; height: 1em; vertical-align: middle; margin-left: 5px"
        />
      </router-link>
    </ScrollPane>
    <ul v-show="visible" :style="{ left: left + 'px', top: top + 'px' }" class="contextmenu">
      <li @click="refreshSelectedTag()" v-if="route.fullPath === selectedTag?.fullPath">
        <refresh-right style="width: 1em; height: 1em" /> 刷新页面
      </li>
      <li v-if="!isAffix(selectedTag)" @click="closeSelectedTag(selectedTag!)">
        <close style="width: 1em; height: 1em" /> 关闭当前
      </li>
      <li @click="closeOthersTags"><circle-close style="width: 1em; height: 1em" /> 关闭其他</li>
      <li v-if="!isFirstView()" @click="closeLeftTags">
        <back style="width: 1em; height: 1em" /> 关闭左侧
      </li>
      <li v-if="!isLastView()" @click="closeRightTags">
        <right style="width: 1em; height: 1em" /> 关闭右侧
      </li>
      <li @click="closeAllTags(selectedTag!)">
        <circle-close style="width: 1em; height: 1em" /> 全部关闭
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import { type RouteConfig } from "@/router/index"
import usePermissionStore from "@/store/modules/permission"
import useTagsViewStore from "@/store/modules/tagsView"
import { type IRoute } from "@/types/common"
import { getNormalPath } from "@/utils/index"

import ScrollPane from "./ScrollPane.vue"

defineOptions({
  name: "TagsView"
})

const visible = ref(false)
const top = ref(0)
const left = ref(0)
const selectedTag = ref<IRoute | null>(null)
const affixTags = ref<any[]>([])
const scrollPaneRef = ref<InstanceType<typeof ScrollPane> | null>(null)

const { proxy } = getCurrentInstance() as any

const route = useRoute()
const router = useRouter()

const visitedViews = computed(() => useTagsViewStore().visitedViews)
const routes = computed(() => usePermissionStore().routes)
const theme = "theme-dark"

watch(route, () => {
  addTags()
  moveToCurrentTag()
})
watch(visible, (value) => {
  if (value) {
    document.body.addEventListener("click", closeMenu)
  } else {
    document.body.removeEventListener("click", closeMenu)
  }
})
onMounted(() => {
  initTags()
  addTags()
})

function isActive(r: IRoute) {
  return r.fullPath === route.fullPath
}

function activeStyle(tag: IRoute) {
  if (!isActive(tag)) return {}
  return {
    "background-color": theme,
    "border-color": theme
  }
}

function isAffix(tag: IRoute | null) {
  if (tag) {
    return tag.meta && tag.meta.affix
  }
}

function isFirstView() {
  try {
    return (
      selectedTag.value?.fullPath === "/index" ||
      selectedTag.value?.fullPath === visitedViews.value[0].fullPath
    )
  } catch (err) {
    return false
  }
}
function isLastView() {
  try {
    return (
      selectedTag.value?.fullPath === visitedViews.value[visitedViews.value.length - 1].fullPath
    )
  } catch (err) {
    return false
  }
}
function filterAffixTags(routes: RouteConfig[], basePath = "") {
  let tags: any[] = []
  routes.forEach((route: any) => {
    if (route.meta && route.meta.affix) {
      const tagPath = getNormalPath(basePath + "/" + route.path)
      tags.push({
        fullPath: tagPath,
        path: tagPath,
        name: route.name,
        meta: { ...route.meta }
      })
    }
    if (route.children) {
      const tempTags = filterAffixTags(route.children, route.path)
      if (tempTags.length >= 1) {
        tags = [...tags, ...tempTags]
      }
    }
  })
  return tags
}

function initTags() {
  const res = filterAffixTags(routes.value)
  affixTags.value = res
  for (const tag of res) {
    // Must have tag name
    if (tag.name) {
      useTagsViewStore().addVisitedView(tag)
    }
  }
}

function addTags() {
  const { name } = route
  if (name) {
    useTagsViewStore().addView(route)
    if (route.meta.link) {
      useTagsViewStore().addIframeView(route)
    }
  }
  return false
}

function moveToCurrentTag() {
  nextTick(() => {
    const currentTag = visitedViews.value.find((item) => item.fullPath === route.fullPath)
    if (currentTag) {
      scrollPaneRef.value?.moveToTarget(currentTag)
      useTagsViewStore().updateVisitedView(route)
    }
  })
}

function refreshSelectedTag() {
  proxy.$tab.refreshPage()
  if (route.meta.link) {
    useTagsViewStore().delIframeView(route)
  }
}

function closeSelectedTag(view: IRoute) {
  proxy.$tab.closePage(view).then(({ visitedViews }: { visitedViews: IRoute[] }) => {
    if (isActive(view)) {
      toLastView(visitedViews, view)
    }
  })
}

function closeRightTags() {
  proxy.$tab.closeRightPage(selectedTag.value).then((visitedViews: IRoute[]) => {
    if (!visitedViews.find((i) => i.fullPath === route.fullPath)) {
      toLastView(visitedViews)
    }
  })
}

function closeLeftTags() {
  proxy.$tab.closeLeftPage(selectedTag.value).then((visitedViews: IRoute[]) => {
    if (!visitedViews.find((i) => i.fullPath === route.fullPath)) {
      toLastView(visitedViews)
    }
  })
}

function closeOthersTags() {
  if (!selectedTag.value) {
    return
  }
  router.push(selectedTag.value).catch(() => {})
  proxy.$tab.closeOtherPage(selectedTag.value).then(() => {
    moveToCurrentTag()
  })
}

function closeAllTags(view: IRoute) {
  proxy.$tab.closeAllPage().then(({ visitedViews }: { visitedViews: IRoute[] }) => {
    if (affixTags.value.some((tag) => tag.fullPath === route.fullPath)) {
      return
    }
    toLastView(visitedViews, view)
  })
}

function toLastView(visitedViews: IRoute[], view?: IRoute) {
  const latestView = visitedViews.slice(-1)[0]
  if (latestView) {
    router.push(latestView.fullPath)
  } else {
    // now the default is to redirect to the home page if there is no tags-view,
    // you can adjust it according to your needs.
    if (view?.name === "Dashboard") {
      // to reload home page
      router.replace({ path: "/redirect" + view.fullPath })
    } else {
      router.push("/")
    }
  }
}

function openMenu(tag: IRoute, e: MouseEvent) {
  const menuMinWidth = 105
  const offsetLeft = proxy.$el.getBoundingClientRect().left // container margin left
  const offsetWidth = proxy.$el.offsetWidth // container width
  const maxLeft = offsetWidth - menuMinWidth // left boundary
  const l = e.clientX - offsetLeft + 15 // 15: margin right

  if (l > maxLeft) {
    left.value = maxLeft
  } else {
    left.value = l
  }

  top.value = e.clientY
  visible.value = true
  selectedTag.value = tag
}

function closeMenu() {
  visible.value = false
}

function handleScroll() {
  closeMenu()
}
</script>

<style lang="scss" scoped>
.tags-view-container {
  height: calc(100% - 2px);
  width: 100%;
  background: #fff;
  padding: 0 16px;
  position: relative;

  .tags-view-wrapper {
    .tags-view-item {
      display: inline-flex;
      align-items: center;
      position: relative;
      cursor: pointer;
      height: 28px;
      line-height: 28px;
      border: 1px solid #e8eaec;
      color: #515a6e;
      background: #fff;
      padding: 0 8px;
      font-size: 12px;
      margin-left: 5px;
      margin-top: 6px;
      border-radius: 3px;
      transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);

      &:first-of-type {
        margin-left: 0;
      }

      &.active {
        background-color: var(--el-color-primary);
        color: #fff;
        border-color: var(--el-color-primary);

        &::before {
          content: "";
          background: #fff;
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          position: relative;
          margin-right: 6px;
        }

        .el-icon-close {
          color: #fff;
        }
      }
    }
  }

  .contextmenu {
    margin: 0;
    background: #fff;
    z-index: 3000;
    position: absolute;
    list-style-type: none;
    padding: 5px 0;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 400;
    color: #333;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

    li {
      margin: 0;
      padding: 8px 16px;
      cursor: pointer;
      display: flex;
      align-items: center;

      .el-icon {
        margin-right: 8px;
        font-size: 14px;
      }

      &:hover {
        background: #f5f7fa;
        color: var(--el-color-primary);
      }
    }
  }
}
</style>
