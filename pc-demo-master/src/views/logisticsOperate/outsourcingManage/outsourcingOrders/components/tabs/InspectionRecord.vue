<!-- 委外订单 - 检验记录 -->
<template>
  <CustomTable
    ref="tableRef"
    v-model:tableData="tableData"
    v-model:total="pagination.total"
    :config="tableConfig"
    :queryConfig="queryConfig"
  ></CustomTable>
  <CustomPagination
    class="pagination"
    v-model:currentPage="pagination.currentPage"
    v-model:pageSize="pagination.pageSize"
    :total="pagination.total"
    :border="false"
    @change="tableRef?.requestData()"
  />
</template>
<script setup lang="ts">
import { requestInspectionRecordInfo } from "@/api/logistics/delegate"
import CustomPagination from "@/components/CustomPagination/index.vue"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import { EnumProductInspectionType, EnumProductInspectionTypeMap } from "@/constant/enums"
import type { IRequestPageParams } from "@/types/common"
import type { LogisticsDelegateInspectionRecordVo as ITableRow } from "@/types/logistics/delegate"
import { precisionConversion } from "@/utils/common"

const props = withDefaults(
  defineProps<{
    selectId: string
  }>(),
  {
    selectId: ""
  }
)

const EnumStatus: Record<number, string> = {
  0: "未开始",
  1: "进行中",
  2: "已完成"
}

const EnumResult: Record<number, string> = {
  0: "结果未出",
  1: "通过",
  2: "不通过"
}

const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "taskNo",
      label: "任务单号",
      minWidth: 160
    },
    {
      prop: "type",
      label: "检验类型",
      minWidth: 120,
      align: "center",
      formatter: (row: ITableRow) =>
        EnumProductInspectionTypeMap[row.type as EnumProductInspectionType]
    },
    {
      prop: "productName",
      label: "产品名称",
      minWidth: 160
    },
    {
      prop: "quantity",
      label: "数量",
      minWidth: 120,
      align: "right",
      formatter: ({ quantity, decimalNumber }) => precisionConversion(quantity, decimalNumber)
    },
    {
      prop: "sampleNumber",
      label: "样本数",
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
      prop: "result",
      label: "结果",
      minWidth: 120,
      align: "center",
      formatter: (row: ITableRow) => EnumResult[row.result]
    },
    {
      prop: "status",
      label: "状态",
      minWidth: 120,
      align: "center",
      formatter: (row: ITableRow) => EnumStatus[row.status]
    }
  ]
})
const queryConfig: ITableRequestConfig<
  [
    IRequestPageParams<{
      id: string
    }>
  ],
  ITableRow,
  true
> = {
  api: requestInspectionRecordInfo,
  getParams: () => {
    return [
      {
        pageQuery: {
          pageNum: pagination.currentPage,
          pageSize: pagination.pageSize
        },
        queryParam: {
          id: props.selectId
        }
      }
    ]
  }
}
const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

onMounted(() => {
  tableRef.value?.requestData()
})
</script>

<style lang="scss" scoped>
.pagination {
  width: calc(100% + 40px);
  margin-left: -20px;
}
</style>
