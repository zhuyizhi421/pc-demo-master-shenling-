<template>
  <CustomDialog v-model="dialogVisible" title="修改名称" width="450" draggable>
    <CustomForm ref="customFormRef" v-model="formData" :configs="formConfigs"> </CustomForm>

    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="onConfirmClick()">确定</el-button>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import { requestUpdateFileName } from "@/api/fileResource"
import { requestFlowDefinitionList } from "@/api/flowable"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import type { IFlowableDefinitionItem } from "@/types/personal/flow"

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    flowId: string
    id: string
  }>(),
  {}
)

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
  (e: "success"): void
}>()

const formData = reactive({
  newName: "",
  flowId: ""
})

const customFormRef = ref<InstanceType<typeof CustomForm>>()
const formConfigs = computed<ICustomFormConfigItem[]>(() => [
  {
    componentType: "el-input",
    label: "新文档名",
    field: "newName",
    rules: [
      {
        required: true,
        message: "请输入新文档名",
        trigger: "blur"
      }
    ],
    props: {
      type: "text",
      placeholder: "请输入新文档名",
      maxlength: 50
    }
  },
  {
    componentType: "el-select",
    label: "文档修订流程",
    field: "flowId",
    props: {
      placeholder: "请选择文档修订流程",
      disabled: true,
      get customChildren() {
        return flowList.value.map((item) => {
          return {
            componentType: "el-option",
            props: { label: item.name, value: item.flowKey }
          }
        })
      }
    }
  }
])

const flowList = ref<IFlowableDefinitionItem[]>([])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val)
})

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      formData.flowId = props.flowId
      getFlowDefineOptions()
    } else {
      customFormRef.value?.resetForm()
      formData.newName = ""
      formData.flowId = ""
    }
  }
)

/** 获取文档审批流下拉 */
const getFlowDefineOptions = async () => {
  const data = await requestFlowDefinitionList()
  flowList.value = data
}

/** 确认操作 */
const onConfirmClick = async () => {
  const valid = await customFormRef.value?.validateForm()
  if (!valid) return

  await requestUpdateFileName({
    id: props.id,
    newName: formData.newName
  })
  ElMessage.success("修改名称成功")
  dialogVisible.value = false
  emit("success")
}
</script>

<style lang="scss" scoped></style>
