<template>
  <CustomTable
    ref="customTableRef"
    v-model:table-data="customTableData"
    :config="tableConfig"
    :query-config="queryConfig"
  >
  </CustomTable>
</template>

<script setup lang="ts">
import { querySupplierDeliveryOrderProductList } from "@/api/baseInfo/supplier-platform/supplier-platform"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import type {
  ISupplierDeliveryData,
  ISupplierDeliveryOrderProductItem as ITableRow,
  ISupplierDeliveryOrderProductParams
} from "@/types/base-info/supplier-platform"
import { isEffectiveValue, precisionConversion } from "@/utils/common"

const props = withDefaults(
  defineProps<{
    data: ISupplierDeliveryData
  }>(),
  {}
)

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      type: "index",
      prop: "index",
      label: "序号",
      align: "center",
      width: 60
    },
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
      prop: "quantity",
      label: "送货数量",
      minWidth: 160,
      align: "center",
      formatter: ({ quantity, decimalNumber }) =>
        isEffectiveValue(quantity) ? precisionConversion(quantity, decimalNumber) : ""
    },
    {
      prop: "unitName",
      label: "单位",
      minWidth: 90,
      align: "center"
    }
  ]
})
const queryConfig: ITableRequestConfig<[ISupplierDeliveryOrderProductParams], ITableRow, false> = {
  api: querySupplierDeliveryOrderProductList,
  getParams: () => {
    const { sendOrderNo, supplierId } = props.data
    return [
      {
        sendOrderNo,
        supplierId
      }
    ]
  }
}

onMounted(() => {
  customTableRef.value?.requestData()
})
</script>

<style lang="scss" scoped></style>
