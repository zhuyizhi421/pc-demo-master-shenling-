<template>
  <CustomDialog v-model="dialogVisible" title="选择委外订单" size="large">
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
      @currentChange="onChooseOrder"
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

    <template v-if="inventoryList.length">
      <CustomTitle title="委外物料清单" />
      <CustomTable
        ref="inventoryListRef"
        v-model:table-data="inventoryList"
        :config="inventoryConfig"
      >
      </CustomTable>
    </template>

    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="onConfirm">确定</el-button>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import {
  getOutsourcinglMaterialList,
  queryOutsourcingOrderPageList
} from "@/api/logistics/delegate"
import { querySupplierPageList } from "@/api/supplier"
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
  IDelegateReturnMaterialVo
} from "@/types/logistics/delegate"
import { precisionConversion } from "@/utils/common"

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    supplierId: string | number
  }>(),
  {
    modelValue: false,
    supplierId: ""
  }
)
const emits = defineEmits<{
  (e: "update:modelValue", val: boolean): void
  (
    e: "success",
    data: (IDelegateReturnMaterialVo & {
      delegateOrderNo: string
      delegateOrderId: string
      delegateOrderMaterialId: string
    })[]
  ): void
}>()

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

const supplierList = ref<IOption[]>([]) // 供应商列表
const { searchList, resetForm, getFormData } = useSearchForm<{
  no: string
  delegateType: number
  statues: number[]
  supplierId: string
}>([
  {
    type: EnumComponentType.Input,
    label: "委外单号",
    key: "no",
    value: "",
    placeholder: "请输入委外单号"
  },
  {
    type: EnumComponentType.Select,
    label: "委外类型",
    key: "delegateType",
    value: "",
    placeholder: "请选择委外类型",
    options: OrderOptions
  },
  {
    type: EnumComponentType.Select,
    label: "状态",
    key: "statues",
    value: [6, 8, 10],
    placeholder: "请选择状态",
    multiple: true,
    disabled: true,
    maxTag: 3,
    get options() {
      return Object.entries(EnumOutsourcingOrderStatusMap).map(([key, value]) => ({
        label: value,
        value: +key
      }))
    }
  },
  {
    type: EnumComponentType.Select,
    label: "供应商名称",
    key: "supplierId",
    value: "",
    options: supplierList,
    disabled: true,
    placeholder: "请选择供应商"
  }
])

// 委外订单列表
const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: 200,
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
      formatter: (row: ITableRow) => EnumOutsourcingTypeMap[row.delegateType as EnumOutsourcingType]
    },
    {
      prop: "source",
      label: "来源",
      width: 120,
      align: "center",
      formatter: (row: ITableRow) => (row.source === 1 ? "MES" : "ERP")
    },
    {
      prop: "status",
      label: "状态",
      minWidth: 120,
      align: "center",
      formatter: (row: ITableRow) =>
        EnumOutsourcingOrderStatusMap[row.status as EnumOutsourcingOrderStatus]
    },
    {
      prop: "supplierName",
      label: "供应商名称",
      minWidth: 160
    },
    {
      prop: "productModelCode",
      label: "产品编号",
      minWidth: 160
    },
    {
      prop: "productModelName",
      label: "产品名称",
      minWidth: 160
    },
    {
      prop: "amount",
      label: "委外数量",
      minWidth: 120,
      align: "right",
      formatter: (row: ITableRow) => precisionConversion(row.amount, row.decimalNumber)
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
      align: "center",
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

//选中的委外订单
const chooseTableData = ref({} as ITableRow)

//物料清单
const inventoryListRef = ref<ComponentExposed<typeof CustomTable>>()
const inventoryList = ref<Array<IDelegateReturnMaterialVo>>([])
const inventoryConfig = ref<ITableConfig>({
  height: 200,
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
      formatter: (row: IDelegateReturnMaterialVo) =>
        precisionConversion(row.deliveryAmount, row.decimalNumber || 2)
    },
    {
      prop: "returnAmount",
      label: "已退数量",
      minWidth: 120,
      align: "right",
      formatter: (row: IDelegateReturnMaterialVo) =>
        precisionConversion(row.returnAmount, row.decimalNumber || 2)
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
      width: 60,
      align: "center",
      fixed: "right",
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
  searchList.value.find((item) => item.key === "supplierId")!.value = props.supplierId as string
  onSubmit()
}

/** 获取供应商列表 */
const getSupplierList = async () => {
  const { records } = await querySupplierPageList({ pageNum: 1, pageSize: 1000 })
  supplierList.value =
    records?.map((item) => {
      return {
        value: item.id,
        label: item.supplierName || item.supplierAbbr
      }
    }) || []
}

// 选择某条委外订单后查看对应的物料清单
const onChooseOrder = async (data: ITableRow) => {
  inventoryListRef.value?.clearSelectedRow()
  inventoryList.value = []
  chooseTableData.value = data
  const res = await getOutsourcinglMaterialList({
    id: data.id
  })
  inventoryList.value = res
}

const queryConfig: ITableRequestConfig<[IDelegateOrderPageParams], ITableRow, true> = {
  api: queryOutsourcingOrderPageList,
  getParams: () => {
    return [
      {
        queryParam: {
          ...getFormData(),
          pickStatus: 1
        },
        pageQuery: {
          pageNum: pagination.currentPage,
          pageSize: pagination.pageSize
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

// 确定
const onConfirm = () => {
  const selectedRows = (inventoryListRef.value?.getCurrentMultipleRows() ||
    []) as IDelegateReturnMaterialVo[]
  if (selectedRows.length == 0) {
    return ElMessage.warning("请选择至少一条委外订单")
  }
  emits(
    "success",
    selectedRows.map((item) => {
      return {
        ...item,
        delegateOrderNo: chooseTableData.value.no, //委外订单号
        delegateOrderId: chooseTableData.value.id, //委外订单ID
        delegateOrderMaterialId: item.id //委外订单-物料清单ID
      }
    })
  )
}

watch(
  () => props.modelValue,
  async (val) => {
    try {
      if (val) {
        searchList.value.find((item) => item.key === "supplierId")!.value =
          props.supplierId as string
        pagination.currentPage = 1
        getSupplierList()
        await nextTick()
        tableRef.value?.requestData()
      } else {
        resetForm()
        tableData.value = []
        inventoryList.value = []
        chooseTableData.value = {} as ITableRow
        inventoryListRef.value?.clearSelectedRow()
      }
    } catch (error) {
      /* empty */
    }
  }
)

defineOptions({
  name: "SelectOrder"
})
</script>

<style scoped lang="scss"></style>
