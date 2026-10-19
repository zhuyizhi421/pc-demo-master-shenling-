<template>
  <CustomDialog v-model="show" width="600px" title="编辑载具台账" @close="resetModalData">
    <CustomForm ref="formRef" :configs="formConfig" :label-width="90" v-model="modalData" />
    <template #footer>
      <div>
        <el-button @click="show = false">返回</el-button>
        <el-button v-if="canEdit" type="primary" @click="onSubmitClick()">保存</el-button>
      </div>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import { getVehicleItem, getVehicleSaveOrUpdate } from "@/api/operation/vehicle/vehicleInfo"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import useButtonAuth, { AuthType } from "@/hooks/useButtonAuth"
import useResetRef from "@/hooks/useResetRef"

const authType = useButtonAuth("VehicleInfoManage_update", "VehicleInfoManage_query")
const canEdit = computed(() => authType.value !== AuthType.View)

defineOptions({
  name: "VehicleInfoDetailDialog"
})

const emits = defineEmits<{
  (e: "onOk"): void
}>()

const show = ref(false)
const formRef = ref<InstanceType<typeof CustomForm>>()

const [modalData, resetModalData] = useResetRef<any>({
  name: "",
  no: "",
  vehicleModelName: "",
  vehicleModelId: "",
  vehicleCategoryName: "",
  id: "",
  barcode: "",
  autoGenerateCode: false
})

const isBindBarcode = ref(false)

const formConfig = computed<ICustomFormConfigItem[]>(() => [
  {
    label: "载具名称",
    componentType: "el-input",
    field: "name",
    rules: [{ required: true, message: "请输入载具名称", trigger: "blur" }],
    props: {
      placeholder: "请输入"
    }
  },
  {
    label: "载具编号",
    componentType: "el-input",
    field: "no",
    props: {
      disabled: true
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
            modelValue: modalData.value.barcode,
            disabled: isBindBarcode.value
          },
          events: {
            "update:modelValue": (value: string) => {
              modalData.value.barcode = value
            }
          }
        },
        {
          componentType: "el-checkbox",
          hidden: isBindBarcode.value,
          field: "autoGenerateCode",
          props: {
            label: "自动生成",
            modelValue: modalData.value.autoGenerateCode,
            style: "margin-left: 10px"
          },
          events: {
            change: onAutoGenerateCodeChange,
            "update:modelValue": (value: boolean) => {
              modalData.value.autoGenerateCode = value
            }
          }
        }
      ]
    }
  },
  {
    label: "载具信息",
    componentType: "el-input",
    field: "vehicleModelName",
    props: {
      disabled: true
    }
  },
  {
    label: "载具分类",
    componentType: "el-input",
    field: "vehicleCategoryName",
    props: {
      disabled: true
    }
  },
  {
    label: "备注",
    componentType: "el-input",
    field: "remarks",
    props: {
      type: "textarea",
      placeholder: "请输入",
      maxlength: 200,
      showWordLimit: true
    }
  }
])

const onAutoGenerateCodeChange = (checked: boolean) => {
  if (checked) {
    modalData.value.barcode = ""
  }
}

const setShow = (id: string) => {
  show.value = true
  modalData.value.id = id
  getVehicleDetail(id)
}

const getVehicleDetail = async (id: string) => {
  const res: any = await getVehicleItem(id)
  modalData.value = res
  modalData.value.autoGenerateCode = false
  isBindBarcode.value = !!res.barcode
}

const onSubmitClick = async () => {
  const valid = formRef.value?.validateForm()
  if (!valid) return

  await getVehicleSaveOrUpdate({
    id: modalData.value.id,
    name: modalData.value.name,
    remarks: modalData.value.remarks || undefined,
    vehicleModelId: modalData.value.vehicleModelId,
    autoGenerateCode: modalData.value.autoGenerateCode,
    barcode: modalData.value.barcode
  })
  ElMessage.success("保存成功")
  show.value = false
  emits("onOk")
}

defineExpose({
  setShow
})
</script>

<style scoped lang="scss"></style>
