<template>
  <div class="layout-child-page-container">
    <div class="layout-child-page-content">
      <div>
        <el-button icon="ArrowLeft" @click="emits('close')">返回</el-button>
      </div>
      <CustomTitle title="送货单" :is-table-title="false" show-short-bar></CustomTitle>
      <CustomDescription :data="formData || {}" :configs="formConfigs"></CustomDescription>
    </div>

    <div class="layout-child-page-content tabs-container">
      <div class="tabs-operation">
        <el-radio-group v-model="tabValue" style="margin-bottom: 20px">
          <el-radio-button v-for="item in tabList" :key="item.value" :value="item.value">{{
            item.label
          }}</el-radio-button>
        </el-radio-group>
        <el-button type="primary" plain icon="Printer" @click="onPrint()">打印</el-button>
      </div>
      <InventoryTab v-if="tabValue === EnumTabs.Inventory" :data="props.data" />
      <ReportTab v-if="tabValue === EnumTabs.Report" :data="props.data" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { querySupplierDeliveryOrderDetail } from "@/api/baseInfo/supplier-platform/supplier-platform"
import CustomDescription from "@/components/CustomDescription/index.vue"
import CustomTitle from "@/components/CustomTitle/index.vue"
import useBarcodePrint from "@/hooks/useBarcodePrint"
import type {
  ISupplierDeliveryData,
  ISupplierDeliveryOrderItem
} from "@/types/base-info/supplier-platform"
import type { IOption } from "@/types/common"

import InventoryTab from "./tabs/InventoryTab.vue"
import ReportTab from "./tabs/ReportTab.vue"

defineOptions({
  name: "GradientModelDetail"
})

enum EnumTabs {
  Inventory,
  Report
}

const props = withDefaults(
  defineProps<{
    data: ISupplierDeliveryData
  }>(),
  {}
)
const emits = defineEmits<{
  (e: "close"): void
}>()

const { printDeliveryOrder } = useBarcodePrint()

const formData = ref<ISupplierDeliveryOrderItem>()
const formConfigs = ref([
  {
    label: "送货单号：",
    field: "sendOrderNo"
  },
  {
    label: "订单号：",
    field: "orderNo"
  },
  {
    label: "订单类型：",
    field: "orderType",
    formatter: () => {
      if (!formData.value?.orderType) {
        return ""
      }

      return formData.value?.orderType === 1 ? "采购订单" : "委外订单"
    }
  },
  {
    label: "送货日期：",
    field: "sendTime"
  },
  {
    label: "备注：",
    field: "remark",
    colspan: -1
  }
])

const tabValue = ref(EnumTabs.Inventory)
const tabList = ref<IOption[]>([
  {
    label: "送货清单",
    value: EnumTabs.Inventory
  },
  {
    label: "关联报告",
    value: EnumTabs.Report
  }
])

onMounted(() => {
  getDeliveryOrderDetail()
})

/** 获取送货单详情 */
const getDeliveryOrderDetail = async () => {
  const data = await querySupplierDeliveryOrderDetail({
    sendOrderNo: props.data.sendOrderNo,
    supplierId: props.data.supplierId
  })
  formData.value = data
}

/** 打印操作 */
const onPrint = async () => {
  printDeliveryOrder(props.data.sendOrderNo, props.data.supplierId)
}
</script>

<style lang="scss" scoped>
.tabs-container {
  flex: 1;

  &:deep(.custom-table) {
    flex: 1;
    overflow: hidden;
  }

  .tabs-operation {
    display: flex;
    justify-content: space-between;
  }
}
</style>
