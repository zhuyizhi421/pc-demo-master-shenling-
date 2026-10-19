<template>
  <MonthPlanDetailPage
    v-if="pageState.mode !== 'list'"
    :id="pageState.id"
    :mode="pageState.mode"
    @close="onBackToList"
    @success="onDetailSuccess"
    @split="onSplitClick"
  />

  <div v-else class="layout-container">
    <div class="layout-main-page">
      <CustomSearchForm :form-list="searchList" @search="onSubmit" @reset="onReset" />

      <div class="custom-table-container">
        <CustomTitle title="保养月计划列表" />
        <CustomTable
          ref="customTableRef"
          v-model:table-data="customTableData"
          v-model:total="pagination.total"
          :config="tableConfig"
          :query-config="queryConfig"
          class="custom-table"
        >
          <template #status-default="{ row }">
            <el-tag
              :type="
                EnumEquipmentMaintenanceMonthPlanStatusTagTypeMap[
                  row.status as EnumEquipmentMaintenanceMonthPlanStatusType
                ]
              "
            >
              {{
                EnumEquipmentMaintenanceMonthPlanStatusTypeMap[
                  row.status as EnumEquipmentMaintenanceMonthPlanStatusType
                ]
              }}
            </el-tag>
          </template>

          <template #operation-default="{ row }">
            <el-button
              v-if="canEdit(row)"
              link
              type="primary"
              size="small"
              @click="openPage('edit', row)"
            >
              编辑
            </el-button>
            <el-button
              v-if="canDelete(row)"
              link
              type="danger"
              size="small"
              @click="onDeleteClick(row)"
            >
              删除
            </el-button>
            <el-button
              v-if="canReview(row)"
              link
              type="primary"
              size="small"
              @click="onReviewClick(row)"
            >
              复核
            </el-button>
            <el-button
              v-if="canVoid(row)"
              link
              type="warning"
              size="small"
              @click="onVoidClick(row)"
            >
              作废
            </el-button>
            <el-button
              v-if="canSplit(row)"
              link
              type="primary"
              size="small"
              @click="onSplitClick(row)"
            >
              拆分周计划
            </el-button>
            <el-button link type="primary" size="small" @click="openPage('detail', row)">
              查看详情
            </el-button>
          </template>
        </CustomTable>
      </div>

      <CustomPagination
        v-model:currentPage="pagination.currentPage"
        v-model:pageSize="pagination.pageSize"
        :total="pagination.total"
        border
        @change="customTableRef?.requestData()"
      />
    </div>

    <WeekPlanSplitDialog
      v-model="splitDialogState.visible"
      :month-plan="splitDialogState.row"
      @success="onSplitSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import {
  queryEquipmentMaintenancePlanPageList,
  requestDeleteEquipmentMaintenancePlan,
  requestReviewEquipmentMaintenancePlan,
  requestVoidEquipmentMaintenancePlan
} from "@/api/operation/equipment/equipment-maintenance-plan"
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
import useButtonAuth from "@/hooks/useButtonAuth"
import type {
  IEquipmentMaintenanceMonthPlanPageItem as ITableRow,
  IEquipmentMaintenanceMonthPlanPageParams
} from "@/types/maintain/equipment-manage/equipment-maintenance-month-plan"

import MonthPlanDetailPage from "./components/MonthPlanDetailPage.vue"
import WeekPlanSplitDialog from "./components/WeekPlanSplitDialog.vue"
import {
  EnumEquipmentMaintenanceMonthPlanStatusTagTypeMap,
  EnumEquipmentMaintenanceMonthPlanStatusType,
  EnumEquipmentMaintenanceMonthPlanStatusTypeMap
} from "./status"

defineOptions({
  name: "MonthPlan"
})

const isAuth = useButtonAuth("MonthPlan_update", "MonthPlan_query")

const searchFormData = ref<ISearchItem[]>([
  {
    type: EnumComponentType.Date,
    dateType: "month",
    key: "planMonth",
    label: "计划月份",
    value: "",
    placeholder: "请选择计划月份",
    format: "YYYY-MM",
    valueFormat: "YYYY-MM"
  },
  {
    type: EnumComponentType.Input,
    key: "areaName",
    label: "所属区域",
    value: "",
    placeholder: "请输入所属区域"
  },
  {
    type: EnumComponentType.Input,
    key: "planName",
    label: "月计划名称",
    value: "",
    placeholder: "请输入月计划名称"
  },
  {
    type: EnumComponentType.Select,
    key: "status",
    label: "状态",
    value: "",
    placeholder: "请选择状态",
    options: [
      {
        label: "未复核",
        value: EnumEquipmentMaintenanceMonthPlanStatusType.Unreviewed
      },
      {
        label: "已复核",
        value: EnumEquipmentMaintenanceMonthPlanStatusType.Reviewed
      },
      {
        label: "已作废",
        value: EnumEquipmentMaintenanceMonthPlanStatusType.Voided
      }
    ]
  },
  {
    type: EnumComponentType.Input,
    key: "sourceYearPlanNo",
    label: "来源年计划单号",
    value: "",
    placeholder: "请输入来源年计划单号"
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  planMonth?: string
  areaName?: string
  planName?: string
  status?: number
  sourceYearPlanNo?: string
}>(searchFormData.value)

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const pageState = reactive<{
  mode: "list" | "edit" | "detail"
  id: string
}>({
  mode: "list",
  id: ""
})

const splitDialogState = reactive<{
  visible: boolean
  row: Partial<ITableRow>
}>({
  visible: false,
  row: {}
})

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "planNo",
      label: "月计划单号",
      minWidth: 160
    },
    {
      prop: "planMonth",
      label: "计划月份",
      width: 120,
      align: "center"
    },
    {
      prop: "areaName",
      label: "所属区域",
      minWidth: 180
    },
    {
      prop: "planName",
      label: "月计划名称",
      minWidth: 240
    },
    {
      prop: "sourceYearPlanNo",
      label: "来源年计划单号",
      minWidth: 160
    },
    {
      prop: "totalCount",
      label: "设备保养总数",
      width: 130,
      align: "right"
    },
    {
      prop: "status",
      label: "状态",
      width: 120,
      align: "center",
      slots: {
        default: "status-default"
      }
    },
    {
      prop: "reviewTime",
      label: "复核时间",
      minWidth: 170,
      align: "center",
      formatter: (row: ITableRow) => row.reviewTime || "-"
    },
    {
      prop: "voidTime",
      label: "作废时间",
      minWidth: 170,
      align: "center",
      formatter: (row: ITableRow) => row.voidTime || "-"
    },
    {
      prop: "operation",
      label: "操作",
      minWidth: 300,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

const queryConfig: ITableRequestConfig<[IEquipmentMaintenanceMonthPlanPageParams], ITableRow, true> =
  {
    api: queryEquipmentMaintenancePlanPageList,
    getParams: () => [
      {
        pageQuery: {
          pageNum: pagination.value.currentPage,
          pageSize: pagination.value.pageSize
        },
        queryParam: getFormData()
      }
    ]
  }

onMounted(() => {
  customTableRef.value?.requestData()
})

function isMessageBoxCancel(error: unknown) {
  return error === "cancel" || error === "close"
}

function canEdit(row: ITableRow) {
  return (
    isAuth.value &&
    Number(row.status) === Number(EnumEquipmentMaintenanceMonthPlanStatusType.Unreviewed)
  )
}

function canDelete(row: ITableRow) {
  return canEdit(row)
}

function canReview(row: ITableRow) {
  return canEdit(row)
}

function canVoid(row: ITableRow) {
  return (
    isAuth.value &&
    Number(row.status) === Number(EnumEquipmentMaintenanceMonthPlanStatusType.Reviewed)
  )
}

function canSplit(row: ITableRow) {
  return (
    isAuth.value &&
    Number(row.status) === Number(EnumEquipmentMaintenanceMonthPlanStatusType.Reviewed)
  )
}

function onReset() {
  resetForm()
  onSubmit()
}

async function onSubmit() {
  pagination.value.currentPage = 1
  await customTableRef.value?.requestData()
}

function openPage(mode: "edit" | "detail", row: ITableRow) {
  pageState.mode = mode
  pageState.id = String(row.id || "")
}

function onBackToList() {
  pageState.mode = "list"
  pageState.id = ""
}

async function onDetailSuccess() {
  onBackToList()
  await customTableRef.value?.requestData()
}

function onSplitClick(row: Partial<ITableRow>) {
  splitDialogState.row = {
    id: row.id,
    planNo: row.planNo,
    planMonth: row.planMonth,
    planName: row.planName,
    areaName: row.areaName,
    status: row.status
  }
  splitDialogState.visible = true
}

async function onSplitSuccess() {
  await customTableRef.value?.requestData()
}

async function onDeleteClick(row: ITableRow) {
  try {
    await ElMessageBox.confirm(`确认删除月计划 ${row.planNo} 吗？`, "删除确认", {
      type: "warning",
      confirmButtonText: "确认",
      cancelButtonText: "取消"
    })
    await requestDeleteEquipmentMaintenancePlan(String(row.id || ""))
    ElMessage.success("删除成功")
    await customTableRef.value?.requestData()
  } catch (error) {
    if (isMessageBoxCancel(error)) return
    ElMessage.error("删除失败")
  }
}

async function onReviewClick(row: ITableRow) {
  try {
    await ElMessageBox.confirm(`确认复核月计划 ${row.planNo} 吗？`, "复核确认", {
      type: "warning",
      confirmButtonText: "确认",
      cancelButtonText: "取消"
    })
    await requestReviewEquipmentMaintenancePlan({ id: String(row.id || "") })
    ElMessage.success("复核成功")
    await customTableRef.value?.requestData()
  } catch (error) {
    if (isMessageBoxCancel(error)) return
    ElMessage.error("复核失败")
  }
}

async function onVoidClick(row: ITableRow) {
  try {
    const { value } = await ElMessageBox.prompt(
      `请填写月计划 ${row.planNo} 的作废原因`,
      "作废确认",
      {
        confirmButtonText: "确认作废",
        cancelButtonText: "取消",
        inputPlaceholder: "请输入作废原因",
        inputType: "textarea",
        inputValidator: (reason) => {
          if (!reason?.trim()) return "请输入作废原因"
          return true
        }
      }
    )
    await requestVoidEquipmentMaintenancePlan({
      id: String(row.id || ""),
      voidReason: String(value || "").trim()
    })
    ElMessage.success("作废成功")
    await customTableRef.value?.requestData()
  } catch (error) {
    if (isMessageBoxCancel(error)) return
    ElMessage.error("作废失败")
  }
}
</script>
