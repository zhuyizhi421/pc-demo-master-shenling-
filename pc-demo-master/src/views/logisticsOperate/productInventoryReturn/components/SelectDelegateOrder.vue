<template>
  <CustomDialog
    v-model="dialogVisible"
    @close="emits('update:modelValue', false)"
    title="选择委外订单"
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
      <CustomTitle title="委外产品清单" style="margin-top: 0px"></CustomTitle>
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

import {
  queryOutOrderProductPageList,
  queryOutsourcingOrderPageList
} from "@/api/logistics/delegate"
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
import {
  EnumOutsourcingOrderStatus,
  EnumOutsourcingOrderStatusMap,
  EnumOutsourcingType,
  EnumOutsourcingTypeMap
} from "@/constant/enums"
import type { IOption } from "@/types/common"
import type {
  DelegateOrder as ITableRow,
  IDelegateOrderPageParams,
  IOutOrderProductItem
} from "@/types/logistics/delegate"
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

type OptionType = {
  label: string
  value: string | number
}
const OrderOptions = ref<OptionType[]>([
  {
    label: "订单委外",
    value: 3
  },
  {
    label: "工序委外",
    value: 4
  }
])

const supplierOptions = ref<IOption[]>([])

const searchFormData = computed<ISearchItem[]>(() => [
  {
    type: EnumComponentType.Input,
    key: "no",
    label: "委外单号",
    value: "",
    placeholder: "请输入委外单号"
  },
  {
    type: EnumComponentType.Select,
    key: "delegateType",
    label: "委外类型",
    value: "",
    placeholder: "请选择委外类型",
    options: OrderOptions
  },
  {
    type: EnumComponentType.Select,
    label: "状态",
    key: "statues",
    value: "",
    placeholder: "请选择状态",
    options: [
      {
        label: "已收货",
        value: 8
      },
      {
        label: "已结案",
        value: 10
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
  no: string
  delegateType: number
  statues: number
  supplierId: string
}>(searchFormData.value)

// 委外订单列表
const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "220px",
  highlightCurrentRow: true,
  columns: [
    {
      prop: "no",
      label: "委外单号",
      minWidth: 160
    },
    {
      prop: "delegateType",
      label: "委外类型",
      width: 120,
      align: "center",
      formatter: (row: ITableRow) => {
        return EnumOutsourcingTypeMap[row.delegateType as EnumOutsourcingType]
      }
    },
    {
      prop: "source",
      label: "来源",
      width: 120,
      align: "center",
      formatter: (row: ITableRow) => {
        return row.source === 1 ? "MES" : "ERP"
      }
    },
    {
      prop: "status",
      label: "状态",
      width: 120,
      align: "center",
      formatter: (row: ITableRow) => {
        return EnumOutsourcingOrderStatusMap[row.status as EnumOutsourcingOrderStatus]
      }
    },
    {
      prop: "supplierName",
      label: "供应商名称",
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
      prop: "amount",
      label: "委外数量",
      width: 120,
      align: "right"
    },
    {
      prop: "unitName",
      label: "单位",
      width: 120,
      align: "center"
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

//选中的委外订单
const chooseTableData = ref({} as ITableRow)

const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

//产品清单
const inventoryTableRef = ref<ComponentExposed<typeof CustomTable>>()
const inventoryTable = ref<IOutOrderProductItem[]>([])
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
      prop: "amount",
      label: "委外数量",
      width: 120,
      align: "right",
      formatter: (row: IOutOrderProductItem) => {
        return row.amount || row.amount == 0
          ? precisionConversion(row.amount, row?.decimalNumber ?? 2)
          : ""
      }
    },
    {
      prop: "inboundQuantity",
      label: "入库数量",
      width: 120,
      align: "right",
      formatter: (row: IOutOrderProductItem) => {
        return row.inboundAmount || row.inboundAmount == 0
          ? precisionConversion(row.inboundAmount, row?.decimalNumber ?? 2)
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

// 选择某条委外订单后查看对应的产品清单
const onChooseOrder = async (data: ITableRow) => {
  inventoryTableRef.value?.clearSelectedRow()
  inventoryTable.value = []
  chooseTableData.value = data

  const params = {
    pageQuery: {
      pageNum: 1,
      pageSize: 100
    },
    queryParam: {
      id: data.id as string
    }
  }
  const { records } = await queryOutOrderProductPageList(params)
  inventoryTable.value = records
}

// 确定
const onConfirm = () => {
  const multipleSelection =
    inventoryTableRef.value?.getCurrentMultipleRows() as IOutOrderProductItem[]
  if (multipleSelection.length == 0) {
    return ElMessage.warning("请选择至少一条委外订单")
  }
  emits(
    "confirm",
    multipleSelection.map((item) => {
      return {
        ...item,
        couldReturnAmount: (item.amount - item.inboundAmount).toFixed(item.decimalNumber),
        delegateOrderNo: chooseTableData.value.no, //委外订单号
        delegateOrderId: chooseTableData.value.id, //委外订单ID
        delegateOrderMaterialId: "", //委外订单-物料清单ID
        inboundQuantity: item.inboundAmount
      }
    })
  )
}

const queryConfig: ITableRequestConfig<[IDelegateOrderPageParams], ITableRow, true> = {
  api: queryOutsourcingOrderPageList,
  getParams: () => {
    const { statues, ...rest } = getFormData()
    return [
      {
        pageQuery: {
          pageNum: pagination.currentPage,
          pageSize: pagination.pageSize
        },
        queryParam: {
          ...rest,
          statues: statues ? [statues] : [8, 10]
        },
        sort: [
          {
            field: "createTime",
            order: "desc"
          }
        ]
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
  }
)
</script>

<style scoped lang="scss"></style>
