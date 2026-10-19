<template>
  <CustomTitle title="按MRO筛选">
    <el-select v-model="mroModelId" placeholder="请按MRO筛选" clearable style="width: 220px" @change="$nextTick(() => tableRef?.requestData())">
      <el-option v-for="item in mroOptions" :key="item.value" :label="item.label" :value="item.value" />
    </el-select>
  </CustomTitle>
  <CustomTable ref="tableRef" v-model:table-data="tableData" :config="tableConfig" :query-config="queryConfig" class="custom-detail-table">
    <template #mroSerialNo-default="{ row }">
      <el-button link type="primary" size="small" @click="emits('onViewMroInfoClick', row)">
        {{ row.mroSerialNo || "--" }}
      </el-button>
    </template>
    <template #mroModelName-default="{ row }">
      <el-button link type="primary" size="small" @click="emits('onViewMroModelClick', row)">
        {{ row.mroModelName || "--" }}
      </el-button>
    </template>
    <template #changeQuantity-default="{ row }">
      <span :style="{ color: getChangeColor(row.changeQuantity) }">{{ row.changeQuantity > 0 ? `+${row.changeQuantity}` : row.changeQuantity }}</span>
    </template>
  </CustomTable>
</template>

<script setup lang="ts">
import { requestMroInventoryCheckRecords } from "@/api/operation/mro/mro-inventory-check"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig, ITableRequestConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import type { IMroInventoryCheckRecordItem as ITableRow } from "@/types/maintain/mro-manage/mro-inventory-check"

type IOption = { label: string; value: string }

const props = withDefaults(defineProps<{ id: string; mroOptions: IOption[]; curMroId: string }>(), {
  id: "",
  mroOptions: () => [],
  curMroId: ""
})
const emits = defineEmits<{
  (e: "update:curMroId", curMroId: string): void
  (e: "onViewMroInfoClick", row: ITableRow): void
  (e: "onViewMroModelClick", row: ITableRow): void
}>()
const mroModelId = computed({
  get: () => props.curMroId,
  set: (val) => emits("update:curMroId", val)
})

const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    { prop: "mroModelNo", label: "MRO编号", minWidth: 140 },
    { prop: "mroSerialNo", label: "MRO序列号", minWidth: 160, slots: { default: "mroSerialNo-default" } },
    { prop: "barcode", label: "标签码", minWidth: 160 },
    { prop: "mroModelName", label: "MRO名称", minWidth: 160, slots: { default: "mroModelName-default" } },
    { prop: "warehouseLocationNo", label: "库位编号", minWidth: 140 },
    { prop: "warehouseLocationName", label: "库位名称", minWidth: 140 },
    { prop: "originalQuantity", label: "账面数量", width: 100, align: "right" },
    { prop: "checkQuantity", label: "盘点数量", width: 100, align: "right" },
    { prop: "changeQuantity", label: "差异数量", width: 100, align: "right", slots: { default: "changeQuantity-default" } },
    { prop: "updateTime", label: "更新时间", width: 160, align: "center" }
  ]
})
const queryConfig: ITableRequestConfig<[{ id: string; mroModelId?: string }], ITableRow, false> = {
  api: requestMroInventoryCheckRecords,
  getParams: () => [{ id: props.id, mroModelId: mroModelId.value }]
}

const getChangeColor = (changeQuantity: number) => (changeQuantity > 0 ? "red" : changeQuantity < 0 ? "green" : "#606266")
onMounted(() => tableRef.value?.requestData())
</script>

<style scoped lang="scss">
.custom-detail-table {
  flex: 1;
  overflow: hidden;
}
</style>
