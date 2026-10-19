<template>
  <div class="content">
    <div class="top-back"><el-button icon="ArrowLeft" @click="emit('close')">返回</el-button></div>
    <div class="top-content">
      <CustomTitle :title="`调整单号：${props.currentRow.adjustNo || '--'}`" :is-table-title="false" show-short-bar style="margin-top: 0" />
      <CustomDescription :data="props.currentRow" :configs="baseConfigs" :label-width="120" />
    </div>
    <div class="table-box">
      <CustomTitle title="调整明细" :is-table-title="false" show-short-bar />
      <CustomTable v-model:table-data="tableData" :config="tableConfig" class="custom-table" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { queryMroAdjustOrderDetail } from "@/api/operation/mro/mro-adjust-order"
import CustomDescription from "@/components/CustomDescription/index.vue"
import type { ICustomDescriptionConfig } from "@/components/CustomDescription/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import type { IMroAdjustOrderDetailItem, IMroAdjustOrderPageListItem } from "@/types/maintain/mro-manage/mro-adjust-order"

const props = defineProps<{ currentRow: IMroAdjustOrderPageListItem }>()
const emit = defineEmits<{ (e: "close"): void }>()
const tableData = ref<IMroAdjustOrderDetailItem[]>([])
const baseConfigs = ref<ICustomDescriptionConfig[]>([
  { label: "日期：", field: "adjustDate" },
  { label: "盘点单号：", field: "sourceCheckNo" },
  { label: "差异单单号：", field: "sourceDiffNo" },
  { label: "仓库编号：", field: "warehouseNo" },
  { label: "仓库名称：", field: "warehouseName" },
  { label: "状态：", field: "status", formatter: ({ data }) => (Number(data?.status || 0) === 0 ? "未复核" : "已复核") },
  { label: "复核人：", field: "reviewByName" },
  { label: "复核时间：", field: "reviewTime" }
])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    { prop: "mroModelNo", label: "MRO编号", minWidth: 130 },
    { prop: "mroSerialNo", label: "MRO序列号", minWidth: 140 },
    { prop: "mroModelName", label: "MRO名称", minWidth: 150 },
    { prop: "mroSpec", label: "MRO规格", minWidth: 120 },
    { prop: "mroClassifyName", label: "MRO分类", minWidth: 120 },
    { prop: "mroTypeName", label: "MRO类型", minWidth: 120 },
    { prop: "identityManage", label: "标识管理", width: 100, formatter: ({ identityManage }: IMroAdjustOrderDetailItem) => (identityManage ? "是" : "否") },
    { prop: "warehouseLocationNo", label: "库位编号", minWidth: 130 },
    { prop: "warehouseLocationName", label: "库位名称", minWidth: 130 },
    { prop: "adjustQuantity", label: "调整数量", width: 100, align: "right" },
    { prop: "originalQuantity", label: "账面数量", width: 100, align: "right" },
    { prop: "checkQuantity", label: "盘点数量", width: 100, align: "right" },
    { prop: "differenceQty", label: "差异数量", width: 100, align: "right" }
  ]
})
onMounted(async () => {
  tableData.value = await queryMroAdjustOrderDetail(props.currentRow.id)
})
</script>

<style scoped lang="scss">
.content { height: 100%; display: flex; flex-direction: column; overflow: hidden; }
.top-back { margin: 12px 20px; }
.top-content { padding: 0 20px 16px; border-bottom: 1px solid #e4e7ed; }
.table-box { flex: 1; display: flex; flex-direction: column; padding: 12px 20px 16px; overflow: hidden; }
.custom-table { flex: 1; overflow: hidden; }
</style>
