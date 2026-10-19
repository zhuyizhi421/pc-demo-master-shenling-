<template>
  <CustomDialog :model-value="modelValue" title="修改密码" @close="onClose()">
    <CustomForm ref="customFormRef" v-model="form" :configs="formConfigs"></CustomForm>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="onCancelClick()">取消</el-button>
        <el-button type="primary" @click="onSubmitClick()">确定</el-button>
      </span>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import { requestUpdatePassword } from "@/api/user"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import { validatePassword } from "@/utils/validate"

interface IProps {
  modelValue: boolean
  userId: string
}
const props = defineProps<IProps>()

const emits = defineEmits<{
  (e: "update:modelValue", show: boolean): void
}>()

const form = reactive({
  pass: "",
  checkPass: "",
  age: ""
})

const customFormRef = ref<InstanceType<typeof CustomForm>>()
const formConfigs = computed<ICustomFormConfigItem[]>(() => [
  {
    componentType: "el-input",
    label: "原密码",
    field: "password",
    props: {
      type: "text",
      placeholder: "******",
      disabled: true
    }
  },
  {
    componentType: "el-input",
    label: "请输入新密码",
    field: "pass",
    rules: [
      {
        validator: validatorPassword,
        trigger: "blur"
      }
    ],
    props: {
      type: "text",
      placeholder: "请输入新密码"
    }
  },
  {
    componentType: "el-input",
    label: "再次输入新密码",
    field: "checkPass",
    rules: [{ validator: validateAgainPassword, trigger: "blur" }],
    props: {
      type: "text",
      placeholder: "再次输入新密码"
    }
  }
])

/** 校验新密码 */
const validatorPassword = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error("请输入密码"))
  } else {
    if (!validatePassword(value)) {
      callback(new Error("6~15位数字、大小写字母、特殊字符 -_./!"))
    }
    callback()
  }
}

/** 校验再次输入密码 */
const validateAgainPassword = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error("请再次输入密码"))
  } else if (value !== form.pass) {
    callback(new Error("两次输入不一致!"))
  } else {
    callback()
  }
}

/** 提交操作 */
const onSubmitClick = async () => {
  const valid = await customFormRef.value?.validateForm()
  if (!valid) return
  await requestUpdatePassword({
    id: props.userId,
    password: form.pass
  })
  ElMessage({
    message: "修改成功",
    type: "success"
  })
  emits("update:modelValue", false)
  customFormRef.value?.resetForm()
}

/** 取消操作 */
const onCancelClick = () => {
  customFormRef.value?.resetForm()
  emits("update:modelValue", false)
}

/** 关闭弹窗,清空表单项 */
const onClose = () => {
  customFormRef.value?.resetForm()
  emits("update:modelValue", false)
}
</script>

<style scoped lang="scss"></style>
