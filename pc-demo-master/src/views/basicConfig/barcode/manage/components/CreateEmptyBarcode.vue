<template>
  <CustomDialog v-model="dialogVisible" title="新增空白码" size="mini" @close="emit('close')">
    <CustomForm ref="formRef" v-model="formData" :configs="formConfigs">
      <template #entityType-labelSlots="{ label }">
        <div class="label-wrapper">
          <el-tooltip
            effect="dark"
            content="限定绑定类型后，条码只能被相应的实例类型绑定"
            placement="top-start"
          >
            <el-icon><QuestionFilled /></el-icon>
          </el-tooltip>
          <span class="label-text">{{ label }}</span>
        </div>
      </template>
    </CustomForm>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="emit('close')">取消</el-button>
        <el-button type="primary" @click="onCreateClick()">创建</el-button>
        <el-button type="primary" @click="onCreateAndExportClick()">创建并导出</el-button>
        <el-button type="primary" @click="onCreateAndPrintClick()">创建并打印</el-button>
      </div>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import {
  requestBatchBarcodeCreateAndExport,
  requestBatchBarcodeCreateAndPrint,
  requestCreateBatchBarcode
} from "@/api/barcode"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import { EnumBarcodeType, EnumBarcodeTypeMap } from "@/constant/enums"
import useBarcodePrint from "@/hooks/useBarcodePrint"
import { downloadFile } from "@/utils/common"

const emit = defineEmits<{
  (e: "success"): void
  (e: "close"): void
}>()

const { printBarcode } = useBarcodePrint()

const dialogVisible = ref(true)
const formRef = ref<InstanceType<typeof CustomForm>>()
const formData = reactive({
  quantity: 1,
  entityType: EnumBarcodeType.EMPTY
})

const barcodeTypeOptions = Object.entries(EnumBarcodeTypeMap).map(([key, value]) => {
  return {
    label: +key === EnumBarcodeType.EMPTY ? "不限" : value,
    value: +key
  }
})

const formConfigs = ref<ICustomFormConfigItem[]>([
  {
    componentType: "el-input-number",
    label: "新增张数：",
    field: "quantity",
    rules: [{ required: true, message: "请输入新增张数", trigger: "blur" }],
    props: {
      "controls-position": "right",
      clearable: false,
      min: 1,
      "step-strictly": true
    }
  },
  {
    componentType: "el-select",
    label: "绑定类型：",
    field: "entityType",
    rules: [{ required: true, message: "请选择绑定类型", trigger: "change" }],
    props: {
      placeholder: "请选择",
      customChildren: barcodeTypeOptions.map((item) => {
        return {
          componentType: "el-option",
          props: { label: item.label, value: item.value }
        }
      })
    },
    labelSlots: "entityType-labelSlots",
    slots: {
      label: "entityType-label"
    }
  }
])

/** 创建操作 */
const onCreateClick = async () => {
  const valid = await formRef.value?.validateForm()
  if (!valid) return
  await requestCreateBatchBarcode({ ...formData })
  ElMessage.success("创建成功")
  emit("success")
  emit("close")
}

/** 创建并导出操作 */
const onCreateAndExportClick = async () => {
  const valid = await formRef.value?.validateForm()
  if (!valid) return
  const res = await requestBatchBarcodeCreateAndExport({ ...formData })
  downloadFile(res)
  ElMessage.success("创建并导出成功")
  emit("success")
  emit("close")
}

/** 创建并打印操作 */
const onCreateAndPrintClick = async () => {
  const valid = await formRef.value?.validateForm()
  if (!valid) return
  const res: any = await requestBatchBarcodeCreateAndPrint({ ...formData })
  const barcodeList = res.map((item: any) => item.barcode)
  printBarcode(barcodeList, () => {
    ElMessage.success("创建并打印成功")
    emit("success")
    emit("close")
  })
}
</script>

<style lang="scss" scoped>
.label-wrapper {
  display: flex;
  align-items: center;

  .label-text {
    margin-left: 8px;
  }
}
</style>
