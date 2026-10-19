<template>
  <div class="layout-container">
    <div class="layout-main-page" v-show="curPageKey === EnumPageType.Main">
      <CustomSearchForm :form-list="searchList" @search="onSubmit" @reset="onReset" />

      <div class="custom-table-container">
        <CustomTitle title="保养异常工单列表" />
        <CustomTable
          ref="customTableRef"
          v-model:table-data="customTableData"
          v-model:total="pagination.total"
          :config="tableConfig"
          :query-config="queryConfig"
          class="custom-table"
        >
          <template #taskStatus-default="{ row }">
            <el-tag
              :type="
                row.taskStatus === EnumMROMaintenanceExceptionStatus.PENDING ? 'danger' : 'success'
              "
            >
              {{
                EnumMROMaintenanceExceptionStatusMap[
                  row.taskStatus as EnumMROMaintenanceExceptionStatus
                ]
              }}
            </el-tag>
          </template>

          <template #equipmentNo-default="{ row }">
            <el-button link type="primary" size="small" @click="onReviewDevice(row)">
              {{ row.equipmentNo || "--" }}
            </el-button>
          </template>

          <template #equipmentName-default="{ row }">
            <el-button link type="primary" size="small" @click="onReviewDevice(row)">
              {{ row.equipmentName || "--" }}
            </el-button>
          </template>

          <template #operation-default="{ row }">
            <el-button v-if="canAssign(row)" link type="primary" size="small" @click="onAssign(row)">
              指派责任人
            </el-button>
            <el-button link type="primary" size="small" @click="onReviewDetail(row)">
              反馈查看
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

      <EquipmentMaintainErrorOrderDetail
        v-if="curPageKey === EnumPageType.Detail"
        :id="selectedRow?.id || ''"
        @close="curPageKey = EnumPageType.Main"
        @success="onDetailSuccess"
      />
    </div>

    <DeviceInfo v-model="deviceInfoVisible" :id="currentDeviceId" />

    <el-dialog
      v-model="assignDialogVisible"
      title="指派责任人"
      width="520px"
      destroy-on-close
      @closed="onAssignDialogClosed"
    >
      <div class="assign-dialog">
        <div class="assign-summary">
          <div>异常单号：{{ assignTargetRow?.taskNo || "--" }}</div>
          <div>设备：{{ assignTargetRow?.equipmentNo || "--" }} / {{ assignTargetRow?.equipmentName || "--" }}</div>
          <div>
            异常处理职位：{{ assignTargetRow?.exceptionHandlePositionName || "未配置，默认所有人可选" }}
          </div>
        </div>

        <el-form label-width="90px">
          <el-form-item label="责任人">
            <el-select
              v-model="selectedResponsibleUserId"
              class="w-full"
              placeholder="请选择责任人"
              filterable
            >
              <el-option
                v-for="item in assignableResponsibleUsers"
                :key="item.id"
                :label="`${item.name} (${item.empNo || '--'})`"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <el-button @click="assignDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="assignLoading" @click="onAssignSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import dayjs from "dayjs"
import { ElMessage } from "element-plus"

import {
  queryEquipmentExceptionOrderPageList,
  requestAssignEquipmentExceptionOrderResponsible
} from "@/api/operation/equipment/equipment-exception-order"
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
  EnumEquipmentExceptionSourceType,
  EnumEquipmentExceptionSourceTypeMap,
  EnumMROMaintenanceExceptionStatus,
  EnumMROMaintenanceExceptionStatusMap,
  EnumMROMaintenanceFeedbackSolution,
  EnumMROMaintenanceFeedbackSolutionMap
} from "@/constant/enums"
import { TIME_RANGE } from "@/constant/time"
import useButtonAuth, { AuthType } from "@/hooks/useButtonAuth"
import type {
  IEquipmentExceptionOrderPageListItem as ITableRow,
  IEquipmentExceptionOrderPageParams
} from "@/types/maintain/equipment-manage/equipment-exception-order"
import DeviceInfo from "@/views/maintOperate/components/DeviceInfo.vue"

import EquipmentMaintainErrorOrderDetail from "./components/EquipmentMaintainErrorOrderDetail.vue"

defineOptions({
  name: "MaintainExceptionOrder"
})

enum EnumPageType {
  Main,
  Detail
}

const authType = useButtonAuth("ExceptionalOrder_update", "ExceptionalOrder_query")

const solutionTextMap: Record<number, string> = {
  [EnumMROMaintenanceFeedbackSolution.UNOBSTRUCTED]:
    EnumMROMaintenanceFeedbackSolutionMap[EnumMROMaintenanceFeedbackSolution.UNOBSTRUCTED],
  [EnumMROMaintenanceFeedbackSolution.REPAIR]:
    EnumMROMaintenanceFeedbackSolutionMap[EnumMROMaintenanceFeedbackSolution.REPAIR],
  [EnumMROMaintenanceFeedbackSolution.SCRAP]:
    EnumMROMaintenanceFeedbackSolutionMap[EnumMROMaintenanceFeedbackSolution.SCRAP]
}

const searchFormData = ref<ISearchItem[]>([
  {
    type: EnumComponentType.Input,
    key: "taskNo",
    label: "异常单号",
    value: "",
    placeholder: "请输入异常单号"
  },
  {
    type: EnumComponentType.Select,
    key: "taskStatus",
    label: "状态",
    value: "",
    placeholder: "请选择状态",
    options: [
      {
        label: EnumMROMaintenanceExceptionStatusMap[EnumMROMaintenanceExceptionStatus.PENDING],
        value: EnumMROMaintenanceExceptionStatus.PENDING
      },
      {
        label: EnumMROMaintenanceExceptionStatusMap[EnumMROMaintenanceExceptionStatus.FINISHED],
        value: EnumMROMaintenanceExceptionStatus.FINISHED
      }
    ]
  },
  {
    type: EnumComponentType.Date,
    dateType: "datetimerange",
    key: "date",
    label: "生成时间",
    value: [],
    placeholder: ["请选择开始时间", "请选择结束时间"],
    format: "YYYY-MM-DD HH:mm:ss",
    valueFormat: "YYYY-MM-DD HH:mm:ss",
    defaultTime: TIME_RANGE,
    keyword: ["startTime", "endTime"]
  },
  {
    type: EnumComponentType.Input,
    key: "equipmentNo",
    label: "设备编号",
    value: "",
    placeholder: "请输入设备编号"
  },
  {
    type: EnumComponentType.Input,
    key: "equipmentName",
    label: "设备名称",
    value: "",
    placeholder: "请输入设备名称"
  },
  {
    type: EnumComponentType.Input,
    key: "equipmentTypeName",
    label: "类型名称",
    value: "",
    placeholder: "请输入类型名称"
  },
  {
    type: EnumComponentType.Input,
    key: "areaName",
    label: "所属区域",
    value: "",
    placeholder: "请输入所属区域"
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  areaName?: string
  equipmentName?: string
  equipmentNo?: string
  equipmentTypeName?: string
  startTime?: string
  endTime?: string
  taskNo?: string
  taskStatus?: number
}>(searchFormData.value)

const curPageKey = ref(EnumPageType.Main)
const pageTree = ref([
  {
    name: "保养异常工单",
    key: EnumPageType.Main,
    children: [
      {
        name: "保养异常工单详情",
        key: EnumPageType.Detail
      }
    ]
  }
])

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const selectedRow = ref<ITableRow>()

const deviceInfoVisible = ref(false)
const currentDeviceId = ref("")

const assignDialogVisible = ref(false)
const assignLoading = ref(false)
const assignTargetRow = ref<ITableRow>()
const selectedResponsibleUserId = ref("")

const assignableResponsibleUsers = computed(
  () => assignTargetRow.value?.assignableResponsibleUsers || []
)

const formatDisplayTime = (value?: string) => {
  const text = String(value || "").trim()
  if (!text) return "--"
  const parsed = dayjs(text)
  return parsed.isValid() ? parsed.format("YYYY-MM-DD HH:mm") : text.replace("T", " ").replace("Z", "")
}

const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "taskNo",
      label: "异常单号",
      width: 160
    },
    {
      prop: "taskStatus",
      label: "状态",
      width: 100,
      align: "center",
      slots: {
        default: "taskStatus-default"
      }
    },
    {
      prop: "createTime",
      label: "生成时间",
      width: 160,
      align: "center",
      formatter: (row: ITableRow) => formatDisplayTime(row.createTime),
      sortable: true,
      sortOrder: "desc"
    },
    {
      prop: "sourceType",
      label: "来源",
      width: 120,
      align: "center",
      formatter: (row: ITableRow) =>
        EnumEquipmentExceptionSourceTypeMap[row.sourceType as EnumEquipmentExceptionSourceType] ||
        "--"
    },
    {
      prop: "sourceNo",
      label: "来源单号",
      width: 160
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
      width: 180,
      slots: {
        default: "equipmentName-default"
      }
    },
    {
      prop: "equipmentTypeNo",
      label: "类型编号",
      width: 160
    },
    {
      prop: "equipmentTypeName",
      label: "类型名称",
      width: 180
    },
    {
      prop: "areaName",
      label: "所属区域",
      width: 220
    },
    {
      prop: "reportUsers",
      label: "报修人",
      width: 160,
      formatter: (row: ITableRow) => row.reportUsers?.map((item) => item.name).join("、") || "--"
    },
    {
      prop: "exceptionHandlePositionName",
      label: "异常处理职位",
      width: 180
    },
    {
      prop: "responsibleUsers",
      label: "责任人",
      width: 160,
      formatter: (row: ITableRow) =>
        row.responsibleUsers?.map((item) => item.name).join("、") || "--"
    },
    {
      prop: "handleUsers",
      label: "处理人",
      width: 160,
      formatter: (row: ITableRow) => row.handleUsers?.map((item) => item.name).join("、") || "--"
    },
    {
      prop: "analysis",
      label: "故障分析",
      width: 220
    },
    {
      prop: "solution",
      label: "结果",
      width: 120,
      align: "center",
      formatter: (row: ITableRow) => {
        if (row.taskStatus === EnumMROMaintenanceExceptionStatus.PENDING) return "--"
        return solutionTextMap[Number(row.solution)] || "--"
      }
    },
    {
      prop: "completeTime",
      label: "办结时间",
      width: 160,
      formatter: (row: ITableRow) => formatDisplayTime(row.completeTime)
    },
    {
      prop: "operation",
      label: "操作",
      width: 170,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

const queryConfig: ITableRequestConfig<[IEquipmentExceptionOrderPageParams], ITableRow, true> = {
  api: queryEquipmentExceptionOrderPageList,
  getParams: (sortData: IColumnSortInfo[]) => {
    const { startTime, endTime, ...rest } = getFormData()
    return [
      {
        pageQuery: {
          pageNum: pagination.value.currentPage,
          pageSize: pagination.value.pageSize
        },
        queryParam: {
          ...rest,
          sourceType: EnumEquipmentExceptionSourceType.Maintain
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
  customTableRef.value?.requestData()
})

const onReset = () => {
  resetForm()
  onSubmit()
}

const onSubmit = async () => {
  pagination.value.currentPage = 1
  await customTableRef.value?.requestData()
}

const onReviewDevice = (row: ITableRow) => {
  currentDeviceId.value = String(row.equipmentId || "")
  deviceInfoVisible.value = true
}

const onReviewDetail = (row: ITableRow) => {
  selectedRow.value = row
  curPageKey.value = EnumPageType.Detail
}

const canAssign = (row: ITableRow) =>
  authType.value !== AuthType.View &&
  Number(row.taskStatus) === EnumMROMaintenanceExceptionStatus.PENDING

const onAssign = (row: ITableRow) => {
  assignTargetRow.value = row
  selectedResponsibleUserId.value = String(row.responsibleUsers?.[0]?.id || row.assignableResponsibleUsers?.[0]?.id || "")
  assignDialogVisible.value = true
}

const onAssignDialogClosed = () => {
  assignTargetRow.value = undefined
  selectedResponsibleUserId.value = ""
}

const onAssignSubmit = async () => {
  if (!assignTargetRow.value?.id) return
  if (!selectedResponsibleUserId.value) {
    ElMessage.warning("请选择责任人")
    return
  }

  assignLoading.value = true
  try {
    await requestAssignEquipmentExceptionOrderResponsible({
      id: assignTargetRow.value.id,
      responsibleUserId: selectedResponsibleUserId.value
    })
    ElMessage.success("指派成功")
    assignDialogVisible.value = false
    await customTableRef.value?.requestData()
  } finally {
    assignLoading.value = false
  }
}

const onDetailSuccess = async () => {
  curPageKey.value = EnumPageType.Main
  await customTableRef.value?.requestData()
}
</script>

<style scoped lang="scss">
.assign-dialog {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.assign-summary {
  padding: 12px 14px;
  background: var(--el-fill-color-light);
  border-radius: 8px;
  line-height: 1.8;
  color: var(--el-text-color-regular);
}
</style>
