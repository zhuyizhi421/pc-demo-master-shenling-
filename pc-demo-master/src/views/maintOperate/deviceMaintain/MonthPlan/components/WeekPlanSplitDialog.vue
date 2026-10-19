<template>
  <CustomDialog v-model="visible" title="拆分周计划" size="medium">
    <div v-loading="loading" class="split-dialog">
      <el-form label-width="120px">
        <el-form-item label="来源月计划单号">
          <el-input :model-value="monthPlan.planNo || '--'" disabled />
        </el-form-item>
        <el-form-item label="来源月计划名称">
          <el-input :model-value="monthPlan.planName || '--'" disabled />
        </el-form-item>
        <el-form-item label="计划月份">
          <el-input :model-value="monthPlan.planMonth || '--'" disabled />
        </el-form-item>
        <el-form-item label="所属区域">
          <el-input :model-value="monthPlan.areaName || '--'" disabled />
        </el-form-item>
      </el-form>

      <CustomTitle title="拆分预览" />
      <el-empty v-if="!previewList.length" description="当前没有可拆分的周计划" />
      <CustomTable v-else v-model:table-data="previewList" :config="tableConfig">
        <template #processStatus-default="{ row }">
          <el-tag :type="getProcessStatusTagType(row.processStatus)">
            {{ row.processStatusLabel || "--" }}
          </el-tag>
        </template>

        <template #submitAction-default="{ row }">
          <el-radio-group v-if="row.canSelectAction" v-model="row.submitAction" size="small">
            <el-radio-button label="generate">生成</el-radio-button>
            <el-radio-button label="skip">跳过</el-radio-button>
          </el-radio-group>
          <span v-else class="readonly-action-text">
            {{ row.processStatus === "skipped" ? "已跳过" : "已生成" }}
          </span>
        </template>
      </CustomTable>
    </div>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="onSubmit">确认拆分</el-button>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import {
  previewEquipmentMaintenanceWeekPlanSplit,
  requestSplitEquipmentMaintenanceWeekPlan
} from "@/api/operation/equipment/equipment-maintenance-week-plan"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import type { IEquipmentMaintenanceMonthPlanPageItem } from "@/types/maintain/equipment-manage/equipment-maintenance-month-plan"
import type {
  IEquipmentMaintenanceWeekPlanSplitActionItem,
  IEquipmentMaintenanceWeekPlanSplitPreviewItem,
  IEquipmentMaintenanceWeekPlanSplitPreviewParams
} from "@/types/maintain/equipment-manage/equipment-maintenance-week-plan"

defineOptions({
  name: "WeekPlanSplitDialog"
})

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    monthPlan?: Partial<IEquipmentMaintenanceMonthPlanPageItem>
  }>(),
  {
    monthPlan: () => ({})
  }
)

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
  (e: "success"): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value)
})

const loading = ref(false)
const submitting = ref(false)
const previewList = ref<IEquipmentMaintenanceWeekPlanSplitPreviewItem[]>([])
const hasPendingRows = computed(() => previewList.value.some((item) => item.canSelectAction))

const tableConfig = ref<ITableConfig>({
  height: 320,
  columns: [
    {
      prop: "naturalWeekLabel",
      label: "自然周标识",
      minWidth: 140
    },
    {
      prop: "planStartDate",
      label: "计划开始日期",
      width: 120,
      align: "center"
    },
    {
      prop: "planEndDate",
      label: "计划结束日期",
      width: 120,
      align: "center"
    },
    {
      prop: "equipmentCount",
      label: "设备数量",
      width: 100,
      align: "right"
    },
    {
      prop: "processStatus",
      label: "处理状态",
      width: 110,
      align: "center",
      slots: {
        default: "processStatus-default"
      }
    },
    {
      prop: "actionType",
      label: "处理方式",
      width: 120,
      align: "center"
    },
    {
      prop: "submitAction",
      label: "本次操作",
      minWidth: 180,
      align: "center",
      slots: {
        default: "submitAction-default"
      }
    },
    {
      prop: "planName",
      label: "周计划名称",
      minWidth: 240
    }
  ]
})

watch(
  () => visible.value,
  async (value) => {
    if (!value) {
      previewList.value = []
      return
    }
    await onOpen()
  }
)

async function loadPreview(params: IEquipmentMaintenanceWeekPlanSplitPreviewParams) {
  loading.value = true
  try {
    previewList.value = await previewEquipmentMaintenanceWeekPlanSplit(params)
  } finally {
    loading.value = false
  }
}

async function onOpen() {
  if (!props.monthPlan?.id) {
    previewList.value = []
    return
  }
  await loadPreview({
    monthPlanId: String(props.monthPlan.id || "")
  })
}

async function onSubmit() {
  if (!props.monthPlan?.id) {
    ElMessage.warning("缺少来源月计划")
    return
  }
  if (!previewList.value.length) {
    ElMessage.warning("当前没有可拆分的周计划")
    return
  }
  if (!hasPendingRows.value) {
    ElMessage.warning("当前没有可处理的周计划")
    return
  }

  const weekActions: IEquipmentMaintenanceWeekPlanSplitActionItem[] = previewList.value
    .filter((item) => item.canSelectAction)
    .map((item) => ({
      planStartDate: item.planStartDate,
      planEndDate: item.planEndDate,
      action: item.submitAction === "skip" ? "skip" : "generate"
    }))

  submitting.value = true
  try {
    await requestSplitEquipmentMaintenanceWeekPlan({
      monthPlanId: String(props.monthPlan.id || ""),
      weekActions
    })
    ElMessage.success("拆分成功")
    visible.value = false
    emit("success")
  } finally {
    submitting.value = false
  }
}

function getProcessStatusTagType(status: string) {
  if (status === "generated") return "success"
  if (status === "skipped") return "info"
  return "warning"
}
</script>

<style scoped lang="scss">
.split-dialog {
  :deep(.custom-table-container) {
    padding: 0;
  }
}

.readonly-action-text {
  color: var(--el-text-color-secondary);
}
</style>
