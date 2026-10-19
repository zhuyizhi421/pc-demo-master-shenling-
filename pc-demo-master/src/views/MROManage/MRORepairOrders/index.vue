<template>
  <div class="layout-container">
    <div class="layout-main-page" v-show="curPageKey === EnumPageType.Main">
      <CustomSearchForm :form-list="searchList" @search="onSubmit" @reset="onReset"></CustomSearchForm>

      <div class="custom-table-container">
        <CustomTitle title="MRO维修单列表">
          <div v-if="isAuth">
            <el-button type="primary" icon="Plus" @click="onCreate">新建维修</el-button>
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
          <template #repairStatus-default="{ row }">
            <el-tag :type="getRepairStatusTagType(row.repairStatus)">
              {{ EnumMRORepairStatusMap[row.repairStatus as EnumMRORepairStatus] }}
            </el-tag>
          </template>

          <template #repairResult-default="{ row }">
            <span v-if="!canDisplayRepairResult(row)"></span>
            <el-tag
              v-else
              :type="getRepairResultTagType(row.repairResult as EnumMRORepairResult)"
            >
              {{ EnumMRORepairResultMap[row.repairResult as EnumMRORepairResult] }}
            </el-tag>
          </template>

          <template #mroNo-default="{ row }">
            <el-button link type="primary" size="small" @click="onReviewMroInfo(row)">
              {{ row.mroNo }}
            </el-button>
          </template>

          <template #mroModelNo-default="{ row }">
            <el-button link type="primary" size="small" @click="onReviewMroModelInfo(row)">
              {{ row.mroModelNo }}
            </el-button>
          </template>

          <template #mroModelName-default="{ row }">
            <el-button link type="primary" size="small" @click="onReviewMroModelInfo(row)">
              {{ row.mroModelName }}
            </el-button>
          </template>

          <template #repairAfterLife-default="{ row }">
            <span>
              {{
                canDisplayRepairAfterLife(row)
                  ? formatPercent(Number(row.repairAfterLife || 0))
                  : ""
              }}
            </span>
          </template>

          <template #operation-default="{ row }">
            <el-button v-if="canEdit(row)" link type="primary" size="small" @click="onEdit(row)">
              编辑
            </el-button>

            <el-popconfirm
              v-if="canDelete(row)"
              title="确认删除该维修单吗？"
              @confirm="onDeleteRow(row)"
            >
              <template #reference>
                <el-button link type="danger" size="small">删除</el-button>
              </template>
            </el-popconfirm>

            <el-popconfirm
              v-if="canReview(row)"
              title="确认复核该维修单吗？"
              @confirm="onReviewRow(row)"
            >
              <template #reference>
                <el-button link type="primary" size="small">复核</el-button>
              </template>
            </el-popconfirm>

            <el-button
              v-if="canAssign(row)"
              link
              type="primary"
              size="small"
              @click="onAssignResponsible(row)"
            >
              指派责任人
            </el-button>

            <el-button
              v-if="row.linkedExceptionTaskNo"
              link
              type="primary"
              size="small"
              @click="onReviewLinkedException(row)"
            >
              查看关联异常工单
            </el-button>

            <el-button
              v-if="row.previousRepairNo"
              link
              type="primary"
              size="small"
              @click="onReviewPreviousRepair(row)"
            >
              查看上一轮维修单
            </el-button>

            <el-button link type="primary" size="small" @click="onReviewDetail(row)">
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

      <MroRepairOrderCreateOrUpdate
        v-if="
          [EnumPageType.Repair_order_create, EnumPageType.Repair_order_update].includes(curPageKey)
        "
        :id="selectedRow?.id || ''"
        :key="selectedRow?.id || curPageKey"
        @close="onCreateOrUpdateClose"
        @success="onCreateOrUpdateSuccess"
      />

      <MroRepairOrderDetail
        v-if="curPageKey === EnumPageType.Repair_order_detail"
        :id="selectedRow?.id || ''"
        @close="curPageKey = EnumPageType.Main"
        @success="onDetailSuccess"
      />
    </div>

    <MroInfoDialog v-model="mroInfoVisible" :mro-id="selectedRow?.mroInformationId || ''" />

    <MroModelInfoDialog
      v-model="mroModelInfoVisible"
      :mro-model-id="selectedRow?.mroModelId || ''"
    />

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
import { useRouter } from "vue-router"

import {
  queryMroRepairDetail,
  queryMroRepairPageList,
  requestAssignResponsibleMroRepair,
  requestDeleteMroRepair,
  requestReviewMroRepair
} from "@/api/operation/mro/mro-repair"
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
  EnumMRORepairMode,
  EnumMRORepairModeMap,
  EnumMRORepairResult,
  EnumMRORepairResultMap,
  EnumMRORepairSourceType,
  EnumMRORepairSourceTypeMap,
  EnumMRORepairStatus,
  EnumMRORepairStatusMap,
  EnumSelectUser
} from "@/constant/enums"
import { TIME_RANGE } from "@/constant/time"
import useButtonAuth from "@/hooks/useButtonAuth"
import type {
  IMroRepairPageListItem as ITableRow,
  IMroRepairPageListParams
} from "@/types/maintain/mro-manage/mro-repair"
import { formatPercent } from "@/utils/common"
import MroInfoDialog from "@/views/MROManage/MROInfo/components/MroInfoDialog.vue"
import MroModelInfoDialog from "@/views/MROManage/MROModelManage/components/MroModelInfoDialog.vue"

import MroRepairOrderCreateOrUpdate from "./components/MroRepairOrderCreateOrUpdate.vue"
import MroRepairOrderDetail from "./components/MroRepairOrderDetail.vue"

defineOptions({
  name: "MRORepairOrders"
})

enum EnumPageType {
  Repair_order_create = 0,
  Repair_order_update = 1,
  Main,
  Repair_order_detail
}

const isAuth = useButtonAuth("MRORepairOrders_update", "MRORepairOrders_query")
const router = useRouter()
const curPageKey = ref(EnumPageType.Main)
const pageTree = ref([
  {
    name: "MRO维修单",
    key: EnumPageType.Main,
    children: [
      {
        name: "新建维修单",
        key: EnumPageType.Repair_order_create
      },
      {
        name: "编辑维修单",
        key: EnumPageType.Repair_order_update
      },
      {
        name: "维修单详情",
        key: EnumPageType.Repair_order_detail
      }
    ]
  }
])

const repairStatusOptions = ref<{ label: string; value: number }[]>([])
const repairResultOptions = ref<{ label: string; value: number }[]>([])
const sourceTypeOptions = ref<{ label: string; value: number }[]>([])
const repairModeOptions = ref<{ label: string; value: number }[]>([])

const searchFormData = ref<ISearchItem[]>([
  {
    type: EnumComponentType.Input,
    key: "repairNo",
    label: "维修单号",
    value: "",
    placeholder: "请输入维修单号"
  },
  {
    type: EnumComponentType.Select,
    key: "repairStatus",
    label: "状态",
    value: "",
    placeholder: "请选择状态",
    options: repairStatusOptions
  },
  {
    type: EnumComponentType.Select,
    key: "repairResult",
    label: "维修结果",
    value: "",
    placeholder: "请选择维修结果",
    options: repairResultOptions
  },
  {
    type: EnumComponentType.Select,
    key: "sourceType",
    label: "来源",
    value: "",
    placeholder: "请选择来源",
    options: sourceTypeOptions
  },
  {
    type: EnumComponentType.Select,
    key: "repairMode",
    label: "维修方式",
    value: "",
    placeholder: "请选择维修方式",
    options: repairModeOptions
  },
  {
    type: EnumComponentType.Input,
    key: "sourceNo",
    label: "来源单号",
    value: "",
    placeholder: "请输入来源单号"
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
    key: "mroNo",
    label: "MRO序列号",
    value: "",
    placeholder: "请输入MRO序列号"
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
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  repairNo: string
  sourceNo: string
  mroNo: string
  mroModelNo: string
  startTime?: string
  endTime?: string
  repairStatus?: number
  repairResult?: number
  sourceType?: number
  repairMode?: number
}>(searchFormData.value)

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const mroInfoVisible = ref(false)
const mroModelInfoVisible = ref(false)
const selectedRow = ref<ITableRow>()

const selectResponsibleVisible = ref(false)
const assignTargetRow = ref<ITableRow>()

const selectedResponsibleIds = computed(() => {
  const currentId = assignTargetRow.value?.responsibleUser?.id
  return currentId ? [currentId] : []
})

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])

const canDisplayRepairResult = (row: ITableRow) =>
  row.repairStatus === EnumMRORepairStatus.FINISHED && row.repairResult !== ""

const canDisplayRepairAfterLife = (row: ITableRow) =>
  row.repairStatus === EnumMRORepairStatus.FINISHED &&
  Number(row.repairResult) === EnumMRORepairResult.RESOLVED

const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    { prop: "repairNo", label: "维修单号", width: 160 },
    { prop: "repairRound", label: "维修轮次", width: 100, align: "center" },
    {
      prop: "repairStatus",
      label: "状态",
      width: 110,
      align: "center",
      slots: { default: "repairStatus-default" }
    },
    {
      prop: "sourceType",
      label: "来源类型",
      width: 110,
      align: "center",
      formatter: (row: ITableRow) => EnumMRORepairSourceTypeMap[row.sourceType as EnumMRORepairSourceType]
    },
    { prop: "sourceNo", label: "来源单号", width: 160 },
    { prop: "linkedExceptionTaskNo", label: "关联异常工单", width: 160 },
    { prop: "previousRepairNo", label: "上一轮维修单", width: 160 },
    { prop: "mroNo", label: "MRO序列号", width: 150, slots: { default: "mroNo-default" } },
    {
      prop: "mroModelNo",
      label: "MRO编号",
      width: 150,
      slots: { default: "mroModelNo-default" }
    },
    {
      prop: "mroModelName",
      label: "MRO名称",
      width: 180,
      slots: { default: "mroModelName-default" }
    },
    { prop: "mroSpec", label: "MRO规格", width: 160 },
    { prop: "mroClassifyName", label: "MRO分类", width: 140 },
    { prop: "mroCategoryName", label: "MRO类型", width: 140 },
    {
      prop: "repairBeforeLife",
      label: "维修前寿命",
      width: 120,
      align: "center",
      formatter: (row: ITableRow) => formatPercent(Number(row.repairBeforeLife || 0))
    },
    { prop: "handlePosition", label: "处理职位", width: 180 },
    {
      prop: "responsibleUser.name",
      label: "责任人姓名",
      width: 130,
      formatter: (row: ITableRow) => row.responsibleUser?.name || ""
    },
    {
      prop: "responsibleUser.empNo",
      label: "责任人工号",
      width: 130,
      formatter: (row: ITableRow) => row.responsibleUser?.empNo || ""
    },
    {
      prop: "handleUser.name",
      label: "处理人姓名",
      width: 130,
      formatter: (row: ITableRow) => row.handleUser?.name || ""
    },
    {
      prop: "handleUser.empNo",
      label: "处理人工号",
      width: 130,
      formatter: (row: ITableRow) => row.handleUser?.empNo || ""
    },
    {
      prop: "repairMode",
      label: "维修方式",
      width: 110,
      align: "center",
      formatter: (row: ITableRow) => EnumMRORepairModeMap[row.repairMode as EnumMRORepairMode]
    },
    { prop: "entrustUnit", label: "委托单位", width: 140 },
    { prop: "faultDescription", label: "故障描述", width: 200 },
    { prop: "analysis", label: "故障分析", width: 200 },
    { prop: "solutionMeasures", label: "解决措施", width: 200 },
    {
      prop: "repairResult",
      label: "维修结果",
      width: 120,
      align: "center",
      slots: { default: "repairResult-default" }
    },
    {
      prop: "repairAfterLife",
      label: "维修后寿命",
      width: 120,
      align: "center",
      slots: { default: "repairAfterLife-default" }
    },
    { prop: "repairStartTime", label: "开始维修时间", width: 160, align: "center" },
    { prop: "repairEndTime", label: "维修完成时间", width: 160, align: "center" },
    {
      prop: "createTime",
      label: "创建时间",
      width: 160,
      align: "center",
      sortable: true,
      sortOrder: "desc"
    },
    { prop: "completeTime", label: "办结时间", width: 160, align: "center" },
    {
      prop: "operation",
      label: "操作",
      width: 300,
      fixed: "right",
      slots: { default: "operation-default" }
    }
  ]
})

const queryConfig: ITableRequestConfig<[IMroRepairPageListParams], ITableRow, true> = {
  api: queryMroRepairPageList,
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
  repairStatusOptions.value = Object.keys(EnumMRORepairStatusMap).map((key) => ({
    label: EnumMRORepairStatusMap[key as unknown as EnumMRORepairStatus],
    value: Number(key)
  }))

  repairResultOptions.value = Object.keys(EnumMRORepairResultMap).map((key) => ({
    label: EnumMRORepairResultMap[key as unknown as EnumMRORepairResult],
    value: Number(key)
  }))

  sourceTypeOptions.value = Object.keys(EnumMRORepairSourceTypeMap).map((key) => ({
    label: EnumMRORepairSourceTypeMap[key as unknown as EnumMRORepairSourceType],
    value: Number(key)
  }))

  repairModeOptions.value = Object.keys(EnumMRORepairModeMap).map((key) => ({
    label: EnumMRORepairModeMap[key as unknown as EnumMRORepairMode],
    value: Number(key)
  }))
}

const getRepairStatusTagType = (status: number) => {
  if (status === EnumMRORepairStatus.FINISHED) return "success"
  if (status === EnumMRORepairStatus.PENDING) return "danger"
  return "warning"
}

const getRepairResultTagType = (result: EnumMRORepairResult) => {
  if (result === EnumMRORepairResult.RESOLVED) return "success"
  if (result === EnumMRORepairResult.SCRAPPED) return "danger"
  return "warning"
}

const canEdit = (row: ITableRow) =>
  Number(row.sourceType) === EnumMRORepairSourceType.MANUAL_CREATE &&
  Number(row.repairStatus) === EnumMRORepairStatus.UNREVIEWED

const canDelete = (row: ITableRow) => canEdit(row)

const canReview = (row: ITableRow) => canEdit(row)

const canAssign = (row: ITableRow) => Number(row.repairStatus) === EnumMRORepairStatus.PENDING

const onReset = () => {
  resetForm()
  onSubmit()
}

const onSubmit = async () => {
  pagination.value.currentPage = 1
  await customTableRef.value?.requestData()
}

const onCreate = () => {
  selectedRow.value = undefined
  curPageKey.value = EnumPageType.Repair_order_create
}

const onEdit = (row: ITableRow) => {
  selectedRow.value = row
  curPageKey.value = EnumPageType.Repair_order_update
}

const onCreateOrUpdateClose = () => {
  curPageKey.value = EnumPageType.Main
}

const onCreateOrUpdateSuccess = async () => {
  curPageKey.value = EnumPageType.Main
  await customTableRef.value?.requestData()
}

const onDeleteRow = async (row: ITableRow) => {
  await requestDeleteMroRepair({ id: row.id })
  ElMessage.success("删除成功")
  await customTableRef.value?.requestData()
}

const onReviewRow = async (row: ITableRow) => {
  if (!row.id) {
    ElMessage.error("缺少维修单ID，无法复核")
    return
  }

  await requestReviewMroRepair({ id: row.id })

  // 先做本地状态回写，避免接口回写和表格刷新之间出现“提示成功但状态不变”的视觉问题
  customTableData.value = customTableData.value.map((item) =>
    item.id === row.id
      ? {
          ...item,
          repairStatus: EnumMRORepairStatus.PENDING
        }
      : item
  )

  const detail = await queryMroRepairDetail(row.id)
  if (Number(detail?.repairStatus) !== EnumMRORepairStatus.PENDING) {
    ElMessage.warning("复核请求已提交，但状态未及时回写，已为你刷新列表")
  } else {
    ElMessage.success("复核成功")
  }

  await customTableRef.value?.requestData()
}

const onAssignResponsible = (row: ITableRow) => {
  assignTargetRow.value = row
  selectResponsibleVisible.value = true
}

const onAssignResponsibleSuccess = async (data: ITree[]) => {
  if (!assignTargetRow.value?.id) {
    return
  }
  if (!data.length) {
    ElMessage.warning("请选择责任人")
    return
  }
  await requestAssignResponsibleMroRepair({
    id: assignTargetRow.value.id,
    responsibleUserId: data[0].id
  })
  ElMessage.success("指派成功")
  assignTargetRow.value = undefined
  await customTableRef.value?.requestData()
}

const onReviewMroInfo = (row: ITableRow) => {
  selectedRow.value = row
  mroInfoVisible.value = true
}

const onReviewMroModelInfo = (row: ITableRow) => {
  selectedRow.value = row
  mroModelInfoVisible.value = true
}

const onReviewDetail = (row: ITableRow) => {
  selectedRow.value = row
  curPageKey.value = EnumPageType.Repair_order_detail
}

const onReviewLinkedException = (row: ITableRow) => {
  if (!row.linkedExceptionTaskNo) {
    return
  }
  if (Number(row.sourceType) === EnumMRORepairSourceType.MAINTENANCE_EXCEPTION) {
    router.push({ name: "UpkeepErrorOrders", query: { exceptionTaskId: row.linkedExceptionTaskNo } })
    return
  }
  if (Number(row.sourceType) === EnumMRORepairSourceType.VALIDATION_EXCEPTION) {
    router.push({ name: "VerifyAbnormalOrders" })
    return
  }
  ElMessage.warning("当前维修单无关联异常工单")
}

const onReviewPreviousRepair = async (row: ITableRow) => {
  if (!row.previousRepairNo) {
    return
  }
  const { records } = await queryMroRepairPageList({
    pageQuery: { pageNum: 1, pageSize: 20 },
    queryParam: { repairNo: row.previousRepairNo }
  })
  const previous = records.find((item) => item.repairNo === row.previousRepairNo)
  if (!previous) {
    ElMessage.warning("未查询到上一轮维修单")
    return
  }
  selectedRow.value = previous
  curPageKey.value = EnumPageType.Repair_order_detail
}

const onDetailSuccess = async () => {
  curPageKey.value = EnumPageType.Main
  await customTableRef.value?.requestData()
}
</script>

<style scoped lang="scss"></style>
