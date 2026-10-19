<template>
  <div class="layout-child-page-container">
    <div class="layout-child-page-content">
      <div>
        <el-button plain icon="ArrowLeft" @click="emit('close')">返回</el-button>
      </div>
      <CustomTitle title="任务单详情" showShortBar />
      <CustomDescription :data="mroVerifyTaskDetail || {}" :configs="mroVerifyTaskDetailConfigs">
        <template #inspection-status-content>
          <el-tag :type="TaskStatusTagTypeMap[detailStatus]">{{
            TaskStatusTextMap[detailStatus]
          }}</el-tag>
        </template>

        <template #mro-no-content>
          <el-button link type="primary" size="small" @click="mroInfoVisible = true"
            >{{ mroVerifyTaskDetail?.mroNo }}
          </el-button>
        </template>

        <template #mro-model-no-content>
          <el-button link type="primary" size="small" @click="mroModelInfoVisible = true"
            >{{ mroVerifyTaskDetail?.mroModelNo }}
          </el-button>
        </template>
      </CustomDescription>
    </div>

    <div class="custom-table-container item">
      <CustomTitle title="校验项" :show-short-bar="false" />
      <VerifyItemTab :mro-verify-task-id="mroTaskId" />
    </div>

    <div class="layout-footer">
      <el-button @click="emit('close')">取消</el-button>
    </div>

    <MroInfoDialog v-model="mroInfoVisible" :mro-id="mroVerifyTaskDetail?.mroInformationId || ''" />
    <MroModelInfoDialog
      v-model="mroModelInfoVisible"
      :mro-model-id="mroVerifyTaskDetail?.mroModelId || ''"
    />
  </div>
</template>

<script setup lang="ts">
import dayjs from "dayjs"

import { queryMroInspectionTaskDetail } from "@/api/operation/mro/mro-verify-task"
import CustomDescription from "@/components/CustomDescription/index.vue"
import type { ICustomDescriptionConfig } from "@/components/CustomDescription/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import { EnumMROInspectionTaskResult, EnumMROInspectionTaskResultMap } from "@/constant/enums"
import type { IMroInspectionTaskPageListItem } from "@/types/maintain/mro-manage/mro-verify-task"
import MroInfoDialog from "@/views/MROManage/MROInfo/components/MroInfoDialog.vue"
import MroModelInfoDialog from "@/views/MROManage/MROModelManage/components/MroModelInfoDialog.vue"

import VerifyItemTab from "./tabs/VerifyItemTab.vue"

defineOptions({
  name: "MroVerifyTaskDetail"
})

enum EnumTaskStatus {
  UNREVIEWED = 0,
  PENDING = 1,
  EXECUTING = 2,
  FINISHED = 3,
  VOIDED = 5
}

const TaskStatusTextMap: Record<EnumTaskStatus, string> = {
  [EnumTaskStatus.UNREVIEWED]: "未复核",
  [EnumTaskStatus.PENDING]: "未执行",
  [EnumTaskStatus.EXECUTING]: "执行中",
  [EnumTaskStatus.FINISHED]: "已完成",
  [EnumTaskStatus.VOIDED]: "已作废"
}

const TaskStatusTagTypeMap: Record<
  EnumTaskStatus,
  "danger" | "warning" | "primary" | "success" | "info"
> = {
  [EnumTaskStatus.UNREVIEWED]: "warning",
  [EnumTaskStatus.PENDING]: "danger",
  [EnumTaskStatus.EXECUTING]: "primary",
  [EnumTaskStatus.FINISHED]: "success",
  [EnumTaskStatus.VOIDED]: "info"
}

const props = withDefaults(
  defineProps<{
    mroTaskId: string
  }>(),
  {}
)
const emit = defineEmits<{
  (e: "close"): void
}>()

const mroInfoVisible = ref(false)
const mroModelInfoVisible = ref(false)
const mroVerifyTaskDetail = ref<IMroInspectionTaskPageListItem>()
const detailStatus = computed<EnumTaskStatus>(() => {
  const source = mroVerifyTaskDetail.value as unknown as Record<string, any>
  const taskStatus = Number(source?.taskStatus ?? source?.inspectionStatus ?? 0)
  if (taskStatus === 4) return EnumTaskStatus.UNREVIEWED
  if (taskStatus === 1) return EnumTaskStatus.PENDING
  if (taskStatus === 2) return EnumTaskStatus.EXECUTING
  if (taskStatus === 3) return EnumTaskStatus.FINISHED
  if (taskStatus === 5) return EnumTaskStatus.VOIDED
  return EnumTaskStatus.UNREVIEWED
})
const isReviewed = computed(() => detailStatus.value !== EnumTaskStatus.UNREVIEWED)
const isVoided = computed(() => detailStatus.value === EnumTaskStatus.VOIDED)

const resolveExecutePositionText = (data: Record<string, any>) => {
  const dep = String(data.executeDepartmentName || data.departments || "").trim()
  const pos = String(data.executePositionName || data.executePosition || "").trim()
  if (pos.includes("-")) return pos
  if (dep && pos) return `${dep}-${pos}`
  return pos || dep || "--"
}

const formatDisplayTime = (value?: string) => {
  const text = String(value || "").trim()
  if (!text) return "--"
  const parsed = dayjs(text)
  return parsed.isValid() ? parsed.format("YYYY/MM/DD HH:mm") : text
}

const mroVerifyTaskDetailConfigs = computed<ICustomDescriptionConfig[]>(() => {
  const configs: ICustomDescriptionConfig[] = [
    {
      field: "inspectionNo",
      label: "任务单号："
    },
    {
      field: "inspectionStatus",
      label: "任务状态：",
      slots: {
        content: "inspection-status-content"
      }
    },
    {
      field: "inspectionResult",
      label: "校验结果：",
      formatter: ({ data }: { data: Record<string, any> }) =>
        EnumMROInspectionTaskResultMap[
          Number(data?.inspectionResult ?? 2) as EnumMROInspectionTaskResult
        ] || "--"
    },
    {
      field: "mroNo",
      label: "MRO序列号：",
      slots: {
        content: "mro-no-content"
      }
    },
    {
      field: "mroModelNo",
      label: "MRO编号：",
      slots: {
        content: "mro-model-no-content"
      }
    },
    {
      field: "executePosition",
      label: "执行职位：",
      formatter: ({ data }: { data: Record<string, any> }) => resolveExecutePositionText(data || {})
    },
    {
      field: "planStartTime",
      label: "计划开始时间："
    },
    {
      field: "inspectionStart",
      label: "校验开始时间：",
      formatter: ({ data }: { data: Record<string, any> }) =>
        formatDisplayTime(data?.inspectionStart)
    },
    {
      field: "inspectionComplete",
      label: "校验结束时间：",
      formatter: ({ data }: { data: Record<string, any> }) =>
        formatDisplayTime(data?.inspectionComplete)
    },
    {
      field: "submitterName",
      label: "提交人："
    },
    {
      field: "inspectionTime",
      label: "校验耗时：",
      formatter: ({ data }: { data: Record<string, any> }) => {
        const inspectionComplete = data?.inspectionComplete
        const inspectionStart = data?.inspectionStart
        if (inspectionComplete && inspectionStart) {
          return dayjs(inspectionComplete).diff(inspectionStart, "minutes") + "分钟"
        }
        return "未结束"
      }
    },
    {
      field: "remarks",
      label: "备注："
    }
  ]

  if (isReviewed.value) {
    configs.push(
      {
        field: "checkByName",
        label: "复核人："
      },
      {
        field: "checkTime",
        label: "复核时间："
      }
    )
  }

  if (isVoided.value) {
    configs.push(
      {
        field: "voidByName",
        label: "作废人："
      },
      {
        field: "voidReason",
        label: "作废原因："
      },
      {
        field: "voidTime",
        label: "作废时间："
      }
    )
  }

  configs.push(
    {
      field: "createBy",
      label: "创建人：",
      formatter: ({ data }: { data: Record<string, any> }) =>
        data?.createByName || data?.createBy || "--"
    },
    {
      field: "createTime",
      label: "创建时间："
    },
    {
      field: "updateBy",
      label: "修改人：",
      formatter: ({ data }: { data: Record<string, any> }) =>
        data?.updateByName || data?.updateBy || "--"
    },
    {
      field: "updateTime",
      label: "修改时间："
    }
  )

  return configs
})

onMounted(() => {
  getMroVerifyTaskDetail(props.mroTaskId)
})

const getMroVerifyTaskDetail = async (id: string) => {
  mroVerifyTaskDetail.value = await queryMroInspectionTaskDetail(id)
}
</script>

<style lang="scss" scoped>
.item {
  padding-bottom: 0;

  &:deep(.custom-title) {
    margin-bottom: 0;
  }
}
</style>
