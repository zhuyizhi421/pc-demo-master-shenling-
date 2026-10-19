<template>
  <el-scrollbar
    ref="scrollContainer"
    :vertical="false"
    class="scroll-container"
    :always="true"
    @wheel="handleScroll"
  >
    <slot />
  </el-scrollbar>
</template>

<script setup lang="ts">
import useTagsViewStore from "@/store/modules/tagsView"
import { type IRoute } from "@/types/common"

defineOptions({
  name: "ScrollPane"
})

const emit = defineEmits<{
  (e: "scroll"): void
}>()

const tagAndTagSpacing = ref(4)
const { proxy } = getCurrentInstance() as any

const scrollWrapper = computed(() => proxy.$refs.scrollContainer.$refs.wrapRef)

onMounted(() => {
  scrollWrapper.value.addEventListener("scroll", emitScroll, true)
})
onBeforeUnmount(() => {
  scrollWrapper.value.removeEventListener("scroll", emitScroll)
})

const emitScroll = () => {
  emit("scroll")
}

const tagsViewStore = useTagsViewStore()
const visitedViews = computed(() => tagsViewStore.visitedViews)

function moveToTarget(currentTag: IRoute) {
  const $container = proxy.$refs.scrollContainer.$el
  const $containerWidth = $container.offsetWidth
  const $scrollWrapper = scrollWrapper.value

  let firstTag = null
  let lastTag = null

  // find first tag and last tag
  if (visitedViews.value.length > 0) {
    firstTag = visitedViews.value[0]
    lastTag = visitedViews.value[visitedViews.value.length - 1]
  }

  if (firstTag === currentTag) {
    $scrollWrapper.scrollLeft = 0
  } else if (lastTag === currentTag) {
    $scrollWrapper.scrollLeft = $scrollWrapper.scrollWidth - $containerWidth
  } else {
    const tagListDom = document.getElementsByClassName("tags-view-item")
    const currentIndex = visitedViews.value.findIndex((item) => item === currentTag)
    let prevTag: HTMLElement | null = null
    let nextTag: HTMLElement | null = null
    for (const k in tagListDom) {
      if (k !== "length" && Object.hasOwnProperty.call(tagListDom, k)) {
        if (
          (tagListDom[k] as HTMLElement).dataset.path ===
            visitedViews.value[currentIndex - 1].fullPath
        ) {
          prevTag = tagListDom[k] as HTMLElement
        }
        if (
          (tagListDom[k] as HTMLElement).dataset.path ===
            visitedViews.value[currentIndex + 1].fullPath
        ) {
          nextTag = tagListDom[k] as HTMLElement
        }
      }
    }

    // the tag's offsetLeft after of nextTag
    const afterNextTagOffsetLeft =
      nextTag!.offsetLeft + nextTag!.offsetWidth + tagAndTagSpacing.value

    // the tag's offsetLeft before of prevTag
    const beforePrevTagOffsetLeft = prevTag!.offsetLeft - tagAndTagSpacing.value
    if (afterNextTagOffsetLeft > $scrollWrapper.scrollLeft + $containerWidth) {
      $scrollWrapper.scrollLeft = afterNextTagOffsetLeft - $containerWidth
    } else if (beforePrevTagOffsetLeft < $scrollWrapper.scrollLeft) {
      $scrollWrapper.scrollLeft = beforePrevTagOffsetLeft
    }
  }
}

function handleScroll(e: WheelEvent) {
  const eventDelta = -e.deltaY * 40
  const $scrollWrapper = scrollWrapper.value
  $scrollWrapper.scrollLeft = $scrollWrapper.scrollLeft + eventDelta / 4
  emit("scroll")
}

defineExpose({
  moveToTarget
})
</script>

<style lang="scss" scoped>
.scroll-container {
  position: relative;
  width: 100%;
  white-space: nowrap;

  :deep(.el-scrollbar__wrap) {
    background-color: #fff;
    display: flex;
    align-items: center;
  }

  :deep(.el-scrollbar__bar) {
    bottom: 0px;

    &.is-horizontal {
      height: 4px;
    }
  }
}
</style>
