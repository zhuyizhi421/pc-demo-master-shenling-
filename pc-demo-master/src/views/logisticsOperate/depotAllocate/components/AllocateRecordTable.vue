<template>
  <CustomTitle title="调拨清单"></CustomTitle>
  <CustomTable
    ref="tableRef"
    v-model:table-data="tableData"
    :config="tableConfig"
    :query-config="queryConfig"
    class="custom-detail-table"
  >
    <template #operation-default="{ row }">
      <el-button link type="primary" size="small" @click="onViewOutRecordClick(row.productModelId)"
        >产品详情</el-button
      >
    </template>
  </CustomTable>
</template>

<script setup lang="ts">
import { getLogAllocateDetail } from "@/api/logistics/allocate"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import type { LogisticsAllocateDetail as ITableRow } from "@/types/logistics/allocate"
import { precisionConversion } from "@/utils/common"

const props = withDefaults(
  defineProps<{
    id: string
  }>(),
  {
    id: ""
  }
)

const emits = defineEmits<{
  (e: "onViewOutRecordClick", productModelId: string): void
}>()

const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
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
      prop: "allocateQty",
      label: "调拨数量",
      width: 120,
      align: "right",
      formatter: (row: ITableRow) => {
        return row.allocateQty || row.allocateQty == 0
          ? precisionConversion(row.allocateQty, row?.decimalNumber ?? 2)
          : ""
      }
    },
    {
      prop: "outQty",
      label: "已拨出数量",
      width: 120,
      align: "right",
      formatter: (row: ITableRow) => {
        return row.outQty || row.outQty == 0
          ? precisionConversion(row.outQty, row?.decimalNumber ?? 2)
          : ""
      }
    },
    {
      prop: "inQty",
      label: "已拨入数量",
      width: 120,
      align: "right",
      formatter: (row: ITableRow) => {
        return row.inQty || row.inQty == 0
          ? precisionConversion(row.inQty, row?.decimalNumber ?? 2)
          : ""
      }
    },
    {
      prop: "unitName",
      label: "单位",
      width: 120,
      align: "center"
    },
    {
      prop: "operation",
      label: "操作",
      width: 120,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

const queryConfig: ITableRequestConfig<[string], ITableRow, false> = {
  api: getLogAllocateDetail,
  getParams: () => {
    return [props.id]
  }
}

const onViewOutRecordClick = (productModelId: string) => {
  emits("onViewOutRecordClick", productModelId)
}

onMounted(async () => {
  await tableRef.value?.requestData()
})

defineOptions({
  name: "AllocateRecordTable"
})
</script>

<style scoped lang="scss">
.custom-detail-table {
  flex: 1;
  overflow: hidden;
}
</style>
