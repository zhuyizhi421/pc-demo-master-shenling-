<template>
  <CustomDialog v-model="visible" title="维修登记" :loading="loading">
    <CustomForm
      ref="customFormRef"
      v-model="formData"
      :configs="formConfigs"
      :label-width="140"
    ></CustomForm>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="onSubmit">保存</el-button>
      </div>
    </template>
  </CustomDialog>

  <SelectPersonDialog
    v-model="selectPersonVisible"
    :type="EnumSelectUser.Staff"
    :selected-ids="formData.handleUserId ? [formData.handleUserId] : []"
    @success="onSelectPersonSuccess"
  />
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import { requestMroRepairFeedback } from "@/api/operation/mro/mro-repair"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import SelectPersonDialog from "@/components/SelectPersonDialog/index.vue"
import type { ITree } from "@/components/SelectPersonDialog/type"
import UploadImage from "@/components/UploadImage/index.vue"
import {
  EnumMRORepairMode,
  EnumMRORepairModeMap,
  EnumMRORepairResult,
  EnumMRORepairResultMap,
  EnumSelectUser
} from "@/constant/enums"
import useResetRef from "@/hooks/useResetRef"
import type { IUploadPhoto } from "@/types/base-info/global-config"
import type { IOption } from "@/types/common"
import type { IMroRepairPageListItem } from "@/types/maintain/mro-manage/mro-repair"

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    mroRepairId: string
    repairData?: IMroRepairPageListItem
  }>(),
  {}
)
const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
  (e: "success"): void
}>()

const [formData, resetFormData] = useResetRef<{
  handleUserId: string
  handleUserCodes: string
  repairResult: EnumMRORepairResult | undefined
  faultDescription: string
  analysis: string
  solutionMeasures: string
  remarks: string
  repairMode: number
  entrustUnit: string
  repairAfterLife: string
  scrapReason: string
  repairStartTime: string
  repairEndTime: string
  imageList: IUploadPhoto[]
  fileIds: string[]
}>({
  handleUserId: "",
  handleUserCodes: "",
  repairResult: undefined,
  faultDescription: "",
  analysis: "",
  solutionMeasures: "",
  remarks: "",
  repairMode: EnumMRORepairMode.INTERNAL,
  entrustUnit: "",
  repairAfterLife: "",
  scrapReason: "",
  repairStartTime: "",
  repairEndTime: "",
  imageList: [],
  fileIds: []
})

const loading = ref(false)
const selectPersonVisible = ref(false)
const selectedPersonList = ref<IOption[]>([])
const customFormRef = ref<InstanceType<typeof CustomForm>>()

const formConfigs = computed<ICustomFormConfigItem[]>(() => [
  {
    componentType: "el-select",
    field: "handleUserId",
    label: "处理人名称",
    props: {
      clearable: true,
      multiple: false,
      customChildren: selectedPersonList.value.map((item) => ({
        componentType: "el-option",
        props: {
          label: item.label,
          value: item.value
        }
      }))
    },
    events: {
      change: ($event: string) => onSelectPersonChange($event),
      visibleChange: ($event: boolean) => onSelectPersonVisibleChange($event)
    },
    rules: [{ required: true, message: "请选择处理人", trigger: "change" }]
  },
  {
    componentType: "el-input",
    field: "handleUserCodes",
    label: "处理人工号",
    props: {
      placeholder: "自动带出",
      disabled: true
    }
  },
  {
    componentType: "el-select",
    field: "repairMode",
    label: "维修方式",
    props: {
      customChildren: Object.entries(EnumMRORepairModeMap).map(([key, value]) => ({
        componentType: "el-option",
        props: {
          label: value,
          value: Number(key)
        }
      }))
    },
    events: {
      change: (val: number) => {
        if (val !== EnumMRORepairMode.EXTERNAL) {
          formData.value.entrustUnit = ""
        }
      }
    },
    rules: [{ required: true, message: "请选择维修方式", trigger: "change" }]
  },
  {
    componentType: "el-input",
    field: "entrustUnit",
    label: "委托单位",
    hidden: formData.value.repairMode !== EnumMRORepairMode.EXTERNAL,
    props: {
      placeholder: "请输入",
      clearable: true
    },
    rules:
      formData.value.repairMode === EnumMRORepairMode.EXTERNAL
        ? [{ required: true, message: "请输入委托单位", trigger: "blur" }]
        : []
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
    },
    rules: [{ required: true, message: "请输入故障描述", trigger: "blur" }]
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
    componentType: "el-input",
    field: "solutionMeasures",
    label: "解决措施",
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
    field: "repairResult",
    label: "维修结果",
    props: {
      customChildren: Object.entries(EnumMRORepairResultMap).map(([key, value]) => ({
        componentType: "el-option",
        props: {
          label: value,
          value: Number(key)
        }
      }))
    },
    rules: [{ required: true, message: "请选择维修结果", trigger: "change" }]
  },
  {
    componentType: "el-date-picker",
    field: "repairStartTime",
    label: "开始维修时间",
    props: {
      type: "datetime",
      valueFormat: "YYYY-MM-DD HH:mm:ss",
      format: "YYYY-MM-DD HH:mm:ss",
      placeholder: "请选择"
    },
    rules: [{ required: true, message: "请选择开始维修时间", trigger: "change" }]
  },
  {
    componentType: "el-date-picker",
    field: "repairEndTime",
    label: "维修完成时间",
    props: {
      type: "datetime",
      valueFormat: "YYYY-MM-DD HH:mm:ss",
      format: "YYYY-MM-DD HH:mm:ss",
      placeholder: "请选择"
    },
    rules: [{ required: true, message: "请选择维修完成时间", trigger: "change" }]
  },
  {
    componentType: "el-input",
    field: "repairAfterLife",
    label: "维修后寿命（次）",
    hidden: formData.value.repairResult !== EnumMRORepairResult.RESOLVED,
    props: {
      type: "number",
      placeholder: "请输入",
      clearable: true,
      min: 1
    },
    rules:
      formData.value.repairResult === EnumMRORepairResult.RESOLVED
        ? [{ required: true, message: "请输入维修后寿命", trigger: "blur" }]
        : []
  },
  {
    componentType: "el-input",
    field: "scrapReason",
    label: "报废原因",
    hidden: formData.value.repairResult !== EnumMRORepairResult.SCRAPPED,
    props: {
      type: "textarea",
      placeholder: "请输入",
      clearable: true,
      maxlength: 200,
      showWordLimit: true
    },
    rules:
      formData.value.repairResult === EnumMRORepairResult.SCRAPPED
        ? [{ required: true, message: "请输入报废原因", trigger: "blur" }]
        : []
  },
  {
    componentType: markRaw(UploadImage),
    field: "imageList",
    label: "报废附件",
    hidden: formData.value.repairResult !== EnumMRORepairResult.SCRAPPED
  },
  {
    componentType: "el-input",
    field: "remarks",
    label: "备注",
    props: {
      type: "textarea",
      placeholder: "请输入",
      clearable: true,
      maxlength: 200,
      showWordLimit: true
    }
  }
])

const visible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val)
})

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      initFromDetail()
    } else {
      customFormRef.value?.resetForm()
      resetFormData()
      selectedPersonList.value = []
    }
  }
)

const initFromDetail = () => {
  if (!props.repairData) {
    return
  }
  formData.value.faultDescription = props.repairData.faultDescription || ""
  formData.value.analysis = props.repairData.analysis || ""
  formData.value.solutionMeasures = props.repairData.solutionMeasures || ""
  formData.value.repairMode = Number(props.repairData.repairMode || EnumMRORepairMode.INTERNAL)
  formData.value.entrustUnit = props.repairData.entrustUnit || ""

  if (props.repairData.handleUser?.id) {
    formData.value.handleUserId = props.repairData.handleUser.id
    formData.value.handleUserCodes = props.repairData.handleUser.empNo || ""
    selectedPersonList.value = [
      {
        label: props.repairData.handleUser.name,
        value: props.repairData.handleUser.id
      }
    ]
  }
}

const onSelectPersonVisibleChange = (dialogVisible: boolean) => {
  if (dialogVisible) {
    selectPersonVisible.value = true
  }
}

const onSelectPersonChange = (value: string) => {
  if (!value) {
    formData.value.handleUserCodes = ""
  }
}

const onSelectPersonSuccess = (data: ITree[]) => {
  if (!data.length) {
    return
  }

  const first = data[0]
  selectedPersonList.value = [
    {
      label: first.label,
      value: first.id
    }
  ]
  formData.value.handleUserId = first.id
  formData.value.handleUserCodes = first.no
}

const onSubmit = async () => {
  const valid = await customFormRef.value?.validateForm()
  if (!valid) {
    return
  }

  const { imageList, ...otherParams } = formData.value
  const repairResult = Number(otherParams.repairResult)
  const isResolved = repairResult === EnumMRORepairResult.RESOLVED
  const isScrapped = repairResult === EnumMRORepairResult.SCRAPPED

  await requestMroRepairFeedback({
    id: props.mroRepairId,
    responsibleUserId: props.repairData?.responsibleUser?.id || "",
    handleUserId: otherParams.handleUserId,
    handleUserName:
      selectedPersonList.value.find(
        (item) => String(item.value) === String(otherParams.handleUserId)
      )?.label || "",
    repairMode: Number(otherParams.repairMode),
    entrustUnit: otherParams.entrustUnit,
    faultDescription: otherParams.faultDescription,
    analysis: otherParams.analysis,
    solutionMeasures: otherParams.solutionMeasures,
    repairResult,
    repairStartTime: otherParams.repairStartTime,
    repairEndTime: otherParams.repairEndTime,
    remarks: otherParams.remarks,
    repairAfterLife: isResolved ? Number(otherParams.repairAfterLife || 0) : 0,
    scrapReason: isScrapped ? otherParams.scrapReason : "",
    fileIds: isScrapped ? imageList.map((item) => item.fileId) : []
  })

  ElMessage.success("反馈成功")
  visible.value = false
  emit("success")
}
</script>

<style lang="scss" scoped></style>
