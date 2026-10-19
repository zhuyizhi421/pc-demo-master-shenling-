<template>
  <CustomDialog v-model="visible" :title="dialogTitle" :loading="loading">
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="110px">
      <el-form-item label="配置编号" prop="configCode">
        <el-input
          v-model.trim="formData.configCode"
          :disabled="props.isEdit || props.justSee"
          placeholder="请输入配置编号"
          clearable
        />
      </el-form-item>
      <el-form-item label="配置名称" prop="configName">
        <el-input
          v-model.trim="formData.configName"
          :disabled="props.justSee"
          placeholder="请输入配置名称"
          clearable
        />
      </el-form-item>
      <el-form-item label="备注" prop="remarks">
        <el-input
          v-model.trim="formData.remarks"
          :disabled="props.justSee"
          type="textarea"
          :rows="4"
          maxlength="200"
          show-word-limit
          placeholder="请输入备注"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button v-if="!props.justSee" type="primary" @click="onSubmit">确定</el-button>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from "element-plus"
import { ElMessage } from "element-plus"

import {
  queryEquipmentRepairBaseConfigDetail,
  requestCreateEquipmentRepairBaseConfig,
  requestUpdateEquipmentRepairBaseConfig
} from "@/api/operation/equipment/equipment-repair-base-config"
import CustomDialog from "@/components/CustomDialog/index.vue"
import type { TEquipmentRepairBaseConfigType } from "@/types/maintain/equipment-manage/equipment-repair-base-config"

interface IFormData {
  configCode: string
  configName: string
  remarks: string
}

const tabLabelMap: Record<TEquipmentRepairBaseConfigType, string> = {
  faultCategory: "故障类型",
  faultLevel: "故障等级",
  faultReason: "故障原因"
}

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    configType: TEquipmentRepairBaseConfigType
    id?: string
    isEdit?: boolean
    justSee?: boolean
  }>(),
  {
    id: "",
    isEdit: false,
    justSee: false
  }
)

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
  (e: "success"): void
}>()

const loading = ref(false)
const formRef = ref<FormInstance>()
const formData = ref<IFormData>(createDefaultForm())

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit("update:modelValue", value)
})

const dialogTitle = computed(() => {
  const label = tabLabelMap[props.configType]
  if (props.justSee) return `查看${label}`
  return props.isEdit ? `编辑${label}` : `新增${label}`
})

const formRules = reactive<FormRules<IFormData>>({
  configCode: [{ required: true, message: "请输入配置编号", trigger: "blur" }],
  configName: [{ required: true, message: "请输入配置名称", trigger: "blur" }]
})

function createDefaultForm(): IFormData {
  return {
    configCode: "",
    configName: "",
    remarks: ""
  }
}

function resetForm() {
  formRef.value?.resetFields()
  formData.value = createDefaultForm()
}

async function loadDetail() {
  if (!props.id) {
    resetForm()
    return
  }
  loading.value = true
  try {
    const data = await queryEquipmentRepairBaseConfigDetail(String(props.id))
    formData.value = {
      configCode: String(data?.configCode || ""),
      configName: String(data?.configName || ""),
      remarks: String(data?.remarks || "")
    }
  } finally {
    loading.value = false
  }
}

async function onSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  const payload = {
    configType: props.configType,
    configCode: String(formData.value.configCode || "").trim(),
    configName: String(formData.value.configName || "").trim(),
    remarks: String(formData.value.remarks || "").trim()
  }

  if (props.isEdit) {
    await requestUpdateEquipmentRepairBaseConfig({
      id: String(props.id || ""),
      ...payload
    })
    ElMessage.success("编辑成功")
  } else {
    await requestCreateEquipmentRepairBaseConfig(payload)
    ElMessage.success("新增成功")
  }

  visible.value = false
  emit("success")
}

watch(
  () => props.modelValue,
  async (value) => {
    if (!value) {
      resetForm()
      return
    }

    if (props.isEdit || props.justSee) {
      await loadDetail()
      return
    }

    resetForm()
  }
)
</script>
