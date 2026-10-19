<template>
  <CustomDialog
    v-model="dialogVisible"
    @close="emits('update:modelValue', false)"
    title="选择料"
    size="medium"
  >
    <CustomTable
      ref="customTableRef"
      v-model:table-data="tableData"
      :config="tableConfig"
      class="custom-table"
    >
      <template #status-default="{ row }">
        <el-tag link :type="row.status === 1 ? 'success' : 'danger'">{{
          row.status === 1 ? "启用" : "停用"
        }}</el-tag>
      </template>
    </CustomTable>

    <template #footer>
      <el-button @click="emits('update:modelValue', false)">取消</el-button>
      <el-button type="primary" @click="modalClick">确定</el-button>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import {
  requestDelegateCandidateProductModels,
  requestProductCandidateProductModels
} from "@/api/logistics/preparationMaterial"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import { EnumGetMaterialPurpose } from "@/constant/enums"
import useProductStore from "@/store/modules/product"
import type {
  IPreparationMaterialRes,
  ISelectMaterialModel
} from "@/types/logistics/preparationMaterial"

defineOptions({
  name: "SelectMaterialModel"
})

const props = defineProps<{
  modelValue: boolean
  selectedList?: IPreparationMaterialRes[]
  useFor?: EnumGetMaterialPurpose
  delegateOrderId?: string
  productionTaskId?: string
}>()

const emits = defineEmits<{
  (e: "update:modelValue", show: boolean): void
  (e: "onOk", data: ISelectMaterialModel[]): void
}>()

const productStore = useProductStore()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => {
    emits("update:modelValue", val)
  }
})

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<ISelectMaterialModel[]>([])
const tableConfig = ref<ITableConfig>({
  height: "400px",
  rowKey: "productModelId",
  columns: [
    {
      prop: "productModelName",
      label: "产品名称",
      minWidth: 160
    },
    {
      prop: "productModelCode",
      label: "产品编号",
      minWidth: 160
    },
    {
      prop: "status",
      label: "状态",
      width: 120,
      align: "center",
      slots: {
        default: "status-default"
      }
    },
    {
      prop: "productCategoryName",
      label: "产品类别",
      minWidth: 160
    },
    {
      prop: "productType",
      label: "产品类型",
      width: 160,
      formatter: (row: ISelectMaterialModel) => {
        return productStore.productTypeMap[row.productType!]
      }
    },
    {
      prop: "remark",
      label: "备注",
      minWidth: 160
    },
    {
      prop: "selection",
      label: "选择",
      width: 60,
      fixed: "right",
      type: "selection",
      multiple: true
    }
  ]
})

watch(
  () => props.modelValue,
  async (val) => {
    if (val) {
      await getList()
      customTableRef.value?.setSelectedRows(
        props.selectedList?.map((item) => item.productModelId) || []
      )
    } else {
      tableData.value = []
      customTableRef.value?.clearSelectedRow()
    }
  },
  {
    immediate: true
  }
)

const getList = async () => {
  try {
    if (props.useFor === EnumGetMaterialPurpose.OUTSOURCING) {
      const res = await requestDelegateCandidateProductModels(props.delegateOrderId!)
      tableData.value = res
    } else {
      const res = await requestProductCandidateProductModels(props.productionTaskId!)
      tableData.value = res
    }
  } catch (error) {
    console.error(error)
  }
}

const modalClick = () => {
  const multipleSelectedData = (customTableRef.value?.getCurrentMultipleRows() ||
    []) as ISelectMaterialModel[]
  if (!multipleSelectedData.length) {
    ElMessage.warning("请选择产品")
    return
  }
  emits("onOk", multipleSelectedData)
  emits("update:modelValue", false)
}
</script>
<style scoped lang="scss"></style>
