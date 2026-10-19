<template>
  <CustomTitle title="收货记录" style="margin-top: 0px">
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
    <template #inspectionCode-default="{ row }">
      <el-button
        v-if="row.inspectionId"
        link
        type="primary"
        size="small"
        @click="onNavigateTo(row.inspectionId)"
        >{{ row.inspectionCode }}
      </el-button>
    </template>

    <template #operation-default="{ row }">
      <el-button type="primary" link size="small" @click="onReviewDetail(row)"
        >查看收货详情</el-button
      >
    </template>
  </CustomTable>

  <ArrivalRecord v-model="visible" :data="dialogData" />
</template>

<script setup lang="ts">
import { getLogPurchaseDetailArrival } from "@/api/logistics/purchase"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import type { IOption } from "@/types/common"
import type { LogisticsPurchaseArrivalRecord as ITableRow } from "@/types/logistics/purchase"
import { precisionConversion, sleep } from "@/utils/common"

import ArrivalRecord from "../ArrivalRecord.vue"

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
const router = useRouter()
const productionId = ref("")
const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "arrivalCode",
      label: "收货单号",
      minWidth: 160
    },
    {
      prop: "arrivalTime",
      label: "收货时间",
      minWidth: 160
    },
    {
      prop: "productModelName",
      label: "产品名称",
      minWidth: 160
    },
    {
      prop: "arrivalQuantity",
      label: "收货数量",
      minWidth: 120,
      align: "right",
      formatter: (row: ITableRow) => {
        return row.arrivalQuantity || row.arrivalQuantity == 0
          ? precisionConversion(row.arrivalQuantity, row.decimalNumber ?? 2)
          : ""
      }
    },
    {
      prop: "inboundQuantity",
      label: "入库数量",
      minWidth: 120,
      align: "right",
      formatter: (row: ITableRow) => {
        return row.inboundQuantity || row.inboundQuantity == 0
          ? precisionConversion(row.inboundQuantity, row.decimalNumber ?? 2)
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
      prop: "inspectionCode",
      label: "检验任务单号",
      minWidth: 160,
      slots: {
        default: "inspectionCode-default"
      }
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
  api: getLogPurchaseDetailArrival,
  getParams: () => {
    return [
      props.id,
      {
        productModelId: productionId.value
      }
    ]
  }
}

const onNavigateTo = (detailId: string) => {
  router.push({
    path: "/quality/InspectionTask/nonProcessInspect",
    query: {
      isDetail: 1,
      id: detailId
    }
  })
}

const visible = ref(false)
const dialogData = ref<{
  receiptId: string
  productModelId: string
  unitId: string
}>({
  receiptId: "",
  productModelId: "",
  unitId: ""
})

onMounted(async () => {
  await sleep(100)
  productionId.value = props.curProductionId
  await tableRef.value?.requestData()
})

const onReviewDetail = (row: ITableRow) => {
  visible.value = true
  dialogData.value = {
    receiptId: row.receiptId,
    productModelId: row.productModelId,
    unitId: row.unitId
  }
}

defineOptions({
  name: "ReceiveRecordTab"
})
</script>

<style scoped lang="scss">
.custom-detail-table {
  flex: 1;
  overflow: hidden;
}
</style>
