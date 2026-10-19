<!-- 不合格评审 - 拆分结果 -->
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
import { getDefectReviewTaskDivide } from "@/api/quality/defectReviewTask"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import { EnumResultNameMap } from "@/constant/enums"
import type { IDefectReviewTaskDivideItem as ITableRow } from "@/types/quality-manage/unqualified"

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
      align: "right"
    },
    {
      prop: "unitName",
      label: "单位",
      width: 120
    },
    {
      prop: "changeQuantity",
      label: "处理结果",
      width: 120,
      formatter: (row: ITableRow) => {
        return EnumResultNameMap[row.reviewResult] ?? "--"
      }
    }
  ]
})
const queryConfig: ITableRequestConfig<[IParams], ITableRow, false> = {
  api: getDefectReviewTaskDivide,
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
