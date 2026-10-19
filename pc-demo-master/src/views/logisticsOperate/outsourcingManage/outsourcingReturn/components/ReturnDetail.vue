<!-- 物流运营-委外管理-委外退料详情 -->

<template>
  <div class="layout-child-page-container">
    <div class="layout-child-page-content border-bottom">
      <div>
        <el-button icon="ArrowLeft" @click="emit('close')">返回</el-button>
      </div>
      <CustomTitle title="基础信息" :is-table-title="false" show-short-bar />
      <div class="order-info">
        <span class="detailSubTitle">委外退料单号：{{ proReturnInfo?.no }}</span>
        <el-tag
          :type="
            EnumOutsourcingReturnOrderStatusTagMap[
              proReturnInfo?.status as EnumOutsourcingReturnOrderStatus
            ]
          "
          >{{
            EnumOutsourcingReturnOrderStatusMap[
              proReturnInfo?.status as EnumOutsourcingReturnOrderStatus
            ]
          }}</el-tag
        >
      </div>
      <CustomDescription :data="proReturnInfo" :configs="detailConfig"></CustomDescription>
    </div>
    <div
      class="layout-child-page-content bottom-content"
      :style="activeTab === EnumTab.ReturnList ? 'padding-bottom: 16px;' : 'padding-bottom: 0'"
    >
      <div class="tab">
        <el-radio-group v-model="activeTab">
          <el-radio-button :value="EnumTab.ReturnList">委外退料清单</el-radio-button>
          <el-radio-button :value="EnumTab.ReceiveRecord">收货记录</el-radio-button>
          <el-radio-button :value="EnumTab.Inspection">检验记录</el-radio-button>
          <el-radio-button :value="EnumTab.Storage" @click="onViewOutRecordClick()"
            >入库记录</el-radio-button
          >
        </el-radio-group>
      </div>
      <CustomTitle :title="activeTabDes" :is-table-title="false" show-short-bar>
        <div v-show="activeTab === EnumTab.Storage">
          <el-select
            v-model="curProductionId"
            placeholder="请按物料筛选"
            @change="getOutRecordList()"
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
      <div class="table-box">
        <ReturnListTable
          v-if="activeTab === EnumTab.ReturnList"
          v-model:origin-list="materialReturnList"
          @on-view-out-record-click="onViewOutRecordClick"
        />
        <ReceiveRecord v-if="activeTab === EnumTab.ReceiveRecord" :select-id="selectId" />
        <InspectionRecord v-if="activeTab === EnumTab.Inspection" :select-id="selectId" />
        <StorageRecord
          ref="StorageRecordRef"
          v-if="activeTab === EnumTab.Storage"
          :productModelId="curProductionId"
          :select-id="selectId"
        />
      </div>
    </div>
    <div class="footer-operation">
      <el-button @click="emit('close')">返回</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getOutsourcingReturnOrderById } from "@/api/logistics/delegate"
import CustomDescription from "@/components/CustomDescription/index.vue"
import type { ICustomDescriptionConfig } from "@/components/CustomDescription/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import {
  EnumOutsourcingReturnOrderStatus,
  EnumOutsourcingReturnOrderStatusMap,
  EnumOutsourcingReturnOrderStatusTagMap,
  EnumProductionOrderSource,
  EnumProductionOrderSourceMap
} from "@/constant/enums"
import type { IDelegateMaterialReturnAddItem, IDelegateReturnVo } from "@/types/logistics/delegate"

import InspectionRecord from "./InspectionRecord.vue"
import ReceiveRecord from "./ReceiveRecord.vue"
import ReturnListTable from "./ReturnListTable.vue"
import StorageRecord from "./StorageRecord.vue"

enum EnumTab {
  ReturnList, // 退料清单
  ReceiveRecord, // 收货记录
  Inspection, //检验记录
  Storage //入库记录
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
const proReturnInfo = ref<Partial<IDelegateReturnVo>>({})
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
    field: "source",
    label: "来源：",
    formatter: ({ data: { source } }) => {
      return EnumProductionOrderSourceMap[source as EnumProductionOrderSource]
    }
  },
  {
    field: "returnDate",
    label: "计划退料日期："
  },
  {
    field: "createTime",
    label: "创建时间："
  },
  {
    field: "archiveTime",
    label: "结单时间："
  }
])

const materialReturnList = ref<IDelegateMaterialReturnAddItem[]>([]) // 委外退料单-物料清单
const curProductionId = ref("") // 当前选中产品ID
const productionOptions = ref<{ label: string; value: string }[]>([]) // 产品下拉
const activeTabDes = computed(() => {
  let description = ""
  switch (activeTab.value) {
    case EnumTab.ReturnList:
      description = "委外退料清单"
      break
    case EnumTab.Inspection:
      description = "检验记录"
      break
    case EnumTab.Storage:
      description = "入库记录"
      break
    case EnumTab.ReceiveRecord:
      description = "收货记录"
      break
  }
  return description
})
const StorageRecordRef = ref<InstanceType<typeof StorageRecord>>()

onMounted(() => {
  getOutsourcingReturnOrderDetail()
})

const getOutRecordList = async () => {
  nextTick(() => {
    StorageRecordRef.value?.getList()
  })
}

/** 获取委外退料单详情 */
const getOutsourcingReturnOrderDetail = async () => {
  const res = await getOutsourcingReturnOrderById({ id: props.selectId })
  proReturnInfo.value = res
  materialReturnList.value = res.detailVoList
  productionOptions.value = res.detailVoList.map((item) => {
    return {
      label: item.productModelName,
      value: item.productModelId
    }
  })
}

/** 点击查看入库记录 */
const onViewOutRecordClick = (productModelId?: string) => {
  activeTab.value = EnumTab.Storage
  curProductionId.value = productModelId || ""
}

defineOptions({
  name: "OutsourcingReturnDetail"
})
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
