<template>
  <div class="layout-child-page-container">
    <div class="layout-child-page-content">
      <div>
        <el-button plain icon="ArrowLeft" @click="onClose">返回</el-button>
      </div>

      <el-tabs v-model="activeName" class="mro-config-tabs" :before-leave="handleBeforeLeave">
        <el-tab-pane
          v-if="mroModelDetail?.checkManage === 1"
          :label="getTabLabel(enumTabs.SpotCheck, '点检配置')"
          :name="enumTabs.SpotCheck"
        >
          <VerifyConfig
            ref="spotCheckConfigRef"
            :mro-model-id="mroModelId"
            :mro-item-type="4"
            title="点检配置"
            item-type-name="点检"
            temp-id-prefix="temp-spot"
            import-dialog-title="从其他MRO带入点检配置"
            import-confirm-message="带入后将覆盖当前页面的点检配置，是否继续？"
            :default-execute-department-id="mroModelDetail?.checkExecuteDepartmentId || ''"
            :default-execute-department-name="mroModelDetail?.checkExecuteDepartmentName || ''"
            :default-execute-position-id="mroModelDetail?.checkExecutePositionId || ''"
            :default-execute-position-name="mroModelDetail?.checkExecutePositionName || ''"
          />
        </el-tab-pane>

        <el-tab-pane
          v-if="mroModelDetail?.checkManage === 1"
          :label="getTabLabel(enumTabs.Verify, '校验配置')"
          :name="enumTabs.Verify"
        >
          <VerifyConfig
            ref="verifyConfigRef"
            :mro-model-id="mroModelId"
            :default-execute-department-id="mroModelDetail?.checkExecuteDepartmentId || ''"
            :default-execute-department-name="mroModelDetail?.checkExecuteDepartmentName || ''"
            :default-execute-position-id="mroModelDetail?.checkExecutePositionId || ''"
            :default-execute-position-name="mroModelDetail?.checkExecutePositionName || ''"
          />
        </el-tab-pane>

        <el-tab-pane
          v-if="mroModelDetail?.maintenanceManage === 1"
          :label="getTabLabel(enumTabs.Maintenance, '保养配置')"
          :name="enumTabs.Maintenance"
        >
          <MaintenanceConfig
            ref="maintenanceConfigRef"
            :mro-model-id="mroModelId"
            :default-execute-department-id="mroModelDetail?.maintenanceExecuteDepartmentId || ''"
            :default-execute-department-name="mroModelDetail?.maintenanceExecuteDepartmentName || ''"
            :default-execute-position-id="mroModelDetail?.maintenanceExecutePositionId || ''"
            :default-execute-position-name="mroModelDetail?.maintenanceExecutePositionName || ''"
          />
        </el-tab-pane>

        <el-tab-pane :label="getTabLabel(enumTabs.File, '相关文件配置')" :name="enumTabs.File">
          <FileConfig ref="fileConfigRef" :mro-model-id="mroModelId" />
        </el-tab-pane>
      </el-tabs>
    </div>

    <div class="layout-footer mro-config-footer">
      <span class="save-status" :class="{ 'is-dirty': activeTabDirty }">{{ activeTabStatusText }}</span>
      <div class="footer-actions">
        <el-button @click="onClose">返回</el-button>
        <el-button :loading="saveLoading" @click="onSaveAll">保存全部</el-button>
        <el-button type="primary" :loading="saveLoading" @click="onSaveCurrent">保存当前页签</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import {
  queryMroItemConfigPageList,
  queryMroModelDetail,
  requestUpdateMroConfig
} from "@/api/operation/mro/mro-model"
import type {
  IMroItemConfigUpdateParams,
  IMroModelPageListItem
} from "@/types/maintain/mro-manage/mro-model"

import FileConfig from "./tabs/FileConfig.vue"
import MaintenanceConfig from "./tabs/MaintenanceConfig.vue"
import VerifyConfig from "./tabs/VerifyConfig.vue"

defineOptions({
  name: "MroModelConfigDialog"
})

const props = withDefaults(
  defineProps<{
    mroModelId: string
  }>(),
  {}
)

const emit = defineEmits<{
  (e: "close"): void
  (e: "success"): void
}>()

enum enumTabs {
  SpotCheck,
  Verify,
  Maintenance,
  File
}

type IConfigTabExpose = {
  getTableList?: () => any[]
  isLoaded?: () => boolean
  validateTableList?: () => boolean
}

const spotCheckConfigRef = ref<InstanceType<typeof VerifyConfig>>()
const verifyConfigRef = ref<InstanceType<typeof VerifyConfig>>()
const maintenanceConfigRef = ref<InstanceType<typeof MaintenanceConfig>>()
const fileConfigRef = ref<InstanceType<typeof FileConfig>>()
const activeName = ref(enumTabs.SpotCheck)
const mroModelDetail = ref<IMroModelPageListItem>()
const saveLoading = ref(false)
const savedPayloadText = reactive<Record<number, string>>({
  [enumTabs.SpotCheck]: "[]",
  [enumTabs.Verify]: "[]",
  [enumTabs.Maintenance]: "[]",
  [enumTabs.File]: "[]"
})
const snapshotLoaded = reactive<Record<number, boolean>>({
  [enumTabs.SpotCheck]: false,
  [enumTabs.Verify]: false,
  [enumTabs.Maintenance]: false,
  [enumTabs.File]: false
})
const lastSavedAt = reactive<Record<number, string>>({
  [enumTabs.SpotCheck]: "",
  [enumTabs.Verify]: "",
  [enumTabs.Maintenance]: "",
  [enumTabs.File]: ""
})

const visibleTabs = computed(() => {
  const tabs: enumTabs[] = []
  if (mroModelDetail.value?.checkManage === 1) tabs.push(enumTabs.SpotCheck)
  if (mroModelDetail.value?.checkManage === 1) tabs.push(enumTabs.Verify)
  if (mroModelDetail.value?.maintenanceManage === 1) tabs.push(enumTabs.Maintenance)
  tabs.push(enumTabs.File)
  return tabs
})

const cloneData = <T,>(data: T): T => JSON.parse(JSON.stringify(data ?? []))

const formatSaveTime = () =>
  new Date().toLocaleTimeString("zh-CN", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  })

const getTabRef = (tab: enumTabs): IConfigTabExpose | undefined => {
  switch (tab) {
    case enumTabs.SpotCheck:
      return spotCheckConfigRef.value as IConfigTabExpose | undefined
    case enumTabs.Verify:
      return verifyConfigRef.value as IConfigTabExpose | undefined
    case enumTabs.Maintenance:
      return maintenanceConfigRef.value as IConfigTabExpose | undefined
    case enumTabs.File:
      return fileConfigRef.value as IConfigTabExpose | undefined
    default:
      return undefined
  }
}

const isTabReady = (tab: enumTabs) => {
  if (!visibleTabs.value.includes(tab)) return true
  return Boolean(getTabRef(tab)?.isLoaded?.())
}

const buildVerifyPayload = (rows: any[] = [], mroItemType = 1): IMroItemConfigUpdateParams["data"] =>
  rows.map((item) => ({
    checkStandardValue: item.checkStandardValue,
    configFrequency: Number(item.configFrequency || 1),
    configItemName: item.configItemName,
    configItemNo: item.configItemNo,
    detectMethod: item.detectMethod || item.methodRequire || "",
    executeDepartmentId: item.executeDepartmentId || "",
    executeDepartmentName: item.executeDepartmentName || "",
    executePositionId: item.executePositionId || "",
    executePositionName: item.executePositionName || "",
    fileIds: item.files?.map((file: any) => file.fileId) || [],
    id: item.id?.startsWith("temp-") ? "" : item.id || "",
    methodRequire: item.detectMethod || item.methodRequire || "",
    mroItemType,
    mroModelId: props.mroModelId,
    verifyOrg: item.verifyOrg || "",
    verifyType: item.verifyType || "day",
    spotShiftTiming: item.spotShiftTiming || "beforeShift"
  }))

const buildMaintenancePayload = (rows: any[] = []): IMroItemConfigUpdateParams["data"] =>
  rows.map((item) => ({
    checkStandardValue: item.checkStandardValue,
    configDepartmentIds: [],
    configFrequency: Number(item.configFrequency || 1),
    configItemName: item.configItemName,
    configItemNo: item.configItemNo,
    detectMethod: item.detectMethod || item.methodRequire || "",
    executeDepartmentId: item.executeDepartmentId || "",
    executeDepartmentName: item.executeDepartmentName || "",
    executePositionId: item.executePositionId || "",
    executePositionName: item.executePositionName || "",
    fileIds: item.files?.map((file: any) => file.fileId) || [],
    id: item.id?.startsWith("temp-maintenance-") ? "" : item.id || "",
    maintenanceType: item.maintenanceType || "week",
    methodRequire: item.detectMethod || item.methodRequire || "",
    mroItemType: 2,
    mroModelId: props.mroModelId,
    ngDepartmentIds: []
  }))

const buildFilePayload = (rows: any[] = []): IMroItemConfigUpdateParams["data"] => [
  {
    fileIds: rows.map((item: any) => item.deploymentId || item.fileId || item.id).filter(Boolean),
    mroItemType: 3,
    mroModelId: props.mroModelId
  }
]

const getSavedPayload = (tab: enumTabs): IMroItemConfigUpdateParams["data"] =>
  cloneData(JSON.parse(savedPayloadText[tab] || "[]"))

const setSavedPayload = (
  tab: enumTabs,
  payload: IMroItemConfigUpdateParams["data"],
  markSaveTime = false
) => {
  savedPayloadText[tab] = JSON.stringify(payload || [])
  snapshotLoaded[tab] = true
  if (markSaveTime) {
    lastSavedAt[tab] = formatSaveTime()
  }
}

const getCurrentTabPayload = (tab: enumTabs): IMroItemConfigUpdateParams["data"] => {
  if (!visibleTabs.value.includes(tab)) return []
  if (!isTabReady(tab)) return getSavedPayload(tab)

  const tableData = cloneData(getTabRef(tab)?.getTableList?.() || [])
  switch (tab) {
    case enumTabs.SpotCheck:
      return buildVerifyPayload(tableData, 4)
    case enumTabs.Verify:
      return buildVerifyPayload(tableData)
    case enumTabs.Maintenance:
      return buildMaintenancePayload(tableData)
    case enumTabs.File:
      return buildFilePayload(tableData)
    default:
      return []
  }
}

const isTabDirty = (tab: enumTabs) => {
  if (!visibleTabs.value.includes(tab)) return false
  if (!snapshotLoaded[tab] || !isTabReady(tab)) return false
  return JSON.stringify(getCurrentTabPayload(tab)) !== savedPayloadText[tab]
}

const activeTabDirty = computed(() => isTabDirty(activeName.value))
const hasDirty = computed(() => visibleTabs.value.some((tab) => isTabDirty(tab)))
const activeTabStatusText = computed(() => {
  if (saveLoading.value) return "正在保存..."
  if (activeTabDirty.value) return "当前页签未保存"
  if (lastSavedAt[activeName.value]) {
    return `当前页签已保存 ${lastSavedAt[activeName.value]}`
  }
  return ""
})

const validateTab = (tab: enumTabs) => {
  const target = getTabRef(tab)
  if (typeof target?.validateTableList === "function") {
    return target.validateTableList() !== false
  }
  return true
}

const loadSavedSnapshots = async () => {
  const tasks: Promise<void>[] = []

  if (mroModelDetail.value?.checkManage === 1) {
    tasks.push(
      queryMroItemConfigPageList({
        pageQuery: { pageNum: 1, pageSize: 1000 },
        queryParam: { mroItemType: 4, mroModelId: props.mroModelId }
      }).then(({ records }) => {
        setSavedPayload(enumTabs.SpotCheck, buildVerifyPayload(records || [], 4))
      })
    )

    tasks.push(
      queryMroItemConfigPageList({
        pageQuery: { pageNum: 1, pageSize: 1000 },
        queryParam: { mroItemType: 1, mroModelId: props.mroModelId }
      }).then(({ records }) => {
        setSavedPayload(enumTabs.Verify, buildVerifyPayload(records || []))
      })
    )
  } else {
    setSavedPayload(enumTabs.SpotCheck, [])
    setSavedPayload(enumTabs.Verify, [])
  }

  if (mroModelDetail.value?.maintenanceManage === 1) {
    tasks.push(
      queryMroItemConfigPageList({
        pageQuery: { pageNum: 1, pageSize: 1000 },
        queryParam: { mroItemType: 2, mroModelId: props.mroModelId }
      }).then(({ records }) => {
        setSavedPayload(enumTabs.Maintenance, buildMaintenancePayload(records || []))
      })
    )
  } else {
    setSavedPayload(enumTabs.Maintenance, [])
  }

  tasks.push(
    queryMroItemConfigPageList({
      pageQuery: { pageNum: 1, pageSize: 1000 },
      queryParam: { mroItemType: 3, mroModelId: props.mroModelId }
    }).then(({ records }) => {
      setSavedPayload(enumTabs.File, buildFilePayload(records?.[0]?.files || []))
    })
  )

  await Promise.all(tasks)
}

const getMroModelDetail = async () => {
  const data = await queryMroModelDetail(props.mroModelId)
  mroModelDetail.value = data
  if (data.checkManage === 1) {
    activeName.value = enumTabs.SpotCheck
  } else if (data.maintenanceManage === 1) {
    activeName.value = enumTabs.Maintenance
  } else {
    activeName.value = enumTabs.File
  }

  await loadSavedSnapshots()
}

const saveConfigs = async (mode: "current" | "all", targetTab = activeName.value, closeAfterSave = false) => {
  if (saveLoading.value) return false

  const tabsToSave = mode === "all" ? visibleTabs.value : [targetTab]
  if (tabsToSave.some((tab) => !validateTab(tab))) return false

  const payloadCache = new Map<enumTabs, IMroItemConfigUpdateParams["data"]>()
  const requestData: IMroItemConfigUpdateParams["data"] = []

  visibleTabs.value.forEach((tab) => {
    const payload =
      mode === "all" || tab === targetTab ? getCurrentTabPayload(tab) : getSavedPayload(tab)
    payloadCache.set(tab, payload)
    requestData.push(...payload)
  })

  saveLoading.value = true
  try {
    await requestUpdateMroConfig({
      id: props.mroModelId,
      data: requestData
    })

    tabsToSave.forEach((tab) => {
      setSavedPayload(tab, payloadCache.get(tab) || [], true)
    })

    ElMessage.success(mode === "all" ? "保存成功" : "当前页签保存成功")
    emit("success")
    if (closeAfterSave) {
      emit("close")
    }
    return true
  } finally {
    saveLoading.value = false
  }
}

const handleBeforeLeave = async (_nextName: string | number, currentName: string | number) => {
  const currentTab = Number(currentName) as enumTabs
  if (!isTabDirty(currentTab)) return true

  try {
    await ElMessageBox.confirm("当前页签有未保存内容，是否先保存？", "提示", {
      type: "warning",
      confirmButtonText: "保存后切换",
      cancelButtonText: "直接切换",
      distinguishCancelAndClose: true,
      closeOnClickModal: false,
      closeOnPressEscape: false
    })
    return await saveConfigs("current", currentTab)
  } catch (action) {
    return action === "cancel"
  }
}

const onSaveCurrent = async () => {
  await saveConfigs("current")
}

const onSaveAll = async () => {
  await saveConfigs("all")
}

const onClose = async () => {
  if (!hasDirty.value) {
    emit("close")
    return
  }

  try {
    await ElMessageBox.confirm("当前页面存在未保存内容，是否先保存？", "提示", {
      type: "warning",
      confirmButtonText: "保存全部并返回",
      cancelButtonText: "直接返回",
      distinguishCancelAndClose: true,
      closeOnClickModal: false,
      closeOnPressEscape: false
    })

    await saveConfigs("all", activeName.value, true)
  } catch (action) {
    if (action === "cancel") {
      emit("close")
    }
  }
}

const handleBeforeUnload = (event: BeforeUnloadEvent) => {
  if (!hasDirty.value) return
  event.preventDefault()
  event.returnValue = ""
}

onMounted(() => {
  void getMroModelDetail()
  window.addEventListener("beforeunload", handleBeforeUnload)
})

onUnmounted(() => {
  window.removeEventListener("beforeunload", handleBeforeUnload)
})

const getTabLabel = (tab: enumTabs, label: string) => (isTabDirty(tab) ? `${label} *` : label)
</script>

<style lang="scss" scoped>
.layout-child-page-content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.mro-config-tabs {
  &.el-tabs--top {
    flex-direction: column;
  }

  :deep(.el-tabs__header) {
    flex: none;
    margin-bottom: 12px;
  }

  :deep(.el-tabs__content) {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }
}

.mro-config-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.footer-actions {
  display: flex;
  gap: 12px;
}

.save-status {
  min-height: 20px;
  font-size: 13px;
  color: #909399;
}

.save-status.is-dirty {
  color: #e6a23c;
}

.el-tabs {
  flex: 1;
  min-height: 0;
  overflow: hidden;

  .el-tab-pane {
    height: 100%;
  }
}
</style>
