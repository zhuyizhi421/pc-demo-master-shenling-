<!-- 选择委外订单弹窗 -->
<template>
  <CustomDialog v-model="dialogVisible" title="选择订单" size="large">
    <CustomSearchForm
      :form-list="searchList"
      @search="onSubmit"
      @reset="onReset"
    ></CustomSearchForm>

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
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="onConfirmClick()">确定</el-button>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import {
  queryOutsourcingOrderPageList,
  requestOutsourcingOrderListByIds
} from "@/api/logistics/delegate"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomPagination from "@/components/CustomPagination/index.vue"
import useSearchForm from "@/components/CustomSearchForm/hooks/index"
import CustomSearchForm from "@/components/CustomSearchForm/index.vue"
import { EnumComponentType } from "@/components/CustomSearchForm/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import { EnumOutsourcingType, EnumOutsourcingTypeMap } from "@/constant/enums"
import type {
  DelegateOrder as ITableRow,
  IDelegateOrderPageParams
} from "@/types/logistics/delegate"

import type { IOutsourceOrderDialogEmits, IOutsourceOrderDialogProps } from "./type"

defineOptions({
  name: "SelectOutsourceOrderDialog"
})

const props = withDefaults(defineProps<IOutsourceOrderDialogProps>(), {
  rowKey: "id",
  multiple: false,
  status: () => []
})

const emit = defineEmits<IOutsourceOrderDialogEmits>()

const { searchList, resetForm, getFormData } = useSearchForm<{
  no: string
  productModelName: string
  productModelNo: string
}>([
  {
    type: EnumComponentType.Input,
    label: "订单编号",
    key: "no",
    value: "",
    placeholder: "请输入订单编号"
  },
  {
    type: EnumComponentType.Input,
    label: "产品名称",
    key: "productModelName",
    value: "",
    placeholder: "请输入产品名称"
  },
  {
    type: EnumComponentType.Input,
    label: "产品编号",
    key: "productModelNo",
    value: "",
    placeholder: "请输入产品编号"
  }
])

const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: 400,
  rowKey: props.rowKey,
  reserveSelection: true,
  columns: [
    {
      prop: "no",
      label: "订单编号",
      minWidth: 160
    },
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
      prop: "delegateType",
      label: "订单类型",
      minWidth: 120,
      align: "center",
      formatter: ({ delegateType }) => EnumOutsourcingTypeMap[delegateType as EnumOutsourcingType]
    },
    {
      prop: "amount",
      label: "数量",
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
      prop: "remark",
      label: "备注",
      minWidth: 200
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
const queryConfig: ITableRequestConfig<[IDelegateOrderPageParams], ITableRow, true> = {
  api: queryOutsourcingOrderPageList,
  getParams: () => {
    return [
      {
        queryParam: {
          ...getFormData(),
          statues: props.status
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

const dialogVisible = computed({
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
          ? tableRef.value?.setSelectedRows(props.selectedRowKeys, getSelectedOutsourceOrderList)
          : tableRef.value?.setSelectedRow(
              props.selectedRowKeys?.[0],
              getSelectedOutsourceOrderList
            )
      })
    } else {
      resetForm()
      tableData.value = []
      tableRef.value?.clearSelectedRow()
    }
  }
)

const onSubmit = () => {
  pagination.currentPage = 1
  tableRef.value?.requestData()
}

const onReset = () => {
  resetForm()
  onSubmit()
}

/** 获取已选中委外订单列表数据 */
const getSelectedOutsourceOrderList = async () => {
  const data = await requestOutsourcingOrderListByIds({
    idList: props.selectedRowKeys
  })
  return data
}

/** 提交操作 */
const onConfirmClick = () => {
  if (!props.multiple) {
    const selectedRow = tableRef.value?.getCurrentSingleRow() as ITableRow
    if (!selectedRow) {
      return ElMessage.warning("请选择订单")
    }
    emit("success", cloneDeep([selectedRow]))
  } else {
    const selectedRows = tableRef.value?.getCurrentMultipleRows() as ITableRow[]
    if (!selectedRows?.length) {
      return ElMessage.warning("请选择订单")
    }
    emit("success", cloneDeep(selectedRows))
  }
  dialogVisible.value = false
}
</script>

<style lang="scss" scoped></style>
