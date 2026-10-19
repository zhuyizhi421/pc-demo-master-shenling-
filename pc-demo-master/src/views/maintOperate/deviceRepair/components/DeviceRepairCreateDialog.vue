<template>
  <CustomDialog v-model="dialogVisible" title="新建维修">
    <CustomForm ref="customFormRef" v-model="formData" :configs="formConfigs" />

    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="onSubmit()">确定</el-button>
    </template>
  </CustomDialog>

  <!-- 选择设备弹窗 -->
  <CustomSelectDialog
    :type="EnumDialogType.Device"
    :props="deviceDialogProps"
    :events="{
      'update:modelValue': (val: boolean) => (deviceDialogProps.modelValue = val),
      success: onSelectDeviceSuccess
    }"
  />

  <!-- 选择人员组件 -->
  <SelectPersonDialog
    v-model="selectPersonVisible"
    :type="EnumSelectUser.Staff"
    :selected-ids="[formData.reportUserId]"
    @success="onSelectPersonSuccess"
  />
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import { requestCreateEquipmentRepair } from "@/api/operation/equipment/equipment-repair"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import CustomSelectDialog from "@/components/CustomSelectDialog/index.vue"
import { EnumDialogType } from "@/components/CustomSelectDialog/type"
import SelectPersonDialog from "@/components/SelectPersonDialog/index.vue"
import type { ITree } from "@/components/SelectPersonDialog/type"
import { EnumSelectUser } from "@/constant/enums"
import useResetRef from "@/hooks/useResetRef"
import type { IOption } from "@/types/common"
import type { IEquipmentPageItem } from "@/types/maintain/equipment-manage/equipment-info"

const props = withDefaults(
  defineProps<{
    modelValue: boolean
  }>(),
  {}
)

const emit = defineEmits<{
  (e: "update:modelValue", val: boolean): void
  (e: "success"): void
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val)
})

const selectedDeviceOptions = ref<IOption[]>([])
const deviceDialogProps = reactive<{
  modelValue: boolean
  selectedRowKeys: string[]
}>({
  modelValue: false,
  selectedRowKeys: []
})

const selectPersonVisible = ref(false)
const selectedPersonList = ref<IOption[]>([])

const customFormRef = ref<InstanceType<typeof CustomForm>>()
const [formData, resetFormData] = useResetRef<{
  equipmentId: string
  equipmentNo: string
  reportUserId: string
  reportUserNo: string
  remarks: string
}>({
  equipmentId: "",
  equipmentNo: "",
  reportUserId: "",
  reportUserNo: "",
  remarks: ""
})
const formConfigs = computed<ICustomFormConfigItem[]>(() => [
  {
    componentType: "el-select",
    field: "equipmentId",
    label: "设备名称",
    rules: [
      {
        required: true,
        message: "请选择设备",
        trigger: "change"
      }
    ],
    props: {
      clearable: false,
      customChildren: selectedDeviceOptions.value.map((item) => ({
        componentType: "el-option",
        props: {
          label: item.label,
          value: item.value
        }
      }))
    },
    events: {
      visibleChange: (val: boolean) => {
        val && (deviceDialogProps.modelValue = val)
      }
    }
  },
  {
    componentType: "el-input",
    field: "equipmentNo",
    label: "设备编号",
    props: {
      disabled: true
    },
    hidden: !formData.value.equipmentId?.length
  },
  {
    componentType: "el-select",
    field: "reportUserId",
    label: "报修人",
    rules: [
      {
        required: true,
        message: "请选择报修人",
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
    field: "reportUserNo",
    label: "报修人编号",
    props: {
      disabled: true
    },
    hidden: !formData.value.reportUserId?.length
  },
  {
    componentType: "el-input",
    field: "remarks",
    label: "维修说明",
    props: {
      type: "textarea",
      maxlength: 200,
      showWordLimit: true
    }
  }
])

watch(
  () => props.modelValue,
  (val) => {
    if (!val) {
      customFormRef.value?.resetForm()
      resetFormData()
      selectedDeviceOptions.value = []
    }
  }
)

/** 选择设备成功回调 */
const onSelectDeviceSuccess = (data: IEquipmentPageItem[]) => {
  if (!data?.length) {
    return
  }

  selectedDeviceOptions.value = data.map((item) => ({
    label: item.equipmentName,
    value: item.id
  }))
  formData.value.equipmentId = data[0].id
  formData.value.equipmentNo = data[0].equipmentNo
  deviceDialogProps.selectedRowKeys = [data[0].id]
}

/** 选择报修人成功回调 */
const onSelectPersonSuccess = (data: ITree[]) => {
  selectedPersonList.value = data.map((item) => ({
    label: item.label,
    value: item.id
  }))
  formData.value.reportUserId = data[0].id
  formData.value.reportUserNo = data[0].no
}

/** 提交操作 */
const onSubmit = async () => {
  const valid = await customFormRef.value?.validateForm()
  if (!valid) {
    return
  }

  await requestCreateEquipmentRepair({
    equipmentId: formData.value.equipmentId,
    reportUserId: [formData.value.reportUserId],
    remarks: formData.value.remarks
  })
  ElMessage.success("创建成功")
  emit("success")
  dialogVisible.value = false
}
</script>

<style scoped lang="scss"></style>
