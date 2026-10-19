<template>
  <div class="allocate-detail">
    <div class="detail-top">
      <div>
        <el-button icon="ArrowLeft" @click="emit('close')">返回</el-button>
      </div>
      <CustomTitle title="基础信息" :is-table-title="false" show-short-bar />
      <div class="base-info-order">
        <span>调拨单号：{{ detailData?.allocateCode }}</span>
      </div>
      <CustomDescription :data="detailData" :configs="detailConfig" style="padding: 0">
      </CustomDescription>
    </div>
    <div class="product-detail">
      <el-radio-group v-model="activeTab">
        <el-radio-button :value="EnumTab.AllocateRecord">调拨清单</el-radio-button>
        <el-radio-button :value="EnumTab.OutInRecord">出入库记录</el-radio-button>
      </el-radio-group>
      <div class="table-container">
        <template v-if="detailData.id">
          <template v-if="activeTab === EnumTab.AllocateRecord">
            <AllocateRecordTable :id="detailData.id" @onViewOutRecordClick="onViewOutRecordClick" />
          </template>
          <template v-if="activeTab === EnumTab.OutInRecord">
            <OutInRecordTable :id="detailData.id" v-model:cur-production-id="curProductionId" />
          </template>
        </template>
      </div>
    </div>
    <div class="footer-operation">
      <el-button @click="emit('close')">返回</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { queryFactoryModelList } from "@/api/fm"
import CustomDescription from "@/components/CustomDescription/index.vue"
import type { ICustomDescriptionConfig } from "@/components/CustomDescription/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import {
  EnumProductionOrderSource,
  EnumProductionOrderSourceMap,
  EnumWarehouseAllotStatus,
  EnumWarehouseAllotStatusMap
} from "@/constant/enums"
import type { LogisticsAllocateRecord as ITableRow } from "@/types/logistics/allocate"

import AllocateRecordTable from "./AllocateRecordTable.vue"
import OutInRecordTable from "./OutInRecordTable.vue"

enum EnumTab {
  AllocateRecord, // 调拨清单
  OutInRecord // 出入库记录
}

const props = defineProps<{
  currentRow: ITableRow
}>()

const emit = defineEmits<{
  (e: "close"): void
}>()

const curProductionId = ref("") // 当前选中产品ID

const activeTab = ref(EnumTab.AllocateRecord)

const factoryModelList = ref<
  {
    id: string
    entityName: string
    entityCode: string
  }[]
>([])
const detailData = ref<ITableRow>({})
const detailConfig = ref<ICustomDescriptionConfig[]>([
  {
    label: "拨出仓库：",
    field: "outWarehouseId",
    formatter: ({ data: { outWarehouseId } }) => {
      return factoryModelList.value.find((item) => item.id == outWarehouseId)?.entityName
    }
  },
  {
    label: "拨入仓库：",
    field: "inWarehouseId",
    formatter: ({ data: { inWarehouseId } }) => {
      return factoryModelList.value.find((item) => item.id == inWarehouseId)?.entityName
    }
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
    field: "allocateStatus",
    formatter: ({ data: { allocateStatus } }) => {
      return EnumWarehouseAllotStatusMap[allocateStatus as EnumWarehouseAllotStatus]
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

onMounted(async () => {
  detailData.value = props.currentRow
  await queryFactoryModelListRequest()
})

const queryFactoryModelListRequest = async () => {
  try {
    const res = await queryFactoryModelList({
      isStorage: true,
      isEnable: true
    })

    factoryModelList.value = res.map((item) => {
      return {
        id: item.id,
        entityName: item.entityName,
        entityCode: item.entityCode
      }
    })
  } catch (error) {
    console.log("getLogwarehouseList::", error)
  }
}

/** 点击查看出入库记录 */
const onViewOutRecordClick = (productModelId: string) => {
  activeTab.value = EnumTab.OutInRecord
  curProductionId.value = productModelId
}
</script>

<style scoped lang="scss">
.allocate-detail {
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
