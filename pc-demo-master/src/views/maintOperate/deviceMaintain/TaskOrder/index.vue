<template>
  <div class="layout-container">
    <div class="layout-main-page" v-show="curPageKey === EnumPageType.Main">
      <CustomSearchForm :form-list="searchList" @search="onSubmit" @reset="onReset" />

      <div class="custom-table-container">
        <CustomTitle title="保养任务单列表">
          <el-button v-if="isAuth" type="primary" icon="Plus" @click="onCreate">新增</el-button>
        </CustomTitle>
        <CustomTable
          ref="customTableRef"
          v-model:table-data="customTableData"
          v-model:total="pagination.total"
          :config="tableConfig"
          :query-config="queryConfig"
          class="custom-table"
        >
          <template #taskSource-default="{ row }">
            {{ resolveTaskSourceText(row) }}
          </template>

          <template #taskStatus-default="{ row }">
            <el-tag :type="TaskStatusTagTypeMap[resolveTaskStatus(row)]">
              {{ TaskStatusTextMap[resolveTaskStatus(row)] }}
            </el-tag>
          </template>

          <template #maintenanceResult-default="{ row }">
            <el-tag :type="MaintenanceResultTagTypeMap[resolveMaintenanceResult(row)]">
              {{ MaintenanceResultTextMap[resolveMaintenanceResult(row)] }}
            </el-tag>
          </template>

          <template #equipmentNo-default="{ row }">
            <el-button link type="primary" size="small" @click="onReviewDeviceInfo(row)">
              {{ row.equipmentNo || "--" }}
            </el-button>
          </template>

          <template #operation-default="{ row }">
            <el-button v-if="canEdit(row)" link type="primary" size="small" @click="onEdit(row)">
              编辑
            </el-button>
            <el-button v-if="canDelete(row)" link type="danger" size="small" @click="onDelete(row)">
              删除
            </el-button>
            <el-button v-if="canReview(row)" link type="primary" size="small" @click="onReview(row)">
              复核
            </el-button>
            <el-button v-if="canVoid(row)" link type="warning" size="small" @click="onVoid(row)">
              作废
            </el-button>
            <el-button
              v-if="canViewDetail(row)"
              link
              type="primary"
              size="small"
              @click="onReviewDetail(row)"
            >
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

    <div class="layout-child-page" v-if="curPageKey !== EnumPageType.Main">
      <CustomPageCrumbs v-model="curPageKey" :data="pageTree" />

      <EquipmentTaskOrderCreateOrUpdate
        v-if="
          [EnumPageType.Maintenance_order_create, EnumPageType.Maintenance_order_update].includes(
            curPageKey
          )
        "
        :id="selectedRow?.id || ''"
        :key="selectedRow?.id || curPageKey"
        @close="onCreateOrUpdateClose"
        @success="onSuccess"
      />

      <EquipmentTaskOrderDetail
        v-if="curPageKey === EnumPageType.Maintenance_order_detail"
        :id="selectedRow?.id || ''"
        @close="curPageKey = EnumPageType.Main"
      />
    </div>

    <DeviceInfo v-model="deviceInfoVisible" :id="currentDeviceId" />
  </div>
</template>

<script setup lang="ts">
import dayjs from "dayjs"
import { ElMessage, ElMessageBox } from "element-plus"

import {
  queryEquipmentMaintenanceTaskPageList,
  requestCheckEquipmentMaintenanceTask,
  requestDeleteEquipmentMaintenanceTask,
  requestVoidEquipmentMaintenanceTask
} from "@/api/operation/equipment/equipment-maintenance-task"
import CustomPageCrumbs from "@/components/CustomPageCrumbs/index.vue"
import CustomPagination from "@/components/CustomPagination/index.vue"
import useSearchForm from "@/components/CustomSearchForm/hooks/index"
import CustomSearchForm from "@/components/CustomSearchForm/index.vue"
import { EnumComponentType, type ISearchItem } from "@/components/CustomSearchForm/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  IColumnSortInfo,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import { TIME_RANGE } from "@/constant/time"
import useButtonAuth from "@/hooks/useButtonAuth"
import type {
  IEquipmentMaintenanceTaskPageItem as ITableRow,
  IEquipmentMaintenanceTaskPageParams
} from "@/types/maintain/equipment-manage/equipment-maintenance-task"
import DeviceInfo from "@/views/maintOperate/components/DeviceInfo.vue"

import EquipmentTaskOrderCreateOrUpdate from "./components/EquipmentTaskOrderCreateOrUpdate.vue"
import EquipmentTaskOrderDetail from "./components/EquipmentTaskOrderDetail.vue"

defineOptions({
  name: "MaintainTask"
})

enum EnumTaskStatus {
  UNREVIEWED = 0,
  PENDING = 1,
  EXECUTING = 2,
  FINISHED = 3,
  VOIDED = 5
}

const TaskStatusTextMap: Record<EnumTaskStatus, string> = {
  [EnumTaskStatus.UNREVIEWED]: "未复核",
  [EnumTaskStatus.PENDING]: "未执行",
  [EnumTaskStatus.EXECUTING]: "执行中",
  [EnumTaskStatus.FINISHED]: "已完成",
  [EnumTaskStatus.VOIDED]: "已作废"
}

const TaskStatusTagTypeMap: Record<
  EnumTaskStatus,
  "danger" | "warning" | "primary" | "success" | "info"
> = {
  [EnumTaskStatus.UNREVIEWED]: "warning",
  [EnumTaskStatus.PENDING]: "danger",
  [EnumTaskStatus.EXECUTING]: "primary",
  [EnumTaskStatus.FINISHED]: "success",
  [EnumTaskStatus.VOIDED]: "info"
}

const MaintenanceResultTextMap: Record<number, string> = {
  0: "NG",
  1: "OK",
  2: "未出结果"
}

const MaintenanceResultTagTypeMap: Record<number, "danger" | "success" | "info"> = {
  0: "danger",
  1: "success",
  2: "info"
}

const TaskSourceTextMap: Record<string, string> = {
  manual: "手动新增",
  manual_create: "手动新增",
  week_plan: "周计划生成",
  count: "按次数",
  by_count: "按次数",
  time: "按时间",
  by_time: "按时间",
  "3": "保养计划",
  "4": "手动新增"
}

enum EnumPageType {
  Maintenance_order_create = 0,
  Maintenance_order_update = 1,
  Main,
  Maintenance_order_detail
}

const isAuth = useButtonAuth("MaintainTask_update", "MaintainTask_query")

const curPageKey = ref(EnumPageType.Main)
const pageTree = ref([
  {
    name: "保养任务单",
    key: EnumPageType.Main,
    children: [
      {
        name: "新增保养任务单",
        key: EnumPageType.Maintenance_order_create
      },
      {
        name: "编辑保养任务单",
        key: EnumPageType.Maintenance_order_update
      },
      {
        name: "保养任务单详情",
        key: EnumPageType.Maintenance_order_detail
      }
    ]
  }
])

const taskStatusOptions = ref<{ label: string; value: number }[]>([])
const maintenanceResultOptions = ref<{ label: string; value: number }[]>([])

const searchFormData = ref<ISearchItem[]>([
  {
    type: EnumComponentType.Input,
    key: "taskNo",
    label: "任务单号",
    value: "",
    placeholder: "请输入任务单号"
  },
  {
    type: EnumComponentType.Select,
    key: "taskSourceList",
    label: "任务单来源",
    value: "",
    placeholder: "请选择任务单来源",
    options: [
      { label: "手动新增", value: "manual_create" },
      { label: "周计划生成", value: "week_plan" }
    ],
    multiple: true,
    maxTag: 2
  },
  {
    type: EnumComponentType.Select,
    key: "taskStatusList",
    label: "任务状态",
    value: "",
    placeholder: "请选择任务状态",
    options: taskStatusOptions,
    multiple: true,
    maxTag: 2
  },
  {
    type: EnumComponentType.Date,
    dateType: "datetimerange",
    key: "date",
    label: "创建时间",
    value: [],
    placeholder: ["请选择开始时间", "请选择结束时间"],
    format: "YYYY-MM-DD HH:mm:ss",
    valueFormat: "YYYY-MM-DD HH:mm:ss",
    defaultTime: TIME_RANGE,
    keyword: ["startTime", "endTime"]
  },
  {
    type: EnumComponentType.Select,
    key: "maintenanceResultList",
    label: "保养结果",
    value: "",
    placeholder: "请选择保养结果",
    options: maintenanceResultOptions,
    multiple: true,
    maxTag: 3
  },
  {
    type: EnumComponentType.Input,
    key: "equipmentNo",
    label: "设备编号",
    value: "",
    placeholder: "请输入设备编号"
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  taskNo: string
  equipmentNo: string
  startTime?: string
  endTime?: string
  taskSourceList?: string[]
  taskStatusList?: number[]
  maintenanceResultList?: number[]
}>(searchFormData.value)

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const selectedRow = ref<ITableRow>()
const deviceInfoVisible = ref(false)
const currentDeviceId = ref("")

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])

const formatDisplayTime = (value?: string) => {
  const text = String(value || "").trim()
  if (!text) return "--"
  const parsed = dayjs(text)
  return parsed.isValid() ? parsed.format("YYYY-MM-DD HH:mm") : text
}

const resolveMaintenanceResult = (row: ITableRow) => {
  return Number(row.maintenanceResult ?? row.inspectionResult ?? 2)
}

const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "taskNo",
      label: "任务单号",
      width: 160
    },
    {
      prop: "taskSource",
      label: "任务单来源",
      width: 120,
      align: "center",
      slots: {
        default: "taskSource-default"
      }
    },
    {
      prop: "taskStatus",
      label: "任务状态",
      width: 120,
      align: "center",
      slots: {
        default: "taskStatus-default"
      }
    },
    {
      prop: "maintenanceResult",
      label: "保养结果",
      width: 120,
      align: "center",
      slots: {
        default: "maintenanceResult-default"
      }
    },
    {
      prop: "createTime",
      label: "创建时间",
      width: 160,
      align: "center",
      formatter: (row: ITableRow) => formatDisplayTime(row.createTime),
      sortable: true,
      sortOrder: "desc"
    },
    {
      prop: "equipmentNo",
      label: "设备编号",
      width: 160,
      slots: {
        default: "equipmentNo-default"
      }
    },
    {
      prop: "equipmentName",
      label: "设备名称",
      width: 160
    },
    {
      prop: "equipmentTypeNo",
      label: "类型编号",
      width: 160
    },
    {
      prop: "equipmentTypeName",
      label: "类型名称",
      width: 160
    },
    {
      prop: "executePosition",
      label: "执行职位",
      width: 180,
      formatter: (row: ITableRow) => resolveExecutePosition(row)
    },
    {
      prop: "planStartTime",
      label: "计划开始时间",
      width: 180,
      formatter: (row: ITableRow) => formatDisplayTime(row.planStartTime)
    },
    {
      prop: "planEndTime",
      label: "计划结束时间",
      width: 180,
      formatter: (row: ITableRow) => formatDisplayTime(row.planEndTime)
    },
    {
      prop: "maintenanceStart",
      label: "保养开始时间",
      width: 180,
      formatter: (row: ITableRow) => formatDisplayTime(row.maintenanceStart)
    },
    {
      prop: "maintenanceComplete",
      label: "保养结束时间",
      width: 180,
      formatter: (row: ITableRow) => formatDisplayTime(row.maintenanceComplete)
    },
    {
      prop: "maintenanceTime",
      label: "保养耗时",
      width: 120,
      align: "center",
      formatter: (row: ITableRow) => resolveMaintenanceTimeText(row)
    },
    {
      prop: "remarks",
      label: "备注",
      width: 160
    },
    {
      prop: "operation",
      label: "操作",
      width: 260,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

const queryConfig: ITableRequestConfig<[IEquipmentMaintenanceTaskPageParams], ITableRow, true> = {
  api: queryEquipmentMaintenanceTaskPageList,
  getParams: (sortData: IColumnSortInfo[]) => {
    const { startTime, endTime, ...rest } = getFormData()
    return [
      {
        pageQuery: {
          pageNum: pagination.value.currentPage,
          pageSize: pagination.value.pageSize
        },
        queryParam: {
          ...rest
        },
        dateRange: {
          startDate: startTime,
          endDate: endTime
        },
        sort: sortData.map((item) => ({
          field: item.sortField,
          order: item.order || "desc"
        }))
      }
    ]
  }
}

onMounted(() => {
  buildOptions()
  customTableRef.value?.requestData()
})

const buildOptions = () => {
  taskStatusOptions.value = Object.entries(TaskStatusTextMap).map(([key, label]) => ({
    label,
    value: Number(key)
  }))
  maintenanceResultOptions.value = Object.entries(MaintenanceResultTextMap).map(([key, label]) => ({
    label,
    value: Number(key)
  }))
}

const onReset = () => {
  resetForm()
  onSubmit()
}

const onSubmit = async () => {
  pagination.value.currentPage = 1
  await customTableRef.value?.requestData()
}

const resolveTaskStatus = (row: ITableRow): EnumTaskStatus => {
  const status = Number(row.taskStatus ?? row.maintenanceStatus ?? 0)
  if (status === 1) return EnumTaskStatus.PENDING
  if (status === 2) return EnumTaskStatus.EXECUTING
  if (status === 3) return EnumTaskStatus.FINISHED
  if (status === 5) return EnumTaskStatus.VOIDED
  return EnumTaskStatus.UNREVIEWED
}

const resolveTaskSourceText = (row: ITableRow) => {
  const key = String(row.taskSource || row.taskSourceName || row.sourceType || "").toLowerCase()
  return TaskSourceTextMap[key] || "--"
}

const resolveExecutePosition = (row: ITableRow) => {
  const dep = String(row.executeDepartmentName || "").trim()
  const pos = String(row.executePositionName || row.executePosition || "").trim()
  if (dep && pos && !pos.includes(dep)) return `${dep}-${pos}`
  return pos || dep || "--"
}

const resolveMaintenanceTimeText = (row: ITableRow) => {
  const seconds = Number(row.maintenanceCostSeconds || 0)
  if (seconds > 0) {
    return `${Math.round(seconds / 60)}分钟`
  }
  if (row.maintenanceStart && row.maintenanceComplete) {
    return `${dayjs(row.maintenanceComplete).diff(row.maintenanceStart, "minute")}分钟`
  }
  return "--"
}

const canEdit = (row: ITableRow) => resolveTaskStatus(row) === EnumTaskStatus.UNREVIEWED
const canDelete = (row: ITableRow) => resolveTaskStatus(row) === EnumTaskStatus.UNREVIEWED
const canReview = (row: ITableRow) => resolveTaskStatus(row) === EnumTaskStatus.UNREVIEWED
const canVoid = (row: ITableRow) => {
  const status = resolveTaskStatus(row)
  return (
    status === EnumTaskStatus.UNREVIEWED ||
    status === EnumTaskStatus.PENDING ||
    status === EnumTaskStatus.EXECUTING
  )
}
const canViewDetail = (row: ITableRow) => resolveTaskStatus(row) !== EnumTaskStatus.UNREVIEWED

const onCreate = () => {
  selectedRow.value = undefined
  curPageKey.value = EnumPageType.Maintenance_order_create
}

const onEdit = (row: ITableRow) => {
  selectedRow.value = row
  curPageKey.value = EnumPageType.Maintenance_order_update
}

const onReviewDetail = (row: ITableRow) => {
  selectedRow.value = row
  curPageKey.value = EnumPageType.Maintenance_order_detail
}

const onCreateOrUpdateClose = () => {
  curPageKey.value = EnumPageType.Main
}

const onSuccess = async () => {
  curPageKey.value = EnumPageType.Main
  await nextTick()
  await onSubmit()
}

const onReviewDeviceInfo = (row: ITableRow) => {
  currentDeviceId.value = String(row.equipmentId || "")
  deviceInfoVisible.value = true
}

const isMessageBoxCancel = (error: unknown) => {
  const message = String(error ?? "").toLowerCase()
  return message.includes("cancel") || message.includes("close")
}

const onDelete = async (row: ITableRow) => {
  const id = String(row.id || "")
  if (!id) {
    ElMessage.error("缺少任务单ID，无法删除")
    return
  }
  try {
    await ElMessageBox.confirm(`确认删除任务单 ${row.taskNo} 吗？`, "删除确认", {
      type: "warning",
      confirmButtonText: "确认",
      cancelButtonText: "取消"
    })
    await requestDeleteEquipmentMaintenanceTask(id)
    ElMessage.success("删除成功")
    await customTableRef.value?.requestData()
  } catch (error) {
    if (isMessageBoxCancel(error)) return
    console.error(error)
    ElMessage.error("删除失败")
  }
}

const onReview = async (row: ITableRow) => {
  const id = String(row.id || "")
  if (!id) {
    ElMessage.error("缺少任务单ID，无法复核")
    return
  }
  try {
    await ElMessageBox.confirm(`确认复核任务单 ${row.taskNo} 吗？`, "复核确认", {
      type: "warning",
      confirmButtonText: "确认",
      cancelButtonText: "取消"
    })
    await requestCheckEquipmentMaintenanceTask({ id })
    ElMessage.success("复核成功")
    await customTableRef.value?.requestData()
  } catch (error) {
    if (isMessageBoxCancel(error)) return
    console.error(error)
    ElMessage.error("复核失败")
  }
}

const onVoid = async (row: ITableRow) => {
  const id = String(row.id || "")
  if (!id) {
    ElMessage.error("缺少任务单ID，无法作废")
    return
  }
  try {
    const { value } = await ElMessageBox.prompt(
      `请填写任务单 ${row.taskNo} 的作废原因`,
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
    await requestVoidEquipmentMaintenanceTask({
      id,
      voidReason: String(value || "").trim()
    })
    ElMessage.success("作废成功")
    await customTableRef.value?.requestData()
  } catch (error) {
    if (isMessageBoxCancel(error)) return
    console.error(error)
    ElMessage.error("作废失败")
  }
}
</script>
