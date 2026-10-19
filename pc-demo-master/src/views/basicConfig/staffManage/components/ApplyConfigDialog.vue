<template>
  <CustomDialog
    v-model="dialogVisible"
    title="上岗证申请流程配置"
    size="mini"
    @close="emit('close')"
  >
    <CustomForm ref="customFormRef" v-model="formData" :configs="formConfigs"></CustomForm>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="emit('close')">取消</el-button>
        <el-button type="primary" @click="onConfirmClick()">保存</el-button>
      </div>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import { queryLicenseApplyConfigDetail, requestLicenseApplyConfig } from "@/api/license"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"

const emit = defineEmits<{
  (e: "success"): void
  (e: "close"): void
}>()

const dialogVisible = ref(true)
const formData = reactive({
  enabled: false
})

const customFormRef = ref<InstanceType<typeof CustomForm>>()
const formConfigs = ref<ICustomFormConfigItem[]>([
  {
    componentType: "el-radio-group",
    label: "流程审批",
    field: "enabled",
    rules: [{ required: true, message: "请选择流程审批", trigger: "change" }],
    props: {
      customChildren: [
        {
          componentType: "el-radio",
          props: {
            label: "开启",
            value: true
          }
        },
        {
          componentType: "el-radio",
          props: {
            label: "关闭",
            value: false
          }
        }
      ]
    }
  }
])

onMounted(() => {
  getLicenseApplyConfigDetail()
})

/** 获取上岗证申请配置详情 */
const getLicenseApplyConfigDetail = async () => {
  const data = await queryLicenseApplyConfigDetail()
  formData.enabled = data || false
}

/** 确认按钮点击事件 */
const onConfirmClick = async () => {
  const valid = await customFormRef.value?.validateForm()
  if (!valid) return

  await requestLicenseApplyConfig(formData.enabled)
  ElMessage.success("保存成功")
  emit("success")
  emit("close")
}
</script>

<style lang="scss" scoped>
.form-style {
  margin: 20px 0;
}
</style>
