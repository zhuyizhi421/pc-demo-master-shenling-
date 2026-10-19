<!-- 委外收货 - 产品记录 -->
<template>
  <CustomTable ref="tableRef" :tableData="tableData" :config="tableConfig">
    <template #operation-default="{ row }">
      <el-button type="primary" link size="small" @click="onReviewDetail(row)"
        >查看收货详情</el-button
      >
    </template>
  </CustomTable>

  <ArrivalRecord v-model="visible" :data="dialogData" />
</template>
<script setup lang="ts">
import CustomTable from "@/components/CustomTable/index.vue"
import type { ITableConfig } from "@/components/CustomTable/type"
import type { IPurchaseReceiveReceiveDetail } from "@/types/logistics/purchaseReceive"
import ArrivalRecord from "@/views/logisticsOperate/procurementManage/procurementOrders/components/ArrivalRecord.vue"

const props = withDefaults(
  defineProps<{
    id: string
    tableData: IPurchaseReceiveReceiveDetail["detailContent"]
  }>(),
  {
    tableData: () => []
  }
)

const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "productModelName",
      label: "产品名称",
      minWidth: 160
    },
    {
      prop: "receiveQuantity",
      label: "收货数量",
      minWidth: 120,
      align: "right"
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
      width: 120,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

const visible = ref(false)
const dialogData = ref<{
  receiptId: string
  productModelId: string
  unitId: string
}>({
  receiptId: "",
  productModelId: "",
  unitId: ""
})

const onReviewDetail = (row: IPurchaseReceiveReceiveDetail["detailContent"][number]) => {
  visible.value = true
  dialogData.value = {
    receiptId: props.id,
    productModelId: row.productModelId,
    unitId: row.unitId
  }
}
</script>

<style lang="scss" scoped></style>
