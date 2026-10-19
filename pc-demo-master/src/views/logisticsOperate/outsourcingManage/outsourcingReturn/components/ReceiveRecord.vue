<!-- 委外退料 - 收货记录 -->
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
import { getOutsourcinglReturnRecieveRecord } from "@/api/logistics/delegate"
import CustomPagination from "@/components/CustomPagination/index.vue"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import type { IRequestPageParams } from "@/types/common"
import type { IDelegateReturnReceiveRecordVo as ITableRow } from "@/types/logistics/delegate"
import { precisionConversion } from "@/utils/common"

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
      prop: "code",
      label: "收货单号",
      minWidth: 160
    },
    {
      prop: "receiveTime",
      label: "收货时间",
      width: 160
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
      prop: "receiveAmount",
      label: "收货数量",
      width: 120,
      align: "right",
      formatter: ({ receiveAmount, decimalNumber }) =>
        precisionConversion(receiveAmount, decimalNumber)
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
  api: getOutsourcinglReturnRecieveRecord,
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
