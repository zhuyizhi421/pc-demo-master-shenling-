<!-- 根据产品模型id选择销售订单弹窗 -->
<template>
  <CustomDialog v-model="visible" title="选择销售订单" size="large">
    <CustomTable
      ref="tableRef"
      v-model:table-data="tableData"
      v-model:total="pagination.total"
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

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="onConfirmClick()">确定</el-button>
      </span>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import { requestSaleOrderListByIds, requestSaleOrderListByProduct } from "@/api/scheduling"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomPagination from "@/components/CustomPagination/index.vue"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import {
  EnumSaleOrderPriority,
  EnumSaleOrderPriorityMap,
  EnumSaleOrderStatus,
  EnumSaleOrderStatusMap
} from "@/constant/enums"
import type {
  IRequestSaleOrderListByProductReq,
  ISaleOrderItem as ITableRow
} from "@/types/production-manage/product-order"

import type { ISaleOrderDialogEmits, ISaleOrderDialogProps } from "./type"

defineOptions({
  name: "SelectSaleOrderDialog"
})

const props = withDefaults(defineProps<ISaleOrderDialogProps>(), {
  rowKey: "id",
  multiple: false
})

const emit = defineEmits<ISaleOrderDialogEmits>()

const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: 400,
  rowKey: props.rowKey,
  reserveSelection: true,
  columns: [
    {
      prop: "saleCode",
      label: "销售单号",
      minWidth: 160
    },
    {
      prop: "saleStatus",
      label: "状态",
      minWidth: 120,
      align: "center",
      formatter: ({ saleStatus }) => EnumSaleOrderStatusMap[saleStatus as EnumSaleOrderStatus]
    },
    {
      prop: "priority",
      label: "优先级",
      minWidth: 120,
      align: "center",
      formatter: ({ priority }) => EnumSaleOrderPriorityMap[priority as EnumSaleOrderPriority]
    },
    {
      prop: "customerName",
      label: "客户名称",
      minWidth: 160
    },
    {
      prop: "customerCode",
      label: "客户编号",
      minWidth: 160
    },
    {
      prop: "saleContent",
      label: "销售内容",
      minWidth: 160
    },
    {
      prop: "createTime",
      label: "创建时间",
      minWidth: 160,
      align: "center"
    },
    {
      prop: "selection",
      label: "选择",
      type: "selection",
      width: 60,
      align: "center",
      get multiple() {
        return props.multiple
      },
      fixed: "right",
      selectable: (row) => {
        return props.multiple ? !props.selectedRowKeys?.includes(row[props.rowKey]) : true
      }
    }
  ]
})
const queryConfig: ITableRequestConfig<[IRequestSaleOrderListByProductReq], ITableRow, true> = {
  api: requestSaleOrderListByProduct,
  getParams: () => {
    return [
      {
        queryParam: {
          id: props.productId
        },
        pageQuery: {
          pageNum: pagination.currentPage,
          pageSize: pagination.pageSize
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

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val)
})

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      nextTick(() => {
        tableRef.value?.requestData()

        if (!props.selectedRowKeys?.length) {
          return
        }
        props.multiple
          ? tableRef.value?.setSelectedRows(props.selectedRowKeys, getSelectedSaleOrderList)
          : tableRef.value?.setSelectedRow(props.selectedRowKeys?.[0], getSelectedSaleOrderList)
      })
    } else {
      tableData.value = []
      tableRef.value?.clearSelectedRow()
    }
  }
)

/** 获取指定id列表的销售订单列表 */
const getSelectedSaleOrderList = async () => {
  const data = await requestSaleOrderListByIds({
    idList: props.selectedRowKeys
  })
  return data
}

/** 提交操作 */
const onConfirmClick = () => {
  if (!props.multiple) {
    const selectedRow = tableRef.value?.getCurrentSingleRow() as ITableRow
    if (!selectedRow) {
      return ElMessage.warning("请选择销售订单")
    }
    emit("success", cloneDeep([selectedRow]))
  } else {
    const selectedRows = tableRef.value?.getCurrentMultipleRows() as ITableRow[]
    if (!selectedRows?.length) {
      return ElMessage.warning("请选择销售订单")
    }
    emit("success", cloneDeep(selectedRows))
  }
  visible.value = false
}
</script>

<style lang="scss" scoped></style>
