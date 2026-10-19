<!-- 采购订单详情 -->
<template>
  <div class="layout-child-page-container">
    <div class="layout-child-page-content border-bottom">
      <div>
        <el-button icon="ArrowLeft" @click="emits('close')">返回</el-button>
      </div>
      <CustomTitle title="基础信息" :is-table-title="false" show-short-bar />
      <div class="order-info">
        <span class="detailSubTitle">采购单号：{{ detailData.purchaseCode }}</span>
      </div>
      <CustomDescription :data="detailData" :configs="detailConfig">
        <template #attachmentFileId-content>
          <template v-if="detailData.attachmentFileId">
            <el-button type="primary" link @click="fileDownloadHandle(detailData.attachmentFileId)"
              >附件</el-button
            >
            <span style="color: #a8abb2"> （点击下载）</span>
          </template>
        </template>
      </CustomDescription>
    </div>
    <div class="layout-child-page-content bottom-content">
      <div class="tab">
        <el-radio-group v-model="activeTab" @change="onChangeTab">
          <el-radio-button :value="EnumTab.PurchaseList">采购清单</el-radio-button>
          <el-radio-button :value="EnumTab.ReceiveRecord">收货记录</el-radio-button>
          <el-radio-button :value="EnumTab.InspectionRecord">检验记录</el-radio-button>
          <el-radio-button :value="EnumTab.InboundRecord">入库记录</el-radio-button>
          <el-radio-button :value="EnumTab.ReturnOutboundRecord">库存退货记录</el-radio-button>
          <el-radio-button :value="EnumTab.DeliveryOrder">送货单</el-radio-button>
        </el-radio-group>
      </div>

      <template v-if="activeTab === EnumTab.PurchaseList">
        <PurchaseListTab
          :id="props.selectId"
          @onOpenArrivalRecord="onOpenArrivalRecord"
          @onOpenInboundRecord="onOpenInboundRecord"
        />
      </template>

      <template v-if="activeTab === EnumTab.ReceiveRecord">
        <ReceiveRecordTab
          :id="props.selectId"
          :cur-production-id="curProductionId"
          :production-options="productionOptions"
        />
      </template>

      <template v-if="activeTab === EnumTab.InspectionRecord">
        <InspectionRecordTab
          :id="props.selectId"
          :cur-production-id="curProductionId"
          :production-options="productionOptions"
        />
      </template>

      <template v-if="activeTab === EnumTab.InboundRecord">
        <InboundRecordTab
          :id="props.selectId"
          :cur-production-id="curProductionId"
          :production-options="productionOptions"
        />
      </template>

      <template v-if="activeTab === EnumTab.ReturnOutboundRecord">
        <ReturnOutboundRecordTab
          :id="props.selectId"
          :cur-production-id="curProductionId"
          :production-options="productionOptions"
        />
      </template>

      <template v-if="activeTab === EnumTab.DeliveryOrder">
        <DeliveryOrderTab :id="detailData.purchaseCode" />
      </template>
    </div>
    <div class="footer-operation">
      <el-button @click="emits('close')">返回</el-button>
    </div>
  </div>

  <!-- 产品详情 弹窗-->
  <ProductInfoModal ref="productInfoHandleRef" />
</template>

<script setup lang="ts">
import { fileDownloadHandle } from "@/api/fileResource"
import { getLogPurchaseProductSearch } from "@/api/logistics/product"
import { queryPurchaseOrderDetail } from "@/api/logistics/purchase"
import CustomDescription from "@/components/CustomDescription/index.vue"
import type { ICustomDescriptionConfig } from "@/components/CustomDescription/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import { EnumPurchaseOrderStatus, EnumPurchaseOrderStatusMap } from "@/constant/enums"
import type { IOption } from "@/types/common"
import ProductInfoModal from "@/views/logisticsOperate/components/productInfoHandle.vue"

import DeliveryOrderTab from "./tabs/DeliveryOrderTab.vue"
import InboundRecordTab from "./tabs/InboundRecordTab.vue"
import InspectionRecordTab from "./tabs/InspectionRecordTab.vue"
import PurchaseListTab from "./tabs/PurchaseListTab.vue"
import ReceiveRecordTab from "./tabs/ReceiveRecordTab.vue"
import ReturnOutboundRecordTab from "./tabs/ReturnOutboundRecordTab.vue"

enum EnumTab {
  PurchaseList, // 采购清单
  ReceiveRecord, // 收货记录
  InboundRecord, //入库记录
  ReturnOutboundRecord, //退货出库记录
  InspectionRecord, //检验记录
  DeliveryOrder //送货单
}

const props = withDefaults(
  defineProps<{
    selectId: string
  }>(),
  {}
)

const emits = defineEmits<{
  (e: "success"): void
  (e: "close"): void
}>()

const productInfoHandleRef = ref<InstanceType<typeof ProductInfoModal>>()

const curProductionId = ref("") // 当前选中产品ID
const productionOptions = ref<IOption[]>([]) // 产品下拉

const detailData = ref<any>({
  supplierName: undefined,
  supplierCode: undefined,
  purchaseType: undefined,
  dataSource: undefined,
  purchaseStatus: undefined,
  eta: undefined,
  createTime: undefined,
  statementTime: undefined,
  attachmentFileId: undefined, //附件id
  remarks: undefined //备注
})
const detailConfig = ref<ICustomDescriptionConfig[]>([
  {
    field: "supplierName",
    label: "供应商名称："
  },
  {
    field: "supplierCode",
    label: "供应商编号："
  },
  {
    field: "createTime",
    label: "创建时间："
  },
  {
    field: "dataSource",
    label: "来源："
  },
  {
    field: "purchaseStatus",
    label: "状态："
  },
  {
    field: "eta",
    label: "预计收货日期：",
    formatter: () => detailData.value?.eta?.slice(0, 10)
  },
  {
    field: "statementTime",
    label: "结案时间："
  },
  {
    field: "attachmentFileId",
    label: "附件：",
    slots: {
      content: "attachmentFileId-content"
    }
  },
  {
    field: "remarks",
    label: "备注：",
    colspan: -1
  }
])

const activeTab = ref(EnumTab.PurchaseList)

onMounted(() => {
  if (props.selectId) {
    queryPurchaseOrderDetailFun()
    getLogPurchaseProductSearchFun()
  }
})

const queryPurchaseOrderDetailFun = async () => {
  const data = await queryPurchaseOrderDetail({ id: props.selectId }) // 获取订单详情
  detailData.value = {
    ...data,
    dataSource: data.dataSource === 1 ? "MES" : "ERP",
    purchaseStatus: EnumPurchaseOrderStatusMap[data.purchaseStatus as EnumPurchaseOrderStatus]
  }
}

const getLogPurchaseProductSearchFun = async () => {
  const res = await getLogPurchaseProductSearch(props.selectId) // 获取产品模型列表
  productionOptions.value = res.map((item) => ({
    label: item.name!,
    value: item.id!
  }))
}

const onChangeTab = () => {
  curProductionId.value = ""
}

const onOpenArrivalRecord = (id: string) => {
  curProductionId.value = id
  activeTab.value = EnumTab.ReceiveRecord
}

const onOpenInboundRecord = (id: string) => {
  curProductionId.value = id
  activeTab.value = EnumTab.InboundRecord
}
</script>

<style scoped lang="scss">
.order-info {
  display: flex;
  align-items: center;

  .detailSubTitle {
    height: 24px;
    font-weight: bold;
    font-size: 16px;
    color: #303133;
    line-height: 24px;
  }
  .el-tag {
    margin-left: 16px;
  }
}

.tab {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.bottom-content {
  flex: 1;
}

.table-box {
  flex: 1;
  display: flex;
  flex-direction: column;

  &:deep(.custom-table) {
    flex: 1;
    overflow: hidden;
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
