<template>
  <div class="putFeedback">
    <CustomDialog draggable v-model="visible" title="提交反馈">
      <CustomForm ref="customFormRef" v-model="formData" :configs="formConfigs"></CustomForm>

      <template #footer>
        <el-button @click="emits('update:modelValue', false)">取 消</el-button>
        <el-button type="primary" @click="onSubmitClick()">提 交</el-button>
      </template>
    </CustomDialog>

    <!-- 选择人员组件 -->
    <SelectPersonDialog
      v-model="selectPersonVisible"
      :type="EnumSelectUser.Staff"
      :selected-ids="formData.handleUserIds"
      @success="onSelectPersonSuccess"
    />
  </div>
</template>

<script setup lang="ts" name="putFeedback">
import { ElMessage } from "element-plus"

import { requestSubmitEquipmentExceptionOrderFeedback } from "@/api/operation/equipment/equipment-exception-order"
import { requestEquipmentExceptionOrderSystemFault } from "@/api/operation/equipment/equipment-exception-order"
import {
  ExceptionTaskSolutionType,
  exceptionTaskSolutionTypeToNameMap
} from "@/api/operation/equipment/types"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import SelectPersonDialog from "@/components/SelectPersonDialog/index.vue"
import type { ITree } from "@/components/SelectPersonDialog/type"
import { EnumEquipmentExceptionSourceType, EnumSelectUser } from "@/constant/enums"
import useResetRef from "@/hooks/useResetRef"
import type { IOption } from "@/types/common"

const [formData, resetFormData] = useResetRef<any>({
  name: "",
  handleUserNo: "",
  handleUserIds: [],
  solution: ExceptionTaskSolutionType.Normal,
  repairRemark: "",
  analysis: "",
  faultIds: [],
  id: ""
})

const formConfigs = computed(() => [
  {
    componentType: "el-select",
    field: "handleUserIds",
    label: "处理人",
    rules: [
      {
        required: true,
        message: "请选择处理人",
        trigger: "change"
      }
    ],
    props: {
      clearable: true,
      multiple: true,
      collapseTags: true,
      collapseTagsTooltip: true,
      customChildren: selectedPersonList.value.map((item) => ({
        componentType: "el-option",
        props: {
          label: item.label,
          value: item.value
        }
      }))
    },
    events: {
      visibleChange: onSelectPersonVisibleChange
    }
  },
  {
    componentType: "el-input",
    label: "处理人工号",
    field: "handleUserNo",
    props: {
      disabled: true
    }
  },
  {
    componentType: "el-select",
    label: "故障",
    field: "faultIds",
    props: {
      filterable: true,
      multiple: true,
      collapseTags: true,
      customChildren: faultList.value.map((item) => ({
        componentType: "el-option",
        props: {
          label: item.name,
          value: item.id
        }
      }))
    }
  },
  {
    componentType: "el-input",
    label: "分析备注",
    field: "analysis",
    props: {
      type: "textarea",
      placeholder: "请输入",
      maxlength: 200,
      showWordLimit: true
    }
  },
  {
    componentType: "el-select",
    label: "解决措施",
    field: "solution",
    rules: [{ required: true, message: "请选择解决措施", trigger: "change" }],
    props: {
      customChildren: faultsList.value.map((item) => ({
        componentType: "el-option",
        props: {
          label: item.label,
          value: item.id
        }
      }))
    }
  },
  {
    componentType: "el-input",
    label: "维修说明",
    field: "repairRemark",
    props: {
      type: "textarea",
      placeholder: "请输入",
      maxlength: 200,
      showWordLimit: true
    },
    hidden: formData.value.solution !== ExceptionTaskSolutionType.Repair
  }
])

const props = defineProps<{
  modelValue: boolean
  data?: any
  type: EnumEquipmentExceptionSourceType
}>()

const emits = defineEmits<{
  (e: "update:modelValue", show: boolean): void
  (e: "success"): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emits("update:modelValue", val)
})

const faults = [
  {
    label: exceptionTaskSolutionTypeToNameMap[ExceptionTaskSolutionType.Normal],
    id: ExceptionTaskSolutionType.Normal
  },
  {
    label: exceptionTaskSolutionTypeToNameMap[ExceptionTaskSolutionType.Repair],
    id: ExceptionTaskSolutionType.Repair
  },
  {
    label: exceptionTaskSolutionTypeToNameMap[ExceptionTaskSolutionType.Maintain],
    id: ExceptionTaskSolutionType.Maintain
  }
]

const customFormRef = ref<InstanceType<typeof CustomForm>>()
const faultList = ref<any[]>([])
const selectPersonVisible = ref(false)
const selectedPersonList = ref<IOption[]>([])

const faultsList = computed(() => {
  if (props.type === EnumEquipmentExceptionSourceType.Maintain) {
    return faults.filter((item) => item.id !== ExceptionTaskSolutionType.Maintain)
  }
  return faults
})

watch(
  () => props.modelValue,
  (val) => {
    if (!val) {
      customFormRef.value?.resetForm()
      resetFormData()
    } else {
      getFaultyList()
    }
  }
)

/** 获取故障列表 */
const getFaultyList = async () => {
  const res = await requestEquipmentExceptionOrderSystemFault(props.data?.equipmentId)
  faultList.value = res.map((item: any) => {
    return {
      id: item.id,
      name: item.faultName
    }
  })
}

/** 选择处理人下拉框visible-change回调 */
const onSelectPersonVisibleChange = (visible: boolean) => {
  if (visible) {
    selectPersonVisible.value = true
  }
}

/** 选择处理人成功回调 */
const onSelectPersonSuccess = (data: ITree[]) => {
  selectedPersonList.value = data.map((item) => ({
    label: item.label,
    value: item.id
  }))
  formData.value.handleUserIds = data.map((item) => item.id)
  formData.value.handleUserNo = data.map((item) => item.no).join()
}

/** 提交操作 */
const onSubmitClick = async () => {
  const valid = await customFormRef.value?.validateForm()

  if (!valid) return
  const params: any = {
    id: props.data?.id,
    handleUserIds: formData.value.handleUserIds,
    solution: formData.value.solution,
    repairRemark: formData.value.repairRemark,
    analysis: formData.value.analysis,
    faultIds: formData.value.faultIds
  }
  await requestSubmitEquipmentExceptionOrderFeedback(params)
  ElMessage.success("提交成功")
  visible.value = false
  emits("success")
}
</script>

<style scoped lang="scss"></style>
