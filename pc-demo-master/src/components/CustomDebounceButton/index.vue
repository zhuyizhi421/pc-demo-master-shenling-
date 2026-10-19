<template>
  <el-button v-bind="attrs" @click="handleClick">
    <slot></slot>
  </el-button>
</template>

<script setup lang="ts">
import { debounce as lodashDebounce } from "lodash-es"

const props = withDefaults(
  defineProps<{
    debounce?: boolean
    debounceTime?: number
  }>(),
  {
    debounce: true
  }
)

const emit = defineEmits<{
  (e: "click", event: MouseEvent): void
}>()

// 默认开启防抖，默认防抖时间为 1000ms
const debounceEnabled = computed(() => props.debounce !== false)
const delay = computed(() => props.debounceTime ?? 1000)

// 透传所有 attrs 到 el-button（包括 type、size 等原生 props）
const attrs = useAttrs()

const handleClick = debounceEnabled.value
  ? lodashDebounce((event: MouseEvent) => emit("click", event), delay.value, {
      leading: true,
      trailing: false
    })
  : (event: MouseEvent) => emit("click", event)

defineOptions({
  name: "CustomDebounceButton"
})
</script>
