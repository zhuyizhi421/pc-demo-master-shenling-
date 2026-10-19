<template>
  <CustomDialog v-model="visible" title="拆分月计划" size="medium">
    <div v-loading="loading" class="split-dialog">
      <el-form label-width="120px">
        <el-form-item label="来源年计划单号">
          <el-input :model-value="yearPlan.planNo || '--'" disabled />
        </el-form-item>
        <el-form-item label="来源年计划名称">
          <el-input :model-value="yearPlan.planName || '--'" disabled />
        </el-form-item>
        <el-form-item label="计划月份" required>
          <el-date-picker
            v-model="planMonth"
            type="month"
            format="YYYY-MM"
            value-format="YYYY-MM"
            placeholder="请选择计划月份"
            class="w-full"
            @change="onPlanMonthChange"
          />
        </el-form-item>
      </el-form>

      <CustomTitle title="拆分预览" />
      <el-empty v-if="!previewList.length" description="请选择计划月份后预览拆分结果" />
      <CustomTable v-else v-model:table-data="previewList" :config="tableConfig" />
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
  previewEquipmentMaintenancePlanSplit,
  requestSplitEquipmentMaintenancePlan
} from "@/api/operation/equipment/equipment-maintenance-plan"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import type {
  IEquipmentMaintenanceMonthPlanSplitPreviewItem,
  IEquipmentMaintenanceMonthPlanSplitPreviewParams
} from "@/types/maintain/equipment-manage/equipment-maintenance-month-plan"
import type { IEquipmentMaintenanceYearPlanPageItem } from "@/types/maintain/equipment-manage/equipment-maintenance-year-plan"

defineOptions({
  name: "MonthPlanSplitDialog"
})

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    yearPlan?: Partial<IEquipmentMaintenanceYearPlanPageItem>
  }>(),
  {
    yearPlan: () => ({})
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
const planMonth = ref("")
const previewList = ref<IEquipmentMaintenanceMonthPlanSplitPreviewItem[]>([])

const tableConfig = ref<ITableConfig>({
  height: 320,
  columns: [
    {
      prop: "areaName",
      label: "所属区域",
      minWidth: 180
    },
    {
      prop: "equipmentCount",
      label: "设备数量",
      width: 120,
      align: "right"
    },
    {
      prop: "planName",
      label: "月计划名称",
      minWidth: 260
    }
  ]
})

watch(
  () => visible.value,
  (value) => {
    if (!value) {
      planMonth.value = ""
      previewList.value = []
    }
  }
)

async function loadPreview(params: IEquipmentMaintenanceMonthPlanSplitPreviewParams) {
  loading.value = true
  try {
    previewList.value = await previewEquipmentMaintenancePlanSplit(params)
  } finally {
    loading.value = false
  }
}

async function onPlanMonthChange() {
  if (!props.yearPlan?.id || !planMonth.value) {
    previewList.value = []
    return
  }
  await loadPreview({
    yearPlanId: String(props.yearPlan.id || ""),
    planMonth: planMonth.value
  })
}

async function onSubmit() {
  if (!props.yearPlan?.id) {
    ElMessage.warning("缺少来源年计划")
    return
  }
  if (!planMonth.value) {
    ElMessage.warning("请选择计划月份")
    return
  }
  if (!previewList.value.length) {
    ElMessage.warning("当前没有可拆分的月计划")
    return
  }

  submitting.value = true
  try {
    await requestSplitEquipmentMaintenancePlan({
      yearPlanId: String(props.yearPlan.id || ""),
      planMonth: planMonth.value
    })
    ElMessage.success("拆分成功")
    visible.value = false
    emit("success")
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="scss">
.split-dialog {
  .w-full {
    width: 100%;
  }
}
</style>
