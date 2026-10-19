<template>
  <!-- v-download:[params] 是可以通过动态指令参数做传递的 -->
  <el-button
    :disabled="disabled"
    :type="type"
    :loading="disabled"
    :icon="icon"
    v-download="{
      get params() {
        return props.params
      }, //  参数改变时指令内部逻辑获取不到变化，需用函数包裹
      get method() {
        return props.method
      },
      get url() {
        return props.url
      },
      onStart: () => {
        disabled = true
      },
      onEnd: () => {
        disabled = false
      }
    }"
  >
    <slot>列表导出</slot>
  </el-button>
</template>

<script setup lang="ts">
defineOptions({
  name: "DownloadButton"
})

const props = withDefaults(
  defineProps<{
    url: string
    params?: any extends Object ? Object : any
    method?: "get" | "post"
    type?: string
    icon?: string
  }>(),
  {
    params: {},
    method: "get",
    type: "primary",
    icon: "Download"
  }
)

const disabled = ref(false)
</script>

<style scoped lang="scss"></style>
