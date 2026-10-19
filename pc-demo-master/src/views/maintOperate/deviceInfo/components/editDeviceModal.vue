<template>
  <div>
    <CustomDialog
      v-model="show"
      :title="status === 'create' ? '新建设备台账' : '编辑设备台账'"
      @close="resetModalData()"
    >
      <CustomForm ref="formRef" v-model="modalData" :label-width="130" :configs="formConfigs">
        <template #barcode-default>
          <el-input
            v-model="modalData.barcode"
            placeholder=""
            :disabled="isBindBarcode || modalData.autoGenerateBarcode"
          />
          <el-checkbox
            v-if="!isBindBarcode"
            v-model="modalData.autoGenerateBarcode"
            :true-value="1"
            :false-value="0"
            label="自动生成"
            style="margin-left: 10px"
            @change="onAutoGenerateCodeChange"
          />
        </template>
        <template #startPatrolDate-default>
          <el-date-picker
            style="width: 100%"
            :disabled="status === 'edit'"
            :value-format="FORMAT_DATE"
            v-model="modalData.startPatrolDate"
            type="date"
            placeholder="参与巡检日期"
            :clearable="false"
            :disabled-date="disabledDate"
          />
        </template>
      </CustomForm>
      <template #footer>
        <div>
          <el-button @click="show = false">取消</el-button>
          <el-button type="primary" @click="onSubmitClick()">确定</el-button>
        </div>
      </template>
    </CustomDialog>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import {
  requestCreateEquipment,
  requestUpdateEquipment
} from "@/api/operation/equipment/equipment-info"
import { requestAllEquipmentModel } from "@/api/operation/equipment/equipment-model"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import { FORMAT_DATE } from "@/constant/time"
import useResetRef from "@/hooks/useResetRef"
import type { IEquipmentModelPageItem } from "@/types/maintain/equipment-manage/equipment-model"
import { formatDate } from "@/views/maintOperate/status"

const [modalData, resetModalData] = useResetRef({
  equipmentCode: "",
  equipmentNo: "",
  equipmentModelId: "",
  equipmentName: "",
  equipmentCategoryName: "",
  manufacturerNo: "",
  remarks: "",
  startPatrolDate: dayjs().format(FORMAT_DATE),
  scadaControl: 0,
  scadaIdentification: "",
  barcode: "",
  autoGenerateBarcode: 0
})

const props = defineProps<{
  status: "edit" | "create"
}>()

const emits = defineEmits<{
  (e: "onOk"): void
}>()

const show = ref(false)
const formRef = ref<InstanceType<typeof CustomForm>>()

const formConfigs = computed<ICustomFormConfigItem[]>(() => [
  {
    componentType: "el-input",
    label: "设备编号",
    field: "equipmentNo",
    props: {
      placeholder: "不填则自动生成设备编号",
      get disabled() {
        return props.status !== "create"
      }
    }
  },
  {
    componentType: "el-input",
    label: "设备名称",
    field: "equipmentName",
    rules: [
      {
        required: true,
        message: "请输入设备名称",
        trigger: "blur"
      }
    ],
    props: {
      placeholder: "请输入设备名称"
    }
  },
  {
    componentType: "div",
    label: "设备标签码",
    field: "barcode",
    props: { class: "barcode-item w-[100%]" },
    slots: {
      default: "barcode-default"
    }
  },
  {
    componentType: "el-select",
    label: "类型名称",
    field: "equipmentModelId",
    rules: [
      {
        required: true,
        message: "请选择类型名称",
        trigger: "blur"
      }
    ],
    props: {
      clearable: true,
      filterable: true,
      placeholder: "请选择类型名称",
      get customChildren() {
        return equipmentModelOptions.value.map((item) => {
          return {
            componentType: "el-option",
            props: {
              label: `${item.modelName}${item.deviceModel ? ` / ${item.deviceModel}` : ""}`,
              value: item.id
            }
          }
        })
      }
    },
    events: {
      change: (val: string) => {
        onDeviceModelChange(val)
      }
    }
  },
  {
    componentType: "el-input",
    label: "设备分类",
    field: "equipmentCategoryName",
    props: {
      disabled: true
    }
  },
  {
    componentType: "el-input",
    label: "原厂编号",
    field: "manufacturerNo",
    props: {
      placeholder: "请输入原厂编号"
    }
  },
  {
    componentType: "div",
    label: "参与巡检日期",
    field: "startPatrolDate",
    props: { class: "w-[100%]" },
    rules: [
      {
        required: true,
        message: "请选择",
        trigger: "blur"
      }
    ],
    slots: {
      default: "startPatrolDate-default"
    }
  },
  {
    componentType: "el-input",
    label: "备注",
    field: "remarks",
    props: {
      placeholder: "请输入备注",
      type: "textarea",
      maxlength: 200,
      showWordLimit: true
    }
  }
])

const isBindBarcode = ref(false)
const equipmentModelOptions = ref<IEquipmentModelPageItem[]>([])

const getEquipmentModelOptions = async () => {
  const res = await requestAllEquipmentModel()
  equipmentModelOptions.value = res || []
}

const onAutoGenerateCodeChange = (checked: boolean) => {
  if (checked) {
    modalData.value.barcode = ""
  }
}

const onDeviceModelChange = (value: string) => {
  const target = equipmentModelOptions.value.find((item) => item.id === value)
  modalData.value.equipmentCategoryName = target?.equipmentCategoryName || ""
  if (props.status === "create" && !String(modalData.value.equipmentName || "").trim()) {
    modalData.value.equipmentName = target?.modelName || ""
  }
}

const onSubmitClick = async () => {
  try {
    const valid = await formRef.value?.validateForm()
    if (!valid) return
    let fn = requestUpdateEquipment
    if (props.status === "create") {
      fn = requestCreateEquipment
    }
    const target = equipmentModelOptions.value.find((item) => item.id === modalData.value.equipmentModelId)
    await fn({
      ...(modalData.value as any),
      equipmentName: modalData.value.equipmentName || target?.modelName || ""
    })
    ElMessage.success(props.status === "create" ? "新建成功" : "编辑成功")
    emits("onOk")
    show.value = false
  } catch (error) {
    console.log(error)
  }
}

const disabledDate = (time: Date) => {
  return time.getTime() < dayjs().subtract(1, "day").valueOf()
}

const setShow = () => {
  show.value = true
  isBindBarcode.value = false
  getEquipmentModelOptions()
}

const setModalData = (data: any) => {
  modalData.value = data
  modalData.value.equipmentName = data.equipmentName || ""
  modalData.value.manufacturerNo = data.manufacturerNo || ""
  modalData.value.barcode = data.barCode
  modalData.value.startPatrolDate = data.startPatrolDate ? formatDate(data.startPatrolDate) : ""
  isBindBarcode.value = !!data.barCode
}

defineExpose({
  setShow,
  setModalData
})
</script>

<style scoped lang="scss">
.barcode-item {
  &:deep(.el-form-item__content) {
    display: flex;

    .el-input {
      flex: 1;
    }
  }
}
</style>
