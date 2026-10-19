<template>
  <CustomTitle title="出入库记录">
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
          :key="item.id"
          :label="item.name"
          :value="item.id"
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
  </CustomTable>
</template>

<script setup lang="ts">
import {
  getLogAllocateDetailInOutRecord,
  getLogAllocateProductList
} from "@/api/logistics/allocate"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import type {
  LogisticsAllocateOutInventory as ITableRow,
  ProductModel
} from "@/types/logistics/allocate"
import { precisionConversion } from "@/utils/common"

const props = withDefaults(
  defineProps<{
    id: string
    curProductionId: string
  }>(),
  {
    id: "",
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

const productionOptions = ref<ProductModel[]>([])

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
      prop: "quantity",
      label: "数量",
      width: 120,
      align: "right",
      formatter: (row: ITableRow) => {
        return row.quantity || row.quantity == 0
          ? precisionConversion(row.quantity, row?.decimalNumber ?? 2)
          : ""
      }
    },
    {
      prop: "unitName",
      label: "单位",
      width: 120,
      align: "center"
    },
    {
      prop: "outLocationName",
      label: "拨出库位",
      minWidth: 160
    },
    {
      prop: "outOperatorName",
      label: "拨出操作人",
      minWidth: 160
    },
    {
      prop: "outboundTime",
      label: "出库时间",
      width: 160
    },
    {
      prop: "inLocationName",
      label: "拨入库位",
      minWidth: 160
    },
    {
      prop: "inOperatorName",
      label: "拨入操作人",
      minWidth: 160
    },
    {
      prop: "inboundTime",
      label: "入库时间",
      width: 160
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
  api: getLogAllocateDetailInOutRecord,
  getParams: () => {
    console.log("productionId", productionId.value)
    return [
      {
        id: props.id,
        productModelId: productionId.value
      }
    ]
  }
}

onMounted(async () => {
  const res = await getLogAllocateProductList(props.id)
  productionOptions.value = res
  await tableRef.value?.requestData()
})

defineOptions({
  name: "OutInRecordTable"
})
</script>

<style scoped lang="scss">
.custom-detail-table {
  flex: 1;
  overflow: hidden;
}
</style>
