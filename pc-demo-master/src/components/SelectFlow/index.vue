<template>
  <el-select @change="change" :model-value="modelValue" placeholder="请选择" clearable filterable>
    <el-option
      v-for="item in list"
      :key="item.processDefinitionId"
      :label="item.processDefinitionName"
      :value="item.processDefinitionId"
    />
  </el-select>
</template>

<script setup lang="ts" generic="T">
import { getFlowableDefinitionList } from "@/api/flowable"

defineOptions({
  name: "SelectFlow"
})

defineProps<{
  modelValue: T
}>()

const emits = defineEmits<{
  (e: "update:modelValue", selectedData: T): void
}>()

const list = ref<
  {
    processDefinitionName: string
    processDefinitionId: string
  }[]
>([])

onMounted(async () => {
  try {
    const res = await getFlowableDefinitionList()
    list.value = res
  } catch (error) {
    console.log("getFlowableDefinitionList::error", error)
  }
})

function change(data: T) {
  emits("update:modelValue", data)
}
</script>

<style scoped lang="scss"></style>
