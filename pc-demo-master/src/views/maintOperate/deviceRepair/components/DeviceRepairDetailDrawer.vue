<template>
  <CustomDrawer v-model="visible" title="维修单详情">
    <CustomDescription :data="detailDrawerData || {}" :configs="detailConfigs">
      <template #status-content>
        <el-tag :type="repairStatusTagTypeMap[detailDrawerData?.repairStatus as RepairStatus]">
          {{ repairStatusToNameMap[detailDrawerData?.repairStatus as RepairStatus] }}
        </el-tag>
      </template>

      <template #equipment-content>
        <el-button @click="onReviewDeviceClick()" link type="primary">{{
          detailDrawerData?.equipmentName
        }}</el-button>
      </template>

      <template #equipment-scrap-content>
        <el-button
          v-if="detailDrawerData?.equipmentScrap?.processInstanceId"
          link
          type="primary"
          @click="
            useFlowDetail.setStatus(true, detailDrawerData?.equipmentScrap?.processInstanceId)
          "
          >{{ detailDrawerData?.equipmentScrap?.equipmentName }}</el-button
        >
      </template>

      <template #image-content>
        <el-image
          v-for="item in detailDrawerData?.equipmentScrap?.files"
          :key="item.id"
          :src="formatImgUrlPreview(item.path)"
          :preview-src-list="[formatImgUrlPreview(item.path)]"
          class="w-[50px] h-[50px]"
          fit="contain"
          preview-teleported
        />
      </template>
    </CustomDescription>

    <!-- 维修说明 -->
    <template
      v-if="showRegisterIfNeed && detailDrawerData?.repairStatus === RepairStatus.Wait && isAuth"
      #footer
    >
      <el-button type="primary" @click="repairRegisterVisible = true">维修登记</el-button>
    </template>

    <!-- 设备详情弹窗 -->
    <DeviceInfo v-model="deviceInfoShow" :id="deviceInfoId" />

    <!-- 维修登记弹窗 -->
    <RepairRegisterDialog
      v-model="repairRegisterVisible"
      :id="props.id"
      :deviceId="detailDrawerData?.equipmentId || ''"
      @success="onRegisterSuccess"
    />
  </CustomDrawer>
</template>

<script setup lang="ts">
import { queryEquipmentRepairDetail } from "@/api/operation/equipment/equipment-repair"
import {
  RepairStatus,
  repairStatusTagTypeMap,
  repairStatusToNameMap
} from "@/api/operation/equipment/types"
import CustomDescription from "@/components/CustomDescription/index.vue"
import type { ICustomDescriptionConfig } from "@/components/CustomDescription/type"
import CustomDrawer from "@/components/CustomDrawer/index.vue"
import {
  EnumEquipmentRepairSolution,
  EnumEquipmentRepairSolutionMap,
  EnumEquipmentRepairSourceType,
  EnumEquipmentRepairSourceTypeMap
} from "@/constant/enums"
import useButtonAuth from "@/hooks/useButtonAuth"
import useFlowDetailStore from "@/store/modules/flowDetail"
import type { IEquipmentRepairPageItem } from "@/types/maintain/equipment-manage/equipment-repair"
import { formatImgUrlPreview } from "@/utils/common"
import DeviceInfo from "@/views/maintOperate/components/DeviceInfo.vue"
import { formatDateTime } from "@/views/maintOperate/status"

import RepairRegisterDialog from "./RepairRegisterDialog.vue"

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    id: string
    showRegisterIfNeed?: boolean
  }>(),
  {
    showRegisterIfNeed: true
  }
)

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
  (e: "success"): void
}>()

const useFlowDetail = useFlowDetailStore()
const isAuth = useButtonAuth("DeviceRepair_update", "DeviceRepair_query")

const deviceInfoShow = ref(false)
const deviceInfoId = ref()
const detailDrawerData = ref<IEquipmentRepairPageItem | null>(null)
const repairRegisterVisible = ref(false)

const detailConfigs = computed<ICustomDescriptionConfig[]>(() => [
  {
    field: "repairNo",
    label: "单号："
  },
  {
    field: "repairStatus",
    label: "状态：",
    slots: {
      content: "status-content"
    }
  },
  {
    field: "equipmentName",
    label: "设备名称：",
    slots: {
      content: "equipment-content"
    }
  },
  {
    field: "solution",
    label: "维修结果：",
    formatter: () =>
      EnumEquipmentRepairSolutionMap[
        detailDrawerData.value?.solution as EnumEquipmentRepairSolution
      ]
  },
  {
    field: "createTime",
    formatter: () => formatDateTime(detailDrawerData.value?.createTime),
    label: "创建时间："
  },
  {
    field: "sourceType",
    label: "来源：",
    formatter: () =>
      EnumEquipmentRepairSourceTypeMap[
        detailDrawerData.value?.sourceType as EnumEquipmentRepairSourceType
      ] || "手动"
  },
  {
    field: "sourceTaskNo",
    label: "来源单号：",
    formatter: () => detailDrawerData.value?.sourceNo
  },
  {
    field: "reportUsers",
    label: "报修人名称：",
    formatter: () => detailDrawerData.value?.reportUsers?.map((item) => item.name).join(",")
  },
  {
    field: "reportUserNos",
    label: "报修人编号：",
    formatter: () => detailDrawerData.value?.reportUsers?.map((item) => item.empNo).join(",")
  },
  {
    field: "handleDepartment",
    label: "处理部门：",
    formatter: () => detailDrawerData.value?.handleDepartment?.depName
  },
  {
    field: "remarks",
    label: "维修说明："
  },
  {
    field: "handleUsers",
    label: "处理人姓名：",
    formatter: () => detailDrawerData.value?.handleUsers?.map((item) => item.name).join(",")
  },
  {
    field: "handleUserNos",
    label: "处理人工号：",
    formatter: () => detailDrawerData.value?.handleUsers?.map((item) => item.empNo).join(",")
  },
  {
    field: "faults",
    label: "故障：",
    colspan: -1,
    formatter: () => detailDrawerData.value?.faults?.map((item) => item.faultName).join(",")
  },
  {
    field: "analysis",
    label: "分析备注：",
    colspan: -1
  },
  {
    field: "completeTime",
    formatter: () => formatDateTime(detailDrawerData.value?.completeTime),
    label: "办结时间："
  },
  {
    field: "equipmentScrap",
    label: "报废申请：",
    slots: {
      content: "equipment-scrap-content"
    },
    hidden: detailDrawerData.value?.solution !== EnumEquipmentRepairSolution.Scrap
  },
  {
    field: "scrapReason",
    label: "报废原因：",
    hidden: detailDrawerData.value?.solution !== EnumEquipmentRepairSolution.Scrap,
    colspan: -1
  },
  {
    field: "imageList",
    label: "报废附件：",
    slots: {
      content: "image-content"
    },
    hidden: detailDrawerData.value?.solution !== EnumEquipmentRepairSolution.Scrap
  }
])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val)
})

watch(
  () => props.modelValue,
  async (val) => {
    if (val) {
      const res = await queryEquipmentRepairDetail(props.id)
      detailDrawerData.value = res
    } else {
      detailDrawerData.value = null
    }
  }
)

/** 查看设备信息 */
const onReviewDeviceClick = () => {
  deviceInfoShow.value = true
  deviceInfoId.value = detailDrawerData.value?.equipmentId
}

/** 维修登记成功回调 */
const onRegisterSuccess = async () => {
  const res = await queryEquipmentRepairDetail(props.id || "")
  detailDrawerData.value = res
  emit("success")
}
</script>

<style scoped lang="scss"></style>
