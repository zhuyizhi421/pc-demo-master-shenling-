<template>
  <div class="depot-detail">
    <div class="detail-top">
      <el-button icon="ArrowLeft" @click="emit('close')">返回</el-button>
      <CustomTitle title="基础信息" :is-table-title="false" show-short-bar />
      <div class="base-info-order"><span>盘点单号：{{ detailData?.checkNo }}</span></div>
      <CustomDescription :data="detailData" :configs="detailConfig" style="padding: 0" />
    </div>
    <div class="product-detail">
      <el-radio-group v-model="activeTab">
        <el-radio-button :value="EnumTab.List">盘点清单</el-radio-button>
        <el-radio-button :value="EnumTab.Record">盘点记录</el-radio-button>
      </el-radio-group>
      <div class="table-container">
        <ListTable
          v-if="activeTab === EnumTab.List && detailData.id"
          :id="detailData.id"
          v-model:mro-options="mroOptions"
          @on-view-record-click="onViewRecordClick"
          @on-view-mro-info-click="onViewMroInfoClick"
          @on-view-mro-model-click="onViewMroModelClick"
        />
        <RecordTable
          v-if="activeTab === EnumTab.Record && detailData.id"
          :id="detailData.id"
          :mro-options="mroOptions"
          v-model:cur-mro-id="curMroId"
          @on-view-mro-info-click="onViewMroInfoClick"
          @on-view-mro-model-click="onViewMroModelClick"
        />
      </div>
    </div>
    <div class="footer-operation">
      <el-button @click="emit('close')">返回</el-button>
      <el-button v-if="detailData?.checkStatus == 1 && !justSee" @click="completeHandle(true)">放弃处理并结案</el-button>
      <el-button v-if="detailData?.checkStatus == 1 && !justSee" type="primary" @click="completeHandle(false)">按盘点结果结案</el-button>
    </div>

    <MroInfoDialog v-model="mroInfoVisible" :mro-id="selectedMroInfoId" />
    <MroModelInfoDialog v-model="mroModelInfoVisible" :mro-model-id="selectedMroModelId" />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import { requestSettleMroInventoryCheck } from "@/api/operation/mro/mro-inventory-check"
import CustomDescription from "@/components/CustomDescription/index.vue"
import type { ICustomDescriptionConfig } from "@/components/CustomDescription/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import type {
  IMroInventoryCheckDetailItem,
  IMroInventoryCheckPageListItem,
  IMroInventoryCheckRecordItem
} from "@/types/maintain/mro-manage/mro-inventory-check"
import MroInfoDialog from "@/views/MROManage/MROInfo/components/MroInfoDialog.vue"
import MroModelInfoDialog from "@/views/MROManage/MROModelManage/components/MroModelInfoDialog.vue"

import ListTable from "./ListTable.vue"
import RecordTable from "./RecordTable.vue"

const props = defineProps<{ detailData: IMroInventoryCheckPageListItem; justSee?: boolean }>()
const emit = defineEmits<{ (e: "close"): void; (e: "success"): void }>()

enum EnumTab {
  List,
  Record
}

const detailConfig = ref<ICustomDescriptionConfig[]>([
  { label: "状态：", field: "checkStatus", formatter: ({ data: { checkStatus } }) => ["未发布", "已发布", "已结案"][checkStatus] },
  { label: "盘点日期：", field: "checkDate" },
  { label: "盘点人：", field: "checkEmpName" },
  { label: "仓库编号：", field: "warehouseNo" },
  { label: "仓库名称：", field: "warehouseName" },
  { label: "创建时间：", field: "createTime" },
  { label: "结案时间：", field: "statementTime" },
  { label: "结案人：", field: "statementEmpName" }
])

const activeTab = ref(EnumTab.List)
const curMroId = ref("")
const mroOptions = ref<{ label: string; value: string }[]>([])
const mroInfoVisible = ref(false)
const mroModelInfoVisible = ref(false)
const selectedMroInfoId = ref("")
const selectedMroModelId = ref("")

const completeHandle = async (isGiveUp: boolean) => {
  await ElMessageBox.confirm(
    isGiveUp ? "确认放弃本次盘点结果并结案？" : "确认按盘点结果处理库存并结案？",
    "提示",
    { confirmButtonText: isGiveUp ? "确认放弃" : "确认结案", type: "warning" }
  )
  await requestSettleMroInventoryCheck({ id: props.detailData.id, accept: !isGiveUp })
  ElMessage.success("结案成功")
  emit("success")
  emit("close")
}

const onViewRecordClick = (mroModelId: string) => {
  activeTab.value = EnumTab.Record
  curMroId.value = mroModelId
}

const onViewMroInfoClick = (row: IMroInventoryCheckDetailItem | IMroInventoryCheckRecordItem) => {
  const mroId = String(row.mroInformationId || "")
  if (!mroId) {
    ElMessage.warning("该行未关联MRO信息，无法查看详情")
    return
  }
  selectedMroInfoId.value = mroId
  mroInfoVisible.value = true
}

const onViewMroModelClick = (row: IMroInventoryCheckDetailItem | IMroInventoryCheckRecordItem) => {
  const mroModelId = String(row.mroModelId || "")
  if (!mroModelId) {
    ElMessage.warning("该行未关联MRO型号，无法查看详情")
    return
  }
  selectedMroModelId.value = mroModelId
  mroModelInfoVisible.value = true
}
</script>

<style scoped lang="scss">
.depot-detail {
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
