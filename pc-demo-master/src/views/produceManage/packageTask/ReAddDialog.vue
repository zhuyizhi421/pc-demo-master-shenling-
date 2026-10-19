<template>
  <CustomDialog v-model="dialogVisible" title="追加数量" size="medium" draggable>
    <CustomForm v-model="detailData" :configs="formConfigs" :label-width="130"></CustomForm>
    <CustomTable
      ref="productTableRef"
      v-model:table-data="productTableData"
      :config="productTableConfig"
    >
      <template #addQty-default="{ row }">
        <el-input
          v-model="row.addQty"
          type="number"
          placeholder="请输入"
          :min="0"
          :max="row.schedulableQty"
          clearable
        />
      </template>
    </CustomTable>
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
  queryPackageTaskDetail,
  requestAppendNumberPackageTask
} from "@/api/produce/package-task/package-task"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import type { IPackageTaskAppendNumberTableItem as ITableRow } from "@/types/production-manage/package-task"
import { isEffectiveValue, precisionConversion } from "@/utils/common"

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    packageTaskId: string
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

const detailData = ref({
  shipmentNo: "",
  packageTaskNo: ""
})
const formConfigs = computed<ICustomFormConfigItem[]>(() => [
  {
    componentType: "el-input",
    label: "发货通知单号：",
    field: "shipmentNo",
    props: {
      disabled: true
    }
  },
  {
    componentType: "el-input",
    label: "包装任务编号：",
    field: "packageTaskNo",
    props: {
      disabled: true
    }
  }
])

const productTableRef = ref<ComponentExposed<typeof CustomTable>>()
const productTableData = ref<ITableRow[]>([])
const productTableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "productModelName",
      label: "产品名称",
      minWidth: 160
    },
    {
      prop: "productModelSpec",
      label: "产品规格",
      minWidth: 160,
      formatter: (row: any) => row.productModelSpec || row.productModel?.specification || "-"
    },
    {
      prop: "productModelCode",
      label: "产品编号",
      minWidth: 160
    },
    {
      prop: "planQty",
      label: "计划数量",
      width: 160,
      align: "right",
      formatter: ({ planQty, decimalNumber }) =>
        isEffectiveValue(planQty) ? precisionConversion(planQty, decimalNumber) : ""
    },
    {
      prop: "schedulableQty",
      label: "可追加排产数量",
      width: 160,
      align: "right",
      formatter: ({ schedulableQty, decimalNumber }) =>
        isEffectiveValue(schedulableQty) ? precisionConversion(schedulableQty, decimalNumber) : ""
    },
    {
      prop: "addQty",
      label: "追加数量",
      width: 160,
      align: "center",
      slots: {
        default: "addQty-default"
      }
    },
    {
      prop: "unitName",
      label: "单位",
      width: 90,
      align: "center"
    }
  ]
})

watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      getDetail()
    } else {
      detailData.value = {
        shipmentNo: "",
        packageTaskNo: ""
      }
      productTableData.value = []
    }
  }
)

/**
 * 获取详情
 */
const getDetail = async () => {
  const res = await queryPackageTaskDetail(props.packageTaskId)
  detailData.value = {
    shipmentNo: res.deliveryCode,
    packageTaskNo: res.no
  }
  productTableData.value = res.products.map((item) => {
    return {
      ...item,
      addQty: undefined
    }
  })
}

/**
 * 确认操作
 */
const onConfirmClick = async () => {
  const isEmpty = productTableData.value.some((item) => !item.addQty)
  if (isEmpty) {
    ElMessage.warning("请输入追加数量")
    return
  }

  let params = {
    taskId: props.packageTaskId,
    additions: productTableData.value.map((item) => {
      return {
        productModelId: item.productModelId,
        addQty: item.addQty!
      }
    })
  }
  await requestAppendNumberPackageTask(params)
  ElMessage.success("追加数量成功")
  emit("success")
  dialogVisible.value = false
}
</script>

<style lang="scss" scoped></style>
