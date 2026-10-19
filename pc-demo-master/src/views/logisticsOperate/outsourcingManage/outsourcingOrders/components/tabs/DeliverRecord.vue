<!-- 委外订单 - 收货记录 -->
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
import { productDeliveryInfo } from "@/api/logistics/delegate"
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
      prop: "receiveNo",
      label: "收货单号",
      minWidth: 160
    },
    {
      prop: "receiveTime",
      label: "收货时间",
      minWidth: 160,
      align: "center"
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
      label: "收货数量",
      minWidth: 120,
      align: "right",
      formatter: ({ quantity, decimalNumber }) => precisionConversion(quantity, decimalNumber)
    },
    {
      prop: "unitName",
      label: "单位",
      minWidth: 120,
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
  api: productDeliveryInfo,
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
