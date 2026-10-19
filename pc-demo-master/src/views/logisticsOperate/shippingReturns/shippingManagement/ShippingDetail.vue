<!-- 发货订单详情  -->
<template>
  <div class="layout-child-page-container">
    <div class="layout-child-page-content border-bottom">
      <div class="top-back">
        <el-button icon="ArrowLeft" @click="emit('close')">返回</el-button>
      </div>
      <CustomTitle title="基础信息" :is-table-title="false" show-short-bar />
      <CustomDescription :data="detailData || {}" :configs="detailConfig">
        <template #attachmentFileId-content>
          <div class="attachment-file" v-if="detailData?.attachmentFileId">
            <el-button type="primary" link @click="fileDownloadHandle(detailData.attachmentFileId)"
              >附件</el-button
            >
            <span class="tip">（点击下载）</span>
          </div>
        </template>
      </CustomDescription>
    </div>

    <div class="layout-child-page-content product-detail">
      <el-radio-group v-model="activeTab" style="margin-bottom: 16px">
        <el-radio-button :value="EnumTab.Product">产品列表</el-radio-button>
        <el-radio-button :value="EnumTab.Prepare_out">领料出库记录</el-radio-button>
        <el-radio-button v-if="detailData?.isPack" :value="EnumTab.Package"
          >包装记录</el-radio-button
        >
        <el-radio-button :value="EnumTab.Shipment">发货记录</el-radio-button>
      </el-radio-group>
      <div class="table-container">
        <ProductTab
          v-if="activeTab === EnumTab.Product"
          :id="detailData?.id || ''"
          :is-pack="detailData?.isPack || false"
        />
        <PrepareOutTab v-if="activeTab === EnumTab.Prepare_out" :id="detailData?.id || ''" />
        <PackageTab v-if="activeTab === EnumTab.Package" :id="detailData?.id || ''" />
        <ShipmentTab v-if="activeTab === EnumTab.Shipment" :id="detailData?.id || ''" />
      </div>
    </div>

    <div class="footer-operation">
      <el-button @click="emit('close')">返回</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { fileDownloadHandle } from "@/api/fileResource"
import { queryDeliveryPlanDetail } from "@/api/logistics/delivery"
import CustomDescription from "@/components/CustomDescription/index.vue"
import type { ICustomDescriptionConfig } from "@/components/CustomDescription/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import {
  EnumDeliveryPlanStatus,
  EnumDeliveryPlanStatusMap,
  EnumProductionOrderSource,
  EnumProductionOrderSourceMap
} from "@/constant/enums"
import type { IDeliveryDetailItem } from "@/types/logistics/delivery"

import PackageTab from "./components/DetailTabs/PackageTab.vue"
import PrepareOutTab from "./components/DetailTabs/PrepareOutTab.vue"
import ProductTab from "./components/DetailTabs/ProductTab.vue"
import ShipmentTab from "./components/DetailTabs/ShipmentTab.vue"

enum EnumTab {
  Product,
  Prepare_out,
  Package,
  Shipment
}

const props = withDefaults(
  defineProps<{
    id: string
  }>(),
  {}
)

const emit = defineEmits<{
  (e: "close"): void
}>()

const activeTab = ref(EnumTab.Product)

const detailData = ref<IDeliveryDetailItem>()
const detailConfig = ref<ICustomDescriptionConfig[]>([
  {
    label: "发货计划单号：",
    field: "deliveryCode"
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
    label: "计划发货日期：",
    field: "deliveryTime"
  },
  {
    label: "包装：",
    field: "isPack",
    formatter: () => (detailData.value?.isPack ? "是" : "否")
  },
  {
    label: "创建时间：",
    field: "createTime"
  },
  {
    label: "结案时间：",
    field: "statementTime"
  },
  {
    label: "来源：",
    field: "dataSource",
    formatter: () =>
      EnumProductionOrderSourceMap[detailData.value?.dataSource as EnumProductionOrderSource]
  },
  {
    label: "状态：",
    field: "deliveryStatus",
    formatter: () =>
      EnumDeliveryPlanStatusMap[detailData.value?.deliveryStatus as EnumDeliveryPlanStatus]
  },
  {
    label: "上传附件：",
    field: "attachmentFileId",
    slots: {
      content: "attachmentFileId-content"
    }
  },
  {
    label: "备注：",
    field: "remarks",
    colspan: -1
  }
])

onMounted(() => {
  getShipmentDetail(props.id)
})

/** 获取发货订单详情 */
const getShipmentDetail = async (id: string) => {
  const data = await queryDeliveryPlanDetail(id)
  detailData.value = data
}
</script>

<style scoped lang="scss">
.shipping-detail {
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
