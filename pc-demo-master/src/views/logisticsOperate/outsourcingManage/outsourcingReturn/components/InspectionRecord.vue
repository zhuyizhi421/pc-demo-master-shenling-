<template>
  <CustomTable
    ref="tableRef"
    v-model:tableData="tableData"
    :config="tableConfig"
    :query-config="queryConfig"
  >
  </CustomTable>
  <CustomPagination
    v-model:currentPage="pagination.currentPage"
    v-model:pageSize="pagination.pageSize"
    :total="pagination.total"
    :border="false"
    @change="tableRef?.requestData()"
  />
</template>
<script setup lang="ts">
import { getOutsourcingReturnInspectionRecord } from "@/api/logistics/delegate"
import CustomPagination from "@/components/CustomPagination/index.vue"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import {
  EnumProductInspectionType,
  EnumProductInspectionTypeMap,
  EnumReturnResultType,
  EnumReturnResultTypeMap
} from "@/constant/enums"
import type { IRequestPageParams } from "@/types/common"
import type { IDelegateReturnInpsectionRecordVo as ITableRow } from "@/types/logistics/delegate"
import { precisionConversion } from "@/utils/common"

const statusMap = {
  0: "未开始",
  1: "进行中",
  2: "已完结"
}

const props = withDefaults(
  defineProps<{
    selectId: string
  }>(),
  {
    selectId: ""
  }
)

const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "taskNo",
      label: "检验单号",
      minWidth: 160
    },
    {
      prop: "type",
      label: "检验类型",
      width: 120,
      align: "center",
      formatter: ({ type }) => {
        return EnumProductInspectionTypeMap[type as EnumProductInspectionType]
      }
    },
    {
      prop: "status",
      label: "状态",
      width: 120,
      align: "center",
      formatter: ({ status }) => {
        return statusMap[status as 0 | 1 | 2]
      }
    },
    {
      prop: "result",
      label: "结果",
      width: 120,
      align: "center",
      formatter: ({ result }) => {
        return EnumReturnResultTypeMap[result as EnumReturnResultType]
      }
    },
    {
      prop: "sampleNumber",
      label: "样本数",
      width: 120,
      align: "right"
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
      label: "数量",
      width: 120,
      align: "right",
      formatter: ({ quantity, decimalNumber }) => precisionConversion(quantity, decimalNumber)
    },
    {
      prop: "unitName",
      label: "单位",
      width: 120,
      align: "center"
    }
  ]
})

const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

onMounted(() => {
  tableRef.value?.requestData()
})

const queryConfig: ITableRequestConfig<
  [
    IRequestPageParams<{
      id?: string
    }>
  ],
  ITableRow,
  true
> = {
  api: getOutsourcingReturnInspectionRecord,
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
</script>
