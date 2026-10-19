<template>
  <CustomTable
    class="table"
    ref="tableRef"
    v-model:table-data="tableData"
    :config="tableConfig"
  ></CustomTable>
</template>

<script setup lang="ts">
import { requestProductRecordByDeliveryPlan } from "@/api/logistics/delivery"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import type { IDeliveryPlanProductRecordItem as ITableRow } from "@/types/logistics/delivery"
import { isEffectiveValue, precisionConversion } from "@/utils/common"

const props = withDefaults(
  defineProps<{
    id: string
    isPack: boolean
  }>(),
  {}
)

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
      prop: "specifiedOutboundWarehouseName",
      label: "指定发货仓库",
      minWidth: 160,
      get hidden() {
        return props.isPack
      }
    },
    {
      prop: "planQty",
      label: "本次计划发货数量",
      minWidth: 160,
      align: "right",
      formatter: ({ decimalNumber, planQty }) =>
        isEffectiveValue(planQty) ? precisionConversion(planQty, decimalNumber) : ""
    },
    {
      prop: "productionQty",
      label: "已排产数量",
      minWidth: 160,
      align: "right",
      formatter: ({ decimalNumber, productionQty }) =>
        isEffectiveValue(productionQty) ? precisionConversion(productionQty, decimalNumber) : ""
    },
    {
      prop: "packQty",
      label: "已包装数量",
      minWidth: 160,
      align: "right",
      formatter: ({ decimalNumber, packQty }) =>
        isEffectiveValue(packQty) ? precisionConversion(packQty, decimalNumber) : ""
    },
    {
      prop: "deliveryQty",
      label: "已发货数量",
      minWidth: 160,
      align: "right",
      formatter: ({ decimalNumber, deliveryQty }) =>
        isEffectiveValue(deliveryQty) ? precisionConversion(deliveryQty, decimalNumber) : ""
    },
    {
      prop: "unitName",
      label: "单位",
      minWidth: 90,
      align: "center"
    }
  ]
})

/** 获取产品列表 */
const getTableData = async (id: string) => {
  if (!id) {
    return
  }

  tableRef.value?.setLoading(true)
  const data = await requestProductRecordByDeliveryPlan(id)
  tableData.value = data
  tableRef.value?.setLoading(false)
}

watch(
  () => props.id,
  () => {
    getTableData(props.id)
  },
  {
    immediate: true
  }
)
</script>

<style lang="scss" scoped>
.table {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
