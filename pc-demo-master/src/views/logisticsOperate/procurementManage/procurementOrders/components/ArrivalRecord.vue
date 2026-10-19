<template>
  <CustomDialog v-model="visible" title="查看收货详情" size="large">
    <CustomDescription :data="detailData!" :configs="detailConfig"></CustomDescription>

    <CustomTable v-model:table-data="tableData" :config="tableConfig">
      <template #operation-default="{ row }">
        <el-button type="primary" size="small" link @click="onReprintClick(row)"
          >打印标签码</el-button
        >
      </template>
    </CustomTable>
  </CustomDialog>
</template>

<script setup lang="ts">
import { getLogPurchaseDetailArrivalDetail } from "@/api/logistics/purchase"
import { queryPurchaseReceiveDetail } from "@/api/logistics/purchase-manage/parchaseReceive"
import CustomDescription from "@/components/CustomDescription/index.vue"
import type { ICustomDescriptionConfig } from "@/components/CustomDescription/type"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ITableConfig } from "@/components/CustomTable/type"
import useBarcodePrint from "@/hooks/useBarcodePrint"
import type { LogisticsPurchaseArrivalInstanceVO } from "@/types/logistics/purchase"
import { isEffectiveValue, precisionConversion } from "@/utils/common"

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    data: {
      receiptId: string
      productModelId: string
      unitId: string
    }
  }>(),
  {}
)
const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val)
})

const { printBarcode } = useBarcodePrint()

const detailData = ref<{
  arrivalCode: string
  productModelName: string
  productModelCode: string
  arrivalTime: string
  arrivalQuantity: string
  unitName: string
}>()
const detailConfig = ref<ICustomDescriptionConfig[]>([
  {
    field: "arrivalCode",
    label: "收货单号："
  },
  {
    field: "productModelName",
    label: "产品名称："
  },
  {
    field: "productModelCode",
    label: "产品编号："
  },
  {
    field: "arrivalTime",
    label: "收货时间："
  },
  {
    field: "arrivalQuantity",
    label: "收货数量："
  },
  {
    field: "unitName",
    label: "单位："
  }
])

const tableData = ref<LogisticsPurchaseArrivalInstanceVO[]>([])
const tableConfig = ref<ITableConfig>({
  height: 400,
  columns: [
    {
      prop: "barcode",
      label: "标签码",
      minWidth: 160
    },
    {
      prop: "productModelName",
      label: "产品名称",
      minWidth: 160
    },
    {
      prop: "quantity",
      label: "数量",
      minWidth: 120,
      align: "right"
    },
    {
      prop: "unit",
      label: "单位",
      minWidth: 120,
      align: "center"
    },
    {
      prop: "operation",
      label: "操作",
      width: 120,
      align: "center",
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

watch(
  () => props.modelValue,
  (val: boolean) => {
    if (val) {
      getProcurementReceiveDetail()
      getArrivalRecord()
    }
  }
)

/** 获取采购收货详情 */
const getProcurementReceiveDetail = async () => {
  const data = await queryPurchaseReceiveDetail({ id: props.data.receiptId })
  const targetProduct = data.detailContent.find(
    (item) => item.productModelId === props.data.productModelId && item.unitId === props.data.unitId
  )

  detailData.value = {
    arrivalCode: data.receiptCode,
    productModelCode: targetProduct!.productModelCode,
    productModelName: targetProduct!.productModelName,
    arrivalTime: data.receiveTime,
    arrivalQuantity: isEffectiveValue(targetProduct!.receiveQuantity)
      ? precisionConversion(targetProduct!.receiveQuantity, targetProduct!.decimalNumber)
      : "",
    unitName: targetProduct!.unitName
  }
}

/** 获取收货详情记录 */
const getArrivalRecord = async () => {
  const data = await getLogPurchaseDetailArrivalDetail({
    ...props.data
  })
  tableData.value = data
}

const onReprintClick = (row: any) => {
  printBarcode([row.barcode])
}
</script>

<style lang="scss" scoped></style>
