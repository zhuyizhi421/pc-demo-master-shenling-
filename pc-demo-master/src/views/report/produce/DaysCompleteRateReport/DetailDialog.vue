<template>
  <CustomDialog v-model="visible" title="详情" size="large">
    <CustomTable
      ref="tableRef"
      v-model:table-data="tableData"
      :config="tableConfig"
      :query-config="queryConfig"
    >
    </CustomTable>
  </CustomDialog>
</template>

<script setup lang="ts">
import { requestDaysCompleteRateDetail } from "@/api/report/produce/daysCompleteRateReport"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import type { IDaysCompleteRateDetailParams } from "@/types/report/produce/daysCompleteRateReport"

type ITableRow = {}

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    date: string
    entityId: string
  }>(),
  {}
)
const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val)
})

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      nextTick(() => {
        tableRef.value?.requestData()
      })
    }
  }
)

const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: 500,
  columns: [
    {
      prop: "taskNo",
      label: "任务单号",
      minWidth: 160
    },
    {
      prop: "orderNo",
      label: "订单单号",
      minWidth: 160
    },
    {
      prop: "productModelNo",
      label: "产品编号",
      minWidth: 160
    },
    {
      prop: "productModelName",
      label: "产品名称",
      minWidth: 160
    },
    {
      prop: "plannedQuantity",
      label: "计划加工数量",
      minWidth: 140,
      align: "right"
    },
    {
      prop: "completedQuantity",
      label: "完工数量",
      minWidth: 140,
      align: "right"
    },
    {
      prop: "unitName",
      label: "单位",
      minWidth: 90,
      align: "center"
    },
    {
      prop: "completionRate",
      label: "完成率",
      minWidth: 120,
      align: "right",
      formatter: ({ completionRate }) => `${completionRate}%`
    }
  ],
  showSummary: true,
  summaryMethod: (params) => {
    return params.columns.map((item) => {
      if (item.property === "taskNo") {
        return "合计"
      } else if (item.property === "plannedQuantity" || item.property === "completedQuantity") {
        return params.data.reduce((acc, cur) => acc + cur[item.property], 0)
      } else {
        return
      }
    })
  }
})
const queryConfig: ITableRequestConfig<[IDaysCompleteRateDetailParams], ITableRow, false> = {
  api: requestDaysCompleteRateDetail,
  getParams: () => {
    return [
      {
        date: props.date,
        entityId: props.entityId
      }
    ]
  }
}
</script>

<style lang="scss" scoped></style>
