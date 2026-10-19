<template>
  <CustomTitle title="库存退货记录" style="margin-top: 0px">
    <div>
      <el-select
        v-model="productionId"
        placeholder="请按产品筛选"
        @change="tableRef?.requestData()"
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

  <!-- 产品详情 弹窗-->
  <ProductInfoModal ref="productInfoHandleRef" />
</template>

<script setup lang="ts">
import { getLogPurchaseInOutRecord } from "@/api/logistics/purchase"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import useBarcodePrint from "@/hooks/useBarcodePrint"
import type { IOption } from "@/types/common"
import type { LogisticsPurchaseReturnOutboundRecord as ITableRow } from "@/types/logistics/purchase"
import { precisionConversion, sleep } from "@/utils/common"
import ProductInfoModal from "@/views/logisticsOperate/components/productInfoHandle.vue"

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

const productionId = ref("")

const { printBarcode } = useBarcodePrint()

const productInfoHandleRef = ref<InstanceType<typeof ProductInfoModal>>()

const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "returnTaskCode",
      label: "退货单号",
      minWidth: 160
    },
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
      label: "出库数量",
      minWidth: 120,
      align: "right",
      formatter: (row: ITableRow) => {
        return row.quantity || row.quantity == 0
          ? precisionConversion(row.quantity, row.decimalNumber ?? 2)
          : ""
      }
    },
    {
      prop: "unitName",
      label: "单位",
      minWidth: 120,
      align: "center"
    },
    {
      prop: "facilityName",
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
    string,
    {
      productModelId?: string
    }
  ],
  ITableRow,
  false
> = {
  api: getLogPurchaseInOutRecord,
  getParams: () => {
    return [
      props.id,
      {
        productModelId: productionId.value
      }
    ]
  }
}

onMounted(async () => {
  await sleep(100)
  productionId.value = props.curProductionId
  await tableRef.value?.requestData()
})

defineOptions({
  name: "ReturnOutboundRecordTab"
})
</script>

<style scoped lang="scss">
.custom-detail-table {
  flex: 1;
  overflow: hidden;
}
</style>
