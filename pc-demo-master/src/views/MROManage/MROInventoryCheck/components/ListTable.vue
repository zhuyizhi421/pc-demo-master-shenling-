<template>
  <CustomTitle title="盘点清单" />
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
    <template #operation-default="{ row }">
      <el-button link type="primary" size="small" @click="emits('onViewRecordClick', row.mroModelId)">查看详情</el-button>
    </template>
  </CustomTable>
</template>

<script setup lang="ts">
import { queryMroInventoryCheckDetail } from "@/api/operation/mro/mro-inventory-check"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig, ITableRequestConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import type { IMroInventoryCheckDetailItem as ITableRow } from "@/types/maintain/mro-manage/mro-inventory-check"

type IOption = { label: string; value: string }

const props = withDefaults(defineProps<{ id: string; mroOptions: IOption[] }>(), {
  id: "",
  mroOptions: () => []
})
const emits = defineEmits<{
  (e: "onViewRecordClick", mroModelId: string): void
  (e: "onViewMroInfoClick", row: ITableRow): void
  (e: "onViewMroModelClick", row: ITableRow): void
  (e: "update:mroOptions", mroOptions: IOption[]): void
}>()

const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    { prop: "mroModelNo", label: "MRO编号", minWidth: 140 },
    { prop: "mroSerialNo", label: "MRO序列号", minWidth: 160, slots: { default: "mroSerialNo-default" } },
    { prop: "barcode", label: "标签码", minWidth: 160 },
    { prop: "mroModelName", label: "MRO名称", minWidth: 160, slots: { default: "mroModelName-default" } },
    { prop: "originalQuantity", label: "账面数量", width: 100, align: "right" },
    { prop: "checkQuantity", label: "盘点数量", width: 100, align: "right" },
    { prop: "changeQuantity", label: "差异数量", width: 100, align: "right", slots: { default: "changeQuantity-default" } },
    { prop: "operation", label: "操作", width: 120, fixed: "right", slots: { default: "operation-default" } }
  ]
})
const queryConfig: ITableRequestConfig<[string], ITableRow, false> = {
  api: queryMroInventoryCheckDetail,
  getParams: () => [props.id]
}
const options = computed({
  get: () => props.mroOptions,
  set: (val) => emits("update:mroOptions", val)
})
const getChangeColor = (changeQuantity: number) => (changeQuantity > 0 ? "red" : changeQuantity < 0 ? "green" : "#606266")

onMounted(async () => {
  await tableRef.value?.requestData()
  options.value = tableData.value.reduce((acc, item) => {
    if (!acc.find((opt) => opt.value === item.mroModelId)) {
      acc.push({ label: item.mroModelName, value: item.mroModelId })
    }
    return acc
  }, [] as IOption[])
})
</script>

<style scoped lang="scss">
.custom-detail-table {
  flex: 1;
  overflow: hidden;
}
</style>
