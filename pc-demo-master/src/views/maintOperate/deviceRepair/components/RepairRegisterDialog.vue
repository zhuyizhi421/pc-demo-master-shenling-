<!-- 维修登记 -->
<template>
  <CustomDialog v-model="visible" title="维修登记">
    <CustomForm ref="customFormRef" v-model="formData" :configs="formConfigs" />

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="onSubmitClick()">提交</el-button>
    </template>
  </CustomDialog>

  <!-- 选择人员组件 -->
  <SelectPersonDialog
    v-model="selectPersonVisible"
    :type="EnumSelectUser.Staff"
    :selected-ids="[formData.handleUserId]"
    @success="onSelectPersonSuccess"
  />
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import { requestEquipmentFaults } from "@/api/operation/equipment/equipment-model"
import { requestRegisterEquipmentRepair } from "@/api/operation/equipment/equipment-repair"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import SelectPersonDialog from "@/components/SelectPersonDialog/index.vue"
import type { ITree } from "@/components/SelectPersonDialog/type"
import UploadImage from "@/components/UploadImage/index.vue"
import {
  EnumEquipmentRepairSolution,
  EnumEquipmentRepairSolutionMap,
  EnumSelectUser
} from "@/constant/enums"
import useResetRef from "@/hooks/useResetRef"
import type { IUploadPhoto } from "@/types/base-info/global-config"
import type { IOption } from "@/types/common"

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    id: string
    deviceId: string
  }>(),
  {}
)
const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
  (e: "success"): void
}>()

const customFormRef = ref<InstanceType<typeof CustomForm>>()
const selectPersonVisible = ref(false)
const selectedPersonList = ref<IOption[]>([])
const deviceFaultSelect = ref<IOption[]>([])

const [formData, resetFormData] = useResetRef<{
  handleUserId: string
  handleUserNo: string
  faultIds: string[]
  solution: EnumEquipmentRepairSolution
  analysis: string
  scrapReason: string
  imageList: IUploadPhoto[]
}>({
  handleUserId: "",
  handleUserNo: "",
  faultIds: [],
  solution: EnumEquipmentRepairSolution.Repair,
  analysis: "",
  scrapReason: "",
  imageList: []
})
const formConfigs = computed<ICustomFormConfigItem[]>(() => [
  {
    componentType: "el-select",
    field: "handleUserId",
    label: "处理人姓名",
    rules: [
      {
        required: true,
        message: "请选择处理人",
        trigger: "change"
      }
    ],
    props: {
      clearable: false,
      customChildren: selectedPersonList.value.map((item) => ({
        componentType: "el-option",
        props: {
          label: item.label,
          value: item.value
        }
      }))
    },
    events: {
      visibleChange: (val: boolean) => {
        val && (selectPersonVisible.value = val)
      }
    }
  },
  {
    componentType: "el-input",
    field: "handleUserNo",
    label: "处理人工号",
    props: {
      disabled: true
    },
    hidden: !formData.value.handleUserId
  },
  {
    componentType: "el-select",
    field: "faultIds",
    label: "故障",
    rules: [
      {
        required: true,
        message: "请选择故障",
        trigger: "change"
      }
    ],
    props: {
      multiple: true,
      collapseTags: true,
      customChildren: deviceFaultSelect.value.map((item) => ({
        componentType: "el-option",
        props: {
          label: item.label,
          value: item.value
        }
      }))
    }
  },
  {
    componentType: "el-select",
    field: "solution",
    label: "维修结果",
    rules: [
      {
        required: true,
        message: "请选择维修结果",
        trigger: "change"
      }
    ],
    props: {
      placeholder: "请选择",
      customChildren: Object.entries(EnumEquipmentRepairSolutionMap).map(([key, value]) => ({
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
    field: "analysis",
    label: "分析备注",
    props: {
      type: "textarea",
      maxlength: 200,
      showWordLimit: true
    }
  },
  {
    componentType: "el-input",
    field: "scrapReason",
    label: "报废原因",
    rules: [
      {
        required: true,
        message: "请输入报废原因",
        trigger: "blur"
      }
    ],
    props: {
      type: "textarea",
      maxlength: 200,
      showWordLimit: true
    },
    hidden: formData.value.solution !== EnumEquipmentRepairSolution.Scrap
  },
  {
    componentType: markRaw(UploadImage),
    field: "imageList",
    label: "报废附件",
    hidden: formData.value.solution !== EnumEquipmentRepairSolution.Scrap
  }
])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val)
})

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      getDeviceFaultSelect()
    } else {
      customFormRef.value?.resetForm()
      resetFormData()
      selectedPersonList.value = []
      deviceFaultSelect.value = []
    }
  }
)

/** 获取设备下拉 */
const getDeviceFaultSelect = async () => {
  const res = await requestEquipmentFaults(props.deviceId)
  deviceFaultSelect.value = res.map((item) => ({
    value: item.id,
    label: item.faultName
  }))
}

/** 选择处理人成功回调 */
const onSelectPersonSuccess = (data: ITree[]) => {
  if (!data?.length) {
    return
  }

  selectedPersonList.value = data.map((item) => ({
    label: item.label,
    value: item.id
  }))
  formData.value.handleUserId = data[0].id
  formData.value.handleUserNo = data[0].no
}

const onSubmitClick = async () => {
  const valid = await customFormRef.value?.validateForm()
  if (!valid) {
    return
  }

  const { imageList, handleUserId, ...othersParams } = formData.value

  const params: any = {
    id: props.id,
    handleUserId: [handleUserId],
    ...othersParams
  }
  if (othersParams.solution === EnumEquipmentRepairSolution.Scrap && imageList.length) {
    params.fileIds = [imageList[0].fileId]
  }

  await requestRegisterEquipmentRepair(params)
  ElMessage.success("登记成功")
  emit("success")
  visible.value = false
}
</script>

<style lang="scss" scoped></style>
