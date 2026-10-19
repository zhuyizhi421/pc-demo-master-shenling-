<template>
  <CustomDialog v-model="dialogVisible" title="绑定标签码">
    <CustomForm class="form" ref="customFormRef" v-model="formData" :configs="formConfigs">
      <template #code-default>
        <el-input
          v-model="formData.barcode"
          placeholder=""
          :disabled="formData.autoGenerateCode"
          style="width: calc(100% - 100px)"
        />
        <el-checkbox
          v-model="formData.autoGenerateCode"
          label="自动生成"
          style="margin-left: 10px"
          @change="onAutoGenerateCodeChange"
        />
      </template>
    </CustomForm>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="onConfirmClick()">绑定</el-button>
      </div>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import { requestMroBandBarcode } from "@/api/operation/mro/mro-info"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import useResetRef from "@/hooks/useResetRef"

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    id: string
  }>(),
  {}
)
const emit = defineEmits<{
  (e: "update:modelValue", val: boolean): void
  (e: "success"): void
}>()

const customFormRef = ref<InstanceType<typeof CustomForm>>()
const [formData, resetFormData] = useResetRef({
  barcode: "",
  autoGenerateCode: false
})
const formConfigs = computed(() => [
  {
    componentType: "div",
    label: "MRO标签码：",
    field: "barcode",
    props: {
      class: "code-content"
    },
    slots: {
      default: "code-default"
    }
  }
])
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val)
})

watch(
  () => props.modelValue,
  (val) => {
    if (!val) {
      customFormRef.value?.resetForm()
      resetFormData()
    }
  }
)

/** 切换自动生成标签码操作 */
const onAutoGenerateCodeChange = (checked: boolean) => {
  if (checked) {
    formData.value.barcode = ""
  }
}

/** 确认按钮点击事件 */
const onConfirmClick = async () => {
  const valid = await customFormRef.value?.validateForm()
  if (!valid) {
    return
  }

  const { barcode, autoGenerateCode } = formData.value

  if (!barcode && !autoGenerateCode) {
    ElMessage.warning("请输入MRO标签码")
    return
  }

  let params = {
    id: props.id,
    barcode,
    autoGenerateCode
  }
  await requestMroBandBarcode(params)
  ElMessage.success("绑定标签码成功")
  dialogVisible.value = false
  emit("success")
}
</script>

<style lang="scss" scoped>
.form {
  &:deep(.code-content) {
    width: 100%;
    display: flex;
    align-items: center;
  }
}
</style>
