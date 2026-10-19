<!-- 委外订单 - 出库记录 -->
<template>
  <div class="top-operation">
    <el-select
      v-model="curProductionId"
      placeholder="请按物料筛选"
      @change="tableRef?.requestData()"
      clearable
      style="width: 200px"
    >
      <el-option
        v-for="item in productionOptions"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>
  </div>
  <CustomTable
    ref="tableRef"
    v-model:tableData="tableData"
    v-model:total="pagination.total"
    :config="tableConfig"
    :queryConfig="queryConfig"
  >
  </CustomTable>
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
import { getOutsourcinglMaterialList, getProductOutboundList } from "@/api/logistics/delegate"
import CustomPagination from "@/components/CustomPagination/index.vue"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import type { IRequestPageParams } from "@/types/common"
import type { IDelegateOrderoutboundItem as ITableRow } from "@/types/logistics/delegate"
import { precisionConversion } from "@/utils/common"

const props = withDefaults(
  defineProps<{
    selectId: string
    productModelId: string
  }>(),
  {
    selectId: "",
    productModelId: ""
  }
)

const curProductionId = ref<string>("") // 当前选择的物料ID
const productionOptions = ref<{ label: string; value: string }[]>([]) // 物料清单下来列表

const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "outboundCode",
      label: "出库单号",
      minWidth: 160
    },
    {
      prop: "outboundTime",
      label: "出库时间",
      minWidth: 160,
      align: "center"
    },
    {
      prop: "facilityName",
      label: "仓库名称",
      minWidth: 160
    },
    {
      prop: "locationName",
      label: "库位名称",
      minWidth: 160
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
      label: "出库数量",
      minWidth: 100,
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
      productModelId?: string
    }>
  ],
  ITableRow,
  true
> = {
  api: getProductOutboundList,
  getParams: () => {
    return [
      {
        pageQuery: {
          pageNum: pagination.currentPage,
          pageSize: pagination.pageSize
        },
        queryParam: {
          id: props.selectId,
          productModelId: curProductionId.value
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
  curProductionId.value = props.productModelId
  getProductList()
  tableRef.value?.requestData()
})

// 获取物料列表
const getProductList = async () => {
  const res = await getOutsourcinglMaterialList({ id: props.selectId })
  productionOptions.value = res.map((item) => {
    return {
      label: item.productModelName,
      value: item.productModelId
    }
  })
}
</script>

<style lang="scss" scoped>
.top-operation {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 12px;
}

.pagination {
  width: calc(100% + 40px);
  margin-left: -20px;
}
</style>
