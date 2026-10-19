<template>
  <div class="layout-child-page-container">
    <div class="layout-child-page-content">
      <div>
        <el-button plain icon="ArrowLeft" @click="emit('close')">返回</el-button>
      </div>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="登记单" :name="enumTabs.RegisterOrder" />
        <el-tab-pane label="状态记录" :name="enumTabs.StatusRecord" />
        <el-tab-pane v-if="show" label="校验记录" :name="enumTabs.Verify" />
        <el-tab-pane v-if="show" label="保养记录" :name="enumTabs.Maintenance" />
        <el-tab-pane v-if="show" label="维修记录" :name="enumTabs.Repair" />
        <el-tab-pane v-if="show" label="报废记录" :name="enumTabs.Scrap" />
      </el-tabs>

      <RegisterOrder
        v-if="mroInfo.mroId && activeTab === enumTabs.RegisterOrder"
        :mro-model-id="mroInfo.mroModelId"
        :mro-register-no="mroInfo.mroRegisterNo"
        @review="emit('review', $event)"
      />
      <MroStatusRecord v-if="activeTab === enumTabs.StatusRecord" :mro-id="mroInfo.mroId" />
      <VerifyRecord v-if="activeTab === enumTabs.Verify" :mro-id="mroInfo.mroId" />
      <MaintenanceRecord v-if="activeTab === enumTabs.Maintenance" :mro-id="mroInfo.mroId" />
      <RepairRecord v-if="activeTab === enumTabs.Repair" :mro-id="mroInfo.mroId" />
      <ScrapRecord v-if="activeTab === enumTabs.Scrap" :mro-id="mroInfo.mroId" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { queryMroInfoDetail } from "@/api/operation/mro/mro-info"

import MaintenanceRecord from "./tabs/MaintenanceRecord.vue"
import MroStatusRecord from "./tabs/MroStatusRecord.vue"
import RegisterOrder from "./tabs/RegisterOrder.vue"
import RepairRecord from "./tabs/RepairRecord.vue"
import ScrapRecord from "./tabs/ScrapRecord.vue"
import VerifyRecord from "./tabs/VerifyRecord.vue"

defineOptions({
  name: "MroInfoResume"
})

enum enumTabs {
  RegisterOrder,
  StatusRecord,
  Verify,
  Maintenance,
  Repair,
  Scrap
}

const props = withDefaults(
  defineProps<{
    mroId: string
  }>(),
  {}
)
const emit = defineEmits<{
  (e: "close"): void
  (e: "review", data: { mroModelName: string; registerId: string }): void
}>()

const show = ref(false)
const activeTab = ref(enumTabs.RegisterOrder)
const mroInfo = reactive({
  mroId: "",
  mroModelId: "",
  mroRegisterNo: ""
})

onMounted(() => {
  void getMroInfoDetail()
})

const getMroInfoDetail = async () => {
  const res = await queryMroInfoDetail({ id: props.mroId })
  show.value = res.mroModelVo.identityManage === 1
  mroInfo.mroId = res.id
  mroInfo.mroModelId = res.mroModelId
  mroInfo.mroRegisterNo = res.registerRecordNo
}
</script>

<style lang="scss" scoped>
.layout-child-page-content {
  flex: 1;
  overflow: hidden;
}
</style>
