<template>
  <CustomDialog v-model="visible" title="新建报废" size="mini">
    <CustomForm ref="customFormRef" v-model="formData" :configs="formConfigs"></CustomForm>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="onSubmitClick()"> 保存 </el-button>
      </span>
    </template>
  </CustomDialog>

  <!-- 设备选择弹窗 -->
  <SelectDeviceDialog
    v-model="equipmentVisible"
    :selected-row-keys="selectedEquipmentIds"
    @success="onSelectEquipmentSuccess"
  />

  <!-- 选择人员组件 -->
  <SelectPersonDialog
    v-model="selectPersonVisible"
    :type="EnumSelectUser.Staff"
    :selected-ids="formData.reportUserIds"
    @success="onSelectPersonSuccess"
  />
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import { requestCreateEquipmentScrap } from "@/api/operation/equipment/equipment-scrap-apply"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import SelectDeviceDialog from "@/components/SelectDeviceDialog/index.vue"
import SelectPersonDialog from "@/components/SelectPersonDialog/index.vue"
import type { ITree } from "@/components/SelectPersonDialog/type"
import UploadImage from "@/components/UploadImage/index.vue"
import { EnumSelectUser } from "@/constant/enums"
import useResetRef from "@/hooks/useResetRef"
import type { IUploadPhoto } from "@/types/base-info/global-config"
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

const visible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val)
})

const customFormRef = ref<InstanceType<typeof CustomForm>>()

const equipmentVisible = ref(false)
const equipmentOptions = ref<IOption[]>([])
const selectedEquipmentIds = ref<string[]>([])

const selectPersonVisible = ref(false)
const selectedPersonList = ref<IOption[]>([])

const [formData, resetFormData] = useResetRef<{
  reportUserIds: string[]
  scrapReason: string
  equipmentNo: string
  equipmentId: string
  depName: string
  imageList: IUploadPhoto[]
  equipmentName: string
  scrapProcdefName: string
}>({
  reportUserIds: [],
  scrapReason: "",
  equipmentNo: "",
  equipmentId: "",
  depName: "",
  imageList: [],
  equipmentName: "",
  scrapProcdefName: ""
})

const formConfigs = computed<ICustomFormConfigItem[]>(() => [
  {
    componentType: "el-input",
    field: "scrapProcdefName",
    label: "流程名称",
    props: {
      disabled: true
    }
  },
  {
    componentType: "el-select",
    field: "reportUserIds",
    label: "发起人",
    rules: [
      {
        required: true,
        message: "请选择发起人",
        trigger: "change"
      }
    ],
    props: {
      multiple: true,
      collapseTags: true,
      collapseTagsTooltip: true
    },
    events: {
      visibleChange: ($event: boolean) => onSelectPersonVisibleChange($event),
      change: ($event: string[]) => onSelectPersonChange($event)
    }
  },
  {
    componentType: "el-input",
    field: "depName",
    label: "所属部门",
    props: {
      disabled: true
    }
  },
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
      customChildren: equipmentOptions.value.map((item) => ({
        componentType: "el-option",
        props: {
          label: item.label,
          value: item.value
        }
      }))
    },
    events: {
      visibleChange: ($event: boolean) => onEquipmentVisibleChange($event),
      clear: () => onEquipmentVisibleClear()
    }
  },
  {
    componentType: "el-input",
    field: "equipmentNo",
    label: "设备编号",
    props: {
      disabled: true
    }
  },
  {
    componentType: "el-input",
    field: "scrapReason",
    label: "报废原因",
    props: {
      type: "textarea",
      maxlength: 200,
      showWordLimit: true
    },
    rules: [
      {
        required: true,
        message: "请填写报废原因",
        trigger: "blur"
      }
    ]
  },
  {
    componentType: markRaw(UploadImage),
    field: "imageList",
    label: "报废附件"
  }
])

watch(
  () => props.modelValue,
  (val) => {
    if (!val) {
      customFormRef.value?.resetForm()
      resetFormData()
      equipmentOptions.value = []
      selectedEquipmentIds.value = []
      selectedPersonList.value = []
    }
  }
)

/** 选择发起人下拉框visible-change回调 */
const onSelectPersonVisibleChange = (visible: boolean) => {
  if (visible) {
    selectPersonVisible.value = true
  }
}

/** 选择发起人下拉框change回调 */
const onSelectPersonChange = (val: string[]) => {
  if (!val || !val.length) {
    formData.value.depName = ""
  }
}

/** 选择发起人成功回调 */
const onSelectPersonSuccess = (data: ITree[]) => {
  selectedPersonList.value = data.map((item) => ({
    label: item.label,
    value: item.id
  }))
  formData.value.reportUserIds = data.map((item) => item.id)
  formData.value.depName = data.map((item) => item.depName).join(",")
}

/**
 * 设备名称下拉框可见变化
 */
const onEquipmentVisibleChange = (visible: boolean) => {
  visible && (equipmentVisible.value = true)
}

/**
 * 设备名称下拉框清空
 */
const onEquipmentVisibleClear = () => {
  formData.value.equipmentId = ""
  formData.value.equipmentNo = ""
  formData.value.equipmentName = ""
  formData.value.scrapProcdefName = ""
  selectedEquipmentIds.value = []
}

/**
 * 选择设备成功回调
 */
const onSelectEquipmentSuccess = (data: IEquipmentPageItem[]) => {
  if (!data.length) {
    return
  }
  const { equipmentNo, id, equipmentName, equipmentModel } = data[0]
  formData.value.equipmentNo = equipmentNo
  formData.value.equipmentId = id
  formData.value.equipmentName = equipmentName
  formData.value.scrapProcdefName = equipmentModel?.scrapProcdefName
  equipmentOptions.value = [
    {
      label: equipmentName,
      value: id
    }
  ]
  selectedEquipmentIds.value = [id]
}

/**
 * 保存操作
 */
const onSubmitClick = async () => {
  const valid = await customFormRef.value?.validateForm()
  if (!valid) {
    return
  }

  const { imageList, ...otherParams } = formData.value
  await requestCreateEquipmentScrap({
    fileIds: !imageList.length ? [] : [imageList[0].fileId],
    equipmentId: otherParams.equipmentId,
    reportUserId: otherParams.reportUserIds[0],
    scrapReason: otherParams.scrapReason
  })
  ElMessage.success("新建成功")
  visible.value = false
  emit("success")
}
</script>

<style lang="scss" scoped></style>
