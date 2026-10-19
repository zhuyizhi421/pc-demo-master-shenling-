<!-- 基础配置-系统设置-全局配置 -->
<template>
  <div class="global-config">
    <el-tabs v-model="tabValue" tab-position="left" type="border-card">
      <el-tab-pane v-for="tab in tabList" :key="tab.value" :label="tab.label" :name="tab.value">
        <div class="module-title">{{ tab.label }}</div>

        <QualityConfig
          v-if="
            tabValue === EnumTab.Quality &&
            tab.value === EnumTab.Quality &&
            inspectionReminderListLoadding
          "
          :inspection-reminder-list="inspectionReminderList"
          :tab-value="tabValue"
        />

        <LogisticsConfig
          v-if="
            tabValue === EnumTab.MaterialFlow &&
            tab.value === EnumTab.MaterialFlow &&
            inspectionReminderListLoadding
          "
          :inspection-reminder-list="inspectionReminderList"
          :tab-value="tabValue"
        />

        <ProductionConfig v-if="tabValue === EnumTab.Production && tab.value === EnumTab.Production" />

        <SystemStyleConfig
          v-if="tabValue === EnumTab.SystemStyle && tab.value === EnumTab.SystemStyle"
          :inspection-reminder-list="inspectionReminderList"
          :tab-value="tabValue"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { getAlarmModelList } from "@/api/alarm"
import type { IOption } from "@/types/base-info/global-config"

import LogisticsConfig from "./components/LogisticsConfig.vue"
import ProductionConfig from "./components/ProductionConfig.vue"
import QualityConfig from "./components/QualityConfig.vue"
import SystemStyleConfig from "./components/SystemStyleConfig.vue"

defineOptions({
  name: "GlobalConfig"
})

enum EnumTab {
  Quality = 1,
  Production = 2,
  MaterialFlow = 3,
  SystemStyle = 4
}

const inspectionReminderListLoadding = ref(false)

const tabValue = ref(EnumTab.Quality)
const tabList = ref([
  {
    label: "质量运营配置",
    value: EnumTab.Quality
  },
  {
    label: "生产运营配置",
    value: EnumTab.Production
  },
  {
    label: "物流运营配置",
    value: EnumTab.MaterialFlow
  },
  {
    label: "系统样式",
    value: EnumTab.SystemStyle
  }
])

const inspectionReminderList = ref<IOption[]>([]) // 来料检验提醒列表

onBeforeMount(() => {
  getInspectionReminderList()
})

/** 获取来料检测提醒 */
const getInspectionReminderList = async () => {
  try {
    const data = await getAlarmModelList({ isEnabled: true })
    inspectionReminderList.value = data.map((item) => ({
      label: item.modelName,
      value: item.id
    }))
  } finally {
    inspectionReminderListLoadding.value = true
  }
}
</script>

<style lang="scss" scoped>
.global-config {
  height: 100%;

  &:deep(.el-tabs) {
    height: 100%;

    .el-tabs__content,
    .el-tab-pane {
      height: 100%;
    }

    .el-tab-pane {
      display: flex;
      flex-direction: column;
      // overflow-y: auto;
    }

    .el-tabs__nav {
      width: 160px;
    }

    .el-tabs__item {
      height: 52px;
      font-size: 16px;
    }
  }

  &:deep(.el-form) {
    flex: 1 !important;
    overflow-y: auto;

    input[type="number"]::-webkit-inner-spin-button,
    input[type="number"]::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }

  &:deep(.el-upload-list) {
    .el-upload-list__item,
    .el-upload {
      width: 146px;
      height: 146px;
      margin-bottom: 30px;
    }
  }

  &:deep(.el-input),
  &:deep(.el-select) {
    width: 300px;
  }

  :deep(.el-checkbox__label) {
    color: #303133;
    font-weight: 400;
  }

  .module-title {
    font-size: 18px;
    margin-bottom: 30px;
  }

  .footer {
    display: flex;
    justify-content: flex-end;
    margin: 10px;
  }
}
</style>
