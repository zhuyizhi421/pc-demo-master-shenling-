<template>
  <div class="exceptOrderDetail">
    <CustomDrawer
      v-model="visible"
      @close="emits('update:modelValue', false)"
      :title="`${type === EnumEquipmentExceptionSourceType.SpotCheck ? '点检' : type === EnumEquipmentExceptionSourceType.Patrol ? '巡检' : '保养'}异常工单详情`"
    >
      <CustomTitle title="基础信息" />
      <CustomDescription :data="data" :configs="descriptionConfig" :columns="2" :label-width="100">
        <template #taskStatus-content>
          {{ exceptionTaskStatusToNameMap[data?.taskStatus] ?? "-" }}
        </template>
        <template #sourceType-content>
          {{ EnumEquipmentExceptionSourceTypeMap[data.sourceType] ?? "-" }}
        </template>
        <template #sourceTaskNo-content>
          {{ data?.sourceTaskNo ?? data?.sourceNo ?? "-" }}
        </template>
        <template #equipmentName-content>
          <el-button v-if="data?.equipmentName" link type="primary" @click="deviceInfoShow = true">
            {{ data?.equipmentName }}
          </el-button>
          <span v-else>--</span>
        </template>
        <template #name-content>
          {{ data?.reportUsers?.map((item: any) => item?.name || "").join(",") || "-" }}
        </template>
        <template #empNo-content>
          {{ data?.reportUsers?.map((item: any) => item?.empNo || "").join(",") || "-" }}
        </template>
      </CustomDescription>
      <CustomTitle title="异常项" />
      <CustomDescription
        :data="expectData"
        :configs="expectDataDescriptionConfig"
        :columns="2"
        :label-width="100"
        class="mt-[16px]"
      >
        <template #inspectionName-content>
          {{ expectData?.inspectionName || expectData?.maintenanceName || "-" }}
        </template>
        <template #inspectionNo-content>
          {{ expectData?.inspectionNo || expectData?.maintenanceNo || "-" }}
        </template>
        <template #inspectionResult-content>
          {{
            ["NG", "OK", "未出结果"][expectData?.maintenanceResult] ||
            ["NG", "OK", "未出结果"][expectData?.inspectionResult] ||
            "-"
          }}
        </template>
        <template #inspectionMethod-content>
          {{ expectData?.inspectionMethod || expectData?.maintenanceMethod }}
        </template>
        <template #standardType-content>
          {{
            (expectData.maintenanceStandard?.standardType ??
              expectData.inspectionStandard?.standardType) === 1
              ? "数值"
              : "文本"
          }}
        </template>
        <template #inspectionStandard-content>
          {{ getStandardString(expectData.inspectionStandard || expectData.maintenanceStandard) }}
        </template>
        <template #ngDepartments-content>
          {{ expectData?.ngDepartments?.map((item: any) => item?.depName).join(",") || "-" }}
        </template>
        <template #files-content>
          <template v-if="expectData?.files?.length">
            <el-image
              v-for="item in expectData?.files"
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
      </CustomDescription>

      <CustomTitle title="处理反馈" />
      <CustomDescription
        v-if="data?.taskStatus && data.taskStatus === 1"
        :data="data"
        :configs="dataDescriptionConfig"
        :columns="2"
        :label-width="100"
        class="mt-[16px]"
      >
        <template #name-content>
          {{ data?.handleUsers?.map((item: any) => item?.name || "").join(",") || "-" }}
        </template>
        <template #empNo-content>
          {{ data?.handleUsers?.map((item: any) => item?.empNo || "").join(",") || "-" }}
        </template>
        <template #faultName-content>
          {{ data?.faults?.map((item: any) => item?.faultName || "").join(",") || "-" }}
        </template>
        <template #solution-content>
          {{ ["", "无碍", "需保养", "需维修"][data?.solution] || "-" }}
        </template>
        <template #equipmentRepairNo-content>
          <el-button
            @click="showRepairDetail = true"
            v-if="data?.equipmentRepairNo"
            link
            type="primary"
          >
            {{ data?.equipmentRepairNo }}
          </el-button>
          <span v-else>--</span>
        </template>
        <template #equipmentMaintenanceNo-content>
          <el-button
            @click="showOrderDetail = true"
            v-if="data?.equipmentMaintenanceNo"
            link
            type="primary"
          >
            {{ data?.equipmentMaintenanceNo || "--" }}
          </el-button>
          <span v-else>--</span>
        </template>
      </CustomDescription>

      <template #footer>
        <el-button @click="emits('update:modelValue', false)">取 消</el-button>
        <el-button
          v-if="data.taskStatus !== ExceptionTaskStatus.Finished && isAuth"
          type="primary"
          @click="putBackShow = true"
          >提交反馈</el-button
        >
      </template>
    </CustomDrawer>

    <!-- 设备详情弹窗 -->
    <DeviceInfo v-model="deviceInfoShow" :id="data?.equipmentId" />

    <!-- 提交反馈弹窗 -->
    <FeedbackDialog v-model="putBackShow" :type="type" :data="data" @success="putFeedbackOk" />

    <!-- 维修单详情弹窗 -->
    <DeviceRepairDetailDialog
      v-model="showRepairDetail"
      :showRegisterIfNeed="false"
      :id="data?.equipmentRepairId"
    />

    <!-- 任务单详情弹窗 -->
    <TaskOrderDetail
      v-model="showOrderDetail"
      :id="data?.equipmentMaintenanceId"
      :type="EnumEquipmentExceptionSourceType.Maintain"
    />
  </div>
</template>

<script setup lang="ts">
import { queryEquipmentMaintenanceItemDetail } from "@/api/operation/equipment/equipment-maintenance-item"
import { queryEquipmentPatrolItemDetail } from "@/api/operation/equipment/equipment-patrol-item"
import { queryEquipmentSpotItemDetail } from "@/api/operation/equipment/equipment-spot-item"
import { ExceptionTaskStatus, exceptionTaskStatusToNameMap } from "@/api/operation/equipment/types"
import CustomDescription from "@/components/CustomDescription/index.vue"
import type { ICustomDescriptionConfig } from "@/components/CustomDescription/type"
import CustomDrawer from "@/components/CustomDrawer/index.vue"
import CustomTitle from "@/components/CustomTitle/index.vue"
import {
  EnumEquipmentExceptionSourceType,
  EnumEquipmentExceptionSourceTypeMap
} from "@/constant/enums"
import { type AuthTypeCode, useButtonAuthRef } from "@/hooks/useButtonAuth"
import { getStandardString } from "@/utils"
import { formatImgUrlPreview } from "@/utils/common"
import DeviceRepairDetailDialog from "@/views/maintOperate/deviceRepair/components/DeviceRepairDetailDialog.vue"
import { formatDateTime } from "@/views/maintOperate/status"

import TaskOrderDetail from "../components/taskOrderDetail.vue"
import DeviceInfo from "./DeviceInfo.vue"
import FeedbackDialog from "./FeedbackDialog.vue"
defineOptions({
  name: "ExceptOrderDetail"
})

const props = defineProps<{
  modelValue: boolean
  type: EnumEquipmentExceptionSourceType
  data: any
}>()

const updateAuthCode = ref<AuthTypeCode>("SpotCheckExpect_update")
const queryAuthCode = ref<AuthTypeCode>("SpotCheckExpect_query")

const isAuth = useButtonAuthRef(updateAuthCode, queryAuthCode)

const typeToFnMap = {
  [EnumEquipmentExceptionSourceType.SpotCheck]: queryEquipmentSpotItemDetail,
  [EnumEquipmentExceptionSourceType.Patrol]: queryEquipmentPatrolItemDetail,
  [EnumEquipmentExceptionSourceType.Maintain]: queryEquipmentMaintenanceItemDetail
}
const showRepairDetail = ref(false)
const showOrderDetail = ref(false)
const deviceInfoShow = ref(false)
const expectData = ref<any>({})

const isMaintain = computed(() => props.type === EnumEquipmentExceptionSourceType.Maintain)

const emits = defineEmits<{
  (e: "update:modelValue", show: boolean): void
  (e: "onOk"): void
}>()

const putBackShow = ref(false)
const visible = ref<boolean>(false)
const descriptionConfig = computed<ICustomDescriptionConfig[]>(() => [
  {
    label: "异常单号：",
    field: "taskNo"
  },
  {
    label: "状态：",
    field: "taskStatus",
    slots: {
      content: "taskStatus-content"
    }
  },
  {
    label: "生成时间：",
    field: "createTime",
    formatter: ({ createTime }) => formatDateTime(createTime)
  },
  {
    label: "来源：",
    field: "sourceType",
    slots: {
      content: "sourceType-content"
    }
  },
  {
    label: "来源单号：",
    field: "sourceTaskNo",
    slots: {
      content: "sourceTaskNo-content"
    }
  },
  {
    label: "设备名称：",
    field: "equipmentName",
    slots: {
      content: "equipmentName-content"
    }
  },
  {
    label: "报修人名称：",
    field: "name",
    slots: {
      content: "name-content"
    }
  },
  {
    label: "报修人编号：",
    field: "empNo",
    slots: {
      content: "empNo-content"
    }
  }
])
const expectDataDescriptionConfig = computed<ICustomDescriptionConfig[]>(() => [
  {
    get label() {
      return isMaintain.value ? "保养项名称：" : "检验项名称："
    },
    field: "inspectionName",
    slots: {
      content: "inspectionName-content"
    }
  },
  {
    get label() {
      return isMaintain.value ? "保养项编号：" : "检验项编号："
    },
    field: "inspectionNo",
    slots: {
      content: "inspectionNo-content"
    }
  },
  {
    get label() {
      return isMaintain.value ? "保养项结果：" : "检验项结果："
    },
    field: "inspectionResult",
    slots: {
      content: "inspectionResult-content"
    }
  },
  {
    label: "方法要求：",
    field: "inspectionMethod",
    slots: {
      content: "inspectionMethod-content"
    }
  },
  {
    label: "检验标准类型：",
    field: "standardType",
    slots: {
      content: "standardType-content"
    }
  },
  {
    label: "检验标准：",
    field: "inspectionStandard",
    slots: {
      content: "inspectionStandard-content"
    }
  },
  {
    label: "实测值：",
    field: "practicalValue"
  },
  {
    label: "NG处理部门：",
    field: "ngDepartments",
    slots: {
      content: "ngDepartments-content"
    }
  },
  {
    label: "图片说明：",
    field: "files",
    slots: {
      content: "files-content"
    }
  }
])
const dataDescriptionConfig = computed<ICustomDescriptionConfig[]>(() => [
  {
    label: "处理人姓名：",
    field: "name",
    slots: {
      content: "name-content"
    }
  },
  {
    label: "处理人工号：",
    field: "empNo",
    slots: {
      content: "empNo-content"
    }
  },
  {
    label: "故障：",
    field: "faultName",
    slots: {
      content: "faultName-content"
    }
  },
  {
    label: "分析备注：",
    field: "analysis"
  },
  {
    label: "解决措施：",
    field: "solution",
    slots: {
      content: "solution-content"
    }
  },
  {
    label: "办结时间：",
    field: "completeTime",
    formatter: ({ completeTime }) => formatDateTime(completeTime)
  },
  {
    label: "设备维修单：",
    field: "equipmentRepairNo",
    slots: {
      content: "equipmentRepairNo-content"
    }
  },
  {
    label: "设备保养单：",
    field: "equipmentMaintenanceNo",
    slots: {
      content: "equipmentMaintenanceNo-content"
    },
    get hidden() {
      return props.type === EnumEquipmentExceptionSourceType.Maintain
    }
  }
])
watch(
  () => props.modelValue,
  async (val) => {
    visible.value = val
    if (val) {
      if (props.data?.sourceId && typeToFnMap[props.type]) {
        let res = await typeToFnMap[props.type](props.data?.sourceId)
        expectData.value = res
      }
    }
  }
)

watch(
  () => props.type,
  (newType) => {
    if (newType === EnumEquipmentExceptionSourceType.SpotCheck) {
      updateAuthCode.value = "SpotCheckExpect_update"
      queryAuthCode.value = "SpotCheckExpect_query"
    } else if (newType === EnumEquipmentExceptionSourceType.Patrol) {
      updateAuthCode.value = "PollCheckExpect_update"
      queryAuthCode.value = "PollCheckExpect_query"
    } else if (newType === EnumEquipmentExceptionSourceType.Maintain) {
      updateAuthCode.value = "ExceptionalOrder_update"
      queryAuthCode.value = "ExceptionalOrder_query"
    }
  },
  {
    immediate: true
  }
)

const putFeedbackOk = () => {
  emits("onOk")
  emits("update:modelValue", false)
}
</script>

<style scoped lang="scss"></style>
