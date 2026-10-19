<template>
  <div class="layout-child-page-container">
    <div class="layout-child-page-content">
      <div>
        <el-button plain icon="ArrowLeft" @click="emit('close')">返回</el-button>
      </div>

      <CustomTitle title="设备台账详情" showShortBar />
      <CustomDescription :data="detailData" :configs="ledgerConfig" :label-width="140">
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

      <CustomTitle title="设备基本信息" showShortBar />
      <CustomDescription :data="mainData" :configs="mainDataConfig" :label-width="140" />
    </div>
  </div>

  <div class="layout-footer">
    <el-button @click="emit('close')">返回</el-button>
  </div>
</template>

<script setup lang="ts">
import { queryEquipmentDetail } from "@/api/operation/equipment/equipment-info"
import CustomDescription from "@/components/CustomDescription/index.vue"
import type { ICustomDescriptionConfig } from "@/components/CustomDescription/type"
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
} from "../status"

defineOptions({
  name: "DeviceLedgerDetail"
})

const props = defineProps<{
  id: string
}>()

const emit = defineEmits<{
  (e: "close"): void
}>()

const detailData = ref<IEquipmentPageItem>({} as IEquipmentPageItem)
const mainData = computed(() => getDeviceMainData(detailData.value))
const runningAlerts = computed(() => getDeviceRunningAlerts(detailData.value))

const ledgerConfig = computed<ICustomDescriptionConfig[]>(() => [
  {
    field: "equipmentNo",
    label: "设备编号：",
    formatter: ({ data }) => data.equipmentNo || "-"
  },
  {
    field: "equipmentName",
    label: "设备名称：",
    formatter: ({ data }) => data.equipmentName || data.equipmentModel?.modelName || "-"
  },
  {
    field: "barCode",
    label: "标签码：",
    formatter: ({ data }) => data.barCode || "-"
  },
  {
    field: "manufacturerNo",
    label: "原厂编号：",
    formatter: ({ data }) => data.manufacturerNo || "-"
  },
  {
    field: "ledgerStatus",
    label: "台账状态：",
    formatter: ({ data }) => formatDeviceLedgerStatus(data)
  },
  {
    field: "runningStatus",
    label: "运转状态：",
    formatter: ({ data }) => formatDeviceRunningStatus(data)
  },
  {
    field: "runningAlerts",
    label: "运转提醒：",
    slots: {
      content: "runningAlerts-content"
    }
  },
  {
    field: "repairTaskStatus",
    label: "维修状态：",
    formatter: ({ data }) => formatDeviceRepairTaskStatus(data)
  },
  {
    field: "scrapTaskStatus",
    label: "报废状态：",
    formatter: ({ data }) => formatDeviceScrapTaskStatus(data)
  },
  {
    field: "spotStatus",
    label: "点检状态：",
    formatter: ({ data }) => formatSpotTaskStatus(data.spotStatus)
  },
  {
    field: "patrolStatus",
    label: "巡检状态：",
    formatter: ({ data }) => formatPatrolTaskStatus(data.patrolStatus)
  },
  {
    field: "maintenanceStatus",
    label: "保养状态：",
    formatter: ({ data }) => formatMaintenanceTaskStatus(data.maintenanceStatus)
  },
  {
    field: "fmEntityNames",
    label: "绑定工位：",
    formatter: ({ data }) => formatBindingWorkstation(data.fmEntityNames)
  },
  {
    field: "startPatrolDate",
    label: "参与巡检日期：",
    formatter: ({ data }) => formatDate(data.startPatrolDate)
  },
  {
    field: "remarks",
    label: "备注：",
    formatter: ({ data }) => data.remarks || "-"
  },
  {
    field: "createTime",
    label: "创建时间：",
    formatter: ({ data }) => formatDateTime(data.createTime)
  }
])

const mainDataConfig = computed<ICustomDescriptionConfig[]>(() => [
  {
    field: "modelNo",
    label: "类型编号：",
    formatter: ({ data }) => data.modelNo || "-"
  },
  {
    field: "modelName",
    label: "类型名称：",
    formatter: ({ data }) => data.modelName || "-"
  },
  {
    field: "equipmentCategoryName",
    label: "设备分类：",
    formatter: ({ data }) => data.equipmentCategoryName || "-"
  },
  {
    field: "exceptionHandlePositionList",
    label: "异常处理职位：",
    formatter: ({ data }) =>
      formatDepartmentPositionList(
        Array.isArray(data.exceptionHandlePositionList) ? data.exceptionHandlePositionList : []
      )
  },
  {
    field: "patrolExecutePositionName",
    label: "巡检执行职位：",
    formatter: ({ data }) =>
      formatDepartmentPosition(data.patrolExecuteDepartmentName, data.patrolExecutePositionName)
  },
  {
    field: "maintenanceExecutePositionName",
    label: "保养执行职位：",
    formatter: ({ data }) =>
      formatDepartmentPosition(
        data.maintenanceExecuteDepartmentName,
        data.maintenanceExecutePositionName
      )
  },
  {
    field: "repairDepartments",
    label: "指定维修职位：",
    formatter: ({ data }) =>
      formatDepartmentPositionList(Array.isArray(data.repairDepartments) ? data.repairDepartments : [])
  },
  {
    field: "repairProcdefName",
    label: "设备维修流程：",
    formatter: ({ data }) => data.repairProcdefName || "-"
  },
  {
    field: "scrapProcdefName",
    label: "设备报废流程：",
    formatter: ({ data }) => data.scrapProcdefName || "-"
  }
])

const getDetail = async () => {
  const res = await queryEquipmentDetail(props.id)
  detailData.value = res || ({} as IEquipmentPageItem)
}

onMounted(() => {
  void getDetail()
})
</script>

<style scoped lang="scss">
.status-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
