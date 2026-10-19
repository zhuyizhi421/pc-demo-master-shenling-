<!-- 组件 客户选择 -->
<template>
  <el-select
    @change="change"
    :model-value="props.modelValue"
    placeholder="请选择"
    filterable
    clearable
  >
    <el-option v-for="item in list" :key="item.id" :label="item.customerAbbr" :value="item.id" />
  </el-select>
</template>
<script setup lang="ts" generic="T">
import { getSearchCustomer } from "@/api/customer"

defineOptions({
  name: "SelectCustomer"
})

const props = defineProps<{
  modelValue: T
}>()
const emits = defineEmits<{
  (e: "update:modelValue", selectedData: T): void
  (e: "onChange", selectedData: any, data: any): void
}>()

const list = ref<any[]>([])

onMounted(async () => {
  const res: any = await getSearchCustomer({ pageNum: 1, pageSize: 1000, stateList: [0] })
  list.value = res.records
})

const change = (data: T) => {
  emits("update:modelValue", data)
  const target = list.value.find((i) => i.id == data)
  emits("onChange", target?.customerCode, target)
}
</script>

<style scoped lang="scss"></style>
