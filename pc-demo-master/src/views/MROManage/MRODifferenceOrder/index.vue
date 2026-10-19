<template>
  <div class="layout-container">
    <div class="layout-main-page" v-show="curPageKey === EnumPageType.Main">
      <CustomSearchForm :form-list="searchList" @search="onSubmit" @reset="onReset" />
      <div class="custom-table-container">
        <CustomTitle title="MRO差异单" />
        <CustomTable
          ref="tableRef"
          v-model:table-data="tableData"
          v-model:total="pagination.total"
          :config="tableConfig"
          :query-config="queryConfig"
        >
          <template #status-default="{ row }">
            <el-tag :type="row.status === 0 ? 'warning' : 'success'">{{
              row.status === 0 ? "未复核" : "已复核"
            }}</el-tag>
          </template>
          <template #operation-default="{ row }">
            <el-button
              v-if="row.status === 0 && isAuth"
              link
              type="primary"
              size="small"
              @click="onEdit(row)"
              >编辑</el-button
            >
            <el-button
              v-if="row.status === 0 && isAuth"
              link
              type="primary"
              size="small"
              @click="onReview(row)"
              >复核</el-button
            >
            <el-button link type="primary" size="small" @click="onViewSourceCheck(row)"
              >查看来源盘点单</el-button
            >
            <el-button
              v-if="row.status !== 0"
              link
              type="primary"
              size="small"
              @click="onDetail(row)"
              >详情</el-button
            >
          </template>
        </CustomTable>
      </div>
      <CustomPagination
        v-model:currentPage="pagination.currentPage"
        v-model:pageSize="pagination.pageSize"
        :total="pagination.total"
        border
        @change="tableRef?.requestData()"
      />
    </div>
    <div class="layout-child-page" v-if="curPageKey !== EnumPageType.Main">
      <CustomPageCrumbs v-model="curPageKey" :data="pageTree" />
      <EditPage
        v-if="curPageKey === EnumPageType.Edit"
        :current-row="currentRow"
        @close="curPageKey = EnumPageType.Main"
        @success="tableRef?.requestData()"
      />
      <DetailPage
        v-if="curPageKey === EnumPageType.Detail"
        :current-row="currentRow"
        @close="curPageKey = EnumPageType.Main"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"
import { useRouter } from "vue-router"

import {
  queryMroDifferenceOrderPageList,
  requestReviewMroDifferenceOrder
} from "@/api/operation/mro/mro-difference-order"
import CustomPageCrumbs from "@/components/CustomPageCrumbs/index.vue"
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
import useButtonAuth from "@/hooks/useButtonAuth"
import type {
  IMroDifferenceOrderPageListItem as ITableRow,
  IMroDifferenceOrderPageListParams
} from "@/types/maintain/mro-manage/mro-difference-order"

import DetailPage from "./components/Detail.vue"
import EditPage from "./components/Edit.vue"

defineOptions({ name: "MRODifferenceOrder" })
enum EnumPageType {
  Main,
  Edit,
  Detail
}
const isAuth = useButtonAuth("MRODifferenceOrder_update", "MRODifferenceOrder_query")
const router = useRouter()
const curPageKey = ref(EnumPageType.Main)
const pageTree = ref([
  {
    name: "MRO差异单列表",
    key: EnumPageType.Main,
    children: [
      { name: "编辑差异单", key: EnumPageType.Edit },
      { name: "差异单详情", key: EnumPageType.Detail }
    ]
  }
])
const { searchList, resetForm, getFormData } = useSearchForm<{
  diffNo: string
  sourceCheckNo: string
  checkEmpName: string
  warehouseNo: string
  warehouseName: string
  status?: number
  mroModelNo: string
  mroSerialNo: string
  mroModelName: string
}>([
  {
    type: EnumComponentType.Input,
    key: "diffNo",
    label: "差异单号",
    value: "",
    placeholder: "请输入差异单号"
  },
  {
    type: EnumComponentType.Input,
    key: "sourceCheckNo",
    label: "来源盘点单号",
    value: "",
    placeholder: "请输入来源盘点单号"
  },
  {
    type: EnumComponentType.Input,
    key: "checkEmpName",
    label: "盘点人",
    value: "",
    placeholder: "请输入盘点人"
  },
  {
    type: EnumComponentType.Input,
    key: "warehouseNo",
    label: "仓库编号",
    value: "",
    placeholder: "请输入仓库编号"
  },
  {
    type: EnumComponentType.Input,
    key: "warehouseName",
    label: "仓库名称",
    value: "",
    placeholder: "请输入仓库名称"
  },
  {
    type: EnumComponentType.Select,
    key: "status",
    label: "状态",
    value: "",
    placeholder: "请选择状态",
    options: [
      { label: "未复核", value: 0 },
      { label: "已复核", value: 1 }
    ]
  },
  {
    type: EnumComponentType.Input,
    key: "mroModelNo",
    label: "MRO编号",
    value: "",
    placeholder: "请输入MRO编号"
  },
  {
    type: EnumComponentType.Input,
    key: "mroSerialNo",
    label: "MRO序列号",
    value: "",
    placeholder: "请输入MRO序列号"
  },
  {
    type: EnumComponentType.Input,
    key: "mroModelName",
    label: "MRO名称",
    value: "",
    placeholder: "请输入MRO名称"
  }
])
const pagination = reactive({ currentPage: 1, pageSize: 20, total: 0 })
const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<ITableRow[]>([])
const currentRow = ref<ITableRow>({} as ITableRow)
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    { prop: "diffNo", label: "差异单号", minWidth: 170 },
    { prop: "diffDate", label: "日期", width: 140, align: "center" },
    { prop: "sourceCheckNo", label: "来源盘点单号", minWidth: 170 },
    { prop: "checkEmpName", label: "盘点人", width: 120 },
    { prop: "warehouseNo", label: "仓库编号", width: 130 },
    { prop: "warehouseName", label: "仓库名称", minWidth: 140 },
    {
      prop: "status",
      label: "状态",
      width: 110,
      align: "center",
      slots: { default: "status-default" }
    },
    { prop: "reviewByName", label: "复核人", width: 120, align: "center" },
    { prop: "reviewTime", label: "复核时间", width: 160, align: "center" },
    {
      prop: "operation",
      label: "操作",
      width: 220,
      fixed: "right",
      slots: { default: "operation-default" }
    }
  ]
})
const queryConfig: ITableRequestConfig<[IMroDifferenceOrderPageListParams], ITableRow, true> = {
  api: queryMroDifferenceOrderPageList,
  getParams: () => [
    { ...getFormData(), pageNum: pagination.currentPage, pageSize: pagination.pageSize }
  ]
}
onMounted(() => tableRef.value?.requestData())
const onSubmit = () => {
  pagination.currentPage = 1
  tableRef.value?.requestData()
}
const onReset = () => {
  resetForm()
  onSubmit()
}
const onEdit = (row: ITableRow) => {
  currentRow.value = row
  curPageKey.value = EnumPageType.Edit
}
const onDetail = (row: ITableRow) => {
  currentRow.value = row
  curPageKey.value = EnumPageType.Detail
}
const onReview = async (row: ITableRow) => {
  await ElMessageBox.confirm("确认复核该差异单？复核后不可编辑。", "提示", { type: "warning" })
  await requestReviewMroDifferenceOrder(row.id)
  ElMessage.success("复核成功")
  tableRef.value?.requestData()
}
const onViewSourceCheck = (row: ITableRow) => {
  router.push({ name: "MROInventoryCheck" })
  ElMessage.info(`来源盘点单号：${row.sourceCheckNo}`)
}
</script>
