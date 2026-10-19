<template>
  <div class="layout-child-page-container">
    <div class="layout-child-page-content">
      <div>
        <el-button plain icon="ArrowLeft" @click="emit('close')">返回</el-button>
      </div>
      <el-tabs v-if="hasVisibleTabs" v-model="activeName">
        <el-tab-pane v-if="showVerify" label="校验配置" :name="enumTabs.Verify">
          <VerifyConfig :mro-id="mroId" />
        </el-tab-pane>
        <el-tab-pane v-if="showMaintenance" label="保养配置" :name="enumTabs.Maintenance">
          <MaintenanceConfig :mro-id="mroId" />
        </el-tab-pane>
        <el-tab-pane v-if="showFile" label="相关文件" :name="enumTabs.File">
          <FileConfig :mro-id="mroId" />
        </el-tab-pane>
      </el-tabs>
      <el-empty v-else description="暂无配置" />
    </div>

    <div class="layout-footer">
      <el-button @click="emit('close')">返回</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  // queryMroInfoConfigPageList, 
  queryMroInfoDetail } from "@/api/operation/mro/mro-info"

import FileConfig from "./tabs/FileConfig.vue"
import MaintenanceConfig from "./tabs/MaintenanceConfig.vue"
import VerifyConfig from "./tabs/VerifyConfig.vue"

defineOptions({
  name: "MroInfoConfigDialog"
})

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

enum enumTabs {
  Verify,
  Maintenance,
  File
}

const activeName = ref(enumTabs.Verify)
const showVerify = ref(false)
const showMaintenance = ref(false)
const showFile = ref(false)

const hasVisibleTabs = computed(
  () => showVerify.value || showMaintenance.value || showFile.value
)

// const getConfigTotal = async (mroItemType: number) => {
//   const { total, records } = await queryMroInfoConfigPageList({
//     pageQuery: {
//       pageNum: 1,
//       pageSize: 1
//     },
//     queryParam: {
//       mroId: props.mroId,
//       mroItemType
//     }
//   })
//   return Number(total || records?.length || 0)
// }

const getMroInfoDetail = async () => {
  if (!props.mroId) {
    showVerify.value = false
    showMaintenance.value = false
    showFile.value = false
    activeName.value = enumTabs.Verify
    return
  }

  const detail = await queryMroInfoDetail({ id: props.mroId })

  showVerify.value = detail?.mroModelVo?.checkManage === 1
  showMaintenance.value = detail?.mroModelVo?.maintenanceManage === 1
  // 相关文件页：始终按开关显示，这里默认打开
  showFile.value = true

  if (showVerify.value) {
    activeName.value = enumTabs.Verify
    return
  }
  if (showMaintenance.value) {
    activeName.value = enumTabs.Maintenance
    return
  }
  if (showFile.value) {
    activeName.value = enumTabs.File
    return
  }
  activeName.value = enumTabs.Verify
}

watch(
  () => props.mroId,
  () => {
    void getMroInfoDetail()
  },
  {
    immediate: true
  }
)
</script>

<style lang="scss" scoped>
.layout-child-page-content {
  flex: 1;
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
