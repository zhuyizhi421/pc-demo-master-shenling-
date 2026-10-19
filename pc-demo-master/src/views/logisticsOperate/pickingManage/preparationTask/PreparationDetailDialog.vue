<template>
  <CustomDialog v-model="visible" title="查看领料详情" size="large">
    <CustomDescription :data="detailData!" :configs="detailConfig" :columns="4">
    </CustomDescription>

    <CustomTable v-model:table-data="tableData" :config="tableConfig">
      <template #operation-default="{ row }">
        <el-button type="primary" link @click="printBarcode([row.barcode])">打印标签码</el-button>
      </template>
    </CustomTable>
  </CustomDialog>
</template>

<script setup lang="ts">
import { requestPreparationMaterialDetailProductList } from "@/api/logistics/preparationMaterial"
import CustomDescription from "@/components/CustomDescription/index.vue"
import type { ICustomDescriptionConfig } from "@/components/CustomDescription/type"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ITableConfig } from "@/components/CustomTable/type"
import useBarcodePrint from "@/hooks/useBarcodePrint"
import type { IPreparationTaskDetailProduct } from "@/types/logistics/preparationMaterial"
import { isEffectiveValue, precisionConversion } from "@/utils/common"

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    id: string
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

const detailData = ref<IPreparationTaskDetailProduct | null>(null)
const detailConfig = ref<ICustomDescriptionConfig[]>([
  {
    field: "productModelName",
    label: "产品名称："
  },
  {
    field: "productModelCode",
    label: "产品编号："
  },
  {
    field: "pickedQuantity",
    label: "已领取数量：",
    formatter: () =>
      isEffectiveValue(detailData.value?.pickedQuantity)
        ? precisionConversion(detailData.value!.pickedQuantity, detailData.value!.decimalNumber)
        : ""
  },
  {
    field: "unitName",
    label: "单位："
  }
])

const tableData = ref<IPreparationTaskDetailProduct["productDetailList"]>([])
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
      formatter: ({ quantity, decimalNumber }) =>
        isEffectiveValue(quantity) ? precisionConversion(quantity, decimalNumber) : ""
    },
    {
      prop: "unitName",
      label: "单位",
      minWidth: 120,
      align: "center"
    },
    {
      prop: "outboundTime",
      label: "领料出库时间",
      minWidth: 160,
      align: "align"
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
      getPreparationDetail(props.id)
    }
  }
)

// 获取收货详情
const getPreparationDetail = async (id: string) => {
  const data = await requestPreparationMaterialDetailProductList(id)
  detailData.value = data
  tableData.value = data.productDetailList
}
</script>

<style lang="scss" scoped></style>
