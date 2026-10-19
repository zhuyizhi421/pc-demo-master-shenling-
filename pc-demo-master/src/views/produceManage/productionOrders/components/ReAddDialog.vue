<template>
  <CustomDialog v-model="dialogVisible" title="追加数量">
    <CustomForm
      ref="customFormRef"
      v-model="formData"
      :configs="formConfigs"
      :labelWidth="120"
    ></CustomForm>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="onConfirmClick()">确定</el-button>
      </div>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import { queryProductionOrderDetail, requestProductionOrderReAdd } from "@/api/scheduling"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import useResetRef from "@/hooks/useResetRef"

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    id: string
  }>(),
  {}
)

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
  (e: "success", orderNo: string): void
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit("update:modelValue", value)
})

const customFormRef = ref<InstanceType<typeof CustomForm>>()

const [formData, resetFormData] = useResetRef<{
  orderNo: string
  productName: string
  productNo: string
  orderAmount: number
  unitName: string
  quantity?: number
  deliveryDate: string
  remark: string
}>({
  orderNo: "",
  productName: "",
  productNo: "",
  orderAmount: 0,
  unitName: "",
  quantity: undefined,
  deliveryDate: "",
  remark: ""
})

const formConfigs = computed<ICustomFormConfigItem[]>(() => [
  {
    componentType: "el-input",
    label: "订单编号：",
    field: "orderNo",
    props: {
      disabled: true
    }
  },
  {
    componentType: "el-input",
    label: "产品名称：",
    field: "productName",
    props: {
      disabled: true
    }
  },
  {
    componentType: "el-input",
    label: "产品编号：",
    field: "productNo",
    props: {
      disabled: true
    }
  },
  {
    componentType: "el-input",
    label: "订单数量：",
    field: "orderAmount",
    props: {
      disabled: true
    }
  },
  {
    componentType: "el-input",
    label: "单位：",
    field: "unitName",
    props: {
      disabled: true
    }
  },
  {
    componentType: "el-input-number",
    label: "追加数量：",
    field: "quantity",
    props: {
      style: {
        width: "100%"
      },
      placeholder: "请输入追加数量",
      min: 0.01,
      precision: 2,
      controls: false
    },
    rules: [
      { required: true, message: "请输入追加数量", trigger: "blur" },
      {
        validator: (_rule, value, callback) => {
          if (Number(value) <= 0) {
            callback(new Error("追加数量必须大于0"))
            return
          }
          callback()
        },
        trigger: "blur"
      }
    ]
  },
  {
    componentType: "el-date-picker",
    label: "交货日期：",
    field: "deliveryDate",
    props: {
      type: "date",
      placeholder: "请选择交货日期",
      valueFormat: "YYYY-MM-DD"
    }
  },
  {
    componentType: "el-input",
    label: "本次追加备注：",
    field: "remark",
    props: {
      type: "textarea",
      maxlength: 200,
      placeholder: "请输入",
      showWordLimit: true
    }
  }
])

watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      getDetail()
    } else {
      resetFormData()
      customFormRef.value?.resetForm?.()
    }
  }
)

/**
 * 获取生产订单详情
 */
const getDetail = async () => {
  const data = await queryProductionOrderDetail(props.id)
  if (!data) {
    return
  }
  formData.value = {
    orderNo: data.no,
    productName: data.productModel?.name ?? "",
    productNo: data.productModel?.code ?? "",
    orderAmount: data.orderAmount ?? 0,
    unitName: data.unitItem?.unitName ?? "",
    quantity: undefined,
    deliveryDate: data.deliveryDate ?? "",
    remark: ""
  }
}

/**
 * 确认操作
 */
const onConfirmClick = async () => {
  await customFormRef.value?.validateForm()
  const quantity = Number(formData.value.quantity || 0)
  let params = {
    productionOrderId: props.id,
    // 兼容不同版本后端字段命名，避免返回成功但未写入追加记录
    orderId: props.id,
    id: props.id,
    deliveryDate: formData.value.deliveryDate,
    quantity,
    addAmount: quantity,
    remark: formData.value.remark,
    remarks: formData.value.remark
  }
  await requestProductionOrderReAdd(params)
  ElMessage.success("追加数量成功")
  dialogVisible.value = false
  emit("success", formData.value.orderNo)
}
</script>

<style lang="scss" scoped></style>
