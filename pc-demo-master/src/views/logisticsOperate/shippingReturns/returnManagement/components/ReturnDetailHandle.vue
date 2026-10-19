<!-- 退货信息 -->
<template>
  <div class="return-detail">
    <div class="detail-top">
      <div>
        <el-button icon="ArrowLeft" @click="emit('close')">返回</el-button>
      </div>
      <CustomTitle title="基础信息" :is-table-title="false" show-short-bar />
      <CustomDescription :data="detailData" :configs="detailConfig" style="padding: 0">
        <template #inspectionCode-content>
          <el-button
            v-if="detailData.inspectionId"
            link
            type="primary"
            size="small"
            @click="onNavigateTo(detailData.inspectionId)"
            >{{ detailData.inspectionCode }}
          </el-button>
        </template>
      </CustomDescription>
    </div>
    <div class="product-detail">
      <CustomTitle title="产品明细" :is-table-title="false" show-short-bar>
        <div v-if="tableData.length === 0 && needSplit && Authed">
          <el-button type="primary" @click="barCodeSplitModalRef?.setVisible(true, detailData)"
            >拆分标签码</el-button
          >
        </div>
      </CustomTitle>
      <div class="table-container">
        <CustomTable
          ref="tableRef"
          v-model:table-data="tableData"
          :config="tableConfig"
          :query-config="queryConfig"
          class="custom-detail-table"
        >
          <template #productModelName-default="{ row }">
            <el-button
              link
              type="primary"
              size="small"
              @click="productInfoModalRef!.setVisible(true, row?.productModelId)"
              >{{ row?.productModelName }}
            </el-button>
          </template>

          <template #operation-default="{ row }">
            <el-button
              link
              type="primary"
              size="small"
              :disabled="!row.barcode"
              @click="printBarcode([row.barcode])"
              >打印标签码</el-button
            >
          </template>
        </CustomTable>
      </div>
    </div>
    <div class="footer-operation">
      <el-button @click="emit('close')">返回</el-button>
    </div>

    <!-- 拆封标签码 -->
    <BarCodeSplitModal ref="barCodeSplitModalRef" @success="barCodeSplitSuccess" />

    <ProductInfoModal ref="productInfoModalRef" />
  </div>
</template>

<script setup lang="ts">
import { queryReturnOrderDetail } from "@/api/logistics/return"
import CustomDescription from "@/components/CustomDescription/index.vue"
import type { ICustomDescriptionConfig } from "@/components/CustomDescription/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import {
  EnumProductionOrderSource,
  EnumProductionOrderSourceMap,
  EnumReturnPlanStatus,
  EnumReturnPlanStatusMap,
  EnumReturnResultType,
  EnumReturnResultTypeMap
} from "@/constant/enums"
import useBarcodePrint from "@/hooks/useBarcodePrint"
import useButtonAuth from "@/hooks/useButtonAuth"
import type {
  IReturnOrderDetail as ITableRow,
  IReturnOrderPageListItem
} from "@/types/logistics/return"
import { precisionConversion } from "@/utils/common"
import ProductInfoModal from "@/views/logisticsOperate/components/productInfoHandle.vue"

import BarCodeSplitModal from "./BarCodeSplitModal.vue"

const Authed = useButtonAuth("ReturnManagement_update", "ReturnManagement_query")

const { printBarcode } = useBarcodePrint()

const productInfoModalRef = ref<InstanceType<typeof ProductInfoModal>>()
const barCodeSplitModalRef = ref<InstanceType<typeof BarCodeSplitModal>>()
const router = useRouter()

const detailData = ref<IReturnOrderPageListItem>({} as IReturnOrderPageListItem)
const detailConfig = ref<ICustomDescriptionConfig[]>([
  {
    label: "来源：",
    field: "productModelName"
  },
  {
    label: "来源：",
    field: "dataSource",
    formatter: ({ data: { dataSource } }) => {
      return EnumProductionOrderSourceMap[dataSource as EnumProductionOrderSource]
    }
  },
  {
    label: "状态：",
    field: "returnStatus",
    formatter: ({ data: { returnStatus } }) => {
      return EnumReturnPlanStatusMap[returnStatus as EnumReturnPlanStatus]
    }
  },
  {
    label: "退货数量：",
    field: "returnQty",
    formatter: ({ data: { returnQty } }) => {
      return precisionConversion(returnQty, detailData.value?.decimalNumber ?? 2)
    }
  },
  {
    label: "实际入库数量：",
    field: "inboundQty",
    formatter: ({ data: { inboundQty } }) => {
      return precisionConversion(inboundQty, detailData.value?.decimalNumber ?? 2)
    }
  },
  {
    label: "单位：",
    field: "unitName"
  },
  {
    label: "销售订单：",
    field: "saleCode"
  },
  {
    label: "客户名称：",
    field: "customerName"
  },
  {
    label: "客户编号：",
    field: "customerCode"
  },
  {
    label: "是否退货检验：",
    field: "isReturnInspection",
    formatter: ({ data: { isReturnInspection } }) => {
      return isReturnInspection === 1 ? "是" : "否"
    }
  },
  {
    label: "检验单号：",
    field: "inspectionCode",
    get hidden() {
      return !detailData.value.inspectionId
    },
    slots: {
      content: "inspectionCode-content"
    }
  },
  {
    label: "检验结果：",
    field: "inspectionResult",
    get hidden() {
      return !detailData.value.isReturnInspection
    },
    formatter: ({ data: { inspectionResult } }) => {
      return EnumReturnResultTypeMap[inspectionResult as EnumReturnResultType]
    }
  },
  {
    label: "创建时间：",
    field: "createTime"
  },
  {
    label: "结单时间：",
    field: "statementTime"
  }
])

const props = defineProps<{
  currentRow: IReturnOrderPageListItem
}>()

const emit = defineEmits<{
  (e: "close"): void
}>()

const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "barcode",
      label: "标签码",
      width: 200
    },
    {
      prop: "productModelName",
      label: "产品名称",
      minWidth: 160,
      slots: {
        default: "productModelName-default"
      }
    },
    {
      prop: "quantity",
      label: "数量",
      width: 160,
      align: "right",
      formatter: (row: ITableRow) => {
        return precisionConversion(row.quantity, row?.decimalNumber ?? 2)
      }
    },
    {
      prop: "unitName",
      label: "单位",
      width: 160,
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

const needSplit = ref(true)

onMounted(async () => {
  detailData.value = props.currentRow
  await tableRef.value?.requestData()
})

const queryConfig: ITableRequestConfig<[string], ITableRow, false> = {
  api: queryReturnOrderDetail,
  getParams: () => {
    return [props.currentRow.id]
  }
}

const barCodeSplitSuccess = async () => {
  needSplit.value = false
  tableRef.value?.requestData()
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
</script>

<style scoped lang="scss">
.return-detail {
  flex: 1;
  color: #303133;
  display: flex;
  flex-direction: column;
  overflow-y: hidden;
}

.detail-top {
  padding: 12px 16px;
  border-bottom: 1px solid #e4e7ed;

  .base-info-order {
    font-weight: bold;
    margin-bottom: 12px;
  }
  .status {
    margin-left: 16px;
  }
}

.product-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 12px 20px 16px;

  .table-container {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .custom-detail-table {
      flex: 1;
      overflow: hidden;
    }
  }
}

.footer-operation {
  width: 100%;
  background: #fff;
  border-top: 1px solid #e4e7ed;
  padding: 13px 20px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
</style>
