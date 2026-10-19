<!-- 库位选择 -->

<template>
  <el-cascader
    ref="cascaderRef"
    :model-value="modelValue"
    @change="change"
    :options="cascaderData"
    collapse-tags
    filterable
    :props="cascaderProps"
    clearable
  />
</template>

<script setup lang="ts">
import { queryModelTreeByLeafType } from "@/api/fm"

import { SelectType } from "./types"

defineOptions({
  name: "SelectStoragePos"
})

const props = withDefaults(
  defineProps<{
    modelValue: any
    multiple?: boolean
  }>(),
  {
    multiple: false
  }
)
const emits = defineEmits<{
  (e: "update:modelValue", data: any): void
}>()

const cascaderProps = computed(() => ({
  label: "entityName",
  value: "entityId",
  multiple: !!props.multiple,
  emitPath: false
}))

const cascaderData = ref<any[]>([])
const cascaderRef = ref()

onMounted(async () => {
  try {
    const res = await queryModelTreeByLeafType({
      leafType: SelectType.LocationType,
      isEnable: true
    })
    cascaderData.value = res ?? []
  } catch (error) {
    /* empty */
  }
})

const change = (data: any) => {
  emits("update:modelValue", data)
}

defineExpose({
  cascaderRef
})
</script>

<style scoped lang="scss"></style>
