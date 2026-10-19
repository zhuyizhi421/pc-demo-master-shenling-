<!-- 组件 工厂选自 -->
<template>
  <el-select
    @change="change"
    :model-value="props.modelValue"
    placeholder="请选择"
    filterable
    :disabled="disabled"
    :clearable="clearable"
  >
    <el-option v-for="item in list" :key="item.id" :label="item.entityName" :value="item.id">
      <slot name="default" :option="item"></slot>
    </el-option>
  </el-select>
</template>

<script setup lang="ts" generic="T">
import { queryFactoryModelList } from "@/api/fm"

defineOptions({
  name: "SelectFacility"
})

const props = withDefaults(
  defineProps<{
    modelValue: T
    data?: { id: string; entityName: string }[]
    clearable?: boolean
    disabled?: boolean
    isEnable?: boolean | undefined // 是否启用
  }>(),
  {
    data: () => [],
    clearable: true,
    disabled: false,
    isEnable: undefined
  }
)

const emits = defineEmits<{
  (e: "update:modelValue", selectedData: T): void
  (e: "onchange", data: any): void
}>()

const list = ref<any[]>([])

onMounted(async () => {
  try {
    if (props.data?.length) {
      list.value = props.data
      return
    }
    const res = await queryFactoryModelList({
      isStorage: true,
      isEnable: props.isEnable
    })

    list.value = res.map((item) => {
      return {
        id: item.id,
        entityName: item.entityName,
        entityCode: item.entityCode
      }
    })
  } catch (error) {
    console.log("getLogwarehouseList::", error)
  }
})

const change = (data: T) => {
  emits("update:modelValue", data)
  const selectedWarehouseCode = list.value?.find((i: any) => i.id == data)?.entityCode
  emits("onchange", selectedWarehouseCode)
}
</script>

<style scoped lang="scss"></style>
