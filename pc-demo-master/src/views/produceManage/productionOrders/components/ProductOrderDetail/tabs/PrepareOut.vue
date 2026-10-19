<template>
  <CustomTable ref="tableRef" v-model:table-data="tableData" :config="tableConfig"></CustomTable>
</template>

<script setup lang="ts">
import { queryPrepareOutboundRecords } from "@/api/produce/production-order/production-order"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import type { IDeliveryPlanMaterialOutRecordItem } from "@/types/logistics/delivery"
import { isEffectiveValue, precisionConversion } from "@/utils/common"

const props = withDefaults(defineProps<{ id: string }>(), {})

const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<IDeliveryPlanMaterialOutRecordItem[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "outboundCode",
      label: "领料出库单号",
      minWidth: 160
    },
    {
      prop: "outboundTime",
      label: "出库时间",
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
      label: "物料名称",
      minWidth: 160
    },
    {
      prop: "productModelCode",
      label: "物料编号",
      minWidth: 160
    },
    {
      prop: "quantity",
      label: "出库数量",
      minWidth: 120,
      align: "right",
      formatter: ({ decimalNumber, quantity }) =>
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

onMounted(() => {
  getTableData(props.id)
})

const getTableData = async (id: string) => {
  tableRef.value?.setLoading(true)
  const data = await queryPrepareOutboundRecords(id)
  tableData.value = data
  tableRef.value?.setLoading(false)
}
</script>

<style lang="scss" scoped></style>
