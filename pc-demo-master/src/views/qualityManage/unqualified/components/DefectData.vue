<!-- 不合格评审 - 缺陷信息 -->
<template>
  <CustomTable
    ref="tableRef"
    v-model:tableData="tableData"
    :config="tableConfig"
    :queryConfig="queryConfig"
  >
  </CustomTable>
</template>
<script setup lang="ts">
import { getDefectReviewTaskDefect } from "@/api/quality/defectReviewTask"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import type { IDefectReviewTaskDefectItem as ITableRow } from "@/types/quality-manage/unqualified"

type IParams = {
  reviewTaskId: string
}

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
      prop: "index",
      label: "序号",
      width: 60,
      type: "index",
      align: "center"
    },
    {
      prop: "flawName",
      label: "缺陷名称",
      minWidth: 160
    },
    {
      prop: "quantity",
      label: "数量",
      width: 120,
      align: "right"
    },
    {
      prop: "unitName",
      label: "单位",
      width: 120
    },
    {
      prop: "remarks",
      label: "备注",
      minWidth: 160
    }
  ]
})
const queryConfig: ITableRequestConfig<[IParams], ITableRow, false> = {
  api: getDefectReviewTaskDefect,
  getParams: () => {
    return [
      {
        reviewTaskId: props.id
      }
    ]
  }
}

onMounted(async () => {
  await tableRef.value?.requestData()
})
</script>

<style lang="scss" scoped></style>
