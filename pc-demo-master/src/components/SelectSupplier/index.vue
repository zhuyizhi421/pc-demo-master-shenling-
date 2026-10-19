<template>
  <el-select
    @change="change"
    :model-value="props.modelValue"
    placeholder="请选择"
    clearable
    filterable
  >
    <el-option v-for="item in list" :key="item.id" :label="item.supplierName" :value="item.id" />
  </el-select>
</template>

<script setup lang="ts" generic="T">
import { querySupplierPageList } from "@/api/supplier"

defineOptions({
  name: "SelectSupplier"
})

const props = defineProps<{
  modelValue: T
}>()

const emits = defineEmits<{
  (e: "update:modelValue", selectedData: T): void
  (e: "onchange", data: any): void
  (e: "origin-data-change", data: any): void
}>()

const list = ref<any[]>([])
const originDataList = ref<any[]>([])

function change(data: T) {
  emits("update:modelValue", data)
  emits("onchange", true)
  const selected = originDataList.value.find((item) => item.id === data)

  if (selected) {
    emits("origin-data-change", selected)
  }
}

onMounted(async () => {
  const res: any = await querySupplierPageList({ pageNum: 1, pageSize: 1000 })
  originDataList.value = res.records || []
  list.value =
    res.records?.map((item: any) => {
      return {
        id: item.id,
        supplierName: item.supplierName || item.supplierAbbr
      }
    }) ?? []
})
</script>

<style scoped lang="scss"></style>
