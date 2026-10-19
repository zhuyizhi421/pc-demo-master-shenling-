<template>
  <CustomDialog v-model="show" @close="onClose()" title="设备台账详情" size="medium">
    <CustomTitle title="设备台账信息" showShortBar />
    <CustomDescription :data="info" :configs="ledgerConfig" :columns="2" :labelWidth="120">
      <template #runningAlerts-content>
        <div v-if="runningAlerts.length" class="status-tags">
          <el-tag
            v-for="item in runningAlerts"
            :key="item"
            type="warning"
            effect="plain"
            size="small"
          >
            {{ item }}
          </el-tag>
        </div>
        <span v-else>-</span>
      </template>
    </CustomDescription>

    <CustomTitle title="设备主数据基本信息" showShortBar />
    <CustomDescription :data="mainData" :configs="mainDataConfig" :columns="2" :labelWidth="140" />
  </CustomDialog>
</template>

<script setup lang="ts">
import { queryEquipmentDetail } from "@/api/operation/equipment/equipment-info"
import CustomDescription from "@/components/CustomDescription/index.vue"
import type { ICustomDescriptionConfig } from "@/components/CustomDescription/type"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomTitle from "@/components/CustomTitle/index.vue"
import type { IEquipmentPageItem } from "@/types/maintain/equipment-manage/equipment-info"
import { formatDate, formatDateTime } from "@/views/maintOperate/status"

import {
  formatBindingWorkstation,
  formatDepartmentPosition,
  formatDepartmentPositionList,
  formatDeviceLedgerStatus,
  formatDeviceRepairTaskStatus,
  formatDeviceRunningStatus,
  formatDeviceScrapTaskStatus,
  formatMaintenanceTaskStatus,
  formatPatrolTaskStatus,
  formatSpotTaskStatus,
  getDeviceMainData,
  getDeviceRunningAlerts
} from "../deviceInfo/status"

defineOptions({
  name: "DeviceInfo"
})

const props = defineProps<{
  modelValue: boolean
  id: string
}>()

const emits = defineEmits<{
  (e: "update:modelValue", value: boolean): void
}>()

const show = ref<boolean>(false)
const info = ref<IEquipmentPageItem>({} as IEquipmentPageItem)
const mainData = computed(() => getDeviceMainData(info.value))
const runningAlerts = computed(() => getDeviceRunningAlerts(info.value))

const ledgerConfig = computed<ICustomDescriptionConfig[]>(() => [
  {
    label: "设备编号：",
    field: "equipmentNo",
    formatter: ({ data }) => data.equipmentNo || "-"
  },
  {
    label: "设备名称：",
    field: "equipmentName",
    formatter: ({ data }) => data.equipmentName || data.equipmentModel?.modelName || "-"
  },
  {
    label: "标签码：",
    field: "barCode",
    formatter: ({ data }) => data.barCode || "-"
  },
  {
    label: "原厂编号：",
    field: "manufacturerNo",
    formatter: ({ data }) => data.manufacturerNo || "-"
  },
  {
    label: "台账状态：",
    field: "ledgerStatus",
    formatter: ({ data }) => formatDeviceLedgerStatus(data)
  },
  {
    label: "运转状态：",
    field: "runningStatus",
    formatter: ({ data }) => formatDeviceRunningStatus(data)
  },
  {
    label: "运转提醒：",
    field: "runningAlerts",
    slots: {
      content: "runningAlerts-content"
    }
  },
  {
    label: "维修状态：",
    field: "repairTaskStatus",
    formatter: ({ data }) => formatDeviceRepairTaskStatus(data)
  },
  {
    label: "报废状态：",
    field: "scrapTaskStatus",
    formatter: ({ data }) => formatDeviceScrapTaskStatus(data)
  },
  {
    label: "点检状态：",
    field: "spotStatus",
    formatter: ({ data }) => formatSpotTaskStatus(data.spotStatus)
  },
  {
    label: "巡检状态：",
    field: "patrolStatus",
    formatter: ({ data }) => formatPatrolTaskStatus(data.patrolStatus)
  },
  {
    label: "保养状态：",
    field: "maintenanceStatus",
    formatter: ({ data }) => formatMaintenanceTaskStatus(data.maintenanceStatus)
  },
  {
    label: "绑定工位：",
    field: "fmEntityNames",
    formatter: ({ data }) => formatBindingWorkstation(data.fmEntityNames)
  },
  {
    label: "参与巡检日期：",
    field: "startPatrolDate",
    formatter: ({ data }) => formatDate(data.startPatrolDate)
  },
  {
    label: "备注：",
    field: "remarks",
    formatter: ({ data }) => data.remarks || "-"
  },
  {
    label: "创建时间：",
    field: "createTime",
    formatter: ({ data }) => formatDateTime(data.createTime)
  }
])

const mainDataConfig = computed<ICustomDescriptionConfig[]>(() => [
  {
    label: "类型编号：",
    field: "modelNo",
    formatter: ({ data }) => data.modelNo || "-"
  },
  {
    label: "类型名称：",
    field: "modelName",
    formatter: ({ data }) => data.modelName || "-"
  },
  {
    label: "设备分类：",
    field: "equipmentCategoryName",
    formatter: ({ data }) => data.equipmentCategoryName || "-"
  },
  {
    label: "异常处理职位：",
    field: "exceptionHandlePositionList",
    formatter: ({ data }) =>
      formatDepartmentPositionList(
        Array.isArray(data.exceptionHandlePositionList) ? data.exceptionHandlePositionList : []
      )
  },
  {
    label: "巡检执行职位：",
    field: "patrolExecutePositionName",
    formatter: ({ data }) =>
      formatDepartmentPosition(data.patrolExecuteDepartmentName, data.patrolExecutePositionName)
  },
  {
    label: "保养执行职位：",
    field: "maintenanceExecutePositionName",
    formatter: ({ data }) =>
      formatDepartmentPosition(
        data.maintenanceExecuteDepartmentName,
        data.maintenanceExecutePositionName
      )
  },
  {
    label: "指定维修职位：",
    field: "repairDepartments",
    formatter: ({ data }) =>
      formatDepartmentPositionList(Array.isArray(data.repairDepartments) ? data.repairDepartments : [])
  },
  {
    label: "设备维修流程：",
    field: "repairProcdefName",
    formatter: ({ data }) => data.repairProcdefName || "-"
  },
  {
    label: "设备报废流程：",
    field: "scrapProcdefName",
    formatter: ({ data }) => data.scrapProcdefName || "-"
  }
])

watch(
  () => props.modelValue,
  async (val) => {
    show.value = val
    if (val) {
      const res = await queryEquipmentDetail(props.id)
      info.value = res
    }
  }
)

const onClose = () => {
  emits("update:modelValue", false)
  info.value = {} as IEquipmentPageItem
}
</script>

<style scoped lang="scss">
.status-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
