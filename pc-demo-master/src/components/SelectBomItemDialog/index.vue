<!-- 选择BOM子件弹窗 -->
<template>
  <CustomDialog v-model="visible" title="选择BOM子件" size="large">
    <div class="bom-info">
      <el-descriptions :column="3" border size="small">
        <el-descriptions-item label="父件产品">{{ bomInfo?.productName }}</el-descriptions-item>
        <el-descriptions-item label="产品编号">{{ bomInfo?.productCode }}</el-descriptions-item>
        <el-descriptions-item label="BOM版本">{{ bomInfo?.version }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <CustomTable
      ref="tableRef"
      v-model:table-data="tableData"
      :config="tableConfig"
      class="custom-table"
    >
    </CustomTable>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="onConfirmClick()">确定</el-button>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import { getBomItemsByProductId, type IBomItemWithVersion } from "@/api/bom"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import useProductStore from "@/store/modules/product"

export interface ISelectBomItemDialogProps {
  modelValue: boolean
  productId: string
  productName?: string
  selectedRowKeys?: string[]
}

export interface ISelectBomItemDialogEmits {
  (e: "update:modelValue", val: boolean): void
  (e: "success", data: IBomItemWithVersion[]): void
}

const props = defineProps<ISelectBomItemDialogProps>()
const emit = defineEmits<ISelectBomItemDialogEmits>()

const productStore = useProductStore()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val)
})

const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<IBomItemWithVersion[]>([])
const bomInfo = ref<{
  bomId: string
  productId: string
  productCode: string
  productName: string
  version: string
  status: string
} | null>(null)

const tableConfig = ref<ITableConfig>({
  height: 400,
  rowKey: "uniqueKey",
  reserveSelection: true,
  columns: [
    {
      prop: "productName",
      label: "产品名称",
      minWidth: 160
    },
    {
      prop: "productCode",
      label: "产品编号",
      width: 160
    },
    {
      prop: "productCategoryName",
      label: "产品类别",
      minWidth: 160
    },
    {
      prop: "productType",
      label: "产品类型",
      width: 120,
      align: "center",
      formatter: ({ productType }) => {
        return productStore.productTypeMap[productType]
      }
    },
    {
      prop: "bomVersion",
      label: "版本",
      width: 120,
      align: "center"
    },
    {
      prop: "remark",
      label: "备注",
      minWidth: 200
    },
    {
      prop: "selection",
      label: "选择",
      type: "selection",
      width: 60,
      align: "center",
      multiple: true,
      fixed: "right",
      selectable: (row) => {
        return !props.selectedRowKeys?.includes(row.uniqueKey)
      }
    }
  ]
})

// 获取BOM子件数据
const getBomItems = async () => {
  if (!props.productId) {
    tableData.value = []
    return
  }
  
  const data = await getBomItemsByProductId(props.productId)
  if (data) {
    bomInfo.value = {
      bomId: data.bomId,
      productId: data.productId,
      productCode: data.productCode,
      productName: data.productName,
      version: data.version,
      status: data.status
    }
    // 为每个子件生成唯一key（productId + 版本）
    tableData.value = data.items.map((item) => ({
      ...item,
      uniqueKey: `${item.productId}-${item.bomVersion}`
    }))
  } else {
    bomInfo.value = null
    tableData.value = []
  }
}

// 确定选择
const onConfirmClick = () => {
  const selectedRows = tableRef.value?.getCurrentMultipleRows() as IBomItemWithVersion[]
  if (!selectedRows || selectedRows.length === 0) {
    ElMessage.warning("请选择至少一个子件")
    return
  }
  emit("success", selectedRows)
  visible.value = false
}

// 监听弹窗显示
watch(
  () => props.modelValue,
  (val) => {
    if (val && props.productId) {
      getBomItems()
    }
  }
)
</script>

<style lang="scss" scoped>
.bom-info {
  margin-bottom: 16px;
}

.custom-table {
  margin-top: 16px;
}
</style>
