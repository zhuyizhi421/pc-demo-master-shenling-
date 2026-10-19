<template>
  <CustomDialog v-model="visible" :title="dialogTitle" size="large">
    <div v-loading="loading" class="year-plan-dialog">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="110px">
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="计划年度" prop="planYear">
              <el-date-picker
                v-model="formData.planYear"
                type="year"
                value-format="YYYY"
                format="YYYY"
                placeholder="请选择计划年度"
                :disabled="readonly"
                class="w-full"
                @change="onPlanYearChange"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="计划名称" prop="planName">
              <el-input
                v-model.trim="formData.planName"
                placeholder="请输入计划名称"
                :disabled="readonly"
                maxlength="100"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="保养设备总数">
              <el-input :model-value="String(formData.details.length)" disabled />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注">
          <el-input
            v-model.trim="formData.remarks"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
            :disabled="readonly"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <CustomTitle class="detail-title" title="设备保养明细">
        <div v-if="!readonly">
          <el-button type="primary" icon="Plus" @click="showDeviceDialog = true">选择设备</el-button>
        </div>
      </CustomTitle>

      <el-table :data="formData.details" border row-key="equipmentId" max-height="420">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="areaName" label="区域" min-width="180" show-overflow-tooltip />
        <el-table-column prop="equipmentNo" label="设备编号" min-width="150" />
        <el-table-column prop="equipmentName" label="设备名称" min-width="150" />
        <el-table-column prop="equipmentTypeNo" label="设备类型编号" min-width="140" />
        <el-table-column prop="equipmentTypeName" label="设备类型名称" min-width="140" />
        <el-table-column
          v-for="month in months"
          :key="month.field"
          :label="month.label"
          width="72"
          align="center"
        >
          <template #default="{ row }">
            <el-checkbox v-model="row[month.field]" :disabled="readonly" />
          </template>
        </el-table-column>
        <el-table-column v-if="!readonly" label="操作" width="90" fixed="right" align="center">
          <template #default="{ $index }">
            <el-button link type="danger" @click="onRemoveDetail($index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="table-hint">每台设备至少勾选一个月份。</div>
    </div>

    <template #footer>
      <el-button v-if="canSplitDetail" type="primary" plain @click="onSplitClick">手动拆分</el-button>
      <el-button @click="visible = false">{{ readonly ? "关闭" : "取消" }}</el-button>
      <el-button v-if="!readonly" type="primary" :loading="saving" @click="onSubmit">保存</el-button>
    </template>

    <SelectDeviceDialog
      v-model="showDeviceDialog"
      :selected-row-keys="selectedDeviceIds"
      :multiple="true"
      enable
      @success="onSelectDeviceSuccess"
    />
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage, type FormInstance, type FormRules } from "element-plus"

import {
  queryEquipmentMaintenanceYearPlanDetail,
  requestCreateEquipmentMaintenanceYearPlan,
  requestUpdateEquipmentMaintenanceYearPlan
} from "@/api/operation/equipment/equipment-maintenance-year-plan"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomTitle from "@/components/CustomTitle/index.vue"
import SelectDeviceDialog from "@/components/SelectDeviceDialog/index.vue"
import { EnumEquipmentMaintenanceYearPlanStatusType } from "@/constant/enums"
import type { IEquipmentPageItem } from "@/types/maintain/equipment-manage/equipment-info"
import type {
  IEquipmentMaintenanceYearPlanDetailItem,
  IEquipmentMaintenanceYearPlanMonthField,
  IEquipmentMaintenanceYearPlanSaveParams
} from "@/types/maintain/equipment-manage/equipment-maintenance-year-plan"

type DialogMode = "create" | "edit" | "detail"

interface IFormData {
  id: string
  planNo: string
  planYear: string
  planName: string
  remarks: string
  status: number
  details: IEquipmentMaintenanceYearPlanDetailItem[]
}

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    mode?: DialogMode
    id?: string
  }>(),
  {
    mode: "create",
    id: ""
  }
)

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
  (e: "success"): void
  (e: "split", value: { id: string; planNo: string; planName: string; status: number }): void
}>()

const months: Array<{ label: string; field: IEquipmentMaintenanceYearPlanMonthField }> = [
  { label: "1月", field: "month1" },
  { label: "2月", field: "month2" },
  { label: "3月", field: "month3" },
  { label: "4月", field: "month4" },
  { label: "5月", field: "month5" },
  { label: "6月", field: "month6" },
  { label: "7月", field: "month7" },
  { label: "8月", field: "month8" },
  { label: "9月", field: "month9" },
  { label: "10月", field: "month10" },
  { label: "11月", field: "month11" },
  { label: "12月", field: "month12" }
]

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value)
})

const readonly = computed(() => props.mode === "detail")
const canSplitDetail = computed(
  () =>
    readonly.value &&
    Number(formData.value.status) === Number(EnumEquipmentMaintenanceYearPlanStatusType.Reviewed)
)
const dialogTitle = computed(() => {
  if (props.mode === "detail") return "年保养计划详情"
  if (props.mode === "edit") return "编辑年保养计划"
  return "新增年保养计划"
})

const formRef = ref<FormInstance>()
const loading = ref(false)
const saving = ref(false)
const showDeviceDialog = ref(false)
const autoNamedPlan = ref(true)
const formData = ref<IFormData>(createDefaultForm())

const formRules: FormRules<IFormData> = {
  planYear: [{ required: true, message: "请选择计划年度", trigger: "change" }],
  planName: [{ required: true, message: "请输入计划名称", trigger: "blur" }]
}

const selectedDeviceIds = computed(() => formData.value.details.map((item) => item.equipmentId))

watch(
  () => visible.value,
  async (value) => {
    if (!value) return
    if (props.mode === "create") {
      resetForm()
      return
    }
    await loadDetail()
  }
)

function createDefaultForm(): IFormData {
  const currentYear = new Date().getFullYear().toString()
  return {
    id: "",
    planNo: "",
    planYear: currentYear,
    planName: `${currentYear}年度设备保养计划`,
    remarks: "",
    status: EnumEquipmentMaintenanceYearPlanStatusType.Unreviewed,
    details: []
  }
}

function createEmptyMonths() {
  return {
    month1: false,
    month2: false,
    month3: false,
    month4: false,
    month5: false,
    month6: false,
    month7: false,
    month8: false,
    month9: false,
    month10: false,
    month11: false,
    month12: false
  }
}

function resolveAreaName(value?: string) {
  const text = String(value || "").trim()
  if (!text || text === "-") return "-"

  const segments = text.split(/\s*(?:\/|>|,|\uFF0C)\s*/).filter(Boolean)
  if (segments.length >= 1) {
    return segments[0]
  }
  return text
}

function resetForm() {
  autoNamedPlan.value = true
  formData.value = createDefaultForm()
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

async function loadDetail() {
  if (!props.id) {
    resetForm()
    return
  }
  loading.value = true
  try {
    const data = await queryEquipmentMaintenanceYearPlanDetail(props.id)
    formData.value = {
      id: String(data?.id || ""),
      planNo: data?.planNo || "",
      planYear: String(data?.planYear || ""),
      planName: data?.planName || "",
      remarks: data?.remarks || "",
      status: Number(data?.status ?? EnumEquipmentMaintenanceYearPlanStatusType.Unreviewed),
      details: Array.isArray(data?.details)
        ? data.details.map((item) => ({
            ...createEmptyMonths(),
            ...item
          }))
        : []
    }
    autoNamedPlan.value = false
  } finally {
    loading.value = false
  }
}

function onPlanYearChange(value: string) {
  if (!value) return
  if (autoNamedPlan.value || !formData.value.planName) {
    formData.value.planName = `${value}年度设备保养计划`
  }
}

watch(
  () => formData.value.planName,
  (value) => {
    const expectedName = `${formData.value.planYear || new Date().getFullYear()}年度设备保养计划`
    autoNamedPlan.value = !value || value === expectedName
  }
)

function mapDeviceToDetail(device: IEquipmentPageItem): IEquipmentMaintenanceYearPlanDetailItem {
  return {
    equipmentId: String(device.id || ""),
    areaName: resolveAreaName(device.fmEntityNames),
    equipmentNo: device.equipmentNo || "",
    equipmentName: device.equipmentName || "",
    equipmentTypeNo: device.equipmentModel?.modelNo || "",
    equipmentTypeName: device.equipmentModel?.modelName || "",
    ...createEmptyMonths()
  }
}

function onSelectDeviceSuccess(list: IEquipmentPageItem[]) {
  const existed = new Set(formData.value.details.map((item) => item.equipmentId))
  const appendList = list
    .filter((item) => !existed.has(String(item.id || "")))
    .map((item) => mapDeviceToDetail(item))

  const skippedCount = list.length - appendList.length
  formData.value.details.push(...appendList)

  if (appendList.length) {
    ElMessage.success(`已添加 ${appendList.length} 台设备`)
  }
  if (skippedCount > 0) {
    ElMessage.warning(`${skippedCount} 台设备已存在，已跳过`)
  }
}

function onRemoveDetail(index: number) {
  formData.value.details.splice(index, 1)
}

function validateDetails() {
  if (!formData.value.details.length) {
    ElMessage.warning("请先选择设备")
    return false
  }

  const duplicateSet = new Set<string>()
  for (const item of formData.value.details) {
    if (!item.equipmentNo) {
      ElMessage.warning("存在未识别设备编号的明细，请重新选择设备")
      return false
    }
    if (duplicateSet.has(item.equipmentNo)) {
      ElMessage.warning(`设备编号 ${item.equipmentNo} 重复，请检查明细`)
      return false
    }
    duplicateSet.add(item.equipmentNo)

    const hasAnyMonth = months.some((month) => Boolean(item[month.field]))
    if (!hasAnyMonth) {
      ElMessage.warning(`设备 ${item.equipmentName || item.equipmentNo} 至少勾选一个月份`)
      return false
    }
  }

  return true
}

function buildPayload(): IEquipmentMaintenanceYearPlanSaveParams {
  return {
    id: formData.value.id || undefined,
    planYear: formData.value.planYear,
    planName: formData.value.planName,
    remarks: formData.value.remarks,
    details: formData.value.details.map((item) => ({
      ...item
    }))
  }
}

function onSplitClick() {
  emit("split", {
    id: formData.value.id,
    planNo: formData.value.planNo,
    planName: formData.value.planName,
    status: formData.value.status
  })
}

async function onSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid || !validateDetails()) return

  saving.value = true
  try {
    const payload = buildPayload()
    if (props.mode === "edit") {
      await requestUpdateEquipmentMaintenanceYearPlan(payload)
      ElMessage.success("保存成功")
    } else {
      await requestCreateEquipmentMaintenanceYearPlan(payload)
      ElMessage.success("新增成功")
    }
    emit("success")
    visible.value = false
  } finally {
    saving.value = false
  }
}
</script>

<style scoped lang="scss">
.year-plan-dialog {
  .w-full {
    width: 100%;
  }

  .detail-title {
    margin: 12px 0;
  }

  .table-hint {
    margin-top: 8px;
    color: var(--el-text-color-secondary);
    font-size: 12px;
  }
}
</style>
