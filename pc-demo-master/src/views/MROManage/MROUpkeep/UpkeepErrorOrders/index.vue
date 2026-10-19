<template>
  <div class="layout-container">
    <div class="layout-main-page" v-show="curPageKey === EnumPageType.Main">
      <CustomSearchForm
        :form-list="searchList"
        @search="onSubmit"
        @reset="onReset"
      ></CustomSearchForm>

      <div class="custom-table-container">
        <CustomTitle title="保养异常工单列表"></CustomTitle>
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
              >{{
                EnumMROMaintenanceExceptionStatusMap[
                  row.taskStatus as EnumMROMaintenanceExceptionStatus
                ]
              }}</el-tag
            >
          </template>

          <template #mroNo-default="{ row }">
            <el-button link type="primary" size="small" @click="onReviewMroInfo(row)"
              >{{ row.mroNo }}
            </el-button>
          </template>

          <template #mroModelNo-default="{ row }">
            <el-button link type="primary" size="small" @click="onReviewMroModelInfo(row)"
              >{{ row.mroModelNo }}
            </el-button>
          </template>

          <template #mroModelName-default="{ row }">
            <el-button link type="primary" size="small" @click="onReviewMroModelInfo(row)"
              >{{ row.mroModelName }}
            </el-button>
          </template>

          <template #sourceName-default="{ row }">
            <el-button link type="primary" size="small" @click="onReviewMroMaintenanceInfo(row)"
              >{{ row.sourceName }}
            </el-button>
          </template>

          <template #operation-default="{ row }">
            <el-button
              v-if="canAssign(row)"
              link
              type="primary"
              size="small"
              @click="onAssignResponsible(row)"
              >指派责任人
            </el-button>
            <el-button link type="primary" size="small" @click="onFeedbackClick(row)"
              >反馈查看
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

      <!-- 保养异常工单详情 -->
      <UpkeepErrorOrderDetail
        v-if="curPageKey === EnumPageType.Maintenance_anomaly_detail"
        :id="selectedRow?.id || ''"
        @close="curPageKey = EnumPageType.Main"
        @success="onDetailSuccess"
      />
    </div>

    <!-- MRO编号信息弹窗 -->
    <MroInfoDialog v-model="mroInfoVisible" :mro-id="selectedRow?.mroInformationId || ''" />

    <!-- MRO型号信息弹窗 -->
    <MroModelInfoDialog
      v-model="mroModelInfoVisible"
      :mro-model-id="selectedRow?.mroModelId || ''"
    />

    <!-- 异常项信息弹窗 -->
    <AbnormalItemDialog
      v-model="abnormalItemDialogVisible"
      :id="selectedRow?.sourceId || ''"
      :type="2"
    />

    <!-- 选择责任人 -->
    <SelectPersonDialog
      v-model="selectResponsibleVisible"
      :type="EnumSelectUser.Staff"
      :selected-ids="selectedResponsibleIds"
      @success="onAssignResponsibleSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import {
  queryMroVerifyExceptionTaskPageList,
  requestAssignResponsibleMroExceptionTask
} from "@/api/operation/mro/mro-verify-exception-task"
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
import SelectPersonDialog from "@/components/SelectPersonDialog/index.vue"
import type { ITree } from "@/components/SelectPersonDialog/type"
import {
  EnumMROExceptionSourceType,
  EnumMROExceptionSourceTypeMap,
  EnumMROMaintenanceExceptionStatus,
  EnumMROMaintenanceExceptionStatusMap,
  EnumMROMaintenanceFeedbackSolution,
  EnumSelectUser
} from "@/constant/enums"
import { TIME_RANGE } from "@/constant/time"
import useButtonAuth, { AuthType } from "@/hooks/useButtonAuth"
import type {
  IMroVerifyExceptionTaskPageListItem as ITableRow,
  IMroVerifyExceptionTaskPageListParams
} from "@/types/maintain/mro-manage/mro-verify-exception-task"
import MroInfoDialog from "@/views/MROManage/MROInfo/components/MroInfoDialog.vue"
import MroModelInfoDialog from "@/views/MROManage/MROModelManage/components/MroModelInfoDialog.vue"
import AbnormalItemDialog from "@/views/MROManage/MROVerify/VerifyAbnormalOrders/components/AbnormalItemDialog.vue"

import UpkeepErrorOrderDetail from "./components/UpkeepErrorOrderDetail.vue"

defineOptions({
  name: "UpkeepErrorOrders"
})

const route = useRoute()
const authType = useButtonAuth("UpkeepErrorOrders_update", "UpkeepErrorOrders_query")

/** 页面显示类型枚举 */
enum EnumPageType {
  Main, // 列表页
  Maintenance_anomaly_detail // 保养异常工单详情
}

const curPageKey = ref(EnumPageType.Main)
const pageTree = ref([
  {
    name: "保养异常工单",
    key: EnumPageType.Main,
    children: [
      {
        name: "保养异常工单详情",
        key: EnumPageType.Maintenance_anomaly_detail
      }
    ]
  }
])

const taskStatusOptions = ref<
  {
    label: string
    value: number
  }[]
>([])

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
    options: taskStatusOptions
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
    key: "mroNo",
    label: "MRO编号",
    value: "",
    placeholder: "请输入MRO编号"
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  taskNo: string
  mroNo: string
  startTime?: string
  endTime?: string
  taskStatus?: number
}>(searchFormData.value)

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const mroInfoVisible = ref(false)
const mroModelInfoVisible = ref(false)
const abnormalItemDialogVisible = ref(false)
const selectResponsibleVisible = ref(false)
const selectedRow = ref<ITableRow>()
const assignTargetRow = ref<ITableRow>()

const selectedResponsibleIds = computed(() => {
  return (assignTargetRow.value?.responsibleUsers || []).map((item) => item.id).filter(Boolean)
})

const exceptionResultMap: Record<number, string> = {
  [EnumMROMaintenanceFeedbackSolution.UNOBSTRUCTED]: "已解决",
  [EnumMROMaintenanceFeedbackSolution.REPAIR]: "维修",
  [EnumMROMaintenanceFeedbackSolution.SCRAP]: "报废"
}

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
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
      width: 120,
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
      sortable: true,
      sortOrder: "desc"
    },
    {
      prop: "sourceType",
      label: "来源",
      width: 160,
      align: "center",
      formatter: (row: ITableRow) => {
        return EnumMROExceptionSourceTypeMap[row.sourceType as EnumMROExceptionSourceType]
      }
    },
    {
      prop: "sourceNo",
      label: "来源单号",
      width: 160
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
      prop: "mroModelNo",
      label: "MRO编号",
      width: 160,
      slots: {
        default: "mroModelNo-default"
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
      prop: "mroSpec",
      label: "MRO规格",
      width: 160
    },
    {
      prop: "mroClassifyName",
      label: "MRO分类",
      width: 160
    },
    {
      prop: "mroTypeName",
      label: "MRO类型",
      width: 160
    },
    {
      prop: "sourceName",
      label: "异常项名称",
      width: 160,
      slots: {
        default: "sourceName-default"
      }
    },
    {
      prop: "reportUserName",
      label: "报修人名称",
      width: 160,
      formatter: (row: ITableRow) => {
        return row.reportUsers.map((item) => item.name).join(",")
      }
    },
    {
      prop: "reportUserEmpNo",
      label: "报修人编号",
      width: 160,
      formatter: (row: ITableRow) => {
        return row.reportUsers.map((item) => item.empNo).join(",")
      }
    },
    {
      prop: "handleUserName",
      label: "处理人姓名",
      width: 160,
      formatter: (row: ITableRow) => {
        return row.handleUsers.map((item) => item.name).join(",")
      }
    },
    {
      prop: "handleUserEmpNo",
      label: "处理人工号",
      width: 160,
      formatter: (row: ITableRow) => {
        return row.handleUsers.map((item) => item.empNo).join(",")
      }
    },
    {
      prop: "analysis",
      label: "故障分析",
      width: 160
    },
    {
      prop: "solution",
      label: "结果",
      width: 160,
      formatter: (row: ITableRow) => {
        if (row.taskStatus === EnumMROMaintenanceExceptionStatus.PENDING) {
          return ""
        }
        return exceptionResultMap[row.solution as EnumMROMaintenanceFeedbackSolution] || ""
      }
    },
    {
      prop: "completeTime",
      label: "办结时间",
      width: 160
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
const queryConfig: ITableRequestConfig<[IMroVerifyExceptionTaskPageListParams], ITableRow, true> = {
  api: queryMroVerifyExceptionTaskPageList,
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
          sourceType: 2
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
  if (Object.keys(route.query).length > 0) {
    if (route.query.exceptionTaskId) {
      searchList.value.find((item) => item.key === "taskNo")!.value = route.query
        .exceptionTaskId as string
    } else if (route.query.jumpKey) {
      ElMessage("查询值为空")
    }
    nextTick(() => {
      customTableRef.value?.requestData()
    })
  } else {
    customTableRef.value?.requestData()
  }
})

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

/** 查看MRO保养项项详情 */
const onReviewMroMaintenanceInfo = (row: ITableRow) => {
  abnormalItemDialogVisible.value = true
  selectedRow.value = row
}

const canAssign = (row: ITableRow) => {
  return (
    authType.value !== AuthType.View &&
    Number(row.taskStatus) === EnumMROMaintenanceExceptionStatus.PENDING
  )
}

const onAssignResponsible = (row: ITableRow) => {
  assignTargetRow.value = row
  selectResponsibleVisible.value = true
}

const onAssignResponsibleSuccess = async (data: ITree[]) => {
  if (!assignTargetRow.value?.id) return
  if (!data.length) {
    ElMessage.warning("请选择责任人")
    return
  }
  await requestAssignResponsibleMroExceptionTask({
    id: assignTargetRow.value.id,
    responsibleUserId: data[0].id
  })
  ElMessage.success("指派成功")
  assignTargetRow.value = undefined
  await customTableRef.value?.requestData()
}

/** 构建下拉选项 */
const buildOptions = () => {
  taskStatusOptions.value = Object.keys(EnumMROMaintenanceExceptionStatusMap).map((key) => ({
    label:
      EnumMROMaintenanceExceptionStatusMap[key as unknown as EnumMROMaintenanceExceptionStatus],
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

/** 详情页反馈成功后回主列表并刷新 */
const onDetailSuccess = async () => {
  curPageKey.value = EnumPageType.Main
  await customTableRef.value?.requestData()
}

/** 查看反馈详情 */
const onFeedbackClick = (row: ITableRow) => {
  curPageKey.value = EnumPageType.Maintenance_anomaly_detail
  selectedRow.value = row
}
</script>

<style scoped lang="scss"></style>
