<template>
  <el-cascader
    :model-value="modelValue"
    :options="options"
    :props="cascaderProps"
    @change="onSelectedChange"
  />
</template>

<script setup lang="ts">
import { requestSystemFaultTree } from "@/api/baseInfo/system-fault/system-fault"
import { EnumSystemFaultType } from "@/constant/enums"

defineOptions({
  name: "SelectFaultCascader"
})

const props = withDefaults(
  defineProps<{
    modelValue: string | string[]
    multiple?: boolean
    data?: any[]
    type?: EnumSystemFaultType
    emitPath?: boolean
  }>(),
  {
    type: EnumSystemFaultType.Andon,
    multiple: false,
    emitPath: false
  }
)

const emits = defineEmits<{
  (e: "update:modelValue", id: string | string[]): void
}>()

const cascaderProps = computed(() => ({
  multiple: props.multiple,
  emitPath: props.emitPath,
  children: "faultTreeNodeList",
  value: "id",
  label: "name"
}))

const options = ref<any[]>([])

onBeforeMount(() => {
  getOptions()
})

/** 选中值改变 */
const onSelectedChange = (data: string | string[]) => {
  emits("update:modelValue", data || (props.multiple ? [] : ""))
}

/** 获取级联选择器Options */
const getOptions = async () => {
  const res: any = await requestSystemFaultTree(props.type)
  options.value = transformTree(res)
}

/** 转换树形结构 */
const transformTree = (list: any[]) => {
  // 统一label名称
  return list.map((item) => {
    if (item.faultTreeNodeList && item.faultTreeNodeList.length) {
      item.faultTreeNodeList = transformTree(item.faultTreeNodeList)
    }
    item.name = item.categoryName || item.faultName || ""
    return item
  })
}
</script>

<style scoped lang="scss"></style>
