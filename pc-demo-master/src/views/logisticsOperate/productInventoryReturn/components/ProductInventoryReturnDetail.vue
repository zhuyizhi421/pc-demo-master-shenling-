<!-- 物流运营-库存管理-库存退货详情 -->

<template>
  <div class="procurement-return-detail">
    <div class="detail-top">
      <div>
        <el-button icon="ArrowLeft" @click="emit('close')">返回</el-button>
      </div>
      <CustomTitle title="基础信息" :is-table-title="false" show-short-bar />
      <div class="base-info-order">
        <span>库存退货单号：{{ proReturnInfo?.taskCode }}</span>
        <span class="status">{{
          EnumPurchaseReturnStatusMap[proReturnInfo?.taskStatus as EnumPurchaseReturnStatus]
        }}</span>
      </div>
      <CustomDescription :data="proReturnInfo" :configs="detailConfig" style="padding: 0">
      </CustomDescription>
    </div>
    <div class="product-detail">
      <el-radio-group v-model="activeTab">
        <el-radio-button :value="EnumTab.ReturnList">库存退货清单</el-radio-button>
        <el-radio-button :value="EnumTab.OutRecord">出库记录</el-radio-button>
      </el-radio-group>
      <div class="table-container">
        <template v-if="activeTab === EnumTab.ReturnList">
          <ReturnListTable
            :id="props.selectId"
            v-model:production-options="productionOptions"
            @onViewOutRecordClick="onViewOutRecordClick"
          />
        </template>
        <template v-if="activeTab === EnumTab.OutRecord">
          <OutRecordTable
            :id="props.selectId"
            :production-options="productionOptions"
            v-model:cur-production-id="curProductionId"
          />
        </template>
      </div>
    </div>
    <div class="footer-operation">
      <el-button @click="emit('close')">返回</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getPurchaseReturnTaskById } from "@/api/logistics/purchase"
import CustomDescription from "@/components/CustomDescription/index.vue"
import type { ICustomDescriptionConfig } from "@/components/CustomDescription/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import {
  EnumProductionOrderSource,
  EnumProductionOrderSourceMap,
  EnumPurchaseReturnStatus,
  EnumPurchaseReturnStatusMap
} from "@/constant/enums"
import type { IPurchaseReturnTaskDetail } from "@/types/logistics/purchase"

import OutRecordTable from "./OutRecordTable.vue"
import ReturnListTable from "./ReturnListTable.vue"

enum EnumTab {
  ReturnList, // 采购退货清单
  OutRecord // 出库记录
}

const props = withDefaults(
  defineProps<{
    selectId: string
  }>(),
  {}
)

const emit = defineEmits<{
  (e: "close"): void
}>()

const activeTab = ref(EnumTab.ReturnList)
const proReturnInfo = ref<Partial<IPurchaseReturnTaskDetail>>({})
const detailConfig = ref<ICustomDescriptionConfig[]>([
  {
    label: "供应商名称：",
    field: "supplierName"
  },
  {
    label: "供应商编号：",
    field: "supplierCode"
  },
  {
    label: "来源：",
    field: "dataSource",
    formatter: ({ data: { dataSource } }) => {
      return EnumProductionOrderSourceMap[dataSource as EnumProductionOrderSource]
    }
  },
  {
    label: "计划退货日期：",
    field: "planReturnTime"
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

const curProductionId = ref("") // 当前选中产品ID
const productionOptions = ref<{ label: string; value: string }[]>([]) // 产品下拉

onMounted(() => {
  getProReturnOrderDetail(props.selectId)
})

/** 获取采购退货单详情 */
const getProReturnOrderDetail = async (id: string) => {
  const res = await getPurchaseReturnTaskById(id)
  proReturnInfo.value = res
}

/** 点击查看出库记录 */
const onViewOutRecordClick = (productModelId: string) => {
  activeTab.value = EnumTab.OutRecord
  curProductionId.value = productModelId
}
</script>

<style lang="scss" scoped>
.procurement-return-detail {
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
