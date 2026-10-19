<!-- 生产过程检 - 检验对象 -->
<template>
  <div class="table-box">
    <CustomTable
      ref="tableRef"
      v-model:tableData="tableData"
      :config="tableConfig"
      :queryConfig="queryConfig"
    >
    </CustomTable>
  </div>
</template>
<script setup lang="ts">
import { getInspectInstancesById } from "@/api/quality/processInspect"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import type { IInspectionObjectTableRow as ITableRow } from "@/types/quality-manage/inspection-task"
import { precisionConversion } from "@/utils/common"

const props = withDefaults(
  defineProps<{
    id: string
  }>(),
  {
    id: ""
  }
)

const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "barcode",
      label: "标签码",
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
      prop: "quantity",
      label: "数量",
      width: 120,
      align: "right",
      formatter: (row: ITableRow) => {
        return row.quantity || row.quantity == 0
          ? precisionConversion(row.quantity, row?.decimalNumber ?? 2)
          : ""
      }
    },
    {
      prop: "unitName",
      label: "单位",
      width: 120
    }
  ]
})
const queryConfig: ITableRequestConfig<[string], ITableRow, false> = {
  api: getInspectInstancesById,
  getParams: () => {
    return [props.id]
  }
}

onMounted(async () => {
  await tableRef.value?.requestData()
})
</script>

<style lang="scss" scoped></style>
