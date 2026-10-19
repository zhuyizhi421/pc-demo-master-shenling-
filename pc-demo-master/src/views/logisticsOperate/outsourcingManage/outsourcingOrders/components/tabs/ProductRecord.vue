<!-- 委外订单 - 产品清单 -->
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
import { queryOutOrderProductPageList } from "@/api/logistics/delegate"
import CustomPagination from "@/components/CustomPagination/index.vue"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import type { IRequestPageParams } from "@/types/common"
import type { IOutOrderProductItem as ITableRow } from "@/types/logistics/delegate"
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
      prop: "amount",
      label: "委外数量",
      minWidth: 120,
      align: "right",
      formatter: ({ amount, decimalNumber }) => precisionConversion(amount, decimalNumber)
    },
    {
      prop: "receiveAmount",
      label: "收货数量",
      minWidth: 120,
      align: "right",
      formatter: ({ receiveAmount, decimalNumber }) =>
        precisionConversion(receiveAmount, decimalNumber)
    },
    {
      prop: "inboundAmount",
      label: "入库数量",
      minWidth: 120,
      align: "right",
      formatter: ({ inboundAmount, decimalNumber }) =>
        precisionConversion(inboundAmount, decimalNumber)
    },
    {
      prop: "unitName",
      label: "单位",
      minWidth: 90,
      align: "center"
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
  api: queryOutOrderProductPageList,
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
