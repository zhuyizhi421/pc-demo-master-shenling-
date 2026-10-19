<template>
  <CustomTitle title="检验记录" style="margin-top: 0px">
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
  </CustomTable>

  <!-- 产品详情 弹窗-->
  <ProductInfoModal ref="productInfoHandleRef" />
</template>

<script setup lang="ts">
import { getLogPurchaseInspectionRecord } from "@/api/logistics/purchase"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import type { IOption } from "@/types/common"
import type { LogisticsPurchaseReturnInspectRecord as ITableRow } from "@/types/logistics/purchase"
import { isEffectiveValue, precisionConversion, sleep } from "@/utils/common"
import ProductInfoModal from "@/views/logisticsOperate/components/productInfoHandle.vue"

const resultEnum = {
  "0": "结果未出",
  "1": "通过",
  "2": "不通过"
}

const statusEnum = {
  "0": "未开始",
  "1": "进行中",
  "2": "已完结"
}

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

const productInfoHandleRef = ref<InstanceType<typeof ProductInfoModal>>()

const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "taskNo",
      label: "任务单号",
      minWidth: 160
    },
    {
      prop: "status",
      label: "检验状态",
      minWidth: 120,
      align: "center",
      formatter: (row: ITableRow) => {
        return statusEnum[row.status as 0 | 1 | 2]
      }
    },
    {
      prop: "result",
      label: "检验结果",
      minWidth: 120,
      align: "center",
      formatter: (row: ITableRow) => {
        return resultEnum[row.result as "0" | "1" | "2"]
      }
    },
    {
      prop: "productName",
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
      label: "检验数量",
      minWidth: 120,
      align: "right",
      formatter: ({ quantity, decimalNumber }) => {
        return isEffectiveValue(quantity) ? precisionConversion(quantity, decimalNumber ?? 2) : ""
      }
    },
    {
      prop: "sampleNumber",
      label: "样本数",
      minWidth: 120,
      align: "right"
    },
    {
      prop: "returnAmount",
      label: "评审退货数量",
      minWidth: 120,
      align: "right",
      formatter: ({ returnAmount, decimalNumber }) => {
        return isEffectiveValue(returnAmount)
          ? precisionConversion(returnAmount, decimalNumber ?? 2)
          : ""
      }
    },
    {
      prop: "replenishAmount",
      label: "评审退补数量",
      minWidth: 120,
      align: "right",
      formatter: ({ replenishAmount, decimalNumber }) => {
        return isEffectiveValue(replenishAmount)
          ? precisionConversion(replenishAmount, decimalNumber ?? 2)
          : ""
      }
    },
    {
      prop: "unitName",
      label: "单位",
      minWidth: 120,
      align: "center"
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
  api: getLogPurchaseInspectionRecord,
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
  name: "InspectionRecordTab"
})
</script>

<style scoped lang="scss">
.custom-detail-table {
  flex: 1;
  overflow: hidden;
}
</style>
