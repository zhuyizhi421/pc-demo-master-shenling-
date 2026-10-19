<template>
  <CustomTable
    ref="tableRef"
    v-model:tableData="tableData"
    :config="tableConfig"
    :query-config="queryConfig"
  >
    <template #operation-default="{ row }">
      <el-button type="primary" link :disabled="!row.barcode" @click="printBarcode([row.barcode])"
        >打印标签码</el-button
      >
    </template>
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
import { getOutsourcinglReturnStorageRecord } from "@/api/logistics/delegate"
import CustomPagination from "@/components/CustomPagination/index.vue"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import useBarcodePrint from "@/hooks/useBarcodePrint"
import type { IRequestPageParams } from "@/types/common"
import type { IDelegateReturnStorageVo as ITableRow } from "@/types/logistics/delegate"
import { precisionConversion } from "@/utils/common"

const props = withDefaults(
  defineProps<{
    selectId: string
    productModelId?: string
  }>(),
  {
    selectId: ""
  }
)

const { printBarcode } = useBarcodePrint()

const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "inboundCode",
      label: "入库单号",
      minWidth: 160
    },
    {
      prop: "inboundTime",
      label: "入库时间",
      width: 160
    },
    {
      prop: "facilityName",
      label: "仓库名称",
      width: 160
    },
    {
      prop: "locationName",
      label: "库位名称",
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
      prop: "quantity",
      label: "入库数量",
      width: 120,
      align: "right",
      formatter: ({ quantity, decimalNumber }) => precisionConversion(quantity, decimalNumber)
    },
    {
      prop: "unitName",
      label: "单位",
      width: 120,
      align: "center"
    },
    {
      prop: "barcode",
      label: "标签码",
      width: 120,
      align: "center"
    },
    {
      prop: "operation",
      label: "操作",
      width: 120,
      align: "center",
      fixed: "right",
      slots: {
        default: "operation-default"
      }
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
      productModelId?: string
    }>
  ],
  ITableRow,
  true
> = {
  api: getOutsourcinglReturnStorageRecord,
  getParams: () => {
    return [
      {
        pageQuery: {
          pageNum: pagination.currentPage,
          pageSize: pagination.pageSize
        },
        queryParam: {
          id: props.selectId,
          productModelId: props.productModelId
        }
      }
    ]
  }
}

const getList = () => {
  tableRef.value?.requestData()
}

defineExpose({
  getList
})
</script>
