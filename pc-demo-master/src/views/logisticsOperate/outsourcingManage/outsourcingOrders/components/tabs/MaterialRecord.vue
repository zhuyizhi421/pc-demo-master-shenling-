<!-- 委外订单 - 物料清单 -->
<template>
  <CustomTable
    ref="tableRef"
    v-model:tableData="tableData"
    v-model:total="pagination.total"
    :config="tableConfig"
    :queryConfig="queryConfig"
  >
    <template #operation-default="{ row }">
      <el-button link type="primary" size="small" @click="changeTab(row.productModelId, 'outbind')"
        >出库记录</el-button
      >
      <el-button
        link
        type="primary"
        size="small"
        @click="changeTab(row.productModelId, 'returnMaterial')"
        >退料记录</el-button
      >
    </template>
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
import { getProductMaterialList } from "@/api/logistics/delegate"
import CustomPagination from "@/components/CustomPagination/index.vue"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import type { IRequestPageParams } from "@/types/common"
import type { IDelegateOrderMaterialItem as ITableRow } from "@/types/logistics/delegate"
import { precisionConversion } from "@/utils/common"

const props = withDefaults(
  defineProps<{
    selectId: string
  }>(),
  {
    selectId: ""
  }
)

const emits = defineEmits<{
  (e: "changeTab", id: string, tab: string): void
}>()

const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
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
      prop: "deliveryAmount",
      label: "出库数量",
      minWidth: 120,
      align: "right",
      formatter: ({ deliveryAmount, decimalNumber }) =>
        precisionConversion(deliveryAmount, decimalNumber)
    },
    {
      prop: "returnAmount",
      label: "退料数量",
      minWidth: 120,
      align: "right",
      formatter: ({ returnAmount, decimalNumber }) =>
        precisionConversion(returnAmount, decimalNumber)
    },
    {
      prop: "unitName",
      label: "单位",
      minWidth: 120,
      align: "center"
    },
    {
      prop: "operation",
      label: "操作",
      width: 160,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
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
  api: getProductMaterialList,
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

//跳转到出库记录和退料记录
const changeTab = (id: string, tab: string) => {
  emits("changeTab", id, tab)
}
</script>

<style lang="scss" scoped>
.pagination {
  width: calc(100% + 40px);
  margin-left: -20px;
}
</style>
