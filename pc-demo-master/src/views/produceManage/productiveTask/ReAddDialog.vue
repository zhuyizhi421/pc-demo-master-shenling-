<template>
  <CustomDialog v-model="dialogVisible" title="追加数量" size="mini" draggable>
    <CustomForm ref="customFormRef" v-model="formData" :configs="formConfigs" :label-width="130">
    </CustomForm>

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

import {
  getAvailablePlanQuantity,
  queryProductionTaskDetail,
  requestAddProductionTaskQuantity
} from "@/api/scheduling"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import type { IProductionTaskPageItem } from "@/types/production-manage/product-task"

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    productionTaskId: string
  }>(),
  {}
)

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
  (e: "success"): void
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit("update:modelValue", value)
})

const detailData = ref<IProductionTaskPageItem>()
const customFormRef = ref<InstanceType<typeof CustomForm>>()
const formData = reactive({
  addNum: 0
})
const maxNumber = ref(100)

const formConfigs = computed<ICustomFormConfigItem[]>(() => [
  {
    componentType: "el-input",
    label: "订单编号：",
    field: "addNum",
    props: {
      value: detailData.value?.productionOrderNo,
      disabled: true
    }
  },
  {
    componentType: "el-input",
    label: "任务编号：",
    field: "no",
    props: {
      value: detailData.value?.no,
      disabled: true
    }
  },
  {
    componentType: "el-input",
    label: "产品名称：",
    field: "productModelName",
    props: {
      value: detailData.value?.productModelName,
      disabled: true
    }
  },
  {
    componentType: "el-input",
    label: "产品编号：",
    field: "productModelNo",
    props: {
      value: detailData.value?.productModelNo,
      disabled: true
    }
  },
  {
    componentType: "el-input",
    label: "订单数量：",
    field: "taskAmount",
    props: {
      value: detailData.value?.taskAmount,
      disabled: true
    }
  },
  {
    componentType: "el-input",
    label: "单位：",
    field: "unitName",
    props: {
      value: detailData.value?.unitName,
      disabled: true
    }
  },
  {
    componentType: "el-input",
    label: "可追加排产数量：",
    field: "maxNumber",
    props: {
      value: maxNumber.value,
      disabled: true
    }
  },
  {
    componentType: "el-input-number",
    label: "追加数量：",
    field: "addNum",
    rules: [
      { required: true, message: "请输入追加数量", trigger: "blur" },
      {
        validator: (rule, value, callback) => {
          if (value > maxNumber.value) {
            // 这里的100需要替换为从接口获取的实际最大值
            callback(new Error("不能超过可追加排产数量"))
          } else {
            callback()
          }
        },
        trigger: "blur"
      }
    ],
    props: {
      min: 0,
      precision: 2,
      controls: false,
      class: "w-[100%]",
      placeholder: "请输入追加数量"
    }
  }
])

watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      getDetail()
    } else {
      customFormRef.value?.resetForm()
    }
  }
)

/**
 * 获取详情
 */
const getDetail = async () => {
  try {
    const res = await queryProductionTaskDetail(props.productionTaskId)
    const availablePlanQuantity = await getAvailablePlanQuantity(res.productionOrderPlanId)
    detailData.value = res
    maxNumber.value = availablePlanQuantity
  } catch (error) {
    console.log(error)
  }
}

/**
 * 确认操作
 */
const onConfirmClick = async () => {
  const valid = await customFormRef.value?.validateForm()
  if (!valid) {
    return
  }
  try {
    await requestAddProductionTaskQuantity({
      productionTaskId: props.productionTaskId,
      quantity: formData.addNum
    })
    ElMessage.success("追加数量成功")
    emit("success")
    dialogVisible.value = false
  } catch (error) {
    console.log(error)
  }
}
</script>

<style lang="scss" scoped></style>
