<!--委外工序选择-->
<template>
  <CustomDialog v-model="visible" title="委外工序选择" size="large">
    <CustomSearchForm
      :form-list="searchList"
      @search="onSubmit"
      @reset="onReset"
    ></CustomSearchForm>

    <CustomTable ref="tableRef" v-model:table-data="tableData" :config="tableConfig">
      <template #operation-default="{ row }">
        <el-checkbox
          :disabled="disabledIds.includes(row.id)"
          :model-value="selectedDataId.has(row.id)"
          @change="selectAndShowDetail(row)"
        />
      </template>
    </CustomTable>

    <CustomPagination
      v-model:currentPage="pagination.currentPage"
      v-model:pageSize="pagination.pageSize"
      :total="pagination.total"
      :border="false"
      @change="getList()"
    />

    <CustomTitle title="工艺路线-流程"></CustomTitle>

    <CustomTable
      ref="routeDetailTableRef"
      v-model:table-data="routeDetailData"
      :config="routeDetailTableConfig"
    >
      <template #amount-default="{ row }">
        <el-input
          placeholder="请输入"
          v-model="row.amount"
          :disabled="!selectedRouteId.has(row.techFlowNodeId)"
          @input="onHandleInput(row)"
          @blur="onHandleCal()"
        />
      </template>

      <template #operation-default="{ row }">
        <el-checkbox
          :model-value="selectedRouteId.has(row.techFlowNodeId)"
          @change="selectRouteChange(row)"
        />
      </template>
    </CustomTable>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :disabled="!selectedRouteId.size" @click="modalClick"
        >确定</el-button
      >
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import { inferNodeOutput, type PlanAbleList, queryPlanAble } from "@/api/craft"
import { requestIsLinkSerial } from "@/api/logistics/delegate"
import { queryProductOrderPageList } from "@/api/scheduling"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomPagination from "@/components/CustomPagination/index.vue"
import useSearchForm from "@/components/CustomSearchForm/hooks/index"
import CustomSearchForm from "@/components/CustomSearchForm/index.vue"
import { EnumComponentType } from "@/components/CustomSearchForm/type"
import CustomTable from "@/components/CustomTable/index.vue"
import { type ComponentExposed, type ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import { EnumCraftType, EnumCraftTypeMap, EnumProductionOrderType } from "@/constant/enums"
import type { IProductionOrderPageItem as ITableRow } from "@/types/production-manage/product-order"

interface numDefine {
  [key: number]: string
}
export interface IPlanAbleList extends PlanAbleList {
  amount: string
}

defineOptions({
  name: "SelectProductOrder"
})

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    multiple?: boolean
    selectedList?: ITableRow[]
    disabledIds?: string[] // 不能选中的工艺id
    ispPcking?: boolean
    onlyReviewed?: boolean
    productionMethod?: null | 1 | 2 // 1自制 2委外
    orderType?: EnumProductionOrderType[] // 生产订单类型
  }>(),
  {
    multiple: false,
    ispPcking: false,
    disabledIds: () => [],
    selectedList: () => [],
    onlyReviewed: false,
    productionMethod: null,
    orderType: () => []
  }
)
const emits = defineEmits<{
  (e: "update:modelValue", show: boolean): void
  (e: "onOk", data: ITableRow[], routeData: IPlanAbleList[]): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emits("update:modelValue", val)
})

const typeMap: numDefine = {
  1: "量产",
  5: "返工",
  10: "试产",
  15: "试模",
  20: "拆解"
}
const selectedDataId = ref(new Map<string, ITableRow>())
const routeDetailData = ref<IPlanAbleList[]>([])
const selectedRouteId = ref(new Map<string, IPlanAbleList>())

const { searchList, resetForm, getFormData } = useSearchForm<{
  no: string
  productModelNo: string
  productModelName: string
}>([
  {
    type: EnumComponentType.Input,
    label: "订单号",
    key: "no",
    value: "",
    placeholder: "请输入订单号"
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

const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: 300,
  columns: [
    {
      prop: "no",
      label: "订单编号",
      minWidth: 160
    },
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
      prop: "type",
      label: "订单类型",
      minWidth: 120,
      align: "center",
      formatter: (row: ITableRow) => typeMap[row.type] ?? "-"
    },
    {
      prop: "orderAmount",
      label: "订单数量",
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
      prop: "remark",
      label: "备注",
      minWidth: 160
    },
    {
      prop: "operation",
      label: "操作",
      minWidth: 60,
      align: "center",
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

const routeDetailTableRef = ref<ComponentExposed<typeof CustomTable>>()
const routeDetailTableConfig = ref<ITableConfig>({
  height: 200,
  rowKey: "id",
  columns: [
    {
      prop: "processSerial",
      label: "工序",
      minWidth: 60
    },
    {
      prop: "techName",
      label: "工艺名称",
      minWidth: 160
    },
    {
      prop: "type",
      label: "类型",
      minWidth: 120,
      align: "center",
      formatter: (row: IPlanAbleList) => EnumCraftTypeMap[row.type as EnumCraftType]
    },
    {
      prop: "nature",
      label: "性质",
      minWidth: 120,
      align: "center",
      formatter: (row: IPlanAbleList) => (row.nature === 1 ? "自制" : "委外")
    },
    {
      prop: "availableAmount",
      label: "可排产数量",
      minWidth: 120,
      align: "right"
    },
    {
      prop: "amount",
      label: "委外数量",
      minWidth: 120,
      slots: {
        default: "amount-default"
      }
    },
    {
      prop: "operation",
      label: "操作",
      minWidth: 60,
      align: "center",
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

watch(
  () => props.modelValue,
  async (val) => {
    try {
      if (val) {
        nextTick(async () => {
          await getList()
          if (props.selectedList?.length) {
            props.selectedList.forEach((item: ITableRow) => {
              selectedDataId.value.set(item.id, item) // 回显
            })
          }
        })
      } else {
        resetForm()
        tableData.value = []
        routeDetailData.value = []
        selectedDataId.value.clear()
        selectedRouteId.value = new Map<string, IPlanAbleList>()
      }
    } catch (error) {
      /* empty */
    }
  },
  {
    immediate: true
  }
)

const onSubmit = () => {
  pagination.currentPage = 1
  getList()
}

const onReset = () => {
  resetForm()
  onSubmit()
}

const getList = async () => {
  try {
    tableRef.value?.setLoading(true)
    const res = await queryProductOrderPageList({
      pageQuery: {
        pageNum: pagination.currentPage,
        pageSize: pagination.pageSize
      },
      queryParam: {
        ...getFormData(),
        status: 1,
        productionMethod: props.productionMethod ?? undefined
      }
    })
    tableData.value = res.records
    pagination.total = +res.total
    tableRef.value?.setLoading(false)
  } catch (error) {
    /* empty */
  }
}

async function selectAndShowDetail(data: ITableRow) {
  if (data?.id) {
    selectChange(data)
  }
}

const selectChange = async (row: ITableRow) => {
  if (selectedDataId.value.has(row.id)) {
    selectedDataId.value.delete(row.id)
    routeDetailData.value = []
    selectedRouteId.value.clear()
  } else {
    if (!props.multiple) {
      selectedDataId.value.clear()
    }
    routeDetailData.value = []
    selectedRouteId.value.clear()
    selectedDataId.value.set(row.id, row)
    routeDetailTableRef.value?.setLoading(true)
    const res = await queryPlanAble({ orderId: row.id, queryType: 1 })
    routeDetailData.value = res.map((item) => {
      return {
        ...item,
        amount: "" //委外数量
      }
    })
    routeDetailTableRef.value?.setLoading(false)
  }
}
const selectRouteChange = (row: IPlanAbleList) => {
  try {
    if (selectedRouteId.value.has(row.techFlowNodeId)) {
      selectedRouteId.value.delete(row.techFlowNodeId)
    } else {
      selectedRouteId.value.set(row.techFlowNodeId, row)
    }
  } catch (error) {
    console.log(error)
  }
}

// 限制输入数量
const onHandleInput = (row: IPlanAbleList) => {
  try {
    row.amount = row.amount.replace(/[^0-9]/g, "")
    if (row.amount !== "") {
      if (Number(row.amount) === 0) {
        row.amount = ""
      } else if (Number(row.amount) > row.availableAmount) {
        row.amount = String(row.availableAmount)
      } else {
        row.amount = Number(row.amount).toString()
      }
    }
  } catch (error) {
    console.log(error)
  }
}

// 计算其他选中工序的数量
const onHandleCal = async () => {
  try {
    const paramsList = [...selectedRouteId.value.values()].map((item) => {
      return {
        id: item.techFlowNodeId,
        amount: Number(item.amount)
      }
    })
    const processId = [...selectedDataId.value.values()][0].id
    const res = await inferNodeOutput({
      items: paramsList,
      processId: processId
    })
    res.forEach((item) => {
      const row = routeDetailData.value.find((ite) => item.id === ite.techFlowNodeId)
      if (row) {
        row.amount = item.amount.toString()
        selectedRouteId.value.set(row.techFlowNodeId, row)
      }
    })
  } catch (error) {
    console.log(error)
  }
}
const modalClick = async () => {
  if (!selectedDataId.value.size) {
    return ElMessage.warning(`请选择生产订单`)
  }

  if (!selectedRouteId.value.size) {
    return ElMessage.warning(`请选择工艺路线`)
  }

  const hasEmpty = [...selectedRouteId.value.values()].some(
    (item) => !item.amount || item.amount === "0"
  )

  if (hasEmpty) {
    return ElMessage.warning(`委外数量不可为空`)
  }

  let params = {
    processId: [...selectedDataId.value.values()][0].techProcessId,
    nodeIdList: [...selectedRouteId.value.values()].map((item) => item.techFlowNodeId)
  }
  const isLink = await requestIsLinkSerial(params)

  if (!isLink) {
    return ElMessage.warning(`非连续工序，无法在一个委外订单完成`)
  }

  emits("onOk", [...selectedDataId.value.values()], [...selectedRouteId.value.values()])
  emits("update:modelValue", false)
}
</script>

<style scoped lang="scss"></style>
