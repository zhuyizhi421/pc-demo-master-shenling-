<template>
  <CustomDialog title="新建载具台账" v-model="visible" size="mini">
    <CustomForm ref="vehicleInfoCreateRef" v-model="formData" :configs="vehicleInfoCreateFormConfig" />

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="onSubmitVehicleCreateClick()">确定</el-button>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import { getVehicleSaveOrUpdate } from "@/api/operation/vehicle/vehicleInfo"
import { getVehicleModelPage } from "@/api/operation/vehicle/vehicleModel"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import useResetRef from "@/hooks/useResetRef"
import type { IVehicleModelPageItem } from "@/types/maintain/vehicle"

const props = withDefaults(
  defineProps<{
    modelValue: boolean
  }>(),
  {}
)

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
  (e: "success"): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val)
})

const vehicleModelOptions = ref<IVehicleModelPageItem[]>([])
const vehicleInfoCreateRef = ref<InstanceType<typeof CustomForm>>()
const inheritedVehicleName = ref("")

const [formData, resetFormData] = useResetRef<any>({
  remarks: "",
  vehicleModelId: "",
  vehicleCategoryName: "",
  name: "",
  no: "",
  barcode: "",
  autoGenerateCode: false
})

const vehicleInfoCreateFormConfig = computed<ICustomFormConfigItem[]>(() => [
  {
    label: "载具名称",
    componentType: "el-input",
    field: "name",
    rules: [{ required: true, message: "请输入载具名称", trigger: "blur" }],
    props: {
      placeholder: "请输入载具名称"
    }
  },
  {
    label: "载具编号",
    componentType: "el-input",
    field: "no",
    props: {
      placeholder: "不填则自动生成"
    }
  },
  {
    label: "载具标签码",
    componentType: "div",
    field: "",
    props: {
      class: "flex",
      customChildren: [
        {
          componentType: "el-input",
          field: "",
          props: {
            placeholder: "请输入",
            modelValue: formData.value.barcode,
            disabled: formData.value.autoGenerateCode
          },
          events: {
            "update:modelValue": (value: string) => {
              formData.value.barcode = value
            }
          }
        },
        {
          componentType: "el-checkbox",
          field: "autoGenerateCode",
          props: {
            label: "自动生成",
            modelValue: formData.value.autoGenerateCode,
            style: "margin-left: 10px"
          },
          events: {
            change: onAutoGenerateCodeChange,
            "update:modelValue": (value: boolean) => {
              formData.value.autoGenerateCode = value
            }
          }
        }
      ]
    }
  },
  {
    componentType: "el-select",
    field: "vehicleModelId",
    label: "载具信息",
    rules: [{ required: true, message: "请选择载具信息", trigger: "blur" }],
    props: {
      placeholder: "请选择",
      clearable: true,
      filterable: true,
      customChildren: vehicleModelOptions.value.map((item) => ({
        componentType: "el-option",
        props: {
          label: item.modelName,
          value: item.id
        }
      }))
    },
    events: {
      change: onVehicleModelChange
    }
  },
  {
    componentType: "el-input",
    label: "载具分类",
    field: "vehicleCategoryName",
    props: {
      disabled: true
    }
  },
  {
    componentType: "el-input",
    label: "备注",
    field: "remarks",
    props: {
      type: "textarea",
      placeholder: "请输入备注",
      maxlength: 200,
      showWordLimit: true
    }
  }
])

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      getVehicleModelOptions()
    } else {
      vehicleInfoCreateRef.value?.resetForm()
      inheritedVehicleName.value = ""
      resetFormData()
    }
  }
)

const onAutoGenerateCodeChange = (checked: boolean) => {
  if (checked) {
    formData.value.barcode = ""
  }
}

const onSubmitVehicleCreateClick = async () => {
  const valid = await vehicleInfoCreateRef.value?.validateForm()
  if (!valid) {
    return
  }

  await getVehicleSaveOrUpdate({
    name: formData.value.name,
    remarks: formData.value.remarks || undefined,
    vehicleModelId: formData.value.vehicleModelId,
    no: formData.value.no || undefined,
    barcode: formData.value.barcode,
    autoGenerateCode: formData.value.autoGenerateCode
  })
  ElMessage.success("新建成功")
  visible.value = false
  emit("success")
}

const onVehicleModelChange = (val: string) => {
  const previousInheritedVehicleName = inheritedVehicleName.value
  const target = vehicleModelOptions.value.find((item) => item.id === val)
  const nextInheritedVehicleName = target?.modelName || ""

  if (!formData.value.name || formData.value.name === previousInheritedVehicleName) {
    formData.value.name = nextInheritedVehicleName
  }
  formData.value.vehicleCategoryName = target?.vehicleCategoryName || ""
  inheritedVehicleName.value = nextInheritedVehicleName
}

const getVehicleModelOptions = async () => {
  const { records } = await getVehicleModelPage({ pageQuery: { pageNum: 1, pageSize: 1000 } })
  if (!records) {
    return
  }
  vehicleModelOptions.value = records
}
</script>

<style lang="scss" scoped></style>
