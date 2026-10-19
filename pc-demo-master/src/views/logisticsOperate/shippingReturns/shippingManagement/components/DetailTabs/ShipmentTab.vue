<template>
  <CustomTable
    class="table"
    ref="tableRef"
    v-model:table-data="tableData"
    :config="tableConfig"
  ></CustomTable>
</template>

<script setup lang="ts">
import { requestDeliveryRecordByDeliveryPlan } from "@/api/logistics/delivery"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import type { IDeliveryPlanDeliveryRecordItem } from "@/types/logistics/delivery"
import { isEffectiveValue, precisionConversion } from "@/utils/common"

const props = withDefaults(defineProps<{ id: string }>(), {})

const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<IDeliveryPlanDeliveryRecordItem[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "deliveryCode",
      label: "发货单号",
      minWidth: 160
    },
    {
      prop: "deliveryTime",
      label: "发货时间",
      minWidth: 160,
      align: "center"
    },
    {
      prop: "facilityName",
      label: "仓库名称",
      minWidth: 160
    },
    {
      prop: "locationName",
      label: "库位名称",
      minWidth: 160
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
      prop: "deliveryTime",
      label: "发货数量",
      minWidth: 120,
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

const getTableData = async (id: string) => {
  if (!id) {
    return
  }
  tableRef.value?.setLoading(true)
  const data = await requestDeliveryRecordByDeliveryPlan(id)
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
