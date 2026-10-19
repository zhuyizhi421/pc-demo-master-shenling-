<template>
  <CustomDialog v-model="visible" title="选择销售订单" size="large">
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
    >
    </CustomTable>

    <CustomPagination
      v-model:currentPage="pagination.currentPage"
      v-model:pageSize="pagination.pageSize"
      :total="pagination.total"
      :border="false"
      @change="getList"
    />

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="submitForm()">确定</el-button>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import { getSearchCustomer } from "@/api/customer"
import { requestSaleOrderListByNotPlanDelivery } from "@/api/logistics/delivery"
import { requestSaleOrderByDelivery } from "@/api/logistics/return"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomPagination from "@/components/CustomPagination/index.vue"
import useSearchForm from "@/components/CustomSearchForm/hooks/index"
import CustomSearchForm from "@/components/CustomSearchForm/index.vue"
import { EnumComponentType } from "@/components/CustomSearchForm/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import type { IOption } from "@/types/common"
import type { ISaleOrderListItemByNotPlanDelivery } from "@/types/logistics/delivery"
import type { ISaleOrderBySaleListItem } from "@/types/logistics/return"

type ITableRow = ISaleOrderListItemByNotPlanDelivery | ISaleOrderBySaleListItem

const props = defineProps<{
  modelValue: boolean
  categoryName: string
  id?: string
}>()

const emits = defineEmits<{
  (e: "success", row: ITableRow): void
  (e: "update:modelValue", show: boolean): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emits("update:modelValue", val)
})

const saleStatusMap = {
  0: "未发货",
  1: "进行中",
  2: "已完成"
}

const customOptions = ref<IOption[]>([])
const { searchList, resetForm, getFormData } = useSearchForm<{
  saleStatus: string
  customerId: string
  saleCode: string
}>([
  {
    type: EnumComponentType.Select,
    label: "状态",
    key: "saleStatus",
    value: "",
    placeholder: "请选择状态",
    get options() {
      return props.categoryName === "delivery"
        ? [
            {
              label: "未发货",
              value: "0"
            },
            {
              label: "进行中",
              value: "1"
            }
          ]
        : [
            {
              label: "进行中",
              value: "1"
            },
            {
              label: "已完成",
              value: "2"
            }
          ]
    }
  },
  {
    type: EnumComponentType.Select,
    label: "客户名称",
    key: "customerId",
    value: "",
    placeholder: "请选择客户名称",
    get options() {
      return customOptions.value
    },
    filterable: true
  },
  {
    type: EnumComponentType.Input,
    label: "销售单号",
    key: "saleCode",
    value: "",
    placeholder: "请输入销售单号"
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
  height: 400,
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
      width: 120,
      align: "center",
      formatter: (row: ITableRow) => {
        return saleStatusMap[row.saleStatus as 0 | 1 | 2]
      }
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
      minWidth: 160
    },
    {
      prop: "selection",
      label: "选择",
      type: "selection",
      width: 60,
      align: "center",
      fixed: "right"
    }
  ]
})

watch(visible, async (val) => {
  if (val) {
    await getCustomOptions()
    await getList()
    if (props.id) {
      tableRef.value?.setSelectedRow(props.id)
    }
  } else {
    tableData.value = []
    tableRef.value?.clearSelectedRow()
    resetForm()
  }
})

/** 获取客户信息 */
const getCustomOptions = async () => {
  const { records } = await getSearchCustomer({ pageNum: 1, pageSize: 1000, stateList: [0] })
  customOptions.value = records.map((item) => ({
    label: item.customerAbbr,
    value: item.id
  }))
}

const getList = async () => {
  if (props.categoryName == "return") {
    const res = await requestSaleOrderByDelivery({
      pageNum: pagination.currentPage,
      pageSize: pagination.pageSize,
      ...getFormData()
    })
    tableData.value = res.records
    pagination.total = +res.total
  } else if (props.categoryName == "delivery") {
    const res = await requestSaleOrderListByNotPlanDelivery({
      pageNum: pagination.currentPage,
      pageSize: pagination.pageSize,
      ...getFormData()
    })
    tableData.value = res.records
    pagination.total = +res.total
  }
}

const submitForm = () => {
  const selectRow = tableRef.value?.getCurrentSingleRow()
  if (!selectRow) {
    ElMessage.warning("请选择销售订单")
    return
  }
  visible.value = false
  emits("success", selectRow as ITableRow)
}

const onSubmit = () => {
  pagination.currentPage = 1
  getList()
}

const onReset = () => {
  resetForm()
  onSubmit()
}
</script>

<style scoped lang="scss"></style>
