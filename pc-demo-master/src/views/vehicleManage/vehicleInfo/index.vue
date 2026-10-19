<template>
  <div class="layout-container">
    <div class="layout-main-page" v-show="curPageKey === EnumPageType.Main">
      <CustomSearchForm :form-list="searchList" @search="onSubmit" @reset="onReset" />

      <div class="custom-table-container">
        <CustomTitle title="载具台账列表">
          <div v-if="canEdit">
            <el-button
              type="primary"
              :disabled="!(customTableRef?.getCurrentMultipleRows() || []).length"
              @click="onBatchPrintBarcode()"
            >
              批量打印
            </el-button>
            <el-button type="primary" icon="Plus" @click="onCreateVehicleClick()">
              新建载具台账
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
            <el-tag :type="LEDGER_STATUS_TAG_TYPE_MAP[getVehicleLedgerStatus(row)]" size="small">
              {{ formatVehicleLedgerStatus(row) }}
            </el-tag>
          </template>

          <template #repair-status="{ row }">
            <el-tag :type="TASK_STATUS_TAG_TYPE_MAP[getVehicleRepairTaskStatus(row)]" size="small">
              {{ formatVehicleRepairTaskStatus(row) }}
            </el-tag>
          </template>

          <template #scrap-status="{ row }">
            <el-tag :type="TASK_STATUS_TAG_TYPE_MAP[getVehicleScrapTaskStatus(row)]" size="small">
              {{ formatVehicleScrapTaskStatus(row) }}
            </el-tag>
          </template>

          <template #operation-default="{ row }">
            <div class="flex items-center">
              <el-button link type="primary" size="small" @click="onReviewVehicleDetailClick(row)">
                查看详情
              </el-button>
              <el-button v-if="canEdit" link type="primary" size="small" @click="onEditVehicleClick(row)">
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
                    <el-dropdown-item @click="onPrintBarcodeClick(row)">
                      <el-button type="primary" :disabled="!row.barcode" link>打印标签码</el-button>
                    </el-dropdown-item>
                    <el-dropdown-item
                      v-if="getVehicleLedgerStatus(row) !== 'scrapped' && canEdit"
                      @click="onSwitchStatusClick(row, row.status)"
                    >
                      <el-button :type="!row.status ? 'primary' : 'danger'" link>
                        {{ !row.status ? "启用" : "停用" }}
                      </el-button>
                    </el-dropdown-item>
                    <el-dropdown-item v-if="canEdit" @click="onDeleteVehicleClick(row)">
                      <el-button type="primary" link>删除</el-button>
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

      <VehicleLedgerDetail
        v-if="curPageKey === EnumPageType.Detail"
        :id="currentDetailId"
        @close="curPageKey = EnumPageType.Main"
        @refresh="customTableRef?.requestData()"
      />
    </div>

    <CreateVehicleInfoDialog
      v-model="vehicleInfoCreateVisible"
      @success="customTableRef?.requestData()"
    />

    <VehicleInfoDetailDialog ref="vehicleInfoDetailRef" @onOk="customTableRef?.requestData()" />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import {
  deleteVehicleItem,
  getVehiclePage,
  getVehicleSaveOrUpdate
} from "@/api/operation/vehicle/vehicleInfo"
import { getVehicleModelPage } from "@/api/operation/vehicle/vehicleModel"
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
import useBarcodePrint from "@/hooks/useBarcodePrint"
import useButtonAuth, { AuthType } from "@/hooks/useButtonAuth"
import type { IVehiclePageItem as ITableRow, IVehiclePageParams } from "@/types/maintain/vehicle"
import { formatDateTime } from "@/views/maintOperate/status"

import CreateVehicleInfoDialog from "./components/CreateVehicleInfoDialog.vue"
import VehicleInfoDetailDialog from "./components/detail.vue"
import VehicleLedgerDetail from "./components/VehicleLedgerDetail.vue"
import {
  formatVehicleLedgerStatus,
  formatVehicleRepairTaskStatus,
  formatVehicleScrapTaskStatus,
  getVehicleLedgerStatus,
  getVehicleRepairTaskStatus,
  getVehicleScrapTaskStatus,
  LEDGER_STATUS_TAG_TYPE_MAP,
  TASK_STATUS_TAG_TYPE_MAP
} from "./status"

defineOptions({
  name: "VehicleInfo"
})

enum EnumPageType {
  Main,
  Detail
}

const { printBarcode } = useBarcodePrint()
const authType = useButtonAuth("VehicleInfoManage_update", "VehicleInfoManage_query")
const canEdit = computed(() => authType.value !== AuthType.View)

const curPageKey = ref(EnumPageType.Main)
const currentDetailId = ref("")
const pageTree = [
  {
    name: "载具台账",
    key: EnumPageType.Main,
    children: [
      {
        name: "载具台账详情",
        key: EnumPageType.Detail
      }
    ]
  }
]

const vehicleModelNoOptions = ref<
  {
    label: string
    value: string
  }[]
>([])

const ledgerStatusOptions = [
  { label: "启用", value: "enabled" },
  { label: "停用", value: "disabled" },
  { label: "报废", value: "scrapped" }
]

const searchFormData = ref<ISearchItem[]>([
  {
    type: EnumComponentType.Input,
    key: "no",
    label: "载具编号",
    value: "",
    placeholder: "请输入载具编号"
  },
  {
    type: EnumComponentType.Input,
    key: "barcode",
    label: "标签码",
    value: "",
    placeholder: "请输入标签码"
  },
  {
    type: EnumComponentType.Select,
    key: "vehicleModelNo",
    label: "载具信息",
    value: "",
    placeholder: "请选择载具信息",
    options: vehicleModelNoOptions
  },
  {
    type: EnumComponentType.Input,
    key: "name",
    label: "载具名称",
    value: "",
    placeholder: "请输入载具名称"
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
    type: EnumComponentType.Input,
    key: "productBarcode",
    label: "产品标签码",
    value: "",
    placeholder: "请输入产品标签码"
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  name?: string
  no?: string
  vehicleModelNo?: string
  ledgerStatus?: "enabled" | "disabled" | "scrapped"
  barcode?: string
  productBarcode?: string
}>(searchFormData.value)

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const vehicleInfoDetailRef = ref<InstanceType<typeof VehicleInfoDetailDialog>>()
const vehicleInfoCreateVisible = ref(false)

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  reserveSelection: true,
  columns: [
    {
      prop: "",
      type: "selection",
      label: "",
      width: 60,
      align: "center",
      multiple: true,
      selectable(row) {
        return row.barcode
      }
    },
    {
      prop: "no",
      label: "载具编号",
      minWidth: 160,
      formatter: (row: ITableRow) => row.no || "-"
    },
    {
      prop: "name",
      label: "载具名称",
      minWidth: 160,
      formatter: (row: ITableRow) => row.name || "-"
    },
    {
      prop: "barcode",
      label: "标签码",
      width: 160,
      formatter: (row: ITableRow) => row.barcode || "-"
    },
    {
      prop: "vehicleModelName",
      label: "载具信息",
      minWidth: 160,
      formatter: (row: ITableRow) => row.vehicleModelName || "-"
    },
    {
      prop: "vehicleCategoryName",
      label: "载具分类",
      minWidth: 160,
      formatter: (row: ITableRow) => row.vehicleCategoryName || "-"
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
      prop: "repairTaskStatus",
      label: "维修状态",
      width: 120,
      align: "center",
      slots: {
        default: "repair-status"
      }
    },
    {
      prop: "scrapTaskStatus",
      label: "报废状态",
      width: 120,
      align: "center",
      slots: {
        default: "scrap-status"
      }
    },
    {
      prop: "createTime",
      label: "台账创建时间",
      width: 160,
      formatter: (row: ITableRow) => formatDateTime(row.createTime)
    },
    {
      prop: "remarks",
      label: "备注",
      minWidth: 160,
      formatter: (row: ITableRow) => row.remarks || "-"
    },
    {
      prop: "operation",
      label: "操作",
      width: 180,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

const queryConfig: ITableRequestConfig<[IVehiclePageParams], ITableRow, true> = {
  api: getVehiclePage,
  getParams: () => [
    {
      pageQuery: {
        pageNum: pagination.value.currentPage,
        pageSize: pagination.value.pageSize
      },
      queryParam: {
        ...getFormData()
      }
    }
  ]
}

onMounted(() => {
  getVehicleModelOptions()
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

const onPrintBarcodeClick = (row: ITableRow) => {
  if (!row.barcode) {
    ElMessage.warning("当前载具没有可打印的标签码")
    return
  }

  printBarcode([row.barcode], () => {
    ElMessage.success("打印成功")
  })
}

const onSwitchStatusClick = async (row: ITableRow, status: number) => {
  await ElMessageBox.confirm(`此操作将${status === 1 ? "停用" : "启用"}该载具，是否继续？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })

  await getVehicleSaveOrUpdate({
    id: row.id,
    name: row.name,
    vehicleModelId: row.vehicleModelId,
    status: status === 1 ? 0 : 1
  })
  ElMessage.success(status === 1 ? "停用成功" : "启用成功")
  customTableRef.value?.requestData()
}

const onDeleteVehicleClick = async (row: ITableRow) => {
  await ElMessageBox.confirm("确认删除后将无法恢复，是否继续？", "删除操作", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  })
  await deleteVehicleItem(row.id)
  ElMessage.success("删除成功")
  customTableRef.value?.requestData()
}

const onBatchPrintBarcode = () => {
  const selectedRows = (customTableRef.value?.getCurrentMultipleRows() || []) as ITableRow[]
  if (selectedRows.length === 0) {
    ElMessage.warning("请选择要打印的载具")
    return
  }

  if (selectedRows.length > 100) {
    ElMessage.warning("超过100张的批量打印上限")
    return
  }

  printBarcode(
    selectedRows.map((item) => item.barcode),
    () => {
      ElMessage.success("打印成功")
      customTableRef.value?.clearSelectedRow()
    }
  )
}

const onCreateVehicleClick = () => {
  vehicleInfoCreateVisible.value = true
}

const onReviewVehicleDetailClick = (row: ITableRow) => {
  currentDetailId.value = row.id
  curPageKey.value = EnumPageType.Detail
}

const onEditVehicleClick = (row: ITableRow) => {
  vehicleInfoDetailRef.value?.setShow(row.id)
}

const getVehicleModelOptions = async () => {
  const { records } = await getVehicleModelPage({ pageQuery: { pageNum: 1, pageSize: 1000 } })
  if (!records) {
    return
  }
  vehicleModelNoOptions.value = records.map((item) => ({
    label: item.modelName,
    value: item.modelNo
  }))
}
</script>

<style scoped lang="scss">
.layout-main-page {
  :deep(.el-dropdown-link) {
    margin-left: 12px;
    display: flex;
    align-items: center;

    i {
      margin-left: 2px;
    }
  }
}
</style>
