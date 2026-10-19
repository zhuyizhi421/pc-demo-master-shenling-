<template>
  <div v-if="visible" class="back-top" @click="onScrollTop()">
    <el-icon size="26"><ArrowUp /></el-icon>
    <div>TOP</div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "CustomBackTop"
})

const props = withDefaults(
  defineProps<{
    /**
     * 滚动元素实例
     */
    instance?: HTMLElement
  }>(),
  {}
)

const visible = ref(false)

onMounted(() => {
  nextTick(() => {
    props.instance?.addEventListener("scroll", handle)
  })
})

onUnmounted(() => {
  props.instance?.removeEventListener("scroll", handle)
})

const handle = (e: Event) => {
  const target = e.target as HTMLElement
  if (!target) {
    return
  }
  visible.value = target.scrollTop > 0
}

/** 元素滚动到顶部 */
const onScrollTop = () => {
  props.instance?.scrollTo({
    top: 0,
    behavior: "smooth"
  })
}
</script>

<style lang="scss" scoped>
.back-top {
  width: 60px;
  height: 60px;
  border: 1px solid #ccc;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: fixed;
  bottom: 100px;
  right: 40px;
  z-index: 10000;
  background-color: #fff;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
  cursor: pointer;

  &:hover {
    .el-icon svg,
    div {
      color: #409eff;
    }
  }

  > div {
    margin-top: 2px;
  }
}
</style>
