<template>
  <CustomTitle title="盘点清单"></CustomTitle>
  <CustomTable
    ref="tableRef"
    v-model:table-data="tableData"
    :config="tableConfig"
    :query-config="queryConfig"
    class="custom-detail-table"
  >
    <template #changeQuantity-default="{ row }">
      <span :style="{ color: getChangeColor(row.changeQuantity) }">{{
        row.changeQuantity > 0
          ? `+${precisionConversion(row.changeQuantity, row?.decimalNumber ?? 2)}`
          : row.changeQuantity < 0
            ? `${precisionConversion(row.changeQuantity, row?.decimalNumber ?? 2)}`
            : precisionConversion(row.changeQuantity, row?.decimalNumber ?? 2)
      }}</span>
    </template>

    <template #operation-default="{ row }">
      <el-button link type="primary" size="small" @click="onViewOutRecordClick(row.productModelId)"
        >查看详情</el-button
      >
    </template>
  </CustomTable>
</template>

<script setup lang="ts">
import { queryWarehouseCheckDetail } from "@/api/logistics/warehouseCheck"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import type { IWarehouseCheckDetail as ITableRow } from "@/types/logistics/warehouse-check"
import { precisionConversion } from "@/utils/common"

type IOption = { label: string; value: string }

const props = withDefaults(
  defineProps<{
    id: string
    productionOptions: IOption[]
  }>(),
  {
    id: "",
    productionOptions: () => []
  }
)

const emits = defineEmits<{
  (e: "onViewOutRecordClick", productModelId: string): void
  (e: "update:productionOptions", productionOptions: IOption[]): void
}>()

const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "productModelName",
      label: "产品名称",
      minWidth: 160
    },
    {
      prop: "productModelCode",
      label: "产品编号",
      minWidth: 160
    },
    {
      prop: "originalQuantity ",
      label: "原总数",
      width: 120,
      align: "right",
      formatter: (row: ITableRow) => {
        return row.originalQuantity || row.originalQuantity == 0
          ? precisionConversion(row.originalQuantity, row?.decimalNumber ?? 2)
          : ""
      }
    },
    {
      prop: "checkQuantity",
      label: "实盘总数",
      width: 120,
      align: "right",
      formatter: (row: ITableRow) => {
        return row.checkQuantity || row.checkQuantity == 0
          ? precisionConversion(row.checkQuantity, row?.decimalNumber ?? 2)
          : ""
      }
    },
    {
      prop: "changeQuantity",
      label: "变更总数",
      width: 120,
      align: "right",
      slots: {
        default: "changeQuantity-default"
      }
    },
    {
      prop: "unitName",
      label: "单位",
      width: 120,
      align: "center"
    },
    {
      prop: "operation",
      label: "操作",
      width: 120,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})

const options = computed({
  get: () => props.productionOptions,
  set: (val) => emits("update:productionOptions", val)
})

const queryConfig: ITableRequestConfig<[string], ITableRow, false> = {
  api: queryWarehouseCheckDetail,
  getParams: () => {
    return [props.id]
  }
}

const getChangeColor = (changeQuantity: number) => {
  if (changeQuantity > 0) return "red"
  if (changeQuantity < 0) return "green"
  return "#cfced8"
}

const onViewOutRecordClick = (productModelId: string) => {
  emits("onViewOutRecordClick", productModelId)
}

onMounted(async () => {
  await tableRef.value?.requestData()
  let array: IOption[] = []
  tableData.value.forEach((item) => {
    let index = array.findIndex((option) => option.value === item.productModelId)
    if (index === -1) {
      array.push({
        label: item.productModelName,
        value: item.productModelId
      })
    }
  })
  options.value = array
})

defineOptions({
  name: "DepotListTable"
})
</script>

<style scoped lang="scss">
.custom-detail-table {
  flex: 1;
  overflow: hidden;
}
</style>
