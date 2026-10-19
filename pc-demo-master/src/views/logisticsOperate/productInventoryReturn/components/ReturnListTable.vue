<template>
  <CustomTitle title="库存退货清单"></CustomTitle>
  <CustomTable
    ref="tableRef"
    v-model:table-data="tableData"
    :config="tableConfig"
    :query-config="queryConfig"
    class="custom-detail-table"
  >
    <template #operation-default="{ row }">
      <el-button type="primary" link size="small" @click="onViewOutRecordClick(row.productModelId)"
        >出库记录</el-button
      >
    </template>
  </CustomTable>
</template>

<script setup lang="ts">
import { getPurchaseReturnTaskDetail } from "@/api/logistics/purchase"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import type { IPurchaseReturnListItem as ITableRow } from "@/types/logistics/purchase"
import { isEffectiveValue, precisionConversion } from "@/utils/common"

type IOption = { label: string; value: string }

const props = withDefaults(
  defineProps<{
    id: string
    productionOptions: IOption[]
  }>(),
  {
    id: "",
    productionOptions: () => []
  }
)

const emits = defineEmits<{
  (e: "onViewOutRecordClick", productModelId: string): void
  (e: "update:productionOptions", productionOptions: IOption[]): void
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
      label: "退货数量",
      width: 120,
      align: "right",
      formatter: (row: ITableRow) => {
        return precisionConversion(row.quantity, row.decimalNumber ?? 2)
      }
    },
    {
      prop: "outboundQuantity",
      label: "实际出库数量",
      width: 120,
      align: "right",
      formatter: (row: ITableRow) => {
        return precisionConversion(row.outboundQuantity, row.decimalNumber ?? 2)
      }
    },
    {
      prop: "unitName",
      label: "单位",
      width: 120,
      align: "center"
    },
    {
      prop: "relatedPurchaseTaskCode",
      label: "关联订单",
      minWidth: 160
    },
    {
      prop: "relatedOrderType",
      label: "订单类型",
      width: 120,
      align: "center",
      formatter: (row: ITableRow) => {
        return row.relatedOrderType === 1
          ? "采购订单"
          : row.relatedOrderType === 2
            ? "委外订单"
            : ""
      }
    },
    {
      prop: "purchaseInboundQuantity",
      label: "原入库数量",
      width: 120,
      align: "right",
      formatter: (row: ITableRow) => {
        return isEffectiveValue(row.purchaseInboundQuantity)
          ? precisionConversion(row.purchaseInboundQuantity, row.decimalNumber ?? 2)
          : ""
      }
    },
    {
      prop: "specifiedWarehouseName",
      label: "指定退货仓库",
      minWidth: 160
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

const options = computed({
  get: () => props.productionOptions,
  set: (val) => emits("update:productionOptions", val)
})

const queryConfig: ITableRequestConfig<[string], ITableRow, false> = {
  api: getPurchaseReturnTaskDetail,
  getParams: () => {
    return [props.id]
  }
}

/** 点击查看出库记录 */
const onViewOutRecordClick = (productModelId: string) => {
  emits("onViewOutRecordClick", productModelId)
}

onMounted(async () => {
  await tableRef.value?.requestData()
  let array: IOption[] = []
  tableData.value.forEach((item) => {
    let index = array.findIndex((option) => option.value === item.productModelId)
    if (index === -1) {
      array.push({
        label: item.productModelName,
        value: item.productModelId
      })
    }
  })
  options.value = array
})

defineOptions({
  name: "ReturnListTable"
})
</script>

<style scoped lang="scss">
.custom-detail-table {
  flex: 1;
  overflow: hidden;
}
</style>
