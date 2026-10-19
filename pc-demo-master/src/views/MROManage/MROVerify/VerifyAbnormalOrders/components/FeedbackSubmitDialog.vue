<template>
  <CustomDialog v-model="dialogVisible" title="提交反馈" :loading="loading">
    <CustomForm ref="customFormRef" v-model="formData" :configs="formConfigs"></CustomForm>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="onSubmit()">提交</el-button>
      </span>
    </template>
  </CustomDialog>

  <!-- 选择人员组件 -->
  <SelectPersonDialog
    v-model="selectPersonVisible"
    :type="EnumSelectUser.Staff"
    :selected-ids="formData.handleUserIds"
    @success="onSelectPersonSuccess"
  />
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import { requestFeedbackMroVerifyExceptionTask } from "@/api/operation/mro/mro-verify-exception-task"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import SelectPersonDialog from "@/components/SelectPersonDialog/index.vue"
import type { ITree } from "@/components/SelectPersonDialog/type"
import UploadImage from "@/components/UploadImage/index.vue"
import {
  EnumMROInspectionFeedbackSolution,
  EnumMROInspectionFeedbackSolutionMap,
  EnumSelectUser
} from "@/constant/enums"
import useResetRef from "@/hooks/useResetRef"
import type { IUploadPhoto } from "@/types/base-info/global-config"
import type { IOption } from "@/types/common"

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    id: string
  }>(),
  {}
)
const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
  (e: "success"): void
}>()

const customFormRef = ref<InstanceType<typeof CustomForm>>()
const loading = ref(false)
const selectPersonVisible = ref(false)
const selectedHandlerList = ref<IOption[]>([])

const [formData, resetForm] = useResetRef<{
  handleUserIds: string[]
  handleUserNo: string
  faultDescription: string
  analysis: string
  solution?: EnumMROInspectionFeedbackSolution
  repairReason: string
  scrapReason: string
  imageList: IUploadPhoto[]
}>({
  handleUserIds: [],
  handleUserNo: "",
  faultDescription: "",
  analysis: "",
  solution: undefined,
  repairReason: "",
  scrapReason: "",
  imageList: []
})
const formConfigs = computed(() => [
  {
    componentType: "el-select",
    field: "handleUserIds",
    label: "处理人姓名",
    rules: [
      {
        required: true,
        message: "请填写处理人姓名",
        trigger: "change"
      }
    ],
    props: {
      clearable: true,
      multiple: true,
      collapseTags: true,
      collapseTagsTooltip: true,
      customChildren: selectedHandlerList.value.map((item) => ({
        componentType: "el-option",
        props: {
          label: item.label,
          value: item.value
        }
      }))
    },
    events: {
      visibleChange: onSelectPersonVisibleChange,
      change: onSelectPersonChange
    }
  },
  {
    componentType: "el-input",
    field: "handleUserNo",
    label: "处理人工号",
    props: {
      disabled: true
    }
  },
  {
    componentType: "el-input",
    field: "faultDescription",
    label: "故障描述",
    props: {
      type: "textarea",
      placeholder: "请输入",
      clearable: true,
      maxlength: 200,
      showWordLimit: true
    }
  },
  {
    componentType: "el-input",
    field: "analysis",
    label: "故障分析",
    props: {
      type: "textarea",
      placeholder: "请输入",
      clearable: true,
      maxlength: 200,
      showWordLimit: true
    }
  },
  {
    componentType: "el-select",
    field: "solution",
    label: "解决措施",
    rules: [
      {
        required: true,
        message: "请选择解决措施",
        trigger: "change"
      }
    ],
    props: {
      customChildren: Object.entries(EnumMROInspectionFeedbackSolutionMap).map(([key, value]) => ({
        componentType: "el-option",
        props: {
          label: value,
          value: +key
        }
      }))
    }
  },
  {
    componentType: "el-input",
    field: "repairReason",
    label: "维修原因",
    rules: [
      {
        required: true,
        message: "请填写维修原因",
        trigger: "change"
      }
    ],
    props: {
      type: "textarea",
      placeholder: "请输入",
      clearable: true,
      maxlength: 200,
      showWordLimit: true
    },
    hidden: formData.value.solution !== EnumMROInspectionFeedbackSolution.REPAIR
  },
  {
    componentType: "el-input",
    field: "scrapReason",
    label: "报废原因",
    rules: [
      {
        required: true,
        message: "请填写报废原因",
        trigger: "change"
      }
    ],
    props: {
      type: "textarea",
      placeholder: "请输入",
      clearable: true,
      maxlength: 200,
      showWordLimit: true
    },
    hidden: formData.value.solution !== EnumMROInspectionFeedbackSolution.SCRAP
  },
  {
    componentType: markRaw(UploadImage),
    field: "imageList",
    label: "报废附件"
  }
])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val)
})

watch(
  () => props.modelValue,
  async (val) => {
    if (val) {
    } else {
      customFormRef.value?.resetForm()
      resetForm()
    }
  }
)

/** 选择处理对象下拉框visible-change回调 */
const onSelectPersonVisibleChange = (visible: boolean) => {
  if (visible) {
    selectPersonVisible.value = true
  }
}

/** 选择处理对象下拉框change回调 */
const onSelectPersonChange = (value: string) => {
  if (!value || !value.length) {
    formData.value.handleUserNo = ""
  }
}

/** 选择处理对象成功回调 */
const onSelectPersonSuccess = (data: ITree[]) => {
  selectedHandlerList.value = data.map((item) => ({
    label: item.label,
    value: item.id
  }))
  formData.value.handleUserIds = data.map((item) => item.id)
  formData.value.handleUserNo = data.map((item) => item.no).join(",")
}

/** 提交操作 */
const onSubmit = async () => {
  const valid = await customFormRef.value?.validateForm()
  if (!valid) {
    return
  }

  const { imageList, ...rest } = formData.value
  let params = {
    ...rest,
    remarks: formData.value.faultDescription,
    responsibleUserIds: formData.value.handleUserIds,
    scrapFileIds: imageList.map((item) => item.fileId),
    id: props.id
  }
  await requestFeedbackMroVerifyExceptionTask(params)
  ElMessage.success("提交成功")
  dialogVisible.value = false
  emit("success")
}
</script>

<style lang="scss" scoped></style>
