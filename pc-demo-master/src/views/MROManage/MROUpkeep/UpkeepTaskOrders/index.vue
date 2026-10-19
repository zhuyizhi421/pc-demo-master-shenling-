<template>
  <div class="layout-container">
    <div class="layout-main-page" v-show="curPageKey === EnumPageType.Main">
      <CustomSearchForm
        :form-list="searchList"
        @search="onSubmit"
        @reset="onReset"
      ></CustomSearchForm>

      <div class="custom-table-container">
        <CustomTitle title="保养任务单列表">
          <el-button type="primary" icon="Plus" @click="onCreate">新增</el-button>
        </CustomTitle>
        <CustomTable
          ref="customTableRef"
          v-model:table-data="customTableData"
          v-model:total="pagination.total"
          :config="tableConfig"
          :query-config="queryConfig"
          class="custom-table"
        >
          <template #maintenanceStatus-default="{ row }">
            <el-tag :type="TaskStatusTagTypeMap[resolveTaskStatus(row)]">{{
              TaskStatusTextMap[resolveTaskStatus(row)]
            }}</el-tag>
          </template>

          <template #taskSource-default="{ row }">
            {{ resolveTaskSourceText(row) }}
          </template>

          <template #mroSerialNo-default="{ row }">
            <el-button link type="primary" size="small" @click="onReviewMroInfo(row)"
              >{{ resolveMroSerialNo(row) }}
            </el-button>
          </template>

          <template #maintenanceResult-default="{ row }">
            <el-tag
              :type="
                EnumMROMaintenanceTaskResultTagMap[
                  row.maintenanceResult as EnumMROMaintenanceTaskResult
                ]
              "
              >{{
                EnumMROMaintenanceTaskResultMap[
                  row.maintenanceResult as EnumMROMaintenanceTaskResult
                ]
              }}</el-tag
            >
          </template>

          <template #mroModelNo-default="{ row }">
            <el-button link type="primary" size="small" @click="onReviewMroInfo(row)"
              >{{ row.mroModelNo }}
            </el-button>
          </template>

          <template #mroModelName-default="{ row }">
            <el-button link type="primary" size="small" @click="onReviewMroModelInfo(row)"
              >{{ row.mroModelName }}
            </el-button>
          </template>

          <template #operation-default="{ row }">
            <el-button v-if="canEdit(row)" link type="primary" size="small" @click="onEdit(row)"
              >编辑
            </el-button>
            <el-button v-if="canDelete(row)" link type="danger" size="small" @click="onDelete(row)"
              >删除
            </el-button>
            <el-button v-if="canReview(row)" link type="primary" size="small" @click="onReview(row)"
              >复核
            </el-button>
            <el-button v-if="canVoid(row)" link type="warning" size="small" @click="onVoid(row)"
              >作废
            </el-button>
            <el-button
              v-if="canViewDetail(row)"
              link
              type="primary"
              size="small"
              @click="onReviewDetail(row)"
              >查看详情
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

    <!-- 子页面部分 -->
    <div class="layout-child-page" v-if="curPageKey !== EnumPageType.Main">
      <CustomPageCrumbs v-model="curPageKey" :data="pageTree" />

      <!-- 保养任务单详情 -->
      <UpkeepTaskOrderCreateOrUpdate
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

      <UpkeepTaskOrderDetail
        v-if="curPageKey === EnumPageType.Maintenance_order_detail"
        :id="selectedRow?.id || ''"
        @close="curPageKey = EnumPageType.Main"
      />

      <!-- 保养异常工单详情 -->
      <UpkeepErrorOrderDetail
        v-if="curPageKey === EnumPageType.Maintenance_exception_order_detail"
        :id="curMaintenanceExceptionOrderDetailId"
        @close="curPageKey = EnumPageType.Maintenance_order_detail"
      />
    </div>

    <!-- MRO编号信息弹窗 -->
    <MroInfoDialog v-model="mroInfoVisible" :mro-id="selectedRow?.mroInformationId || ''" />

    <!-- MRO型号信息弹窗 -->
    <MroModelInfoDialog
      v-model="mroModelInfoVisible"
      :mro-model-id="selectedRow?.mroModelId || ''"
    />
  </div>
</template>

<script setup lang="ts">
import dayjs from "dayjs"
import { ElMessage, ElMessageBox } from "element-plus"

import {
  queryMroMaintenanceTaskPageList,
  requestCheckMroMaintenanceTask,
  requestDeleteMroMaintenanceTask,
  requestVoidMroMaintenanceTask
} from "@/api/operation/mro/mro-maintenance-task"
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
import {
  EnumMROMaintenanceTaskResult,
  EnumMROMaintenanceTaskResultMap,
  EnumMROMaintenanceTaskResultTagMap,
  EnumMROMaintenanceTaskStatus
} from "@/constant/enums"
import { TIME_RANGE } from "@/constant/time"
import type {
  IMroMaintenanceTaskPageListItem as ITableRow,
  IMroMaintenanceTaskPageListParams
} from "@/types/maintain/mro-manage/mro-maintenance-task"
import MroInfoDialog from "@/views/MROManage/MROInfo/components/MroInfoDialog.vue"
import MroModelInfoDialog from "@/views/MROManage/MROModelManage/components/MroModelInfoDialog.vue"
import UpkeepErrorOrderDetail from "@/views/MROManage/MROUpkeep/UpkeepErrorOrders/components/UpkeepErrorOrderDetail.vue"

import UpkeepTaskOrderCreateOrUpdate from "./components/UpkeepTaskOrderCreateOrUpdate.vue"
import UpkeepTaskOrderDetail from "./components/UpkeepTaskOrderDetail.vue"

defineOptions({
  name: "UpkeepTaskOrders"
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

const TaskSourceTextMap: Record<string, string> = {
  manual: "手动新增",
  manual_create: "手动新增",
  count: "按次数",
  by_count: "按次数",
  time: "按时间",
  by_time: "按时间"
}

/** 页面显示类型枚举 */
enum EnumPageType {
  Maintenance_order_create = 0,
  Maintenance_order_update = 1,
  Main, // 列表页
  Maintenance_order_detail, // 保养任务单详情页
  Maintenance_exception_order_detail // 保养异常工单详情页
}

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
        key: EnumPageType.Maintenance_order_detail,
        children: [
          {
            name: "保养异常工单详情",
            key: EnumPageType.Maintenance_exception_order_detail
          }
        ]
      }
    ]
  }
])

const maintenanceStatusOptions = ref<
  {
    label: string
    value: number
  }[]
>([])

const maintenanceResultOptions = ref<
  {
    label: string
    value: number
  }[]
>([])

const searchFormData = ref<ISearchItem[]>([
  {
    type: EnumComponentType.Input,
    key: "maintenanceNo",
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
      { label: "按次数", value: "by_count" },
      { label: "按时间", value: "by_time" }
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
    options: maintenanceStatusOptions,
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
    key: "mroNo",
    label: "MRO序列号",
    value: "",
    placeholder: "请输入MRO序列号"
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  maintenanceNo: string
  mroNo: string
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

const curMaintenanceExceptionOrderDetailId = ref("")
provide("maintenanceExceptionOrderDetail", {
  openDetail: (id: string) => {
    curMaintenanceExceptionOrderDetailId.value = id
    curPageKey.value = EnumPageType.Maintenance_exception_order_detail
  }
})

const mroInfoVisible = ref(false)
const mroModelInfoVisible = ref(false)
const selectedRow = ref<ITableRow>()

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const formatDisplayTime = (value?: string) => {
  const text = String(value || "").trim()
  if (!text) return "--"
  const parsed = dayjs(text)
  return parsed.isValid() ? parsed.format("YYYY-MM-DD HH:mm") : text
}
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "maintenanceNo",
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
      prop: "maintenanceStatus",
      label: "任务状态",
      width: 120,
      align: "center",
      slots: {
        default: "maintenanceStatus-default"
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
      prop: "mroNo",
      label: "MRO序列号",
      width: 160,
      slots: {
        default: "mroSerialNo-default"
      }
    },
    // {
    //   prop: "mroModelNo",
    //   label: "MRO编号",
    //   width: 160,
    //   slots: {
    //     default: "mroModelNo-default"
    //   }
    // },
    {
      prop: "mroModelName",
      label: "MRO名称",
      width: 160,
      slots: {
        default: "mroModelName-default"
      }
    },
    // {
    //   prop: "mroSpec",
    //   label: "MRO规格",
    //   width: 160
    // },
    // {
    //   prop: "mroClassifyName",
    //   label: "MRO分类",
    //   width: 160
    // },
    // {
    //   prop: "mroTypeName",
    //   label: "MRO类型",
    //   width: 160
    // },
    {
      prop: "executePosition",
      label: "执行职位",
      width: 180,
      formatter: (row: ITableRow) => resolveExecutePosition(row)
    },
    {
      prop: "planStartTime",
      label: "计划开始时间",
      width: 180
    },
    {
      prop: "maintenanceStart",
      label: "保养开始时间(实际)",
      width: 180,
      formatter: (row: ITableRow) => formatDisplayTime(row.maintenanceStart)
    },
    {
      prop: "maintenanceComplete",
      label: "保养结束时间(实际)",
      width: 180,
      formatter: (row: ITableRow) => formatDisplayTime(row.maintenanceComplete)
    },
    // {
    //   prop: "submitterName",
    //   label: "提交人",
    //   width: 120
    // },
    // {
    //   prop: "checkByName",
    //   label: "复核人",
    //   width: 120
    // },
    // {
    //   prop: "checkTime",
    //   label: "复核时间",
    //   width: 180
    // },
    // {
    //   prop: "voidByName",
    //   label: "作废人",
    //   width: 120
    // },
    // {
    //   prop: "voidReason",
    //   label: "作废原因",
    //   width: 180
    // },
    // {
    //   prop: "voidTime",
    //   label: "作废时间",
    //   width: 180
    // },
    // {
    //   prop: "maintenanceTime",
    //   label: "保养耗时",
    //   width: 120,
    //   align: "center",
    //   formatter: (row: ITableRow) => {
    //     return row.maintenanceComplete && row.maintenanceStart
    //       ? dayjs(row.maintenanceComplete).diff(dayjs(row.maintenanceStart), "minutes") + "分钟"
    //       : "未结束"
    //   }
    // },
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
const queryConfig: ITableRequestConfig<[IMroMaintenanceTaskPageListParams], ITableRow, true> = {
  api: queryMroMaintenanceTaskPageList,
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
          order: item.order!
        }))
      }
    ]
  }
}

onMounted(() => {
  buildOptions()
  customTableRef.value?.requestData()
})

/** 构建下拉选项 */
const buildOptions = () => {
  maintenanceStatusOptions.value = Object.entries(TaskStatusTextMap).map(([key, label]) => ({
    label,
    value: Number(key)
  }))

  maintenanceResultOptions.value = Object.keys(EnumMROMaintenanceTaskResultMap).map((key) => ({
    label: EnumMROMaintenanceTaskResultMap[key as unknown as EnumMROMaintenanceTaskResult],
    value: +key
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

const asRecord = (row: ITableRow) => row as unknown as Record<string, any>

const resolveTaskStatus = (row: ITableRow): EnumTaskStatus => {
  const source = asRecord(row)
  const taskStatus = Number(source.taskStatus ?? source.maintenanceStatus ?? 0)
  if (taskStatus === EnumMROMaintenanceTaskStatus.UNPUBLISHED) return EnumTaskStatus.UNREVIEWED
  if (taskStatus === EnumMROMaintenanceTaskStatus.PENDING) return EnumTaskStatus.PENDING
  if (taskStatus === EnumMROMaintenanceTaskStatus.EXECUTING) return EnumTaskStatus.EXECUTING
  if (taskStatus === EnumMROMaintenanceTaskStatus.FINISHED) return EnumTaskStatus.FINISHED
  if (taskStatus === EnumTaskStatus.VOIDED) return EnumTaskStatus.VOIDED
  return EnumTaskStatus.UNREVIEWED
}

const resolveTaskSourceText = (row: ITableRow) => {
  const source = asRecord(row)
  const key = String(
    source.taskSource || source.maintenanceSource || source.sourceType || ""
  ).toLowerCase()
  if (key === "unarchive_maintenance") {
    return "解封保养"
  }
  return TaskSourceTextMap[key] || source.taskSourceName || "--"
}

const resolveMroSerialNo = (row: ITableRow) => {
  const source = asRecord(row)
  return source.mroNo || row.mroNo || "--"
}

const resolveExecutePosition = (row: ITableRow) => {
  const source = asRecord(row)
  const dep = String(source.executeDepartmentName || source.departments || "").trim()
  const pos = String(source.executePositionName || source.executePosition || "").trim()
  if (dep && pos) return `${dep}-${pos}`
  return pos || dep || "--"
}

const canEdit = (row: ITableRow) => {
  const status = resolveTaskStatus(row)
  return status === EnumTaskStatus.UNREVIEWED // || status === EnumTaskStatus.PENDING
}

const canDelete = (row: ITableRow) => {
  return resolveTaskStatus(row) === EnumTaskStatus.UNREVIEWED
}

const canReview = (row: ITableRow) => {
  return resolveTaskStatus(row) === EnumTaskStatus.UNREVIEWED
}

const canVoid = (row: ITableRow) => {
  const status = resolveTaskStatus(row)
  return (
    status === EnumTaskStatus.UNREVIEWED ||
    status === EnumTaskStatus.PENDING ||
    status === EnumTaskStatus.EXECUTING
  )
}

const canViewDetail = (row: ITableRow) => {
  return resolveTaskStatus(row) !== EnumTaskStatus.UNREVIEWED
}

const onCreate = () => {
  selectedRow.value = undefined
  curPageKey.value = EnumPageType.Maintenance_order_create
}

const onEdit = (row: ITableRow) => {
  selectedRow.value = row
  curPageKey.value = EnumPageType.Maintenance_order_update
}

const onCreateOrUpdateClose = () => {
  curPageKey.value = EnumPageType.Main
}

const onSuccess = async () => {
  curPageKey.value = EnumPageType.Main
  await nextTick()
  await onSubmit()
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
    await ElMessageBox.confirm(`确认删除任务单 ${row.maintenanceNo} 吗？`, "删除确认", {
      type: "warning",
      confirmButtonText: "确认",
      cancelButtonText: "取消"
    })
    await requestDeleteMroMaintenanceTask(id)
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
    await ElMessageBox.confirm(`确认复核任务单 ${row.maintenanceNo} 吗？`, "复核确认", {
      type: "warning",
      confirmButtonText: "确认",
      cancelButtonText: "取消"
    })
    await requestCheckMroMaintenanceTask({ id })
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
      `请填写任务单 ${row.maintenanceNo} 的作废原因`,
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
    await requestVoidMroMaintenanceTask({
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

/** 查看MRO信息 */
const onReviewMroInfo = (row: ITableRow) => {
  mroInfoVisible.value = true
  selectedRow.value = row
}

/** 查看MRO型号信息 */
const onReviewMroModelInfo = (row: ITableRow) => {
  mroModelInfoVisible.value = true
  selectedRow.value = row
}

/** 查看保养任务单详情 */
const onReviewDetail = (row: ITableRow) => {
  curPageKey.value = EnumPageType.Maintenance_order_detail
  selectedRow.value = row
}
</script>

<style scoped lang="scss"></style>
