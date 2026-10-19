<template>
  <CustomDialog v-model="visible" @close="onClose()" title="审批操作" size="mini">
    <CustomForm
      ref="customFormRef"
      v-model="formData"
      :label-width="80"
      :configs="formConfigs"
    ></CustomForm>
    <template #footer>
      <el-button @click="emits('update:modelValue', false)">取消</el-button>
      <el-button @click="onPassHandle(0)">不通过</el-button>
      <el-button type="primary" @click="onPassHandle(1)">通过</el-button>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts" name="ExamineHandle">
import { ElMessage } from "element-plus"

import { queryFlowAuditPass, queryFlowAuditReject } from "@/api/flowable"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import { type IFlowListResult } from "@/types/personal/flow"

const props = defineProps<{
  modelValue: boolean
  data: IFlowListResult[]
}>()

const emits = defineEmits<{
  (e: "update:modelValue", data: boolean): void
  (e: "onOk"): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emits("update:modelValue", val)
})

const formData = ref<{
  flowNames: string
  remarks: string
}>({
  flowNames: "",
  remarks: ""
})

const customFormRef = ref<InstanceType<typeof CustomForm>>()
const formConfigs = computed<ICustomFormConfigItem[]>(() => [
  {
    componentType: "el-input",
    label: "流程名称",
    field: "flowNames",
    props: {
      type: "text",
      placeholder: "请输入流程名称",
      disabled: true
    }
  },
  {
    componentType: "el-input",
    label: "审批备注",
    field: "remarks",
    rules: [
      {
        required: true,
        message: "请输入审批备注",
        trigger: "blur"
      }
    ],
    props: {
      type: "textarea",
      placeholder: "请输入审批备注",
      maxlength: 200,
      showWordLimit: true
    }
  }
])

/**
 * 审核通过/不通过操作
 * @param type 0:不通过 1:通过
 */
const onPassHandle = async (type: number) => {
  const valid = await customFormRef.value?.validateForm()
  if (!valid) return
  if (type) {
    // 审核通过
    const paramList = props.data.map((item) => {
      return {
        taskId: item.taskId,
        instanceId: item.procInsId,
        comment: formData.value.remarks
      }
    })
    const params = {
      taskList: paramList
    }
    await queryFlowAuditPass(params)
    ElMessage.success("操作成功")
    emits("onOk")
  } else {
    // 审核不通过
    const instanceIds = props.data.map((item) => item.procInsId)
    await queryFlowAuditReject({
      instanceIds,
      comment: formData.value.remarks
    })
    ElMessage.success("操作成功")
    emits("onOk")
  }
  emits("update:modelValue", false)
}

const onClose = () => {
  emits("update:modelValue", false)
  formData.value.remarks = ""
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      formData.value.flowNames = props.data.map((item) => item.procDefName).join(",") || ""
    } else {
      customFormRef.value?.resetForm()
    }
  }
)
</script>
