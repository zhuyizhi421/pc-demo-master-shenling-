<template>
  <div class="layout-container">
    <div class="layout-main-page" v-show="curPageKey === EnumPageType.Main">
      <CustomSearchForm
        :form-list="searchList"
        @search="onSubmit"
        @reset="onReset"
      ></CustomSearchForm>

      <div class="custom-table-container">
        <CustomTitle title="校验任务单列表">
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
          <template #inspectionStatus-default="{ row }">
            <el-tag :type="TaskStatusTagTypeMap[resolveTaskStatus(row)]">{{
              TaskStatusTextMap[resolveTaskStatus(row)]
            }}</el-tag>
          </template>

          <template #taskSource-default="{ row }">
            {{ resolveTaskSourceText(row) }}
          </template>

          <template #mroNo-default="{ row }">
            <el-button link type="primary" size="small" @click="onReviewMroInfo(row)"
              >{{ resolveMroSerialNo(row) }}
            </el-button>
          </template>

          <template #inspectionResult-default="{ row }">
            <el-tag
              :type="
                EnumMROInspectionTaskResultTagMap[
                  row.inspectionResult as EnumMROInspectionTaskResult
                ]
              "
              >{{
                EnumMROInspectionTaskResultMap[row.inspectionResult as EnumMROInspectionTaskResult]
              }}</el-tag
            >
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

    <div class="layout-child-page" v-if="curPageKey !== EnumPageType.Main">
      <CustomPageCrumbs v-model="curPageKey" :data="pageTree" />

      <VerifyTaskOrderCreateOrUpdate
        v-if="
          [EnumPageType.Verify_order_create, EnumPageType.Verify_order_update].includes(curPageKey)
        "
        :id="selectedRow?.id || ''"
        :key="selectedRow?.id || curPageKey"
        @close="onCreateOrUpdateClose"
        @success="onSuccess"
      />

      <MroVerifyTaskDetail
        v-if="curPageKey === EnumPageType.Verify_order_detail"
        :mro-task-id="selectedRow?.id || ''"
        @close="curPageKey = EnumPageType.Main"
      />

      <VerifyAbnormalOrderDetail
        v-if="curPageKey === EnumPageType.Verify_exception_order_detail"
        :id="curVerifyAbnormalOrderId"
        :type="1"
        @success="customTableRef?.requestData()"
        @close="curPageKey = EnumPageType.Verify_order_detail"
      />
    </div>

    <MroInfoDialog v-model="mroInfoVisible" :mro-id="selectedRow?.mroInformationId || ''" />

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
  queryMroInspectionTaskPageList,
  requestCheckMroInspectionTask,
  requestDeleteMroInspectionTask,
  requestVoidMroInspectionTask
} from "@/api/operation/mro/mro-verify-task"
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
  EnumMROInspectionTaskResult,
  EnumMROInspectionTaskResultMap,
  EnumMROInspectionTaskResultTagMap
} from "@/constant/enums"
import { TIME_RANGE } from "@/constant/time"
import type {
  IMroInspectionTaskPageListItem as ITableRow,
  IMroInspectionTaskPageListParams
} from "@/types/maintain/mro-manage/mro-verify-task"
import MroInfoDialog from "@/views/MROManage/MROInfo/components/MroInfoDialog.vue"
import MroModelInfoDialog from "@/views/MROManage/MROModelManage/components/MroModelInfoDialog.vue"
import VerifyAbnormalOrderDetail from "@/views/MROManage/MROVerify/VerifyAbnormalOrders/components/VerifyAbnormalOrderDetail.vue"

import MroVerifyTaskDetail from "./components/MroVerifyTaskDetail/index.vue"
import VerifyTaskOrderCreateOrUpdate from "./components/VerifyTaskOrderCreateOrUpdate.vue"

defineOptions({
  name: "VerifyTaskOrders"
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

enum EnumPageType {
  Verify_order_create = 0,
  Verify_order_update = 1,
  Main,
  Verify_order_detail,
  Verify_exception_order_detail
}

const curPageKey = ref(EnumPageType.Main)
const pageTree = ref([
  {
    name: "校验任务单",
    key: EnumPageType.Main,
    children: [
      {
        name: "新增校验任务单",
        key: EnumPageType.Verify_order_create
      },
      {
        name: "编辑校验任务单",
        key: EnumPageType.Verify_order_update
      },
      {
        name: "校验任务单详情",
        key: EnumPageType.Verify_order_detail,
        children: [
          {
            name: "校验异常工单详情",
            key: EnumPageType.Verify_exception_order_detail
          }
        ]
      }
    ]
  }
])

const inspectionStatusOptions = ref<
  {
    label: string
    value: number
  }[]
>([])

const inspectionResultOptions = ref<
  {
    label: string
    value: number
  }[]
>([])

const searchFormData = ref<ISearchItem[]>([
  {
    type: EnumComponentType.Input,
    key: "inspectionNo",
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
    options: inspectionStatusOptions,
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
    key: "inspectionResultList",
    label: "校验结果",
    value: "",
    placeholder: "请选择校验结果",
    options: inspectionResultOptions,
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
  inspectionNo: string
  mroNo: string
  startTime?: string
  endTime?: string
  taskSourceList?: string[]
  taskStatusList?: number[]
  inspectionResultList?: number[]
}>(searchFormData.value)

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const curVerifyAbnormalOrderId = ref("")
provide("verifyAbnormalOrderDetail", {
  openDetail: (id: string) => {
    curVerifyAbnormalOrderId.value = id
    curPageKey.value = EnumPageType.Verify_exception_order_detail
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
      prop: "inspectionNo",
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
      prop: "inspectionStatus",
      label: "任务状态",
      width: 120,
      align: "center",
      slots: {
        default: "inspectionStatus-default"
      }
    },
    {
      prop: "inspectionResult",
      label: "校验结果",
      width: 120,
      align: "center",
      slots: {
        default: "inspectionResult-default"
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
        default: "mroNo-default"
      }
    },
    {
      prop: "mroModelName",
      label: "MRO名称",
      width: 160,
      slots: {
        default: "mroModelName-default"
      }
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
      width: 180
    },
    {
      prop: "inspectionStart",
      label: "校验开始时间(实际)",
      width: 180,
      formatter: (row: ITableRow) => formatDisplayTime(row.inspectionStart)
    },
    {
      prop: "inspectionComplete",
      label: "校验结束时间(实际)",
      width: 180,
      formatter: (row: ITableRow) => formatDisplayTime(row.inspectionComplete)
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
const queryConfig: ITableRequestConfig<[IMroInspectionTaskPageListParams], ITableRow, true> = {
  api: queryMroInspectionTaskPageList,
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

const buildOptions = () => {
  inspectionStatusOptions.value = Object.entries(TaskStatusTextMap).map(([key, label]) => ({
    label,
    value: Number(key)
  }))

  inspectionResultOptions.value = Object.keys(EnumMROInspectionTaskResultMap).map((key) => ({
    label: EnumMROInspectionTaskResultMap[key as unknown as EnumMROInspectionTaskResult],
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
  const taskStatus = Number(source.taskStatus ?? source.inspectionStatus ?? 0)
  if (taskStatus === 4) return EnumTaskStatus.UNREVIEWED
  if (taskStatus === 1) return EnumTaskStatus.PENDING
  if (taskStatus === 2) return EnumTaskStatus.EXECUTING
  if (taskStatus === 3) return EnumTaskStatus.FINISHED
  if (taskStatus === 5) return EnumTaskStatus.VOIDED
  return EnumTaskStatus.UNREVIEWED
}

const resolveTaskSourceText = (row: ITableRow) => {
  const source = asRecord(row)
  const key = String(source.taskSource || source.sourceType || "").toLowerCase()
  if (key === "unarchive_inspection") {
    return "解封校验"
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
  return resolveTaskStatus(row) === EnumTaskStatus.UNREVIEWED
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
  curPageKey.value = EnumPageType.Verify_order_create
}

const onEdit = (row: ITableRow) => {
  selectedRow.value = row
  curPageKey.value = EnumPageType.Verify_order_update
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
    await ElMessageBox.confirm(`确认删除任务单 ${row.inspectionNo} 吗？`, "删除确认", {
      type: "warning",
      confirmButtonText: "确认",
      cancelButtonText: "取消"
    })
    await requestDeleteMroInspectionTask(id)
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
    await ElMessageBox.confirm(`确认复核任务单 ${row.inspectionNo} 吗？`, "复核确认", {
      type: "warning",
      confirmButtonText: "确认",
      cancelButtonText: "取消"
    })
    await requestCheckMroInspectionTask({ id })
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
      `请填写任务单 ${row.inspectionNo} 的作废原因`,
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
    await requestVoidMroInspectionTask({
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

const onReviewMroInfo = (row: ITableRow) => {
  mroInfoVisible.value = true
  selectedRow.value = row
}

const onReviewMroModelInfo = (row: ITableRow) => {
  mroModelInfoVisible.value = true
  selectedRow.value = row
}

const onReviewDetail = (row: ITableRow) => {
  curPageKey.value = EnumPageType.Verify_order_detail
  selectedRow.value = row
}
</script>

<style scoped lang="scss"></style>
