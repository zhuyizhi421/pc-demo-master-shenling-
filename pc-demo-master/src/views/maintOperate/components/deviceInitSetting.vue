<template>
  <div class="layout-child-page-container">
    <div class="layout-child-page-content">
      <div>
        <el-button plain icon="ArrowLeft" @click="onClose">返回</el-button>
      </div>

      <el-tabs v-model="activeName" class="device-init-tabs" :before-leave="handleBeforeLeave">
        <el-tab-pane :label="getTabLabel(DeviceInitSettingTabs.check, '点检配置')" :name="DeviceInitSettingTabs.check">
          <CheckConfig
            ref="checkConfigRef"
            :model-id="modelId"
            :just-see="justSee"
            @success="emit('success')"
            @dirty-change="onTabDirtyChange(DeviceInitSettingTabs.check, $event)"
          />
        </el-tab-pane>
        <el-tab-pane :label="getTabLabel(DeviceInitSettingTabs.patrol, '巡检配置')" :name="DeviceInitSettingTabs.patrol">
          <PatrolConfig
            ref="patrolConfigRef"
            :model-id="modelId"
            :just-see="justSee"
            @success="emit('success')"
            @dirty-change="onTabDirtyChange(DeviceInitSettingTabs.patrol, $event)"
          />
        </el-tab-pane>
        <el-tab-pane
          :label="getTabLabel(DeviceInitSettingTabs.maintain, '保养配置')"
          :name="DeviceInitSettingTabs.maintain"
        >
          <MaintenanceConfig
            ref="maintenanceConfigRef"
            :model-id="modelId"
            :just-see="justSee"
            @success="emit('success')"
            @dirty-change="onTabDirtyChange(DeviceInitSettingTabs.maintain, $event)"
          />
        </el-tab-pane>
        <el-tab-pane :label="getTabLabel(DeviceInitSettingTabs.file, '相关文件配置')" :name="DeviceInitSettingTabs.file">
          <FileConfig :model-id="modelId" :just-see="justSee" @success="emit('success')" />
        </el-tab-pane>
      </el-tabs>
    </div>

    <div class="layout-footer device-init-footer">
      <span class="save-status" :class="{ 'is-dirty': activeTabDirty }">{{ activeTabStatusText }}</span>
      <div class="footer-actions">
        <el-button @click="onClose">返回</el-button>
        <template v-if="!justSee">
          <el-button :loading="saveLoading" @click="onSaveAll">保存全部</el-button>
          <el-button type="primary" :loading="saveLoading" @click="onSaveCurrent">保存当前页签</el-button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import { DeviceInitSettingTabs } from "@/api/operation/equipment/types"

import CheckConfig from "./deviceInitSettingTabs/CheckConfig.vue"
import FileConfig from "./deviceInitSettingTabs/FileConfig.vue"
import MaintenanceConfig from "./deviceInitSettingTabs/MaintenanceConfig.vue"
import PatrolConfig from "./deviceInitSettingTabs/PatrolConfig.vue"

defineOptions({
  name: "DeviceInitSetting"
})

const props = defineProps<{
  modelId: string
  justSee?: boolean
}>()

const emit = defineEmits<{
  (e: "close"): void
  (e: "success"): void
}>()

type IConfigTabExpose = {
  isDirty?: () => boolean
  saveTableData?: () => Promise<boolean>
}

const checkConfigRef = ref<InstanceType<typeof CheckConfig>>()
const patrolConfigRef = ref<InstanceType<typeof PatrolConfig>>()
const maintenanceConfigRef = ref<InstanceType<typeof MaintenanceConfig>>()
const activeName = ref(DeviceInitSettingTabs.check)
const saveLoading = ref(false)
const tabDirtyMap = reactive<Record<number, boolean>>({
  [DeviceInitSettingTabs.check]: false,
  [DeviceInitSettingTabs.patrol]: false,
  [DeviceInitSettingTabs.maintain]: false,
  [DeviceInitSettingTabs.file]: false
})

const activeTabDirty = computed(() => tabDirtyMap[activeName.value] || false)
const hasDirty = computed(() => Object.values(tabDirtyMap).some(Boolean))
const activeTabStatusText = computed(() => {
  if (saveLoading.value) return "正在保存..."
  if (activeTabDirty.value) return "当前页签未保存"
  return ""
})

const getTabRef = (tab: DeviceInitSettingTabs): IConfigTabExpose | undefined => {
  if (tab === DeviceInitSettingTabs.check) {
    return checkConfigRef.value as IConfigTabExpose | undefined
  }
  if (tab === DeviceInitSettingTabs.patrol) {
    return patrolConfigRef.value as IConfigTabExpose | undefined
  }
  if (tab === DeviceInitSettingTabs.maintain) {
    return maintenanceConfigRef.value as IConfigTabExpose | undefined
  }
  return undefined
}

const onTabDirtyChange = (tab: DeviceInitSettingTabs, value: boolean) => {
  tabDirtyMap[tab] = value
}

const getTabLabel = (tab: DeviceInitSettingTabs, label: string) => (tabDirtyMap[tab] ? `${label} *` : label)

const saveTab = async (tab: DeviceInitSettingTabs) => {
  const target = getTabRef(tab)
  if (!target?.saveTableData) return true
  if (!target?.isDirty?.()) return true
  return (await target.saveTableData()) !== false
}

const onSaveCurrent = async () => {
  if (saveLoading.value) return
  if (!getTabRef(activeName.value)?.isDirty?.()) {
    ElMessage.success("当前页签已保存")
    return
  }
  saveLoading.value = true
  try {
    await saveTab(activeName.value)
  } finally {
    saveLoading.value = false
  }
}

const onSaveAll = async () => {
  if (saveLoading.value) return
  saveLoading.value = true
  try {
    let savedAny = false
    for (const tab of [
      DeviceInitSettingTabs.check,
      DeviceInitSettingTabs.patrol,
      DeviceInitSettingTabs.maintain,
      DeviceInitSettingTabs.file
    ]) {
      if (getTabRef(tab)?.isDirty?.()) {
        savedAny = true
      }
      const success = await saveTab(tab)
      if (!success) return
    }
    if (!savedAny) {
      ElMessage.success("保存成功")
    }
  } finally {
    saveLoading.value = false
  }
}

const handleBeforeLeave = async (_nextName: string | number, currentName: string | number) => {
  const currentTab = Number(currentName) as DeviceInitSettingTabs
  if (!tabDirtyMap[currentTab]) return true

  try {
    await ElMessageBox.confirm("当前页签有未保存内容，是否先保存？", "提示", {
      type: "warning",
      confirmButtonText: "保存后切换",
      cancelButtonText: "直接切换",
      distinguishCancelAndClose: true,
      closeOnClickModal: false,
      closeOnPressEscape: false
    })
    saveLoading.value = true
    try {
      return await saveTab(currentTab)
    } finally {
      saveLoading.value = false
    }
  } catch (action) {
    return action === "cancel"
  }
}

const onClose = async () => {
  if (!hasDirty.value || props.justSee) {
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

    saveLoading.value = true
    try {
      for (const tab of [
        DeviceInitSettingTabs.check,
        DeviceInitSettingTabs.patrol,
        DeviceInitSettingTabs.maintain,
        DeviceInitSettingTabs.file
      ]) {
        const success = await saveTab(tab)
        if (!success) return
      }
    } finally {
      saveLoading.value = false
    }
    emit("close")
  } catch (action) {
    if (action === "cancel") {
      emit("close")
    }
  }
}

const handleBeforeUnload = (event: BeforeUnloadEvent) => {
  if (!hasDirty.value || props.justSee) return
  event.preventDefault()
  event.returnValue = ""
}

onMounted(() => {
  window.addEventListener("beforeunload", handleBeforeUnload)
})

onUnmounted(() => {
  window.removeEventListener("beforeunload", handleBeforeUnload)
})
</script>

<style lang="scss" scoped>
.layout-child-page-content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.device-init-tabs {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;

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

.device-init-footer {
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
  overflow: hidden;

  .el-tab-pane {
    height: 100%;
    overflow: hidden;
  }
}
</style>
