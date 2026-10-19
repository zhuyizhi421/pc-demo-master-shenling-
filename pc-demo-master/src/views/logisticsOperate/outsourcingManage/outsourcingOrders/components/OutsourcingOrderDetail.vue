<template>
  <div class="layout-child-page-container">
    <div class="layout-child-page-content border-bottom">
      <div>
        <el-button icon="ArrowLeft" @click="onCancel">返回</el-button>
      </div>
      <CustomTitle title="基础信息" :is-table-title="false" show-short-bar />
      <div class="order-info">
        <div class="detailSubTitle">委外单号： {{ selectNo }}</div>
        <div class="orderStatus">
          {{ EnumOutsourcingOrderStatusMap[detailInfo?.status as EnumOutsourcingOrderStatus] }}
        </div>
      </div>

      <CustomDescription :data="detailInfo" :configs="detailConfig">
        <template #attachFile-content>
          <div v-if="detailInfo?.attachFile?.length">
            <el-button
              v-for="item in detailInfo?.attachFile"
              :key="item.fileId"
              type="primary"
              link
              @click="fileDownloadHandle(item.fileId!)"
              >{{ formatFileName(item.fileName!) }}</el-button
            >
          </div>
          <div v-else>无</div>
        </template>
      </CustomDescription>
    </div>

    <div class="layout-child-page-content bottom-content">
      <el-radio-group v-model="activeTab" class="radio-tab">
        <el-radio-button :value="EnumTab.Production">产品清单</el-radio-button>
        <el-radio-button :value="EnumTab.Delivery">收货记录</el-radio-button>
        <el-radio-button :value="EnumTab.InspectionRecord">检验记录</el-radio-button>
        <el-radio-button :value="EnumTab.InStore">入库记录</el-radio-button>
        <el-radio-button :value="EnumTab.Material">物料清单</el-radio-button>
        <el-radio-button :value="EnumTab.outStore">出库记录</el-radio-button>
        <el-radio-button :value="EnumTab.ReturnMaterial">退料记录</el-radio-button>
        <el-radio-button :value="EnumTab.DeliveryOrder">送货单</el-radio-button>
      </el-radio-group>
      <div class="table-box">
        <ProductRecord v-if="activeTab == EnumTab.Production" :selectId="selectId" />
        <DeliverRecord v-else-if="activeTab == EnumTab.Delivery" :selectId="selectId" />
        <InspectionRecord v-else-if="activeTab == EnumTab.InspectionRecord" :selectId="selectId" />
        <InboundRecord v-else-if="activeTab == EnumTab.InStore" :selectId="selectId" />
        <MaterialRecord
          v-else-if="activeTab == EnumTab.Material"
          :selectId="selectId"
          @changeTab="changeDetailTab"
        />
        <OutboundRecord
          v-else-if="activeTab == EnumTab.outStore"
          :selectId="selectId"
          :productModelId="productModelId"
        />
        <ReturnMaterial
          v-else-if="activeTab == EnumTab.ReturnMaterial"
          :selectId="selectId"
          :productModelId="productModelId"
        />
        <DeliveryOrder
          v-else-if="activeTab == EnumTab.DeliveryOrder"
          :select-id="detailInfo.no || ''"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { fileDownloadHandle } from "@/api/fileResource"
import { getProductionOrderById } from "@/api/logistics/delegate"
import CustomDescription from "@/components/CustomDescription/index.vue"
import type { ICustomDescriptionConfig } from "@/components/CustomDescription/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import { EnumOutsourcingOrderStatus, EnumOutsourcingOrderStatusMap } from "@/constant/enums"
import type { TsesDelegateOrderVo } from "@/types/logistics/delegate"
import { precisionConversion } from "@/utils/common"

import DeliverRecord from "./tabs/DeliverRecord.vue"
import DeliveryOrder from "./tabs/DeliveryOrder.vue"
import InboundRecord from "./tabs/InboundRecord.vue"
import InspectionRecord from "./tabs/InspectionRecord.vue"
import MaterialRecord from "./tabs/MaterialRecord.vue"
import OutboundRecord from "./tabs/OutboundRecord.vue"
import ProductRecord from "./tabs/ProductRecord.vue"
import ReturnMaterial from "./tabs/ReturnMaterial.vue"

enum EnumTab {
  Production, //产品清单
  Delivery, //收货记录
  InspectionRecord, //检验记录
  InStore, //入库记录
  Material, //物料清单
  outStore, //出库记录
  ReturnMaterial, //退料记录
  DeliveryOrder // 送货单
}

const props = withDefaults(
  defineProps<{
    selectNo: string
    selectId: string
  }>(),
  {}
)

const emits = defineEmits(["cancel"])

const activeTab = ref(EnumTab.Production)
const detailInfo = ref<TsesDelegateOrderVo>({})
const productModelId = ref("")
const isOrderOutsource = computed(() => detailInfo.value?.delegateType == 3)
const detailConfig = ref<ICustomDescriptionConfig[]>([
  {
    field: "supplierName",
    label: "供应商名称："
  },
  {
    field: "supplierCode",
    label: "供应商编码："
  },
  {
    field: "originalOrderNo",
    label: "关联生产订单：",
    get hidden() {
      return isOrderOutsource.value
    }
  },
  {
    field: "productModelName",
    label: "产品名称："
  },
  {
    field: "productModelCode",
    label: "产品编码："
  },
  {
    field: "amount",
    label: "数量：",
    formatter: ({ data: { amount, decimalNumber } }) => {
      return precisionConversion(+(amount || 0), decimalNumber || 0)
    }
  },
  {
    field: "unitName",
    label: "产品单位："
  },
  {
    field: "isOrderOutsource",
    label: "委外类型：",
    formatter: () => {
      return isOrderOutsource.value ? "订单委外" : "工序委外"
    }
  },
  {
    field: "techProcessNo",
    label: "工艺路线：",
    get hidden() {
      return !isOrderOutsource.value
    }
  },
  {
    field: "processVersion",
    label: "工艺路线版本：",
    get hidden() {
      return !isOrderOutsource.value
    }
  },
  {
    field: "expectedReceiveTime",
    label: "计划收货日期：",
    formatter: ({ data: { expectedReceiveTime } }) => {
      return expectedReceiveTime?.slice(0, 10)
    }
  },
  {
    field: "source",
    label: "来源：",
    formatter: ({ data: { source } }) => {
      return source === 1 ? "mes" : "erp"
    }
  },
  {
    field: "createTime",
    label: "创建时间："
  },
  {
    field: "createByName",
    label: "创建人："
  },
  {
    field: "checkEmpName",
    label: "复核人："
  },
  {
    field: "checkTime",
    label: "复核时间："
  },
  {
    field: "attachFile",
    label: "附件：",
    slots: {
      content: "attachFile-content"
    }
  },
  {
    field: "remark",
    label: "备注：",
    colspan: -1
  }
])

watch(
  () => activeTab.value,
  async (oldVal, newVal) => {
    if (oldVal === EnumTab.outStore && newVal === EnumTab.ReturnMaterial) {
      // 从出库记录页切换到退料记录页，清空物料选择
      productModelId.value = ""
    } else if (oldVal === EnumTab.ReturnMaterial && newVal === EnumTab.outStore) {
      // 从退料记录页切换出库记录页，清空物料选择
      productModelId.value = ""
    }
  }
)

onMounted(() => {
  getDetail()
})

//物料清单跳转过来
const changeDetailTab = (id: string, tab: string) => {
  // 切换详情页tab
  if (tab === "returnMaterial") {
    activeTab.value = EnumTab.ReturnMaterial
  } else {
    activeTab.value = EnumTab.outStore
  }
  productModelId.value = id
}

/** 文件名称格式化 */
const formatFileName = (name: string) => {
  const index = name.lastIndexOf("/")
  return index > -1 ? name.slice(0, index) + "." + name.slice(index + 1) : name
}

const onCancel = async () => {
  emits("cancel")
}

// 获取详情
const getDetail = async () => {
  detailInfo.value = await getProductionOrderById({ id: props.selectId })
}
</script>

<style lang="scss" scoped>
.order-info {
  display: flex;
  align-items: center;

  .detailSubTitle {
    height: 24px;
    font-weight: bold;
    font-size: 16px;
    color: #303133;
    line-height: 24px;
    text-align: left;
  }

  .orderStatus {
    margin-left: 16px;
    background: #fffbe6;
    border-radius: 16px 16px 16px 16px;
    border: 1px solid #fff1b8;
    height: 24px;
    font-size: 14px;
    color: #faad14;
    line-height: 20px;
    padding: 2px 4px;
  }
}

.radio-tab {
  margin-bottom: 12px;
}

.bottom-content {
  flex: 1;
  padding-bottom: 0 !important;
}

.table-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &:deep(.custom-table) {
    flex: 1;
    overflow: hidden;
  }
}
</style>
