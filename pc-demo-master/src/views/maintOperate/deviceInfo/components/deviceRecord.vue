<template>
  <div class="device-resume">
    <CustomDrawer v-model="visible" title="设备履历" size="medium">
      <el-tabs v-model="activeName" type="card">
        <el-tab-pane :label="EnumDeviceRecordTabs.check" :name="EnumDeviceRecordTabs.check" />
        <el-tab-pane :label="EnumDeviceRecordTabs.patrol" :name="EnumDeviceRecordTabs.patrol" />
        <el-tab-pane :label="EnumDeviceRecordTabs.maintain" :name="EnumDeviceRecordTabs.maintain" />
        <el-tab-pane :label="EnumDeviceRecordTabs.repair" :name="EnumDeviceRecordTabs.repair" />
        <el-tab-pane :label="EnumDeviceRecordTabs.reject" :name="EnumDeviceRecordTabs.reject" />
      </el-tabs>

      <div class="drawer-table-container">
        <template v-if="isSpotTask">
          <SpotRecord :device-id="deviceId" @onReviewClick="onReviewClick"></SpotRecord>
        </template>

        <template v-if="isPatrolTask">
          <PatrolRecord :device-id="deviceId" @onReviewClick="onReviewClick"></PatrolRecord>
        </template>

        <template v-if="isMaintainTask">
          <MaintainRecord :device-id="deviceId" @onReviewClick="onReviewClick"></MaintainRecord>
        </template>

        <template v-if="isRepairTask">
          <RepairRecord
            :device-id="deviceId"
            @onReviewRepairDetailClick="onReviewRepairDetailClick"
          ></RepairRecord>
        </template>

        <template v-if="isScarp">
          <ScrapRecord :device-id="deviceId"></ScrapRecord>
        </template>
      </div>
    </CustomDrawer>

    <!-- 任务单详情 -->
    <TaskOrderDetail
      v-if="isSpotTask || isMaintainTask || isPatrolTask"
      v-model="currentRow.show"
      :data="currentRow.data"
      :type="curType"
      :id="currentRow?.data?.id ?? ''"
    />

    <!-- 维修单详情 -->
    <DeviceRepairDetailDialog
      v-if="isRepairTask && repairDetailDrawerData?.id"
      v-model="repairDetailDrawer"
      :detailDrawerData="repairDetailDrawerData"
      :id="repairDetailDrawerData?.id"
      :show-register-if-need="false"
    />
  </div>
</template>

<script setup lang="ts">
import CustomDrawer from "@/components/CustomDrawer/index.vue"
import type { IEquipmentMaintenanceTaskPageItem } from "@/types/maintain/equipment-manage/equipment-maintenance-task"
import type { IEquipmentPatrolTaskPageItem } from "@/types/maintain/equipment-manage/equipment-patrol-task"
import type { IEquipmentRepairPageItem } from "@/types/maintain/equipment-manage/equipment-repair"
import type { IEquipmentSpotTaskPageItem } from "@/types/maintain/equipment-manage/equipment-spot-task"

import TaskOrderDetail from "../../components/taskOrderDetail.vue"
import DeviceRepairDetailDialog from "../../deviceRepair/components/DeviceRepairDetailDialog.vue"
import MaintainRecord from "./records/maintainRecord.vue"
import PatrolRecord from "./records/patrolRecord.vue"
import RepairRecord from "./records/repairRecord.vue"
import ScrapRecord from "./records/scrapRecord.vue"
import SpotRecord from "./records/spotRecord.vue"
// 列表展示和任务单里面是共用的，后续要抽成组件
enum EnumDeviceRecordTabs {
  check = "点检记录",
  patrol = "巡检记录",
  maintain = "保养记录",
  repair = "维修记录",
  reject = "报废记录"
}

type ICommonTableRow =
  | IEquipmentSpotTaskPageItem
  | IEquipmentMaintenanceTaskPageItem
  | IEquipmentPatrolTaskPageItem

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    deviceId: string
  }>(),
  {}
)

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val)
})

const activeName = ref<EnumDeviceRecordTabs>(EnumDeviceRecordTabs.check)

const currentRow = ref<{
  show: boolean
  data: ICommonTableRow
}>({
  show: false,
  data: {} as ICommonTableRow
})

const repairDetailDrawer = ref(false)
const repairDetailDrawerData = ref<IEquipmentRepairPageItem>()

const isSpotTask = computed(() => activeName.value === EnumDeviceRecordTabs.check)
const isPatrolTask = computed(() => activeName.value === EnumDeviceRecordTabs.patrol)
const isMaintainTask = computed(() => activeName.value === EnumDeviceRecordTabs.maintain)
const isRepairTask = computed(() => activeName.value === EnumDeviceRecordTabs.repair)
const isScarp = computed(() => activeName.value === EnumDeviceRecordTabs.reject)
const curType = computed(() => {
  return isSpotTask.value ? 1 : isPatrolTask.value ? 2 : isMaintainTask.value ? 3 : 1
})

/** 查看操作 */
const onReviewClick = (data: ICommonTableRow) => {
  currentRow.value = {
    show: true,
    data
  }
}

/** 查看维修详情 */
const onReviewRepairDetailClick = (row: IEquipmentRepairPageItem) => {
  repairDetailDrawer.value = true
  repairDetailDrawerData.value = row
}
</script>

<style scoped lang="scss">
.device-resume {
  &:deep(.custom-drawer-content) {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  &:deep(.drawer-table-container) {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .custom-table {
      flex: 1;
      overflow: hidden;
    }
  }
}
</style>
