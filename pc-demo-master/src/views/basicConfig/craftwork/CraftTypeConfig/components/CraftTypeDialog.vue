<template>
  <CustomDialog v-model="visible" :title="dialogTitle" :loading="loading">
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="110px" class="dialog-form">
      <el-form-item label="工艺类型名称" prop="craftTypeName">
        <el-input
          v-model="formData.craftTypeName"
          class="w-full"
          maxlength="100"
          placeholder="请输入工艺类型名称"
          :disabled="isReadonly"
        />
      </el-form-item>
      <el-form-item label="工艺类型编号" prop="craftTypeNo">
        <el-input
          v-model="formData.craftTypeNo"
          class="w-full"
          maxlength="50"
          placeholder="不填则自动生成"
          :disabled="isCodeReadonly"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="4"
          maxlength="200"
          show-word-limit
          placeholder="请输入备注"
          :disabled="isReadonly"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button v-if="!isReadonly" type="primary" @click="submit">保存</el-button>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage, type FormInstance, type FormRules } from "element-plus"

import {
  queryCraftTypeDetail,
  requestCreateCraftType,
  requestUpdateCraftType
} from "@/api/craft"
import CustomDialog from "@/components/CustomDialog/index.vue"

defineOptions({
  name: "CraftTypeDialog"
})

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    mode: "create" | "edit" | "view"
    craftTypeId?: string
  }>(),
  {
    modelValue: false,
    mode: "create",
    craftTypeId: ""
  }
)

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
  (e: "success", payload: { id?: string; needLoadBindIronTag: number }): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit("update:modelValue", value)
})

const loading = ref(false)
const formRef = ref<FormInstance | null>(null)

const isReadonly = computed(() => props.mode === "view")
const isCodeReadonly = computed(() => props.mode !== "create")
const dialogTitle = computed(() => {
  if (props.mode === "create") return "新建工艺类型"
  if (props.mode === "edit") return "编辑工艺类型"
  return "查看工艺类型"
})

const formData = reactive({
  craftTypeNo: "",
  craftTypeName: "",
  remark: "",
  needLoadBindIronTag: 0
})

const createTrimmedRequiredValidator =
  (message: string) => (_rule: unknown, value: string, callback: (error?: Error) => void) => {
    if (!String(value || "").trim()) {
      callback(new Error(message))
      return
    }
    callback()
  }

const rules = reactive<FormRules<typeof formData>>({
  craftTypeName: [
    {
      required: true,
      validator: createTrimmedRequiredValidator("请输入工艺类型名称"),
      trigger: "blur"
    }
  ]
})

const resetState = () => {
  formData.craftTypeNo = ""
  formData.craftTypeName = ""
  formData.remark = ""
  formData.needLoadBindIronTag = 0
  formRef.value?.resetFields()
  formRef.value?.clearValidate()
}

const isHandledRequestError = (error: any) => {
  return Boolean(error?.isAxiosError || error?.response || error?.success === false)
}

const setDetailData = async () => {
  if (!props.craftTypeId) return
  const detail = await queryCraftTypeDetail(props.craftTypeId)
  formData.craftTypeNo = detail?.craftTypeNo || ""
  formData.craftTypeName = detail?.craftTypeName || ""
  formData.remark = detail?.remark || ""
  formData.needLoadBindIronTag = Number(detail?.needLoadBindIronTag || 0)
}

const initDialog = async () => {
  loading.value = true
  try {
    resetState()
    if (props.mode !== "create") {
      await setDetailData()
    }
  } finally {
    loading.value = false
  }
}

const submit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  const payload = {
    craftTypeNo: formData.craftTypeNo.trim() || undefined,
    craftTypeName: formData.craftTypeName.trim(),
    remark: formData.remark.trim() || undefined,
    needLoadBindIronTag: Number(formData.needLoadBindIronTag || 0)
  }

  loading.value = true
  try {
    if (props.mode === "create") {
      const id = await requestCreateCraftType(payload)
      ElMessage.success("新建成功")
      emit("success", {
        id: typeof id === "string" ? id : props.craftTypeId,
        needLoadBindIronTag: payload.needLoadBindIronTag
      })
    } else {
      await requestUpdateCraftType({
        id: props.craftTypeId,
        ...payload
      })
      ElMessage.success("编辑成功")
      emit("success", {
        id: props.craftTypeId,
        needLoadBindIronTag: payload.needLoadBindIronTag
      })
    }
  } catch (error: any) {
    if (isHandledRequestError(error)) return
    ElMessage.error(error?.message || "保存失败")
  } finally {
    loading.value = false
  }
}

watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      initDialog()
    } else {
      resetState()
    }
  }
)
</script>

<style scoped lang="scss">
.dialog-form {
  :deep(.el-form-item) {
    align-items: flex-start;
  }

  :deep(.el-form-item__label) {
    height: auto;
    line-height: 20px;
    padding-top: 6px;
  }
}
</style>
