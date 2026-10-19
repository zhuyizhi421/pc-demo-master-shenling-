<template>
  <CustomDialog v-model="visible" title="查看入库详情" size="large">
    <CustomDescription :data="detailData!" :configs="detailConfig"></CustomDescription>

    <CustomTable v-model:table-data="tableData" :config="tableConfig">
      <template #operation-default="{ row }">
        <el-button type="primary" link @click="onReprintClick(row)">打印标签码</el-button>
      </template>
    </CustomTable>
  </CustomDialog>
</template>

<script setup lang="ts">
import { requestInboundDetail } from "@/api/logistics/purchase"
import CustomDescription from "@/components/CustomDescription/index.vue"
import type { ICustomDescriptionConfig } from "@/components/CustomDescription/type"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ITableConfig } from "@/components/CustomTable/type"
import useBarcodePrint from "@/hooks/useBarcodePrint"
import type { LogisticsPurchaseInboundRecord } from "@/types/logistics/purchase"
import { isEffectiveValue, precisionConversion } from "@/utils/common"

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    data: {
      inboundId: string
      productModelId: string
    }
  }>(),
  {}
)
const emit = defineEmits<{
  (e: "update:modelValue", val: boolean): void
}>()

const visible = computed({
  get() {
    return props.modelValue
  },
  set(val: boolean) {
    emit("update:modelValue", val)
  }
})

const { printBarcode } = useBarcodePrint()

const detailData = ref<LogisticsPurchaseInboundRecord>()
const detailConfig = ref<ICustomDescriptionConfig[]>([
  {
    field: "inboundCode",
    label: "入库单号："
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
    field: "inboundTime",
    label: "入库时间："
  },
  {
    field: "quantity",
    label: "入库数量：",
    formatter: () =>
      isEffectiveValue(detailData.value?.quantity)
        ? precisionConversion(detailData.value!.quantity, detailData.value!.decimalNumber)
        : ""
  },
  {
    field: "unitName",
    label: "单位："
  }
])

const tableData = ref<LogisticsPurchaseInboundRecord["detailVOList"]>([])
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
      align: "right",
      formatter: (row: { quantity: number; decimalNumber: number }) =>
        isEffectiveValue(row.quantity) ? precisionConversion(row.quantity, row.decimalNumber) : ""
    },
    {
      prop: "unitName",
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
  (val) => {
    if (val) {
      getInboundDetail()
    }
  }
)

// 获取入库详情
const getInboundDetail = async () => {
  const data = await requestInboundDetail({ ...props.data })
  detailData.value = data
  tableData.value = data.detailVOList
}

const onReprintClick = (row: any) => {
  printBarcode([row.barcode])
}
</script>

<style lang="scss" scoped></style>
