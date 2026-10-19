<template>
  <CustomDialog v-model="dialogVisible" :title="'新增生产区域'" @close="emit('close')" size="mini">
    <CustomForm ref="customFormRef" v-model="formData" :configs="formConfigs"></CustomForm>

    <template #footer>
      <el-button @click="emit('close')">取消</el-button>
      <el-button type="primary" @click="onConfirmClick()">确定</el-button>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { queryModelTreeByLeafType } from "@/api/fm"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import { SelectType } from "@/components/SelectFactoryModel/types"
import type { IFactoryModelTreeNode } from "@/types/base-info/factory-model"

type IExcludeChildrenFactoryModelTreeNode = Exclude<IFactoryModelTreeNode, "children">

const props = withDefaults(
  defineProps<{
    type: SelectType
  }>(),
  {}
)

const emit = defineEmits<{
  (e: "close"): void
  (e: "success", data: IExcludeChildrenFactoryModelTreeNode[]): void
}>()

const cascaderProps = computed(() => ({
  label: "entityName",
  value: "entityId",
  multiple: true,
  emitPath: false
}))

const dialogVisible = ref(true)

const formData = reactive<{
  productUnitList: string[]
  originData: any[]
}>({
  productUnitList: [],
  originData: []
})
const productUnitOptions = ref<IFactoryModelTreeNode[]>([])

const customFormRef = ref<InstanceType<typeof CustomForm>>()
const formConfigs = ref<ICustomFormConfigItem[]>([
  {
    componentType: "el-cascader",
    label: "选择生产区域",
    field: "productUnitList",
    rules: [
      {
        required: true,
        message: "请选择生产区域",
        trigger: "change"
      }
    ],
    props: {
      placeholder: "请选择生产区域",
      collapseTags: true,
      maxCollapseTags: 1,
      class: "w-[100%]",
      get props() {
        return cascaderProps.value
      },
      get options() {
        return productUnitOptions.value
      }
    }
  }
])

onMounted(() => {
  getProductUnitOptions()
})

/** 获取加工单位下拉数据 */
const getProductUnitOptions = async () => {
  const res = await queryModelTreeByLeafType({
    leafType: props.type as 1 | 2 | 3 | 4,
    isEnable: true
  })
  productUnitOptions.value = res
}

// 扁平化整个树
const flattenTree = (
  tree: IFactoryModelTreeNode[],
  result: IExcludeChildrenFactoryModelTreeNode[] = []
): IExcludeChildrenFactoryModelTreeNode[] => {
  for (const node of tree) {
    const { children, ...rest } = node
    result.push(rest as IExcludeChildrenFactoryModelTreeNode)
    if (children && children.length > 0) {
      flattenTree(children, result)
    }
  }
  return result
}

// 根据 entityIds 获取对应的数据（不包含 children）
const getEntitiesByIds = (
  tree: IFactoryModelTreeNode[],
  ids: string[]
): IExcludeChildrenFactoryModelTreeNode[] => {
  const flatList = flattenTree(tree)
  return flatList.filter((item) => ids.includes(item.entityId))
}

/** 确定操作 */
const onConfirmClick = async () => {
  const valid = await customFormRef.value?.validateForm()
  if (!valid) return

  const productUnitList = getEntitiesByIds(productUnitOptions.value, formData.productUnitList)

  emit("close")
  emit("success", productUnitList)
}
</script>

<style lang="scss" scoped></style>
