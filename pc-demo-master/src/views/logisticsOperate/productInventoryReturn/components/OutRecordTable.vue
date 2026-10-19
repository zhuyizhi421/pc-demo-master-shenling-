<template>
  <CustomTitle title="出库记录">
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
    <template #operation-default="{ row }">
      <el-button
        type="primary"
        link
        size="small"
        :disabled="!row.barcode"
        @click="printBarcode([row.barcode])"
        >打印标签码</el-button
      >
    </template>
  </CustomTable>
</template>

<script setup lang="ts">
import { requestPurchaseReturnOutboundRecord } from "@/api/logistics/purchase"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import useBarcodePrint from "@/hooks/useBarcodePrint"
import type { IOutRecordInfo as ITableRow } from "@/types/logistics/purchase"
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

const { printBarcode } = useBarcodePrint()

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
      prop: "quantity",
      label: "数量",
      width: 120,
      align: "right",
      formatter: (row: ITableRow) => {
        return precisionConversion(row.quantity, row.decimalNumber ?? 2)
      }
    },
    {
      prop: "unitName",
      label: "单位",
      width: 120,
      align: "center"
    },
    {
      prop: "outboundCode",
      label: "出库单号",
      minWidth: 160
    },
    {
      prop: "warehouseName",
      label: "仓库名称",
      minWidth: 160
    },
    {
      prop: "locationName",
      label: "库位名称",
      minWidth: 160
    },
    {
      prop: "outboundTime",
      label: "出库时间",
      width: 160
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
      returnTaskId: string
      productModelId?: string
    }
  ],
  ITableRow,
  false
> = {
  api: requestPurchaseReturnOutboundRecord,
  getParams: () => {
    return [
      {
        returnTaskId: props.id,
        productModelId: productionId.value
      }
    ]
  }
}

onMounted(async () => {
  await tableRef.value?.requestData()
})

defineOptions({
  name: "OutRecordTable"
})
</script>

<style scoped lang="scss">
.custom-detail-table {
  flex: 1;
  overflow: hidden;
}
</style>
