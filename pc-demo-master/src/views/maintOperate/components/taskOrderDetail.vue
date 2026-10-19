<template>
  <div class="taskOrderDetail">
    <CustomDrawer v-model="visible" @close="emits('update:modelValue', false)" title="任务单详情">
      <CustomDescription :data="data" :configs="descriptionConfig">
        <template #taskStatus-content>
          {{ EnumEquipmentSpotTaskTypeMap[data?.taskStatus] ?? "-" }}
        </template>
        <template #sourceType-content>
          {{ ["", "点检", "巡检", "计划", "手动"][data?.sourceType] ?? "--" }}
        </template>
        <template #button-content>
          <el-button link type="primary" @click="deviceInfoShow = true">
            {{ data?.equipmentName }}
          </el-button>
        </template>
        <template #departments-content>
          {{
            data?.departments
              ?.map((item: any) => item?.depName || item?.name || item || "")
              .join(",") || "-"
          }}
        </template>
        <template #schedulingRotations-content>
          {{
            data?.schedulingRotations
              ?.map((item: any) => item?.rotationName || item?.name || "")
              .join(",") || "-"
          }}
        </template>
        <template #inspectionResult-content>
          {{ ["NG", "OK", "未出结果"][data?.inspectionResult] ?? "待定" }}
        </template>
        <template #inspectionStart-content>
          {{ formatDateTime(data?.inspectionStart ?? data?.maintenanceStart) }}
        </template>
        <template #inspectionComplete-content>
          {{ formatDateTime(data?.inspectionComplete ?? data?.maintenanceComplete) }}
        </template>
        <template #timeCost-content>
          {{ timeConsuming() }}
        </template>
        <template #maintenanceResult-content>
          {{ ["NG", "OK", "未出结果"][data?.maintenanceResult] ?? "-" }}
        </template>
      </CustomDescription>
      <CustomTitle :title="computedTitle"></CustomTitle>
      <CustomTable ref="customTableRef" v-model:table-data="tableData" :config="tableConfig">
        <template #inspectionName-default="{ row }">
          {{ row?.inspectionName || row?.maintenanceName }}
        </template>
        <template #inspectionNo-default="{ row }">
          {{ row?.inspectionNo || row?.maintenanceNo }}
        </template>
        <template #inspectionResult-default="{ row }">
          {{
            ["NG", "OK", "未出结果"][row?.maintenanceResult] ||
            ["NG", "OK", "未出结果"][row?.inspectionResult] ||
            "-"
          }}
        </template>
        <template #inspectionMethod-default="{ row }">
          {{ row?.inspectionMethod || row?.maintenanceMethod || "-" }}
        </template>
        <template #standardType-default="{ row }">
          {{
            (row.maintenanceStandard?.standardType ?? row.inspectionStandard?.standardType) === 1
              ? "数值"
              : "文本"
          }}
        </template>
        <template #inspectionStandard-default="{ row }">
          {{ formatStandard(row.inspectionStandard || row.maintenanceStandard) }}
        </template>
        <template #inspectionTime-default="{ row }">
          {{ formatDateTime(row?.inspectionTime || row?.maintenanceTime) }}
        </template>
        <template #name-default="{ row }">
          {{
            row[isMaintainCheck ? "maintenanceUsers" : "inspectionUsers"]
              ?.map((item: any) => item?.name || item)
              .join(",") || "-"
          }}
        </template>
        <template #empNo-default="{ row }">
          {{
            row[isMaintainCheck ? "maintenanceUsers" : "inspectionUsers"]
              ?.map((item: any) => item?.empNo || item)
              .join(",") || "-"
          }}
        </template>
        <template #ngDepartments-default="{ row }">
          {{ row?.ngDepartments?.map((item: any) => item?.depName).join(",") || "-" }}
        </template>
        <template #files-default="{ row }">
          <template v-if="row?.files?.length">
            <el-image
              v-for="item in row?.files || []"
              :key="item.id"
              :src="formatImgUrlPreview(item.path)"
              :preview-teleported="true"
              :zoom-rate="1"
              :max-scale="7"
              :min-scale="0.2"
              :preview-src-list="[formatImgUrlPreview(item.path)]"
              class="w-[50px] h-[50px]"
              fit="contain"
            />
          </template>
        </template>
        <template #exceptionTaskId-default="{ row }">
          <el-button
            v-if="row?.exceptionTaskId"
            link
            type="primary"
            @click="onReviewExceptDetailClick(row.exceptionTaskId)"
          >
            {{ row?.exceptionTaskNo ?? row?.exceptionTaskId }}
          </el-button>
          <span v-else>-</span>
        </template>
      </CustomTable>
      <DeviceInfo v-model="deviceInfoShow" :id="data?.equipmentId" />
      <ExceptOrderDetail v-model="exceptShow" :data="exceptData" :type="type" />
    </CustomDrawer>
  </div>
</template>

<script setup lang="ts">
import { queryEquipmentExceptionOrderDetail } from "@/api/operation/equipment/equipment-exception-order"
import { queryEquipmentMaintenanceTaskDetail } from "@/api/operation/equipment/equipment-maintenance-task"
import { queryEquipmentPatrolTaskDetail } from "@/api/operation/equipment/equipment-patrol-task"
import { queryEquipmentSpotTaskDetail } from "@/api/operation/equipment/equipment-spot-task"
import CustomDescription from "@/components/CustomDescription/index.vue"
import type { ICustomDescriptionConfig } from "@/components/CustomDescription/type"
import CustomDrawer from "@/components/CustomDrawer/index.vue"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import { EnumEquipmentExceptionSourceType, EnumEquipmentSpotTaskTypeMap } from "@/constant/enums"
import { formatImgUrlPreview } from "@/utils/common"
import { formatDate, formatDateTime } from "@/views/maintOperate/status"

import DeviceInfo from "./DeviceInfo.vue"
import ExceptOrderDetail from "./exceptOrderDetail.vue"

defineOptions({
  name: "TaskOrderDetail"
})

const props = defineProps<{
  modelValue: boolean
  type: EnumEquipmentExceptionSourceType
  id?: string
}>()

const emits = defineEmits<{
  (e: "update:modelValue", show: boolean): void
  (e: "onOk"): void
}>()

const visible = ref<boolean>(false)
const fnMap = {
  [EnumEquipmentExceptionSourceType.SpotCheck]: queryEquipmentSpotTaskDetail,
  [EnumEquipmentExceptionSourceType.Patrol]: queryEquipmentPatrolTaskDetail,
  [EnumEquipmentExceptionSourceType.Maintain]: queryEquipmentMaintenanceTaskDetail
}

const data = ref<any>({
  equipmentId: ""
})
const isSpotCheck = computed(() => props.type === EnumEquipmentExceptionSourceType.SpotCheck)
const isPatrol = computed(() => props.type === EnumEquipmentExceptionSourceType.Patrol)
const isMaintainCheck = computed(() => props.type === EnumEquipmentExceptionSourceType.Maintain)

const deviceInfoShow = ref(false)
const exceptShow = ref(false)
const exceptData = ref({})
const computedTitle = computed(() => {
  return isSpotCheck.value ? "点检项列表" : isPatrol.value ? "巡检项列表" : "保养项列表"
})
const descriptionConfig = computed<ICustomDescriptionConfig[]>(() => [
  {
    label: "任务单号：",
    field: "taskNo"
  },
  {
    label: "任务状态：",
    field: "taskStatus",
    slots: {
      content: "taskStatus-content"
    }
  },
  {
    label: "创建时间：",
    field: "createTime",
    formatter: ({ createTime }) => formatDateTime(createTime)
  },
  {
    label: "来源：",
    field: "sourceType",
    slots: {
      content: "sourceType-content"
    },
    get hidden() {
      return !isMaintainCheck.value
    }
  },
  {
    label: "所属月计划：",
    field: "planName",
    get hidden() {
      return !isMaintainCheck.value
    }
  },
  {
    label: "排班日期：",
    field: "planDate",
    formatter: ({ planDate }) => formatDate(planDate),
    get hidden() {
      return !isMaintainCheck.value
    }
  },
  {
    label: "设备名称：",
    field: "button",
    slots: {
      content: "button-content"
    }
  },
  {
    label: "保养执行部门：",
    field: "departments",
    get hidden() {
      return !isMaintainCheck.value
    },
    slots: {
      content: "departments-content"
    }
  },
  {
    label: "保养班次：",
    field: "schedulingRotations",
    get hidden() {
      return !isMaintainCheck.value
    },
    slots: {
      content: "schedulingRotations-content"
    }
  },
  {
    label: "检验结果：",
    field: "inspectionResult",
    get hidden() {
      return isMaintainCheck.value
    },
    slots: {
      content: "inspectionResult-content"
    }
  },
  {
    label: "班次名称：",
    field: "rotationName",
    get hidden() {
      return !isSpotCheck.value
    }
  },
  {
    label: "班次编号：",
    field: "rotationCode",
    get hidden() {
      return !isSpotCheck.value
    }
  },
  {
    get label() {
      return `${isMaintainCheck.value ? "保养" : "检验"}开始时间：`
    },
    field: "inspectionStart",
    slots: {
      content: "inspectionStart-content"
    }
  },
  {
    get label() {
      return `${isMaintainCheck.value ? "保养" : "检验"}结束时间：`
    },
    field: "inspectionComplete",
    slots: {
      content: "inspectionComplete-content"
    }
  },
  {
    get label() {
      return `${isMaintainCheck.value ? "保养" : "检验"}耗时：`
    },
    field: "timeCost",
    slots: {
      content: "timeCost-content"
    }
  },
  {
    label: "执行人：",
    field: "executorName",
    get hidden() {
      return !isSpotCheck.value
    }
  },
  {
    label: "保养结果：",
    field: "maintenanceResult",
    slots: {
      content: "maintenanceResult-content"
    },
    get hidden() {
      return !isMaintainCheck.value
    }
  },
  {
    label: "备注：",
    field: "remarks"
  }
])

const tableData = computed(() => {
  if (data.value?.itemList?.length) {
    return data.value.itemList ?? []
  }
  if (data.value?.items?.length) {
    return data.value.items ?? []
  }
  return []
})
const tableConfig = ref<ITableConfig>({
  columns: [
    {
      prop: "inspectionName",
      get label() {
        return `${isMaintainCheck.value ? "保养" : "检验"}项名称`
      },
      width: 160,
      slots: {
        default: "inspectionName-default"
      }
    },
    {
      prop: "inspectionNo",
      label: "检验项编号",
      width: 160,
      slots: {
        default: "inspectionNo-default"
      }
    },
    {
      prop: "inspectionResult",
      label: "检验项结果",
      width: 120,
      slots: {
        default: "inspectionResult-default"
      }
    },
    {
      prop: "inspectionMethod",
      label: "方法要求",
      width: 160,
      slots: {
        default: "inspectionMethod-default"
      }
    },
    {
      prop: "standardType",
      label: "检验标准类型",
      width: 120,
      slots: {
        default: "standardType-default"
      }
    },
    {
      prop: "inspectionStandard",
      label: "检验标准",
      width: 160,
      slots: {
        default: "inspectionStandard-default"
      }
    },
    {
      prop: "practicalValue",
      label: "实测值",
      width: 160
    },
    {
      prop: "inspectionTime",
      label: "提交时间",
      width: 160,
      slots: {
        default: "inspectionTime-default"
      }
    },
    {
      prop: "name",
      label: "提交人姓名",
      width: 160,
      slots: {
        default: "name-default"
      },
      get hidden() {
        return isSpotCheck.value
      }
    },
    {
      prop: "empNo",
      label: "提交人工号",
      width: 160,
      slots: {
        default: "empNo-default"
      },
      get hidden() {
        return isSpotCheck.value
      }
    },
    {
      prop: "ngDepartments",
      label: "NG处理部门",
      width: 160,
      slots: {
        default: "ngDepartments-default"
      }
    },
    {
      prop: "files",
      label: "图片说明",
      width: 350,
      slots: {
        default: "files-default"
      }
    },
    {
      prop: "exceptionTaskId",
      label: "异常工单",
      width: 160,
      slots: {
        default: "exceptionTaskId-default"
      },
      fixed: "right"
    }
  ]
})

watch(
  () => props.modelValue,
  async (show) => {
    visible.value = show
    if (show) {
      const res = await fnMap[props.type](props.id || "")
      data.value = res
    } else {
      data.value = {
        equipmentId: ""
      }
    }
  }
)

/** 格式化检验标准 */
const formatStandard = (inspectionStandard: any) => {
  if (inspectionStandard?.standardType) {
    const {
      standardType,
      standardDesc,
      standardMaxInclusive,
      standardMax,
      standardMinInclusive,
      standardMin
    } = inspectionStandard
    if (standardType === 2) {
      return standardDesc
    } else if (standardType === 1) {
      let str = ""
      if (!["undefined", "object"].includes(typeof standardMin) && standardMin !== "") {
        str += ` ${standardMin} ${standardMinInclusive ? "<=" : "<"} `
      }
      str += "n"
      if (!["undefined", "object"].includes(typeof standardMax) && standardMax !== "") {
        str += ` ${standardMaxInclusive ? "<=" : "<"} ${standardMax}`
      }
      return str
    }
  }
  return ""
}

/** 计算耗时 */
const timeConsuming = () => {
  const start = data.value?.inspectionStart || data.value?.maintenanceStart
  const end = data.value?.inspectionComplete || data.value?.maintenanceComplete
  if (start && end) {
    try {
      return dayjs(end).diff(dayjs(start), "minute") + "分钟"
    } catch (error) {
      return "-"
    }
  }
  return "-"
}

/** 查看异常工单详情 */
const onReviewExceptDetailClick = async (id: string) => {
  const res = await queryEquipmentExceptionOrderDetail(id)
  exceptData.value = res
  exceptShow.value = true
}
</script>

<style scoped lang="scss">
.taskOrderDetail {
  &:deep(.el-drawer__body) {
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .el-table {
      flex: 1;
    }
  }
}
</style>
