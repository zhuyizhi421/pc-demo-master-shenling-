<template>
  <WeekPlanDetailPage
    v-if="pageState.mode !== 'list'"
    :id="pageState.id"
    :mode="pageState.mode"
    @close="onBackToList"
    @success="onDetailSuccess"
  />

  <div v-else class="layout-container">
    <div class="layout-main-page">
      <CustomSearchForm :form-list="searchList" @search="onSubmit" @reset="onReset" />

      <div class="custom-table-container">
        <CustomTitle title="保养周计划列表" />
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
                EnumEquipmentMaintenanceWeekPlanStatusTagTypeMap[
                  row.status as EnumEquipmentMaintenanceWeekPlanStatusType
                ]
              "
            >
              {{
                EnumEquipmentMaintenanceWeekPlanStatusTypeMap[
                  row.status as EnumEquipmentMaintenanceWeekPlanStatusType
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
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import {
  queryEquipmentMaintenanceWeekPlanPageList,
  requestDeleteEquipmentMaintenanceWeekPlan,
  requestReviewEquipmentMaintenanceWeekPlan,
  requestVoidEquipmentMaintenanceWeekPlan
} from "@/api/operation/equipment/equipment-maintenance-week-plan"
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
  IEquipmentMaintenanceWeekPlanPageItem as ITableRow,
  IEquipmentMaintenanceWeekPlanPageParams
} from "@/types/maintain/equipment-manage/equipment-maintenance-week-plan"

import WeekPlanDetailPage from "./components/WeekPlanDetailPage.vue"
import {
  EnumEquipmentMaintenanceWeekPlanStatusTagTypeMap,
  EnumEquipmentMaintenanceWeekPlanStatusType,
  EnumEquipmentMaintenanceWeekPlanStatusTypeMap
} from "./status"

defineOptions({
  name: "WeekPlan"
})

const isAuth = useButtonAuth("WeekPlan_update", "WeekPlan_query")

const searchFormData = ref<ISearchItem[]>([
  {
    type: EnumComponentType.Input,
    key: "naturalWeekLabel",
    label: "自然周标识",
    value: "",
    placeholder: "请输入自然周标识"
  },
  {
    type: EnumComponentType.Date,
    dateType: "daterange",
    key: "planDateRange",
    label: "计划开始日期",
    value: [],
    placeholder: ["请选择开始日期", "请选择结束日期"],
    format: "YYYY-MM-DD",
    valueFormat: "YYYY-MM-DD",
    keyword: ["planStartDateFrom", "planStartDateTo"]
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
    label: "周计划名称",
    value: "",
    placeholder: "请输入周计划名称"
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
        value: EnumEquipmentMaintenanceWeekPlanStatusType.Unreviewed
      },
      {
        label: "已复核",
        value: EnumEquipmentMaintenanceWeekPlanStatusType.Reviewed
      },
      {
        label: "已作废",
        value: EnumEquipmentMaintenanceWeekPlanStatusType.Voided
      }
    ]
  },
  {
    type: EnumComponentType.Input,
    key: "sourceMonthPlanNo",
    label: "来源月计划单号",
    value: "",
    placeholder: "请输入来源月计划单号"
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  naturalWeekLabel?: string
  planStartDateFrom?: string
  planStartDateTo?: string
  areaName?: string
  planName?: string
  status?: number
  sourceMonthPlanNo?: string
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

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "planNo",
      label: "周计划单号",
      minWidth: 170
    },
    {
      prop: "naturalWeekLabel",
      label: "自然周标识",
      width: 140,
      align: "center"
    },
    {
      prop: "planStartDate",
      label: "计划开始日期",
      width: 120,
      align: "center"
    },
    {
      prop: "planEndDate",
      label: "计划结束日期",
      width: 120,
      align: "center"
    },
    {
      prop: "areaName",
      label: "所属区域",
      minWidth: 140
    },
    {
      prop: "planName",
      label: "周计划名称",
      minWidth: 240
    },
    {
      prop: "sourceMonthPlanNos",
      label: "来源月计划单号",
      minWidth: 220
    },
    {
      prop: "defaultMaintenanceTypeName",
      label: "默认保养类型",
      minWidth: 140
    },
    {
      prop: "totalCount",
      label: "设备总数",
      width: 120,
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
      minWidth: 220,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

const queryConfig: ITableRequestConfig<[IEquipmentMaintenanceWeekPlanPageParams], ITableRow, true> =
  {
    api: queryEquipmentMaintenanceWeekPlanPageList,
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
    Number(row.status) === Number(EnumEquipmentMaintenanceWeekPlanStatusType.Unreviewed)
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
    Number(row.status) === Number(EnumEquipmentMaintenanceWeekPlanStatusType.Reviewed)
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

async function onDeleteClick(row: ITableRow) {
  try {
    await ElMessageBox.confirm(`确认删除周计划 ${row.planNo} 吗？`, "删除确认", {
      type: "warning",
      confirmButtonText: "确认",
      cancelButtonText: "取消"
    })
    await requestDeleteEquipmentMaintenanceWeekPlan(String(row.id || ""))
    ElMessage.success("删除成功")
    await customTableRef.value?.requestData()
  } catch (error) {
    if (isMessageBoxCancel(error)) return
    ElMessage.error("删除失败")
  }
}

async function onReviewClick(row: ITableRow) {
  try {
    await ElMessageBox.confirm(`确认复核周计划 ${row.planNo} 吗？`, "复核确认", {
      type: "warning",
      confirmButtonText: "确认",
      cancelButtonText: "取消"
    })
    await requestReviewEquipmentMaintenanceWeekPlan({ id: String(row.id || "") })
    ElMessage.success("复核成功")
    await customTableRef.value?.requestData()
  } catch (error: any) {
    if (isMessageBoxCancel(error)) return
    ElMessage.error(error?.message || "复核失败")
  }
}

async function onVoidClick(row: ITableRow) {
  try {
    const { value } = await ElMessageBox.prompt(
      `请填写周计划 ${row.planNo} 的作废原因`,
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
    await requestVoidEquipmentMaintenanceWeekPlan({
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
