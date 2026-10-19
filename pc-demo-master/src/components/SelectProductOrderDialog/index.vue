<!--生产订单选择-->
<template>
  <CustomDialog v-model="visible" title="选择生产订单" size="large" @close="onCancelClick">
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

    <slot name="extra"></slot>

    <template #footer>
      <el-button @click="onCancelClick">取消</el-button>
      <el-button type="primary" @click="onConfirmClick()">确定</el-button>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import { queryProductOrderPageList, requestProductionOrderListByIds } from "@/api/scheduling"
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
import {
  EnumProductionOrderSource,
  EnumProductionOrderSourceMap,
  EnumProductionOrderType,
  EnumProductionOrderTypeMap
} from "@/constant/enums"
import { FORMAT_DATE, FORMAT_TIME, TIME_RANGE } from "@/constant/time"
import { SelectType } from "@/components/SelectFactoryModel/types"
import type {
  IProductionOrderPageItem as ITableRow,
  IProductionOrderPageParams
} from "@/types/production-manage/product-order"

import type { IProductOrderDialogEmits, IProductOrderDialogProps } from "./type"

defineOptions({
  name: "SelectProductOrder"
})

const props = withDefaults(defineProps<IProductOrderDialogProps>(), {
  rowKey: "id",
  multiple: false,
  onlyReviewed: false,
  containRewordOrReform: false
})
const emits = defineEmits<IProductOrderDialogEmits>()

const { searchList, resetForm, getFormData } = useSearchForm<{
  no: string
  types: number[]
  source: number
  productModelNo: string
  productModelName: string
  productionUnitIds: string[]
  startDate: string
  endDate: string
}>([
  {
    type: EnumComponentType.Input,
    label: "订单号",
    key: "no",
    value: "",
    placeholder: "请输入订单号"
  },
  {
    type: EnumComponentType.Select,
    label: "类型",
    key: "types",
    value: "",
    placeholder: "请选择类型",
    options: Object.entries(EnumProductionOrderTypeMap).map(([key, value]) => ({
      label: value,
      value: +key
    })),
    multiple: true,
    maxTag: 3
  },
  {
    type: EnumComponentType.Select,
    label: "来源",
    key: "source",
    value: "",
    placeholder: "请选择来源",
    options: Object.entries(EnumProductionOrderSourceMap).map(([key, value]) => ({
      label: value,
      value: +key
    }))
  },
  {
    type: EnumComponentType.Input,
    label: "产品编号",
    key: "productModelNo",
    value: "",
    placeholder: "请输入产品编号"
  },
  {
    type: EnumComponentType.Input,
    label: "产品名称",
    key: "productModelName",
    value: "",
    placeholder: "请输入产品名称"
  },
  {
    type: EnumComponentType.Area,
    label: "生产单元",
    key: "productionUnitIds",
    value: [],
    placeholder: "请选择生产单元",
    props: {
      areaType: SelectType.ProductType,
      isEnable: true,
      multiple: true
    },
    style: {
      width: 240
    }
  },
  {
    type: EnumComponentType.Date,
    dateType: "daterange",
    label: "创建日期",
    key: "date",
    value: ["", ""],
    placeholder: ["开始日期", "结束日期"],
    format: FORMAT_DATE,
    valueFormat: FORMAT_TIME,
    defaultTime: TIME_RANGE,
    keyword: ["startDate", "endDate"]
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
      label: "订单号",
      minWidth: 160
    },
    {
      prop: "type",
      label: "类型",
      minWidth: 90,
      align: "center",
      formatter: ({ type }) => EnumProductionOrderTypeMap[type as EnumProductionOrderType]
    },
    {
      prop: "source",
      label: "来源",
      minWidth: 90,
      align: "center",
      formatter: ({ source }) => EnumProductionOrderSourceMap[source as EnumProductionOrderSource]
    },
    // {
    //   prop: "status",
    //   label: "状态",
    //   minWidth: 90,
    //   align: "center",
    //   formatter: ({ status }) => EnumProductionOrderStatusMap[status as EnumProductionOrderStatus]
    // },
    {
      prop: "productModel.name",
      label: "产品名称",
      minWidth: 160
    },
    {
      prop: "productModel.code",
      label: "产品编号",
      minWidth: 160
    },
    {
      prop: "deliveryDate",
      label: "交货日期",
      minWidth: 120,
      align: "center"
    },
    {
      prop: "orderAmount",
      label: "订单数量",
      minWidth: 120,
      align: "right"
    },
    {
      prop: "planAmount",
      label: "排产数量",
      minWidth: 120,
      align: "right"
    },
    {
      prop: "completeAmount",
      label: "完工数量",
      minWidth: 120,
      align: "right"
    },
    {
      prop: "unitItem.unitName",
      label: "单位",
      minWidth: 90,
      align: "center"
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
const queryConfig: ITableRequestConfig<[IProductionOrderPageParams], ITableRow, true> = {
  api: queryProductOrderPageList,
  getParams: () => {
    const { startDate, endDate, ...rest } = getFormData()
    return [
      {
        pageQuery: {
          pageNum: pagination.currentPage,
          pageSize: pagination.pageSize
        },
        queryParam: {
          ...rest,
          status: props.onlyReviewed ? 1 : undefined,
          productionMethod: props.productionMethod,
          containRewordOrReform: props.containRewordOrReform
        },
        dateRange: {
          startDate,
          endDate
        },
        sort: [
          {
            field: "deliveryDate",
            order: "asc"
          }
        ]
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
  set: (val) => emits("update:modelValue", val)
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
          ? tableRef.value?.setSelectedRows(props.selectedRowKeys, getSelectedProductOrderList)
          : tableRef.value?.setSelectedRow(props.selectedRowKeys?.[0], getSelectedProductOrderList)
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

/** 获取产品订单所有数据 */
const getSelectedProductOrderList = async () => {
  const data = await requestProductionOrderListByIds({
    idList: props.selectedRowKeys
  })
  return data
}

/** 取消操作 */
const onCancelClick = () => {
  visible.value = false
  emits("cancel")
}

/** 提交操作 */
const onConfirmClick = () => {
  const formData = getFormData()
  const productionUnitIds = Array.isArray(formData.productionUnitIds) ? formData.productionUnitIds : []
  if (!props.multiple) {
    const selectedRow = tableRef.value?.getCurrentSingleRow() as ITableRow
    if (!selectedRow) {
      return ElMessage.warning("请选择生产订单")
    }
    if (props.beforeConfirm && !props.beforeConfirm()) return
    emits("success", cloneDeep([{ ...selectedRow, productionUnitIds } as any]))
  } else {
    const selectedRows = tableRef.value?.getCurrentMultipleRows() as ITableRow[]
    if (!selectedRows?.length) {
      return ElMessage.warning("请选择生产订单")
    }
    if (props.beforeConfirm && !props.beforeConfirm()) return
    emits("success", cloneDeep(selectedRows.map((row) => ({ ...row, productionUnitIds } as any))))
  }
  visible.value = false
}
</script>

<style scoped lang="scss"></style>
