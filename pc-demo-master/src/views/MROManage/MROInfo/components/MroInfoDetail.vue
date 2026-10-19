<template>
  <div class="layout-child-page-container">
    <div class="layout-child-page-content">
      <div class="header-actions">
        <el-button plain icon="ArrowLeft" @click="emit('close')">{{ backText }}</el-button>
        <el-button
          v-if="mroInfoData?.ledgerStatus === 'enabled'"
          type="warning"
          plain
          @click="openActionDialog('archive')"
        >
          {{ archiveText }}
        </el-button>
        <el-button
          v-if="mroInfoData?.ledgerStatus === 'archived' && !mroInfoData?.pendingUnarchiveTaskId"
          type="success"
          plain
          @click="openActionDialog('unarchive')"
        >
          {{ unarchiveText }}
        </el-button>
      </div>
      <CustomTitle :title="detailTitle" showShortBar />
      <CustomDescription :data="mroInfoData || {}" :configs="mroInfoConfig" :label-width="140" />

      <CustomTitle :title="modelTitle" showShortBar />
      <CustomDescription :data="mroModelData || {}" :configs="mroModelConfig" :label-width="140" />
    </div>
  </div>

  <div class="layout-footer">
    <el-button @click="emit('close')">{{ backText }}</el-button>
  </div>

  <MroLedgerStatusActionDialog
    v-model="actionDialogVisible"
    :mode="currentActionMode"
    :row="mroInfoData || null"
    @success="onActionSuccess"
  />
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import {
  queryMroInfoDetail,
  requestArchiveMroInfo,
  requestUnarchiveMroInfo
} from "@/api/operation/mro/mro-info"
import CustomDescription from "@/components/CustomDescription/index.vue"
import type { ICustomDescriptionConfig } from "@/components/CustomDescription/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import { EnumMROCurrentLocation, EnumMROCurrentLocationMap } from "@/constant/enums"
import type {
  IMroInfoLedgerActionParams,
  IMroInfoPageListItem
} from "@/types/maintain/mro-manage/mro-info"

import MroLedgerStatusActionDialog from "./MroLedgerStatusActionDialog.vue"
import {
  formatDateTime,
  formatLedgerStatus,
  formatRunningAlerts,
  formatRunningStatus,
  formatUnarchiveMethod
} from "../status"

defineOptions({
  name: "MroInfoDetail"
})

const backText = "返回"
const archiveText = "封存"
const unarchiveText = "解封"
const detailTitle = "MRO台账详情"
const modelTitle = "MRO信息基本信息"

type TLedgerActionMode = "archive" | "unarchive"

const props = withDefaults(
  defineProps<{
    mroId: string
  }>(),
  {}
)

const emit = defineEmits<{
  (e: "close"): void
  (e: "success"): void
}>()

const formatSwitchText = (value?: number) => (Number(value) === 1 ? "开启" : "关闭")

const formatDepartmentPosition = (department?: string, position?: string) => {
  const values = [department, position].filter(Boolean)
  return values.length ? values.join("-") : "-"
}

const actionDialogVisible = ref(false)
const currentActionMode = ref<TLedgerActionMode>("archive")
const mroInfoData = ref<IMroInfoPageListItem>()
const mroModelData = computed(() => mroInfoData.value?.mroModelVo)

const mroInfoConfig = computed<ICustomDescriptionConfig[]>(() => [
  {
    field: "mroNo",
    label: "序列号："
  },
  {
    field: "barcode",
    label: "标签码：",
    formatter: ({ data }) => data.barcode || "-"
  },
  {
    field: "ledgerStatus",
    label: "台账状态：",
    formatter: ({ data }) => data.displayLedgerStatus || formatLedgerStatus(data.ledgerStatus)
  },
  {
    field: "runningStatus",
    label: "运转状态：",
    formatter: ({ data }) => formatRunningStatus(data.displayRunningStatus || data.runningStatus)
  },
  {
    field: "runningAlerts",
    label: "运转提醒：",
    formatter: ({ data }) => formatRunningAlerts(data.runningAlerts)
  },
  {
    field: "archiveReason",
    label: "封存原因：",
    formatter: ({ data }) => data.archiveReason || "-"
  },
  {
    field: "archiveUserName",
    label: "封存人：",
    formatter: ({ data }) => data.archiveUserName || "-"
  },
  {
    field: "archiveTime",
    label: "封存时间：",
    formatter: ({ data }) => formatDateTime(data.archiveTime)
  },
  {
    field: "unarchiveMethod",
    label: "解封方式：",
    formatter: ({ data }) => formatUnarchiveMethod(data.unarchiveMethod)
  },
  {
    field: "unarchiveReason",
    label: "解封原因：",
    formatter: ({ data }) => data.unarchiveReason || "-"
  },
  {
    field: "unarchiveUserName",
    label: "解封人：",
    formatter: ({ data }) => data.unarchiveUserName || "-"
  },
  {
    field: "unarchiveTime",
    label: "解封时间：",
    formatter: ({ data }) => formatDateTime(data.unarchiveTime)
  },
  {
    field: "extendedLife",
    label: "延展寿命(次)："
  },
  {
    field: "usedLife",
    label: "已用寿命(次)："
  },
  {
    field: "remainingLife",
    label: "剩余寿命(次)："
  },
  {
    field: "curLocation",
    label: "当前位置：",
    formatter: ({ data }) =>
      EnumMROCurrentLocationMap[data.curLocation as EnumMROCurrentLocation] || "-"
  },
  {
    field: "warehouseName",
    label: "仓库：",
    formatter: ({ data }) => data.warehouseName || "-"
  },
  {
    field: "warehouseLocationName",
    label: "库位：",
    formatter: ({ data }) => data.warehouseLocationName || "-"
  },
  {
    field: "productionAreaDisplayName",
    label: "生产区域：",
    formatter: ({ data }) => data.productionAreaDisplayName || "-"
  },
  {
    field: "remarks",
    label: "备注：",
    colspan: -1,
    formatter: ({ data }) => data.remarks || "-"
  }
])

const mroModelConfig = computed<ICustomDescriptionConfig[]>(() => [
  {
    field: "mroModelNo",
    label: "MRO编号："
  },
  {
    field: "mroModelName",
    label: "MRO名称："
  },
  {
    field: "mroSpec",
    label: "MRO规格："
  },
  {
    field: "mroClassifyName",
    label: "MRO分类："
  },
  {
    field: "mroCategoryName",
    label: "MRO类型："
  },
  {
    field: "identityManage",
    label: "标识管理：",
    formatter: ({ data }) => formatSwitchText(data.identityManage)
  },
  {
    field: "checkManage",
    label: "校验管理：",
    formatter: ({ data }) => formatSwitchText(data.checkManage)
  },
  {
    field: "checkExecutePositionName",
    label: "校验执行职位：",
    formatter: ({ data }) =>
      data.identityManage && data.checkManage
        ? formatDepartmentPosition(data.checkExecuteDepartmentName, data.checkExecutePositionName)
        : "-"
  },
  {
    field: "maintenanceManage",
    label: "保养管理：",
    formatter: ({ data }) => formatSwitchText(data.maintenanceManage)
  },
  {
    field: "maintenanceExecutePositionName",
    label: "保养执行职位：",
    formatter: ({ data }) =>
      data.identityManage && data.maintenanceManage
        ? formatDepartmentPosition(
            data.maintenanceExecuteDepartmentName,
            data.maintenanceExecutePositionName
          )
        : "-"
  },
  {
    field: "lifeManage",
    label: "寿命管理：",
    formatter: ({ data }) => formatSwitchText(data.lifeManage)
  },
  {
    field: "totalLife",
    label: "设计寿命：",
    formatter: ({ data }) =>
      data.identityManage && data.lifeManage ? String(Number(data.totalLife || 0)) : "-"
  },
  {
    field: "alarmLine",
    label: "寿命报警线：",
    formatter: ({ data }) =>
      data.identityManage && data.lifeManage ? `${Number(data.alarmLine || 0)}%` : "-"
  },
  {
    field: "archiveManage",
    label: "封存管理：",
    formatter: ({ data }) => formatSwitchText(data.archiveManage)
  },
  {
    field: "archivePeriod",
    label: "封存周期(天)：",
    formatter: ({ data }) =>
      data.identityManage && data.archiveManage ? String(Number(data.archivePeriod || 0)) : "-"
  },
  {
    field: "safeStockManage",
    label: "安全库存管理：",
    formatter: ({ data }) => formatSwitchText(data.safeStockManage)
  },
  {
    field: "safeStock",
    label: "安全库存：",
    formatter: ({ data }) => (data.safeStockManage ? String(Number(data.safeStock || 0)) : "-")
  },
  {
    field: "createTime",
    label: "创建时间：",
    formatter: ({ data }) => formatDateTime(data.createTime)
  }
])

onMounted(() => {
  void getMroInfoDetail()
})

const getMroInfoDetail = async () => {
  const res = await queryMroInfoDetail({ id: props.mroId })
  mroInfoData.value = res
}

const openActionDialog = (mode: TLedgerActionMode) => {
  currentActionMode.value = mode
  actionDialogVisible.value = true
}

const onActionSuccess = async (payload: IMroInfoLedgerActionParams) => {
  const requestMap: Record<TLedgerActionMode, (params: IMroInfoLedgerActionParams) => Promise<unknown>> = {
    archive: requestArchiveMroInfo,
    unarchive: requestUnarchiveMroInfo
  }

  await requestMap[currentActionMode.value](payload)
  ElMessage.success(
    currentActionMode.value === "unarchive" &&
      payload.method &&
      payload.method !== "offline_verify"
      ? `已发起${formatUnarchiveMethod(payload.method)}解封`
      : currentActionMode.value === "archive"
        ? "封存成功"
        : "解封成功"
  )
  actionDialogVisible.value = false
  await getMroInfoDetail()
  emit("success")
}
</script>

<style lang="scss" scoped>
.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
