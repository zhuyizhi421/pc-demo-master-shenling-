<template>
  <el-cascader
    ref="cascaderRef"
    class="w-[330px]"
    :model-value="props.modelValue"
    @change="change"
    :props="cascaderProps"
    :collapse-tags="props.multiple"
    :collapse-tags-tooltip="props.multiple"
    placeholder="请选择"
    :options="options"
    clearable
  />
</template>

<script setup lang="ts" generic="T">
import { queryLicenseCascade } from "@/api/license"
import { transformLicenseCascade } from "@/utils/cascaderTransform"

defineOptions({
  name: "SelectLicense"
})

const props = withDefaults(
  defineProps<{
    modelValue: T
    multiple?: boolean
    emitPath?: boolean
  }>(),
  {
    multiple: false,
    emitPath: true
  }
)

const emits = defineEmits<{
  (e: "update:modelValue", selectedData: T): void
  (e: "update:originData", selectedData: any): void
}>()

const cascaderProps = computed(() => ({
  multiple: props.multiple,
  emitPath: props.emitPath
}))

const options = ref<any[]>([])
const cascaderRef = ref()

const change = (data: T) => {
  console.log(data)

  emits("update:modelValue", data)
  const nodes = cascaderRef.value?.getCheckedNodes()
  if (nodes?.length) {
    const originData = nodes.map((item: any) => item.data)
    emits(
      "update:originData",
      originData.filter((item: any) => !item.children || !item.children?.length)
    ) // 过滤掉父级
  }
}

onMounted(async () => {
  const data = await queryLicenseCascade({})
  options.value = transformLicenseCascade(data)
})
</script>

<style scoped lang="scss"></style>
