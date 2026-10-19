<template>
  <div class="layout-container">
    <div class="layout-main-page" v-show="curPageKey === EnumPageType.Main">
      <CustomSearchForm :form-list="searchList" @search="onSubmit" @reset="onReset" />

      <div class="custom-table-container">
        <CustomTitle title="设备维修单列表">
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
            <el-tag :type="repairStatusTagTypeMap[Number(row.repairStatus)]">
              {{ formatDeviceRepairStatus(row.repairStatus) }}
            </el-tag>
          </template>

          <template #repairResult-default="{ row }">
            <span v-if="row.repairResult === ''">-</span>
            <el-tag v-else :type="equipmentRepairResultTagTypeMap[Number(row.repairResult)]">
              {{ formatDeviceRepairResult(row.repairResult) }}
            </el-tag>
          </template>

          <template #equipmentName-default="{ row }">
            <el-button link type="primary" @click="onReviewDeviceClick(row)">
              {{ row.equipmentName }}
            </el-button>
          </template>

          <template #operation-default="{ row }">
            <el-button
              v-if="canEditDeviceRepair(row.sourceType, row.repairStatus)"
              link
              type="primary"
              size="small"
              @click="onEdit(row)"
            >
              编辑
            </el-button>

            <el-popconfirm
              v-if="canEditDeviceRepair(row.sourceType, row.repairStatus)"
              title="确认删除该维修单吗？"
              @confirm="onDeleteRow(row)"
            >
              <template #reference>
                <el-button link type="danger" size="small">删除</el-button>
              </template>
            </el-popconfirm>

            <el-button
              v-if="canAssignDeviceRepair(row.repairStatus)"
              link
              type="primary"
              size="small"
              @click="onAssignResponsible(row)"
            >
              指派责任人
            </el-button>

            <el-button
              v-if="canFeedbackDeviceRepair(row.repairStatus)"
              link
              type="primary"
              size="small"
              @click="onOpenDetail(row, 'feedback')"
            >
              维修反馈
            </el-button>

            <el-button
              v-if="canConfirmDeviceRepair(row.repairStatus)"
              link
              type="primary"
              size="small"
              @click="onOpenDetail(row, 'confirm')"
            >
              确认/验收
            </el-button>

            <el-button link type="primary" size="small" @click="onOpenDetail(row, 'view')">
              查看详情
            </el-button>

            <el-button link type="primary" size="small" @click="onPrintRow(row)">
              打印
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

      <DeviceRepairCreateOrUpdate
        v-if="[EnumPageType.Create, EnumPageType.Edit].includes(curPageKey)"
        :id="selectedRow?.id || ''"
        :key="selectedRow?.id || String(curPageKey)"
        @close="curPageKey = EnumPageType.Main"
        @success="onCreateOrUpdateSuccess"
      />

      <DeviceRepairDetail
        v-if="curPageKey === EnumPageType.Detail && selectedRow?.id"
        :id="selectedRow.id"
        :action-type="detailAction"
        :print-after-loaded="printAfterLoaded"
        @close="onDetailClose"
        @success="onDetailSuccess"
      />
    </div>

    <SelectPersonDialog
      v-model="selectResponsibleVisible"
      :type="EnumSelectUser.Staff"
      :selected-ids="selectedResponsibleIds"
      @success="onAssignResponsibleSuccess"
    />

    <DeviceInfo v-model="deviceInfoVisible" :id="deviceInfoId" />
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import {
  queryEquipmentRepairPageList,
  requestAssignResponsibleEquipmentRepair,
  requestDeleteEquipmentRepair} from "@/api/operation/equipment/equipment-repair"
import {
  equipmentRepairResultTagTypeMap,
  repairStatusTagTypeMap
} from "@/api/operation/equipment/types"
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
import { EnumSelectUser } from "@/constant/enums"
import { TIME_RANGE } from "@/constant/time"
import useButtonAuth from "@/hooks/useButtonAuth"
import type {
  IEquipmentRepairPageItem as ITableRow,
  IEquipmentRepairPageParams
} from "@/types/maintain/equipment-manage/equipment-repair"
import DeviceInfo from "@/views/maintOperate/components/DeviceInfo.vue"
import {
  canAssignDeviceRepair,
  canConfirmDeviceRepair,
  canEditDeviceRepair,
  canFeedbackDeviceRepair,
  deviceRepairResultOptions,
  deviceRepairSourceTypeOptions,
  deviceRepairStatusOptions,
  formatDeviceRepairResult,
  formatDeviceRepairStatus
} from "@/views/maintOperate/deviceRepair/constants"
import { formatDateTime } from "@/views/maintOperate/status"

import DeviceRepairCreateOrUpdate from "./components/DeviceRepairCreateOrUpdate.vue"
import DeviceRepairDetail from "./components/DeviceRepairDetail.vue"

defineOptions({
  name: "DeviceRepair"
})

enum EnumPageType {
  Create = 0,
  Edit = 1,
  Main,
  Detail
}

const isAuth = useButtonAuth("DeviceRepair_update", "DeviceRepair_query")

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
    options: deviceRepairStatusOptions
  },
  {
    type: EnumComponentType.Select,
    key: "repairResult",
    label: "维修结果",
    value: "",
    placeholder: "请选择维修结果",
    options: deviceRepairResultOptions
  },
  {
    type: EnumComponentType.Select,
    key: "sourceType",
    label: "来源",
    value: "",
    placeholder: "请选择来源",
    options: deviceRepairSourceTypeOptions
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
    key: "reportUnit",
    label: "报修单位",
    value: "",
    placeholder: "请输入报修单位"
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
    keyword: ["startDate", "endDate"]
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  equipmentName: string
  equipmentNo: string
  repairNo: string
  repairStatus?: number
  repairResult?: number
  sourceType?: number
  reportUnit: string
  startDate?: string
  endDate?: string
}>(searchFormData.value)

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const curPageKey = ref(EnumPageType.Main)
const pageTree = ref([
  {
    name: "设备维修单",
    key: EnumPageType.Main,
    children: [
      { name: "新建设备维修单", key: EnumPageType.Create },
      { name: "编辑设备维修单", key: EnumPageType.Edit },
      { name: "设备维修单详情", key: EnumPageType.Detail }
    ]
  }
])

const selectedRow = ref<ITableRow>()
const detailAction = ref<"view" | "feedback" | "confirm">("view")
const printAfterLoaded = ref(false)

const selectResponsibleVisible = ref(false)
const assignTargetRow = ref<ITableRow>()

const deviceInfoVisible = ref(false)
const deviceInfoId = ref("")

const selectedResponsibleIds = computed(() => {
  const id = assignTargetRow.value?.responsibleUser?.id
  return id ? [id] : []
})

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])

const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    { prop: "repairNo", label: "维修单号", width: 160 },
    {
      prop: "repairStatus",
      label: "状态",
      width: 110,
      align: "center",
      slots: { default: "repairStatus-default" }
    },
    { prop: "equipmentNo", label: "设备编号", width: 150 },
    {
      prop: "equipmentName",
      label: "设备名称",
      minWidth: 160,
      slots: { default: "equipmentName-default" }
    },
    { prop: "reportUnit", label: "报修单位", width: 160 },
    {
      prop: "reportUser.name",
      label: "报修人",
      width: 120,
      formatter: (row: ITableRow) => row.reportUser?.name || "-"
    },
    {
      prop: "faultLevel",
      label: "故障等级",
      width: 100,
      align: "center",
      formatter: (row: ITableRow) => row.faultLevelName || "-"
    },
    {
      prop: "reportTime",
      label: "报修时间",
      width: 160,
      align: "center",
      formatter: (row: ITableRow) => formatDateTime(row.reportTime)
    },
    {
      prop: "responsibleUser.name",
      label: "责任人",
      width: 120,
      formatter: (row: ITableRow) => row.responsibleUser?.name || "-"
    },
    {
      prop: "repairUser.name",
      label: "维修人",
      width: 120,
      formatter: (row: ITableRow) => row.repairUser?.name || "-"
    },
    {
      prop: "repairResult",
      label: "维修结果",
      width: 120,
      align: "center",
      slots: { default: "repairResult-default" }
    },
    {
      prop: "createTime",
      label: "创建时间",
      width: 160,
      align: "center",
      sortable: true,
      sortOrder: "desc",
      formatter: (row: ITableRow) => formatDateTime(row.createTime)
    },
    {
      prop: "closeTime",
      label: "关闭时间",
      width: 160,
      align: "center",
      formatter: (row: ITableRow) => formatDateTime(row.closeTime)
    },
    {
      prop: "operation",
      label: "操作",
      width: 360,
      fixed: "right",
      slots: { default: "operation-default" }
    }
  ]
})

const queryConfig: ITableRequestConfig<[IEquipmentRepairPageParams], ITableRow, true> = {
  api: queryEquipmentRepairPageList,
  getParams: (sortData: IColumnSortInfo[]) => {
    const { startDate, endDate, ...rest } = getFormData()
    return [
      {
        pageQuery: {
          pageNum: pagination.value.currentPage,
          pageSize: pagination.value.pageSize
        },
        queryParam: rest,
        dateRange: {
          startDate,
          endDate
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

const onCreate = () => {
  selectedRow.value = undefined
  curPageKey.value = EnumPageType.Create
}

const onEdit = (row: ITableRow) => {
  selectedRow.value = row
  curPageKey.value = EnumPageType.Edit
}

const onOpenDetail = (row: ITableRow, action: "view" | "feedback" | "confirm") => {
  selectedRow.value = row
  detailAction.value = action
  printAfterLoaded.value = false
  curPageKey.value = EnumPageType.Detail
}

const onPrintRow = (row: ITableRow) => {
  selectedRow.value = row
  detailAction.value = "view"
  printAfterLoaded.value = true
  curPageKey.value = EnumPageType.Detail
}

const onDeleteRow = async (row: ITableRow) => {
  await requestDeleteEquipmentRepair({ id: row.id })
  ElMessage.success("删除成功")
  await customTableRef.value?.requestData()
}

const onAssignResponsible = (row: ITableRow) => {
  assignTargetRow.value = row
  selectResponsibleVisible.value = true
}

const onAssignResponsibleSuccess = async (list: ITree[]) => {
  if (!assignTargetRow.value?.id) {
    return
  }
  if (!list.length) {
    ElMessage.warning("请选择责任人")
    return
  }
  await requestAssignResponsibleEquipmentRepair({
    id: assignTargetRow.value.id,
    responsibleUserId: list[0].id
  })
  ElMessage.success("指派成功")
  assignTargetRow.value = undefined
  await customTableRef.value?.requestData()
}

const onReviewDeviceClick = (row: ITableRow) => {
  deviceInfoId.value = row.equipmentId
  deviceInfoVisible.value = true
}

const onCreateOrUpdateSuccess = async () => {
  curPageKey.value = EnumPageType.Main
  await customTableRef.value?.requestData()
}

const onDetailSuccess = async () => {
  await customTableRef.value?.requestData()
}

const onDetailClose = async () => {
  curPageKey.value = EnumPageType.Main
  printAfterLoaded.value = false
  await customTableRef.value?.requestData()
}
</script>



