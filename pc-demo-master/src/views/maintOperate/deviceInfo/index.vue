<template>
  <div class="layout-container">
    <div class="layout-main-page" v-show="curPageKey === EnumPageType.Main">
      <CustomSearchForm
        :form-list="searchList"
        @search="onSubmit"
        @reset="onReset"
      ></CustomSearchForm>

      <div class="custom-table-container">
        <CustomTitle title="设备台账列表">
          <div v-if="canEdit">
            <el-button type="primary" icon="Plus" @click="onEditDeviceClick('create')">
              新建设备台账
            </el-button>
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
          <template #ledger-status="{ row }">
            <el-tag :type="LEDGER_STATUS_TAG_TYPE_MAP[getDeviceLedgerStatus(row)]" size="small">
              {{ formatDeviceLedgerStatus(row) }}
            </el-tag>
          </template>

          <template #running-status="{ row }">
            <el-tag :type="getDeviceRunningStatusTagType(row)" size="small">
              {{ formatDeviceRunningStatus(row) }}
            </el-tag>
          </template>

          <template #running-alerts="{ row }">
            <div v-if="getDeviceRunningAlerts(row).length" class="running-alerts">
              <el-tag
                v-for="item in getDeviceRunningAlerts(row).slice(0, 2)"
                :key="item"
                type="warning"
                effect="plain"
                size="small"
              >
                {{ item }}
              </el-tag>
              <el-tag
                v-if="getDeviceRunningAlerts(row).length > 2"
                type="info"
                effect="plain"
                size="small"
              >
                +{{ getDeviceRunningAlerts(row).length - 2 }}
              </el-tag>
            </div>
            <span v-else>--</span>
          </template>

          <template #operation-default="{ row }">
            <div class="flex items-center">
              <el-button link type="primary" @click="onDetailClick(row)" size="small">
                查看详情
              </el-button>
              <el-button
                v-if="canEdit"
                link
                type="primary"
                @click="onEditDeviceClick('edit', row)"
                size="small"
              >
                编辑
              </el-button>
              <el-dropdown>
                <span class="el-dropdown-link">
                  更多
                  <el-icon class="el-icon--right">
                    <arrow-down />
                  </el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="onDeviceHistoryClick(row.id)">
                      <el-button type="primary" link>设备履历</el-button>
                    </el-dropdown-item>
                    <el-dropdown-item @click="onDeviceSettingClick(row)">
                      <el-button type="primary" link>设备配置</el-button>
                    </el-dropdown-item>
                    <el-dropdown-item @click="onPrintClick(row)">
                      <el-button type="primary" :disabled="!row.barCode" link>
                        打印标签码
                      </el-button>
                    </el-dropdown-item>
                    <el-dropdown-item
                      v-if="row.repairStatus !== 35 && canEdit"
                      @click="onSwitchStatusClick(row.id, row.equipmentStatus)"
                    >
                      <el-button
                        :type="
                          row.equipmentStatus === EnumDeviceUseStatusType.Stopping
                            ? 'primary'
                            : 'danger'
                        "
                        link
                      >
                        {{ row.equipmentStatus === EnumDeviceUseStatusType.Stopping ? "启用" : "停用" }}
                      </el-button>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
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

      <DeviceLedgerDetail
        v-if="curPageKey === EnumPageType.Detail"
        :id="currentDetailId"
        @close="curPageKey = EnumPageType.Main"
      />
    </div>

    <EditDeviceModal
      ref="deviceModalRef"
      :status="editDeviceStatus"
      @onOk="customTableRef?.requestData()"
    />

    <DeviceInitSetting ref="deviceInitRef" :data="{}" :justSee="!canEdit" />

    <DeviceRecord v-model="recordShow" :device-id="recordDeviceId" />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import {
  queryEquipmentPageList,
  requestDisableEquipment,
  requestEnableEquipment
} from "@/api/operation/equipment/equipment-info"
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
import { EnumDeviceUseStatusType } from "@/constant/enums"
import { FORMAT_DATE } from "@/constant/time"
import useBarcodePrint from "@/hooks/useBarcodePrint"
import useButtonAuth, { AuthType } from "@/hooks/useButtonAuth"
import type {
  IEquipmentPageItem as ITableRow,
  IEquipmentPageParams
} from "@/types/maintain/equipment-manage/equipment-info"
import { formatDateTime } from "@/views/maintOperate/status"

import DeviceInitSetting from "../components/deviceItemSetting.vue"
import DeviceLedgerDetail from "./components/DeviceLedgerDetail.vue"
import DeviceRecord from "./components/deviceRecord.vue"
import EditDeviceModal from "./components/editDeviceModal.vue"
import {
  formatBindingWorkstation,
  formatDeviceLedgerStatus,
  formatDeviceRunningStatus,
  getDeviceLedgerStatus,
  getDeviceRunningAlerts,
  getDeviceRunningStatusTagType,
  LEDGER_STATUS_TAG_TYPE_MAP} from "./status"

defineOptions({
  name: "DeviceInfo"
})

enum EnumPageType {
  Main,
  Detail
}

const { printBarcode } = useBarcodePrint()
const authType = useButtonAuth("DeviceInfo_update", "DeviceInfo_query")
const canEdit = computed(() => authType.value !== AuthType.View)

const curPageKey = ref(EnumPageType.Main)
const currentDetailId = ref("")
const pageTree = [
  {
    name: "设备台账",
    key: EnumPageType.Main,
    children: [
      {
        name: "设备台账详情",
        key: EnumPageType.Detail
      }
    ]
  }
]

const ledgerStatusOptions = [
  { label: "启用", value: "enabled" },
  { label: "停用", value: "disabled" },
  { label: "报废", value: "scrapped" }
]

const runningStatusOptions = [
  { label: "正常", value: "normal" },
  { label: "待保养", value: "maintenance_pending" },
  { label: "待巡检", value: "patrol_pending" },
  { label: "待点检", value: "spot_pending" },
  { label: "保养异常", value: "maintenance_exception" },
  { label: "巡检异常", value: "patrol_exception" },
  { label: "点检异常", value: "spot_exception" },
  { label: "待维修", value: "repair_pending" },
  { label: "维修中", value: "repair_processing" },
  { label: "待报废", value: "scrap_pending" }
]

const searchFormData = ref<ISearchItem[]>([
  {
    type: EnumComponentType.Input,
    key: "equipmentNo",
    label: "设备编号",
    value: "",
    placeholder: "请输入设备编号"
  },
  {
    type: EnumComponentType.Input,
    key: "barCode",
    label: "标签码",
    value: "",
    placeholder: "请输入标签码"
  },
  {
    type: EnumComponentType.Input,
    key: "equipmentModelNo",
    label: "类型编号",
    value: "",
    placeholder: "请输入类型编号"
  },
  {
    type: EnumComponentType.Input,
    key: "equipmentName",
    label: "设备名称",
    value: "",
    placeholder: "请输入设备名称"
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
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  barCode: string
  equipmentName: string
  equipmentModelNo: string
  equipmentNo: string
  ledgerStatus?: "enabled" | "disabled" | "scrapped"
  runningStatus?:
    | "normal"
    | "maintenance_pending"
    | "patrol_pending"
    | "spot_pending"
    | "maintenance_exception"
    | "patrol_exception"
    | "spot_exception"
    | "repair_pending"
    | "repair_processing"
    | "scrap_pending"
}>(searchFormData.value)

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])

const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "equipmentNo",
      label: "设备编号",
      width: 160,
      formatter: (row: ITableRow) => row.equipmentNo || "-"
    },
    {
      prop: "equipmentName",
      label: "设备名称",
      width: 160,
      formatter: (row: ITableRow) => row.equipmentName || row.equipmentModel?.modelName || "-"
    },
    {
      prop: "barCode",
      label: "标签码",
      width: 160,
      formatter: (row: ITableRow) => {
        return row.barCode || "-"
      }
    },
    {
      prop: "equipmentModel.modelName",
      label: "类型名称",
      width: 160,
      formatter: (row: ITableRow) => row.equipmentModel?.modelName || "-"
    },
    {
      prop: "equipmentModel.equipmentCategoryName",
      label: "设备分类",
      width: 160
    },
    {
      prop: "ledgerStatus",
      label: "台账状态",
      width: 120,
      align: "center",
      slots: {
        default: "ledger-status"
      }
    },
    {
      prop: "runningStatus",
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
      minWidth: 200,
      slots: {
        default: "running-alerts"
      }
    },
    {
      prop: "fmEntityNames",
      label: "绑定工位",
      width: 160,
      formatter: (row: ITableRow) => {
        return formatBindingWorkstation(row.fmEntityNames)
      }
    },
    {
      prop: "createTime",
      label: "台账创建时间",
      width: 160,
      formatter: ({ createTime }) => formatDateTime(createTime)
    },
    {
      prop: "remarks",
      label: "备注",
      width: 160
    },
    {
      prop: "operation",
      label: "操作",
      width: 200,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

const queryConfig: ITableRequestConfig<[IEquipmentPageParams], ITableRow, true> = {
  api: queryEquipmentPageList,
  getParams: () => {
    return [
      {
        pageQuery: {
          pageNum: pagination.value.currentPage,
          pageSize: pagination.value.pageSize
        },
        queryParam: {
          ...getFormData()
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
}

const editDeviceStatus = ref<"edit" | "create">("edit")
const deviceModalRef = ref<InstanceType<typeof EditDeviceModal>>()
const deviceInitRef = ref<InstanceType<typeof DeviceInitSetting>>()
const recordShow = ref(false)
const recordDeviceId = ref("")

onMounted(() => {
  customTableRef.value?.requestData()
})

const onPrintClick = (row: any) => {
  row.barCode &&
    printBarcode([row.barCode], () => {
      ElMessage.success("打印成功")
    })
}

const onSwitchStatusClick = async (id: string, status: number) => {
  await ElMessageBox.confirm(
    `此操作将${status === 1 ? "停用" : "启用"}该设备台账，是否继续？`,
    "提示",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }
  )
  if (status === 1) {
    await requestDisableEquipment(id)
    ElMessage.success("停用成功")
  } else {
    await requestEnableEquipment(id)
    ElMessage.success("启用成功")
  }
  customTableRef.value?.requestData()
}

const onReset = () => {
  resetForm()
  onSubmit()
}

const onSubmit = async () => {
  pagination.value.currentPage = 1
  await customTableRef.value?.requestData()
}

const onDeviceHistoryClick = (id: string) => {
  recordShow.value = true
  recordDeviceId.value = id
}


const onDeviceSettingClick = (data: ITableRow) => {
  deviceInitRef.value?.setShow()
  deviceInitRef.value?.setModelId(data.id as any)
}

const onDetailClick = (data: ITableRow) => {
  currentDetailId.value = data.id
  curPageKey.value = EnumPageType.Detail
}

const onEditDeviceClick = (type: "edit" | "create", data?: any) => {
  editDeviceStatus.value = type
  deviceModalRef.value?.setShow()
  const dd = cloneDeep(data)
  data &&
    type === "edit" &&
    deviceModalRef.value?.setModalData({
      ...dd,
      equipmentCategoryName: dd.equipmentModel?.equipmentCategoryName || "",
      startPatrolDate: dd.startPatrolDate || dayjs().format(FORMAT_DATE)
    })
}
</script>

<style scoped lang="scss">
.layout-main-page {
  .running-alerts {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  :deep(.el-dropdown-link) {
    margin-left: 12px;
    display: flex;
    align-items: center;

    i {
      margin-left: 2px;
    }
    &:focus-visible {
      outline: none;
    }
  }
}
</style>
