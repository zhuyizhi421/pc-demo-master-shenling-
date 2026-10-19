<!--生产批次选择-->
<template>
  <CustomDialog v-model="visible" title="选择生产批次" size="large" @close="onCancelClick">
    <CustomSearchForm :form-list="searchList" @search="onSubmit" @reset="onReset" />

    <CustomTable
      ref="tableRef"
      v-model:table-data="tableData"
      v-model:total="pagination.total"
      :config="tableConfig"
      :query-config="queryConfig"
    />

    <CustomPagination
      v-model:currentPage="pagination.currentPage"
      v-model:pageSize="pagination.pageSize"
      :total="pagination.total"
      :border="false"
      @change="tableRef?.requestData()"
    />

    <template #footer>
      <el-button @click="onCancelClick">取消</el-button>
      <el-button type="primary" @click="onConfirmClick">确定</el-button>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import { queryProductBatchPageList } from "@/api/logistics/batch"
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
import { EnumBatchModelType, EnumBatchModelTypeMap } from "@/constant/enums"
import type {
  IProductBatchPageListItem as ITableRow,
  IProductBatchPageListParams
} from "@/types/logistics/batch"
import { precisionConversion } from "@/utils/common"

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    selectedRowKeys?: string[]
  }>(),
  {
    selectedRowKeys: () => []
  }
)

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
  (e: "success", rows: ITableRow[]): void
  (e: "cancel"): void
}>()

const { searchList, resetForm, getFormData } = useSearchForm<{
  batchNo: string
  productModelName: string
  productionOrderNo: string
  processSerial: string
}>([
  {
    type: EnumComponentType.Input,
    label: "批次号",
    key: "batchNo",
    value: "",
    placeholder: "请输入批次号"
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
    label: "生产订单",
    key: "productionOrderNo",
    value: "",
    placeholder: "请输入生产订单"
  },
  {
    type: EnumComponentType.Select,
    label: "工序",
    key: "processSerial",
    value: "",
    placeholder: "请选择工序",
    options: [
      { label: "10", value: "10" },
      { label: "20", value: "20" },
      { label: "30", value: "30" },
      { label: "40", value: "40" },
      { label: "CR-001", value: "CR-001" }
    ],
    clearable: true
  }
])

const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: 400,
  rowKey: "id",
  columns: [
    {
      prop: "batchNo",
      label: "批次号",
      minWidth: 160,
      showOverflowTooltip: true
    },
    {
      prop: "productionInfo.techVersionNo",
      label: "工序",
      minWidth: 100,
      align: "center",
      showOverflowTooltip: true
    },
    {
      prop: "productionInfo.productionOrderNo",
      label: "生产订单",
      minWidth: 160,
      showOverflowTooltip: true
    },
    {
      prop: "batchType",
      label: "批次类型",
      minWidth: 110,
      align: "center",
      formatter: ({ batchType }) => EnumBatchModelTypeMap[batchType as EnumBatchModelType]
    },
    {
      prop: "productModelName",
      label: "产品名称",
      minWidth: 160,
      showOverflowTooltip: true
    },
    {
      prop: "productModelSpec",
      label: "产品规格",
      minWidth: 160,
      formatter: (row: any) => row.productModelSpec || row.productModel?.specification || "-"
    },
    {
      prop: "productModelCode",
      label: "产品编号",
      minWidth: 160,
      showOverflowTooltip: true
    },
    {
      prop: "batchQuantity",
      label: "批次数量",
      minWidth: 120,
      align: "right",
      formatter: ({ batchQuantity, decimalNumber }) =>
        precisionConversion(batchQuantity, decimalNumber)
    },
    {
      prop: "unitName",
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
      fixed: "right",
      multiple: false
    }
  ]
})

const queryConfig: ITableRequestConfig<[IProductBatchPageListParams], ITableRow, true> = {
  api: queryProductBatchPageList,
  getParams: () => [
    {
      ...getFormData(),
      batchType: "2",
      pageNum: pagination.currentPage,
      pageSize: pagination.pageSize
    }
  ]
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

const onCancelClick = () => {
  visible.value = false
  emit("cancel")
}

const onConfirmClick = () => {
  const selectedRow = tableRef.value?.getCurrentSingleRow() as ITableRow
  if (!selectedRow) {
    return ElMessage.warning("请选择生产批次")
  }
  emit("success", cloneDeep([selectedRow]))
  visible.value = false
}
</script>
