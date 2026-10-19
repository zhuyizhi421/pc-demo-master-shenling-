<template>
  <CustomDialog
    v-model="dialogVisible"
    @close="emits('update:modelValue', false)"
    title="选择采购订单"
    size="large"
  >
    <CustomSearchForm
      :form-list="searchList"
      @search="onSubmit"
      @reset="onReset"
    ></CustomSearchForm>

    <div class="top-table-box">
      <CustomTable
        ref="tableRef"
        v-model:table-data="tableData"
        v-model:total="pagination.total"
        :config="tableConfig"
        :query-config="queryConfig"
        @current-change="onChooseOrder"
      >
        <template #operation-default>
          <el-button link type="primary">查看</el-button>
        </template>
      </CustomTable>
      <CustomPagination
        v-model:currentPage="pagination.currentPage"
        v-model:pageSize="pagination.pageSize"
        :total="pagination.total"
        :border="false"
        @change="tableRef?.requestData()"
      />
    </div>

    <template v-if="inventoryTable.length">
      <CustomTitle title="采购清单" style="margin-top: 0px"></CustomTitle>
      <CustomTable
        ref="inventoryTableRef"
        v-model:table-data="inventoryTable"
        :config="inventoryTableConfig"
      >
        <template #operation-default>
          <el-button link type="primary">查看</el-button>
        </template>
      </CustomTable>
    </template>

    <template #footer>
      <el-button @click="emits('update:modelValue', false)">取消</el-button>
      <el-button type="primary" @click="onConfirm">确定</el-button>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import { getLogPurchaseItemDetail, queryPurchaseOrderPageList } from "@/api/logistics/purchase"
import { querySupplierPageList } from "@/api/supplier"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomPagination from "@/components/CustomPagination/index.vue"
import useSearchForm from "@/components/CustomSearchForm/hooks/index"
import CustomSearchForm from "@/components/CustomSearchForm/index.vue"
import { EnumComponentType, type ISearchItem } from "@/components/CustomSearchForm/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import { EnumPurchaseOrderStatus, EnumPurchaseOrderStatusMap } from "@/constant/enums"
import type { IOption } from "@/types/common"
import type { IInventoryListItem } from "@/types/logistics/inventory"
import type {
  IPurchaseOrderPageListItem as ITableRow,
  IPurchaseOrderPageListParams
} from "@/types/logistics/purchase"
import { precisionConversion } from "@/utils/common"

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    supplierId: string | number
    supplierCode: string
  }>(),
  {
    modelValue: false,
    supplierId: "",
    supplierCode: ""
  }
)
const emits = defineEmits(["update:modelValue", "confirm"])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emits("update:modelValue", val)
})

const supplierOptions = ref<IOption[]>([])

const searchFormData = computed<ISearchItem[]>(() => [
  {
    type: EnumComponentType.Input,
    key: "purchaseCode",
    label: "采购单号",
    value: "",
    placeholder: "请输入采购单号"
  },
  {
    type: EnumComponentType.Select,
    key: "purchaseStatus",
    label: "状态",
    value: "",
    placeholder: "请选择状态",
    options: [
      {
        label: "进行中",
        value: 1
      },
      {
        label: "已结案",
        value: 2
      }
    ]
  },
  {
    type: EnumComponentType.Select,
    label: "供应商名称",
    key: "supplierId",
    value: "",
    placeholder: "请选择供应商名称",
    options: supplierOptions
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  purchaseCode: string
  purchaseStatus: number
  supplierId: string
}>(searchFormData.value)

const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "220px",
  highlightCurrentRow: true,
  columns: [
    {
      prop: "purchaseCode",
      label: "采购单号",
      minWidth: 160
    },
    {
      prop: "dataSource",
      label: "来源",
      width: 120,
      align: "center",
      formatter: (row: ITableRow) => {
        return row.dataSource === 1 ? "MES" : "ERP"
      }
    },
    {
      prop: "purchaseStatus",
      label: "状态",
      width: 120,
      align: "center",
      formatter: (row: ITableRow) => {
        return EnumPurchaseOrderStatusMap[row.purchaseStatus as EnumPurchaseOrderStatus]
      }
    },
    {
      prop: "supplierName",
      label: "供应商名称",
      minWidth: 160
    },
    {
      prop: "purchaseContent",
      label: "采购内容",
      minWidth: 160
    },
    {
      prop: "operation",
      label: "操作",
      width: 90,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

const chooseTableData = ref({} as ITableRow)

const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const inventoryTableRef = ref<ComponentExposed<typeof CustomTable>>()
const inventoryTable = ref<IInventoryListItem[]>([])
const inventoryTableConfig = ref<ITableConfig>({
  height: "220px",
  highlightCurrentRow: true,
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
      prop: "productCategoryName",
      label: "产品类别",
      minWidth: 160
    },
    {
      prop: "quantity",
      label: "采购数量",
      width: 120,
      align: "right",
      formatter: (row: IInventoryListItem) => {
        return row.quantity || row.quantity == 0
          ? precisionConversion(row.quantity, row?.decimalNumber ?? 2)
          : ""
      }
    },
    {
      prop: "inboundQuantity",
      label: "入库数量",
      width: 120,
      align: "right",
      formatter: (row: IInventoryListItem) => {
        return row.inboundQuantity || row.inboundQuantity == 0
          ? precisionConversion(row.inboundQuantity, row?.decimalNumber ?? 2)
          : ""
      }
    },
    {
      prop: "unitName",
      label: "单位",
      width: 120,
      align: "center"
    },
    {
      prop: "selection",
      label: "操作",
      width: 55,
      align: "center",
      type: "selection",
      multiple: true
    }
  ]
})

const onSubmit = () => {
  pagination.currentPage = 1
  tableRef.value?.requestData()
}

const onReset = () => {
  resetForm()
  onSubmit()
}

// 选择某条采购订单
const onChooseOrder = async (data: ITableRow) => {
  inventoryTableRef.value?.clearSelectedRow()
  inventoryTable.value = []
  chooseTableData.value = data
  const res = await getLogPurchaseItemDetail({
    purchaseId: data.id
  })
  inventoryTable.value = res as any
}

// 确定
const onConfirm = () => {
  const multipleSelection =
    inventoryTableRef.value?.getCurrentMultipleRows() as IInventoryListItem[]
  if (multipleSelection.length == 0) {
    return ElMessage.warning("请选择至少一条采购清单")
  }
  emits(
    "confirm",
    multipleSelection.map((item) => ({
      ...item,
      relatedPurchaseTaskCode: chooseTableData.value.purchaseCode
    }))
  )
}

const queryConfig: ITableRequestConfig<[IPurchaseOrderPageListParams], ITableRow, true> = {
  api: queryPurchaseOrderPageList,
  getParams: () => {
    const { purchaseStatus, ...rest } = getFormData()
    return [
      {
        pageNum: pagination.currentPage,
        pageSize: pagination.pageSize,
        ...rest,
        purchaseStatus: purchaseStatus ? purchaseStatus : undefined,
        purchaseStatusList: purchaseStatus ? undefined : [1, 2]
      }
    ]
  }
}

/** 获取供应商下拉 */
const getSupplierOptions = async () => {
  const { records } = await querySupplierPageList({ pageNum: 1, pageSize: 1000 })
  supplierOptions.value = records.map((item) => ({
    label: item.supplierName || item.supplierAbbr,
    value: item.id
  }))
}

watch(
  () => props.modelValue,
  async (val) => {
    try {
      if (val) {
        getSupplierOptions()
        searchList.value.find((item) => item.key === "supplierId")!.value = props.supplierId
        await nextTick()
        tableRef.value?.requestData()
      } else {
        resetForm()
        tableData.value = []
        inventoryTable.value = []
        chooseTableData.value = {} as ITableRow
        inventoryTableRef.value?.clearSelectedRow()
      }
    } catch (error) {
      /* empty */
    }
  }
)
</script>

<style scoped lang="scss"></style>
