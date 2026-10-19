<!-- 组件 仓库盘点详情 -->
<template>
  <div class="depot-detail">
    <div class="detail-top">
      <div>
        <el-button icon="ArrowLeft" @click="emit('close')">返回</el-button>
      </div>
      <CustomTitle title="基础信息" :is-table-title="false" show-short-bar />
      <div class="base-info-order">
        <span>盘点单号：{{ detailData?.checkCode }}</span>
      </div>
      <CustomDescription :data="detailData" :configs="detailConfig" style="padding: 0">
      </CustomDescription>
    </div>
    <div class="product-detail">
      <el-radio-group v-model="activeTab">
        <el-radio-button :value="EnumTab.List">盘点清单</el-radio-button>
        <el-radio-button :value="EnumTab.Record">盘点记录</el-radio-button>
      </el-radio-group>
      <div class="table-container">
        <template v-if="detailData.id">
          <template v-if="activeTab === EnumTab.List">
            <DepotListTable
              :id="props.detailData.id"
              v-model:production-options="productionOptions"
              @onViewOutRecordClick="onViewOutRecordClick"
            />
          </template>
          <template v-if="activeTab === EnumTab.Record">
            <DepotRecordTable
              :id="props.detailData.id"
              :production-options="productionOptions"
              v-model:cur-production-id="curProductionId"
            />
          </template>
        </template>
      </div>
    </div>
    <div class="footer-operation">
      <el-button @click="emit('close')">返回</el-button>
      <el-button v-if="detailData?.checkStatus == 1 && !justSee" @click="completeHandle(true)">
        放弃处理并结案
      </el-button>
      <el-button
        v-if="detailData?.checkStatus == 1 && !justSee"
        @click="completeHandle(false)"
        type="primary"
      >
        按盘点结果结案
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts" name="depotDetail">
import { ElMessage, ElMessageBox } from "element-plus"

import { requestSettleWarehouseCheck } from "@/api/logistics/warehouseCheck"
import CustomDescription from "@/components/CustomDescription/index.vue"
import type { ICustomDescriptionConfig } from "@/components/CustomDescription/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import type { IWarehouseCheckPageListItem } from "@/types/logistics/warehouse-check"

import DepotListTable from "./DepotListTable.vue"
import DepotRecordTable from "./DepotRecordTable.vue"

const props = defineProps<{
  modelValue: boolean
  detailData: IWarehouseCheckPageListItem
  justSee?: boolean
}>()
const emit = defineEmits<{
  (e: "close"): void
  (e: "success"): void
}>()

enum EnumTab {
  List, // 盘点清单
  Record // 盘点记录
}

const detailConfig = ref<ICustomDescriptionConfig[]>([
  {
    label: "仓库名称：",
    field: "facilityName"
  },
  {
    label: "仓库编号：",
    field: "facilityCode"
  },
  {
    label: "状态：",
    field: "checkStatus",
    formatter: ({ data: { checkStatus } }) => {
      return ["未发布", "已发布", "已结案"][checkStatus]
    }
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
    label: "结案人：",
    field: "statementEmpName"
  }
])

const activeTab = ref(EnumTab.List)

const curProductionId = ref("") // 当前选中产品ID
const productionOptions = ref<{ label: string; value: string }[]>([]) // 产品下拉

const completeHandle = async (isGiveUp: boolean) => {
  try {
    await ElMessageBox.confirm(
      isGiveUp
        ? "确认放弃本次盘点的结果？"
        : "接受本次盘点结果，并按实盘数量进行相关实例的变更调整!",
      "提示",
      {
        confirmButtonText: isGiveUp ? "确认放弃" : "确认接受",
        type: "warning"
      }
    )

    await requestSettleWarehouseCheck({ id: props.detailData.id, accept: !isGiveUp }) // 接口操作
    ElMessage.success("结案成功")
    emit("success")
    emit("close")
  } catch (error) {
    /* empty */
  }
}

/** 点击查看出库记录 */
const onViewOutRecordClick = (productModelId: string) => {
  activeTab.value = EnumTab.Record
  curProductionId.value = productModelId
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
