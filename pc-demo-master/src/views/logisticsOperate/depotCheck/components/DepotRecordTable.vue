<template>
  <CustomTitle title="按产品筛选">
    <div>
      <el-select
        v-model="productionId"
        placeholder="请按产品筛选"
        @change="$nextTick(() => tableRef?.requestData())"
        clearable
        style="width: 200px"
      >
        <el-option
          v-for="item in productionOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </div>
  </CustomTitle>
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
      <el-button
        v-if="row.barcode"
        link
        size="small"
        type="primary"
        :disabled="!row.checkQuantity"
        @click="printCheckBarcode([{ barcode: row.barcode, quantity: row.checkQuantity }])"
        >打印标签码</el-button
      >
    </template>
  </CustomTable>
</template>

<script setup lang="ts">
import { requestWarehouseCheckRecords } from "@/api/logistics/warehouseCheck"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import useBarcodePrint from "@/hooks/useBarcodePrint"
import type { IWarehouseCheckRecordItem as ITableRow } from "@/types/logistics/warehouse-check"
import { precisionConversion } from "@/utils/common"

type IOption = { label: string; value: string }

const props = withDefaults(
  defineProps<{
    id: string
    productionOptions: IOption[]
    curProductionId: string
  }>(),
  {
    id: "",
    productionOptions: () => [],
    curProductionId: ""
  }
)

const emits = defineEmits<{
  (e: "update:curProductionId", curProductionId: string): void
}>()

const productionId = computed({
  get: () => props.curProductionId,
  set: (val) => emits("update:curProductionId", val)
})

const { printCheckBarcode } = useBarcodePrint()

const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
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
      prop: "productModelCode",
      label: "产品编号",
      minWidth: 160
    },
    {
      prop: "originalQuantity",
      label: "原数量",
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
      label: "实盘数量",
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
      label: "变更数量",
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
      prop: "originalLocationName",
      label: "原库位",
      minWidth: 160
    },
    {
      prop: "checkLocationName",
      label: "实际库位",
      minWidth: 160
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

const queryConfig: ITableRequestConfig<
  [
    {
      id: string
      productModelId?: string
    }
  ],
  ITableRow,
  false
> = {
  api: requestWarehouseCheckRecords,
  getParams: () => {
    return [
      {
        id: props.id,
        productModelId: productionId.value
      }
    ]
  }
}

const getChangeColor = (changeQuantity: number) => {
  if (changeQuantity > 0) return "red"
  if (changeQuantity < 0) return "green"
  return "#cfced8"
}

onMounted(async () => {
  await tableRef.value?.requestData()
})

defineOptions({
  name: "DepotRecordTable"
})
</script>

<style scoped lang="scss">
.custom-detail-table {
  flex: 1;
  overflow: hidden;
}
</style>
