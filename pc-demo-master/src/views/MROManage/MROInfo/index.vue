<template>
  <div class="layout-container">
    <div class="layout-main-page" v-show="curPageKey === EnumPageType.Main">
      <CustomSearchForm :form-list="searchList" @search="onSubmit" @reset="onReset" />

      <div class="custom-table-container">
        <CustomTitle title="MRO台账" />
        <CustomTable
          ref="customTableRef"
          v-model:table-data="customTableData"
          v-model:total="pagination.total"
          :config="tableConfig"
          :query-config="queryConfig"
          class="custom-table"
        >
          <template #ledger-status="{ row }">
            <el-tag :type="ledgerStatusTagTypeMap[row.ledgerStatus] || 'info'" size="small">
              {{ row.displayLedgerStatus || formatLedgerStatus(row.ledgerStatus) }}
            </el-tag>
          </template>

          <template #running-status="{ row }">
            <el-tag :type="runningStatusTagTypeMap[row.runningStatusCode || 0] || 'info'" size="small">
              {{ formatRunningStatus(row.displayRunningStatus || row.runningStatus) }}
            </el-tag>
          </template>

          <template #running-alerts="{ row }">
            <div v-if="getRunningAlerts(row).length" class="running-alerts">
              <el-tag
                v-for="item in getRunningAlerts(row).slice(0, 2)"
                :key="item"
                type="warning"
                effect="plain"
                size="small"
              >
                {{ item }}
              </el-tag>
              <el-tag
                v-if="getRunningAlerts(row).length > 2"
                type="info"
                effect="plain"
                size="small"
              >
                +{{ getRunningAlerts(row).length - 2 }}
              </el-tag>
            </div>
            <span v-else>--</span>
          </template>

          <template #operation-default="{ row }">
            <el-button link type="primary" size="small" @click="onMroInfoDetail(row)">
              查看详情
            </el-button>
            <el-button link type="primary" size="small" @click="onMroInfoConfig(row)">
              MRO配置
            </el-button>
            <el-button link type="primary" size="small" @click="onMroInfoResume(row)">
              MRO履历
            </el-button>

            <el-button
              v-if="row.ledgerStatus === 'enabled'"
              link
              type="warning"
              size="small"
              @click="openLedgerActionDialog('archive', row)"
            >
              封存
            </el-button>
            <el-button
              v-if="row.ledgerStatus === 'archived' && !row.pendingUnarchiveTaskId"
              link
              type="success"
              size="small"
              @click="openLedgerActionDialog('unarchive', row)"
            >
              解封
            </el-button>
            <el-button
              v-if="row.ledgerStatus !== 'scrapped'"
              link
              type="danger"
              size="small"
              @click="openLedgerActionDialog('scrap', row)"
            >
              报废
            </el-button>

            <el-button
              v-if="row.barcode"
              link
              type="primary"
              size="small"
              :disabled="row.mroModelVo?.identityManage !== 1"
              @click="printBarcode([row.barcode])"
            >
              打印标签码
            </el-button>
            <el-button
              v-else
              link
              type="primary"
              size="small"
              :disabled="row.mroModelVo?.identityManage !== 1"
              @click="onBindBarcodeClick(row)"
            >
              绑定标签码
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

      <MroInfoDetail
        v-if="curPageKey === EnumPageType.Mro_detail"
        :mro-id="selectedRowId"
        @close="curPageKey = EnumPageType.Main"
        @success="customTableRef?.requestData()"
      />

      <MroInfoConfig
        v-if="curPageKey === EnumPageType.Mro_config"
        :key="`mro-info-config-${selectedRowId}`"
        :mro-id="selectedRowId"
        @close="curPageKey = EnumPageType.Main"
        @success="customTableRef?.requestData()"
      />

      <MroInfoResume
        v-if="curPageKey === EnumPageType.Mro_resume"
        :mro-id="selectedRowId"
        @close="curPageKey = EnumPageType.Main"
        @review="onMroResumeReview"
      />

      <MroVerifyTaskDetail
        v-if="curPageKey === EnumPageType.Mro_verify_order_detail"
        :mro-task-id="curMroVerifyTaskId"
        @close="curPageKey = EnumPageType.Mro_resume"
      />

      <VerifyAbnormalOrderDetail
        v-if="curPageKey === EnumPageType.Mro_verify_exception_order_detail"
        :id="curVerifyExceptionTaskId"
        :type="1"
        @close="curPageKey = EnumPageType.Mro_verify_order_detail"
      />

      <UpkeepTaskOrderDetail
        v-if="curPageKey === EnumPageType.Mro_maintenance_order_detail"
        :id="curMaintenanceTaskId"
        @close="curPageKey = EnumPageType.Mro_resume"
      />

      <UpkeepErrorOrderDetail
        v-if="curPageKey === EnumPageType.Mro_maintenance_exception_order_detail"
        :id="curMaintenanceExceptionTaskId"
        @close="curPageKey = EnumPageType.Mro_maintenance_order_detail"
      />
    </div>

    <BindBarcodeDialog
      v-model="bindCodeVisible"
      :id="selectedRowId"
      @close="bindCodeVisible = false"
      @success="customTableRef?.requestData()"
    />

    <MroLedgerStatusActionDialog
      v-model="actionDialogVisible"
      :mode="currentActionMode"
      :row="currentActionRow"
      @success="onLedgerActionSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import {
  queryMroInfoPageList,
  requestArchiveMroInfo,
  requestUnarchiveMroInfo,
  requestScrapMroInfo
} from "@/api/operation/mro/mro-info"
import CustomPageCrumbs from "@/components/CustomPageCrumbs/index.vue"
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
import { EnumMROCurrentLocation, EnumMROCurrentLocationMap } from "@/constant/enums"
import useBarcodePrint from "@/hooks/useBarcodePrint"
import type {
  IMroInfoLedgerActionParams,
  IMroInfoPageListItem as ITableRow,
  IMroInfoPageListParams
} from "@/types/maintain/mro-manage/mro-info"
import UpkeepErrorOrderDetail from "@/views/MROManage/MROUpkeep/UpkeepErrorOrders/components/UpkeepErrorOrderDetail.vue"
import UpkeepTaskOrderDetail from "@/views/MROManage/MROUpkeep/UpkeepTaskOrders/components/UpkeepTaskOrderDetail.vue"
import VerifyAbnormalOrderDetail from "@/views/MROManage/MROVerify/VerifyAbnormalOrders/components/VerifyAbnormalOrderDetail.vue"
import MroVerifyTaskDetail from "@/views/MROManage/MROVerify/VerifyTaskOrders/components/MroVerifyTaskDetail/index.vue"

import BindBarcodeDialog from "./components/BindBarcodeDialog.vue"
import MroInfoConfig from "./components/MroInfoConfig/index.vue"
import MroInfoDetail from "./components/MroInfoDetail.vue"
import MroInfoResume from "./components/MroInfoResume/index.vue"
import MroLedgerStatusActionDialog from "./components/MroLedgerStatusActionDialog.vue"
import {
  formatLedgerStatus,
  formatRunningStatus,
  formatUnarchiveMethod,
  ledgerStatusOptions,
  ledgerStatusTagTypeMap,
  runningStatusOptions,
  runningStatusTagTypeMap
} from "./status"

defineOptions({
  name: "MROInfo"
})

type TLedgerActionMode = "archive" | "unarchive" | "scrap"

const { printBarcode } = useBarcodePrint()
const route = useRoute()

enum EnumPageType {
  Main,
  Mro_detail,
  Mro_config,
  Mro_resume,
  Mro_verify_order_detail,
  Mro_verify_exception_order_detail,
  Mro_maintenance_order_detail,
  Mro_maintenance_exception_order_detail
}

const curPageKey = ref(EnumPageType.Main)
const pageTree = [
  {
    name: "MRO台账",
    key: EnumPageType.Main,
    children: [
      {
        name: "MRO台账详情",
        key: EnumPageType.Mro_detail
      },
      {
        name: "MRO配置",
        key: EnumPageType.Mro_config
      },
      {
        name: "MRO履历",
        key: EnumPageType.Mro_resume,
        children: [
          {
            name: "MRO校验任务单详情",
            key: EnumPageType.Mro_verify_order_detail,
            children: [
              {
                name: "MRO校验异常任务单详情",
                key: EnumPageType.Mro_verify_exception_order_detail
              }
            ]
          },
          {
            name: "MRO保养任务单详情",
            key: EnumPageType.Mro_maintenance_order_detail,
            children: [
              {
                name: "MRO保养异常任务单详情",
                key: EnumPageType.Mro_maintenance_exception_order_detail
              }
            ]
          }
        ]
      }
    ]
  }
]

const curMroVerifyTaskId = ref("")
provide("mroVerifyOrderDetail", {
  openDetail: (id: string) => {
    curPageKey.value = EnumPageType.Mro_verify_order_detail
    curMroVerifyTaskId.value = id
  }
})

const curVerifyExceptionTaskId = ref("")
provide("verifyAbnormalOrderDetail", {
  openDetail: (id: string) => {
    curVerifyExceptionTaskId.value = id
    curPageKey.value = EnumPageType.Mro_verify_exception_order_detail
  }
})

const curMaintenanceTaskId = ref("")
provide("maintenanceTaskDetail", {
  openDetail: (id: string) => {
    curPageKey.value = EnumPageType.Mro_maintenance_order_detail
    curMaintenanceTaskId.value = id
  }
})

const curMaintenanceExceptionTaskId = ref("")
provide("maintenanceExceptionOrderDetail", {
  openDetail: (id: string) => {
    curPageKey.value = EnumPageType.Mro_maintenance_exception_order_detail
    curMaintenanceExceptionTaskId.value = id
  }
})

const locationOptions = ref<
  {
    label: string
    value: number
  }[]
>([])

const searchFormData = ref<ISearchItem[]>([
  {
    type: EnumComponentType.Input,
    key: "mroNo",
    label: "MRO序列号",
    value: "",
    placeholder: "请输入MRO序列号"
  },
  {
    type: EnumComponentType.Select,
    key: "curLocationList",
    label: "当前位置",
    value: "",
    placeholder: "请选择当前位置",
    options: locationOptions,
    multiple: true,
    maxTag: 2
  },
  {
    type: EnumComponentType.Select,
    key: "ledgerStatus",
    label: "台账状态",
    value: "",
    placeholder: "请选择台账状态",
    options: ledgerStatusOptions
  },
  {
    type: EnumComponentType.Select,
    key: "runningStatus",
    label: "运转状态",
    value: "",
    placeholder: "请选择运转状态",
    options: runningStatusOptions
  },
  {
    type: EnumComponentType.Input,
    key: "mroModelName",
    label: "MRO信息",
    value: "",
    placeholder: "请输入MRO信息"
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  curLocationList?: number[]
  ledgerStatus?: string
  mroModelName: string
  mroNo: string
  runningStatus?: number
}>(searchFormData.value)

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const registerRecordId = ref("")

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "mroNo",
      label: "MRO序列号",
      width: 160
    },
    {
      prop: "barcode",
      label: "标签码",
      width: 160
    },
    {
      prop: "ledgerStatus",
      label: "台账状态",
      width: 110,
      align: "center",
      slots: {
        default: "ledger-status"
      }
    },
    {
      prop: "displayRunningStatus",
      label: "运转状态",
      width: 120,
      align: "center",
      slots: {
        default: "running-status"
      }
    },
    {
      prop: "runningAlerts",
      label: "运转提醒",
      minWidth: 180,
      slots: {
        default: "running-alerts"
      }
    },
    {
      prop: "remainingLife",
      label: "剩余寿命",
      width: 100,
      align: "center",
      formatter: (row: ITableRow) => row.remainingLife ?? ""
    },
    {
      prop: "mroModelVo.mroModelName",
      label: "MRO信息",
      width: 160
    },
    {
      prop: "mroModelVo.mroCategoryName",
      label: "MRO类型",
      width: 160
    },
    {
      prop: "curLocation",
      label: "当前位置",
      width: 120,
      align: "center",
      formatter: (row: ITableRow) =>
        EnumMROCurrentLocationMap[row.curLocation as EnumMROCurrentLocation]
    },
    {
      prop: "warehouseName",
      label: "仓库",
      width: 160
    },
    {
      prop: "warehouseLocationName",
      label: "库位",
      width: 160
    },
    {
      prop: "productionAreaDisplayName",
      label: "生产区域",
      width: 180
    },
    {
      prop: "remarks",
      label: "备注",
      width: 180
    },
    {
      prop: "operation",
      label: "操作",
      width: 420,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

const queryConfig: ITableRequestConfig<[IMroInfoPageListParams], ITableRow, true> = {
  api: queryMroInfoPageList,
  getParams: () => [
    {
      pageQuery: {
        pageNum: pagination.value.currentPage,
        pageSize: pagination.value.pageSize
      },
      queryParam: {
        ...getFormData(),
        registerRecordId: registerRecordId.value
      },
      sort: [
        {
          field: "createTime",
          order: "desc"
        }
      ]
    }
  ]
}

const bindCodeVisible = ref(false)
const selectedRowId = ref("")

const actionDialogVisible = ref(false)
const currentActionMode = ref<TLedgerActionMode>("archive")
const currentActionRow = ref<ITableRow | null>(null)

let isInit = true
const oldQueryParams = {
  registerId: "",
  mroModelName: ""
}

const getRouteQueryString = (value: unknown) => {
  if (Array.isArray(value)) {
    return String(value[0] || "")
  }
  return typeof value === "string" ? value : ""
}

const getRunningAlerts = (row: ITableRow) =>
  (Array.isArray(row.runningAlerts) ? row.runningAlerts : []).filter(Boolean)

const initPageData = async () => {
  const { registerId, mroModelName } = route.query
  const nextRegisterId = getRouteQueryString(registerId)
  const nextMroModelName = getRouteQueryString(mroModelName)

  if (
    isInit ||
    oldQueryParams.registerId !== nextRegisterId ||
    oldQueryParams.mroModelName !== nextMroModelName
  ) {
    isInit = false
    oldQueryParams.mroModelName = nextMroModelName
    oldQueryParams.registerId = nextRegisterId
    registerRecordId.value = nextRegisterId
    searchList.value.find((item) => item.key === "mroModelName")!.value = nextMroModelName
  }

  curPageKey.value = EnumPageType.Main
  await nextTick()
  buildOptions()
  await customTableRef.value?.requestData()
}

onMounted(() => {
  void initPageData()
})

onActivated(() => {
  void initPageData()
})

watch(
  () => searchList.value.find((item) => item.key === "mroModelName")!.value,
  (val) => {
    if (!val) {
      registerRecordId.value = ""
    }
  }
)

const onMroInfoConfig = (row: ITableRow) => {
  selectedRowId.value = row.id
  curPageKey.value = EnumPageType.Mro_config
}

const onMroInfoResume = (row: ITableRow) => {
  selectedRowId.value = row.id
  curPageKey.value = EnumPageType.Mro_resume
}

const onReset = () => {
  resetForm()
  onSubmit()
}

const onSubmit = async () => {
  pagination.value.currentPage = 1
  await customTableRef.value?.requestData()
}

const buildOptions = () => {
  locationOptions.value = Object.keys(EnumMROCurrentLocationMap).map((key) => ({
    label: EnumMROCurrentLocationMap[key as unknown as EnumMROCurrentLocation],
    value: +key
  }))
}

const onMroInfoDetail = (row: ITableRow) => {
  selectedRowId.value = row.id
  curPageKey.value = EnumPageType.Mro_detail
}

const onMroResumeReview = (val: { mroModelName: string; registerId: string }) => {
  curPageKey.value = EnumPageType.Main
  const { mroModelName, registerId } = val
  searchList.value.find((item) => item.key === "mroModelName")!.value = mroModelName
  registerRecordId.value = registerId
  customTableRef.value?.requestData()
}

const onBindBarcodeClick = (row: ITableRow) => {
  bindCodeVisible.value = true
  selectedRowId.value = row.id
}

const openLedgerActionDialog = (mode: TLedgerActionMode, row: ITableRow) => {
  currentActionMode.value = mode
  currentActionRow.value = row
  actionDialogVisible.value = true
}

const onLedgerActionSuccess = async (payload: IMroInfoLedgerActionParams) => {
  const actionRequestMap: Record<
    TLedgerActionMode,
    (params: IMroInfoLedgerActionParams) => Promise<unknown>
  > = {
    archive: requestArchiveMroInfo,
    unarchive: requestUnarchiveMroInfo,
    scrap: requestScrapMroInfo
  }

  await actionRequestMap[currentActionMode.value](payload)

  const successTextMap: Record<TLedgerActionMode, string> = {
    archive: "封存成功",
    unarchive: "解封成功",
    scrap: "报废成功"
  }

  ElMessage.success(
    currentActionMode.value === "unarchive" &&
      payload.method &&
      payload.method !== "offline_verify"
      ? `已发起${formatUnarchiveMethod(payload.method)}解封`
      : successTextMap[currentActionMode.value]
  )
  actionDialogVisible.value = false
  await customTableRef.value?.requestData()
}
</script>

<style scoped lang="scss">
.running-alerts {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
</style>
