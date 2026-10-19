<template>
  <CustomTitle title="采购清单" style="margin-top: 0px"></CustomTitle>
  <CustomTable
    ref="tableRef"
    v-model:table-data="tableData"
    :config="tableConfig"
    :query-config="queryConfig"
    class="custom-detail-table"
  >
    <template #operation-default="{ row }">
      <el-button link type="primary" size="small" @click="onOpenArrivalRecord(row.productModelId)"
        >收货记录</el-button
      >
      <el-button link type="primary" size="small" @click="onOpenInboundRecord(row.productModelId)"
        >入库记录</el-button
      >
    </template>
  </CustomTable>
</template>

<script setup lang="ts">
import { getLogPurchaseItemDetail } from "@/api/logistics/purchase"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import type { LogisticsPurchaseTaskDetail as ITableRow } from "@/types/logistics/purchase"
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
  (e: "onOpenArrivalRecord", id: string): void
  (e: "onOpenInboundRecord", id: string): void
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
      prop: "productCategoryName",
      label: "产品类别",
      minWidth: 160
    },
    {
      prop: "quantity",
      label: "采购数量",
      minWidth: 120,
      align: "right",
      formatter: (row: ITableRow) => {
        return row.quantity || row.quantity == 0
          ? precisionConversion(row.quantity, row.decimalNumber ?? 2)
          : ""
      }
    },
    {
      prop: "arrivalQuantity",
      label: "收货数量",
      minWidth: 120,
      align: "right",
      formatter: (row: ITableRow) => {
        return row.arrivalQuantity || row.arrivalQuantity == 0
          ? precisionConversion(row.arrivalQuantity, row.decimalNumber ?? 2)
          : ""
      }
    },
    {
      prop: "inboundQuantity",
      label: "入库数量",
      minWidth: 120,
      align: "right",
      formatter: (row: ITableRow) => {
        return row.inboundQuantity || row.inboundQuantity == 0
          ? precisionConversion(row.inboundQuantity, row.decimalNumber ?? 2)
          : ""
      }
    },
    {
      prop: "eta",
      label: "预期收货日期",
      minWidth: 160,
      align: "center"
    },
    {
      prop: "unitName",
      label: "单位",
      minWidth: 120,
      align: "center"
    },
    {
      prop: "operation",
      label: "操作",
      width: 160,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

const queryConfig: ITableRequestConfig<
  [
    {
      purchaseId: string
    }
  ],
  ITableRow,
  false
> = {
  api: getLogPurchaseItemDetail,
  getParams: () => {
    return [
      {
        purchaseId: props.id
      }
    ]
  }
}

const onOpenArrivalRecord = (id: string) => {
  emits("onOpenArrivalRecord", id)
}

const onOpenInboundRecord = (id: string) => {
  emits("onOpenInboundRecord", id)
}

onMounted(async () => {
  await tableRef.value?.requestData()
})

defineOptions({
  name: "PurchaseListTab"
})
</script>

<style scoped lang="scss">
.custom-detail-table {
  flex: 1;
  overflow: hidden;
}
</style>
