<template>
  <el-dialog
    v-model="visible"
    title="升级BOM"
    width="500px"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px">
      <el-form-item label="原版本">
        <el-input :model-value="originalVersion" disabled />
      </el-form-item>

      <el-form-item label="新版本" prop="version">
        <el-input v-model="formData.version" placeholder="请输入新版本号" />
      </el-form-item>

      <el-form-item label="生效时间" prop="effectiveTime">
        <el-date-picker
          v-model="formData.effectiveTime"
          type="datetime"
          placeholder="请选择生效时间"
          style="width: 100%"
          value-format="YYYY-MM-DD HH:mm:ss"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ElMessage, type FormInstance, type FormRules } from "element-plus"
import { computed, reactive, ref, watch } from "vue"

import { upgradeBom } from "@/api/bom"

import type { IBomItem, IBomUpgradeData } from "../types"

const props = defineProps<{
  modelValue: boolean
  data: IBomItem | null
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
  (e: "success"): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val)
})

const originalVersion = computed(() => props.data?.version || "")

const formRef = ref<FormInstance>()
const submitLoading = ref(false)

const formData = reactive<IBomUpgradeData>({
  originalId: "",
  version: "",
  effectiveTime: ""
})

const formRules: FormRules = {
  version: [
    { required: true, message: "请输入新版本号", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        if (value === originalVersion.value) {
          callback(new Error("新版本号不能与原版本号相同"))
        } else {
          callback()
        }
      },
      trigger: "blur"
    }
  ],
  effectiveTime: [{ required: true, message: "请选择生效时间", trigger: "change" }]
}

// 监听弹窗打开
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      initForm()
    }
  }
)

// 初始化表单
const initForm = () => {
  formData.originalId = props.data?.id || ""
  formData.version = ""
  formData.effectiveTime = ""
}

// 提交
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitLoading.value = true

    try {
      await upgradeBom(formData)
      ElMessage.success("升级成功")
      visible.value = false
      emit("success")
    } catch (error: any) {
      ElMessage.error(error?.message || "升级失败")
    } finally {
      submitLoading.value = false
    }
  })
}
</script>

<style scoped lang="scss"></style>
