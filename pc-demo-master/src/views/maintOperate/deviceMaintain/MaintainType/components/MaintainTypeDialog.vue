<template>
  <CustomDialog v-model="visible" :title="dialogTitle" :loading="loading">
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px">
      <el-form-item label="保养类型编号" prop="maintenanceTypeCode">
        <el-input
          v-model.trim="formData.maintenanceTypeCode"
          :disabled="props.isEdit || props.justSee"
          placeholder="请输入保养类型编号"
          clearable
        />
      </el-form-item>
      <el-form-item label="保养类型名称" prop="maintenanceTypeName">
        <el-input
          v-model.trim="formData.maintenanceTypeName"
          :disabled="props.justSee"
          placeholder="请输入保养类型名称"
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
  queryEquipmentMaintenanceTypeDetail,
  requestCreateEquipmentMaintenanceType,
  requestUpdateEquipmentMaintenanceType
} from "@/api/operation/equipment/equipment-maintenance-type"
import CustomDialog from "@/components/CustomDialog/index.vue"

interface IFormData {
  maintenanceTypeCode: string
  maintenanceTypeName: string
  remarks: string
}

const props = withDefaults(
  defineProps<{
    modelValue: boolean
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
  if (props.justSee) return "查看保养类型"
  return props.isEdit ? "编辑保养类型" : "新增保养类型"
})

const formRules = reactive<FormRules<IFormData>>({
  maintenanceTypeCode: [{ required: true, message: "请输入保养类型编号", trigger: "blur" }],
  maintenanceTypeName: [{ required: true, message: "请输入保养类型名称", trigger: "blur" }]
})

function createDefaultForm(): IFormData {
  return {
    maintenanceTypeCode: "",
    maintenanceTypeName: "",
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
    const data = await queryEquipmentMaintenanceTypeDetail(String(props.id))
    formData.value = {
      maintenanceTypeCode: String(data?.maintenanceTypeCode || ""),
      maintenanceTypeName: String(data?.maintenanceTypeName || ""),
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
    maintenanceTypeCode: String(formData.value.maintenanceTypeCode || "").trim(),
    maintenanceTypeName: String(formData.value.maintenanceTypeName || "").trim(),
    remarks: String(formData.value.remarks || "").trim()
  }

  if (props.isEdit) {
    await requestUpdateEquipmentMaintenanceType({
      id: String(props.id || ""),
      ...payload
    })
    ElMessage.success("编辑成功")
  } else {
    await requestCreateEquipmentMaintenanceType(payload)
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
