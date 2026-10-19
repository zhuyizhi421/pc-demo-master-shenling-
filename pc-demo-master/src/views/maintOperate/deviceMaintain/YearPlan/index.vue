<template>
  <div class="layout-container">
    <div class="layout-main-page">
      <CustomSearchForm :form-list="searchList" @search="onSubmit" @reset="onReset" />

      <div class="custom-table-container">
        <CustomTitle title="保养年计划列表">
          <div v-if="isAuth">
            <el-button icon="Plus" type="primary" @click="onCreateClick">新增年计划</el-button>
          </div>
        </CustomTitle>

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
                EnumEquipmentMaintenanceYearPlanStatusTagTypeMap[
                  row.status as EnumEquipmentMaintenanceYearPlanStatusType
                ]
              "
            >
              {{
                EnumEquipmentMaintenanceYearPlanStatusTypeMap[
                  row.status as EnumEquipmentMaintenanceYearPlanStatusType
                ]
              }}
            </el-tag>
          </template>

          <template #operation-default="{ row }">
            <el-button v-if="canEdit(row)" link type="primary" size="small" @click="onEditClick(row)">
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
            <el-button v-if="canVoid(row)" link type="warning" size="small" @click="onVoidClick(row)">
              作废
            </el-button>
            <el-button v-if="canSplit(row)" link type="primary" size="small" @click="onSplitClick(row)">
              手动拆分
            </el-button>
            <el-button link type="primary" size="small" @click="onDetailClick(row)">查看详情</el-button>
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

    <YearPlanDialog
      v-model="dialogState.visible"
      :id="dialogState.id"
      :mode="dialogState.mode"
      @success="customTableRef?.requestData()"
      @split="onSplitClick"
    />

    <MonthPlanSplitDialog
      v-model="splitDialogState.visible"
      :year-plan="splitDialogState.row"
      @success="onSplitSuccess"
    />
  </div>
</template>

<script setup lang="ts" name="yearPlan">
import { ElMessage, ElMessageBox } from "element-plus"

import {
  queryEquipmentMaintenanceYearPlanPageList,
  requestDeleteEquipmentMaintenanceYearPlan,
  requestReviewEquipmentMaintenanceYearPlan,
  requestVoidEquipmentMaintenanceYearPlan
} from "@/api/operation/equipment/equipment-maintenance-year-plan"
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
  EnumEquipmentMaintenanceYearPlanStatusTagTypeMap,
  EnumEquipmentMaintenanceYearPlanStatusType,
  EnumEquipmentMaintenanceYearPlanStatusTypeMap
} from "@/constant/enums"
import useButtonAuth from "@/hooks/useButtonAuth"
import type {
  IEquipmentMaintenanceYearPlanPageItem as ITableRow,
  IEquipmentMaintenanceYearPlanPageParams
} from "@/types/maintain/equipment-manage/equipment-maintenance-year-plan"

import MonthPlanSplitDialog from "./components/MonthPlanSplitDialog.vue"
import YearPlanDialog from "./components/YearPlanDialog.vue"

defineOptions({
  name: "YearPlan"
})

const isAuth = useButtonAuth("YearPlan_update", "YearPlan_query")

const searchFormData = ref<ISearchItem[]>([
  {
    type: EnumComponentType.Date,
    dateType: "year",
    key: "planYear",
    label: "计划年度",
    value: "",
    placeholder: "请选择计划年度",
    format: "YYYY",
    valueFormat: "YYYY"
  },
  {
    type: EnumComponentType.Input,
    key: "planName",
    label: "计划名称",
    value: "",
    placeholder: "请输入计划名称"
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
        value: EnumEquipmentMaintenanceYearPlanStatusType.Unreviewed
      },
      {
        label: "已复核",
        value: EnumEquipmentMaintenanceYearPlanStatusType.Reviewed
      },
      {
        label: "已作废",
        value: EnumEquipmentMaintenanceYearPlanStatusType.Voided
      }
    ]
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  planName?: string
  planYear?: string
  status?: number
}>(searchFormData.value)

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const dialogState = reactive<{
  visible: boolean
  mode: "create" | "edit" | "detail"
  id: string
}>({
  visible: false,
  mode: "create",
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
      label: "年计划单号",
      minWidth: 150
    },
    {
      prop: "planYear",
      label: "计划年度",
      width: 120,
      align: "center"
    },
    {
      prop: "planName",
      label: "计划名称",
      minWidth: 200
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
      prop: "totalCount",
      label: "保养设备总数",
      width: 140,
      align: "right"
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
      minWidth: 280,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

const queryConfig: ITableRequestConfig<[IEquipmentMaintenanceYearPlanPageParams], ITableRow, true> = {
  api: queryEquipmentMaintenanceYearPlanPageList,
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

function onReset() {
  resetForm()
  onSubmit()
}

async function onSubmit() {
  pagination.value.currentPage = 1
  await customTableRef.value?.requestData()
}

function openDialog(mode: "create" | "edit" | "detail", id = "") {
  dialogState.mode = mode
  dialogState.id = id
  dialogState.visible = true
}

function canEdit(row: ITableRow) {
  return (
    isAuth.value &&
    Number(row.status) === Number(EnumEquipmentMaintenanceYearPlanStatusType.Unreviewed)
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
    Number(row.status) === Number(EnumEquipmentMaintenanceYearPlanStatusType.Reviewed)
  )
}

function canSplit(row: Partial<ITableRow>) {
  return (
    isAuth.value &&
    Number(row.status) === Number(EnumEquipmentMaintenanceYearPlanStatusType.Reviewed)
  )
}

function onCreateClick() {
  openDialog("create")
}

function onEditClick(row: ITableRow) {
  openDialog("edit", String(row.id || ""))
}

function onDetailClick(row: ITableRow) {
  openDialog("detail", String(row.id || ""))
}

function onSplitClick(row: Partial<ITableRow>) {
  splitDialogState.row = {
    id: row.id,
    planNo: row.planNo,
    planName: row.planName,
    status: row.status
  }
  splitDialogState.visible = true
}

async function onSplitSuccess() {
  await customTableRef.value?.requestData()
}

async function onDeleteClick(row: ITableRow) {
  try {
    await ElMessageBox.confirm(`确认删除年计划 ${row.planNo} 吗？`, "删除确认", {
      type: "warning",
      confirmButtonText: "确认",
      cancelButtonText: "取消"
    })
    await requestDeleteEquipmentMaintenanceYearPlan(String(row.id || ""))
    ElMessage.success("删除成功")
    await customTableRef.value?.requestData()
  } catch (error) {
    if (isMessageBoxCancel(error)) return
    ElMessage.error("删除失败")
  }
}

async function onReviewClick(row: ITableRow) {
  try {
    await ElMessageBox.confirm(`确认复核年计划 ${row.planNo} 吗？`, "复核确认", {
      type: "warning",
      confirmButtonText: "确认",
      cancelButtonText: "取消"
    })
    await requestReviewEquipmentMaintenanceYearPlan({ id: String(row.id || "") })
    ElMessage.success("复核成功")
    await customTableRef.value?.requestData()
  } catch (error) {
    if (isMessageBoxCancel(error)) return
    ElMessage.error("复核失败")
  }
}

async function onVoidClick(row: ITableRow) {
  try {
    const { value } = await ElMessageBox.prompt(`请填写年计划 ${row.planNo} 的作废原因`, "作废确认", {
      confirmButtonText: "确认作废",
      cancelButtonText: "取消",
      inputPlaceholder: "请输入作废原因",
      inputType: "textarea",
      inputValidator: (reason) => {
        if (!reason?.trim()) return "请输入作废原因"
        return true
      }
    })
    await requestVoidEquipmentMaintenanceYearPlan({
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
