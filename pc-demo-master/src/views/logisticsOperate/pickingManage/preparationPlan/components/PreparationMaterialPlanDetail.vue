<template>
  <div class="preparation-material-plan-detail">
    <div class="detail-top">
      <div>
        <el-button icon="ArrowLeft" @click="emit('close')">返回</el-button>
      </div>
      <CustomTitle title="计划信息" :is-table-title="false" show-short-bar />
      <div class="order">
        <span>任务单号：{{ formData?.no }}</span>
      </div>
      <CustomDescription :data="formData!" :configs="detailConfig" style="padding: 0">
      </CustomDescription>
    </div>
    <div class="material-list">
      <el-radio-group v-model="activeTabName">
        <el-radio-button value="materialList">物料清单</el-radio-button>
        <el-radio-button value="prepareTask">领料任务</el-radio-button>
      </el-radio-group>
      <div class="table-container">
        <template v-if="activeTabName === 'materialList'">
          <MaterialListTable
            v-model:material-list="formData.itemList"
            :status="formData.status"
            :is-auth="!!isAuth"
          ></MaterialListTable>
        </template>
        <template v-if="activeTabName === 'prepareTask'">
          <PrepareTaskTable :no="formData.no" />
        </template>
      </div>
    </div>

    <div class="layout-footer">
      <el-button @click="emit('close')">取消</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { queryPreparationMaterialPlanDetail } from "@/api/logistics/preparationMaterial"
import CustomDescription from "@/components/CustomDescription/index.vue"
import type { ICustomDescriptionConfig } from "@/components/CustomDescription/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import {
  EnumDeliveryOrderStatus,
  EnumDeliveryOrderStatusMap,
  EnumGetMaterialPurpose,
  EnumGetMaterialPurposeMap,
  EnumOutsourcingOrderStatus,
  EnumOutsourcingOrderStatusMap,
  EnumPackOrderStatus,
  EnumPackOrderStatusMap,
  EnumPreparationMaterialPlanType,
  EnumPreparationMaterialPlanTypeMap,
  EnumProductionTaskStatus,
  EnumProductionTaskStatusMap
} from "@/constant/enums"
import useButtonAuth from "@/hooks/useButtonAuth"
import type { IPreparationMaterialDetail } from "@/types/logistics/preparationMaterial"

import MaterialListTable from "./MaterialListTable.vue"
import PrepareTaskTable from "./PrepareTaskTable.vue"

defineOptions({
  name: "PreparationMaterialPlanDetail"
})

const props = withDefaults(
  defineProps<{
    selectId: string
  }>(),
  {}
)
const emit = defineEmits<{
  (e: "close"): void
}>()

const isAuth = useButtonAuth("PreparationPlan_update", "PreparationPlan_query")

const formData = ref<IPreparationMaterialDetail>({} as IPreparationMaterialDetail)
const detailConfig = ref<ICustomDescriptionConfig[]>([
  {
    label: "领取用途：",
    field: "facilityName",
    formatter: ({ data: { useFor } }) => {
      return EnumGetMaterialPurposeMap[useFor as EnumGetMaterialPurpose]
    }
  },
  {
    label: "计划领取时间：",
    field: "planTime"
  },
  {
    label: "类型：",
    field: "type",
    formatter: ({ data: { type } }) => {
      return EnumPreparationMaterialPlanTypeMap[type as EnumPreparationMaterialPlanType]
    }
  },
  {
    label: "来源单号：",
    field: "sourceNo"
  },
  {
    label: "计划开始时间：",
    field: "planStartTime"
  },
  {
    label: "任务状态：",
    field: "sourceStatus",
    formatter: ({ data: { useFor, sourceStatus } }) => {
      if (useFor === EnumGetMaterialPurpose.PRODUCTION) {
        return EnumProductionTaskStatusMap[sourceStatus as EnumProductionTaskStatus]
      } else if (useFor === EnumGetMaterialPurpose.OUTSOURCING) {
        return EnumOutsourcingOrderStatusMap[sourceStatus as EnumOutsourcingOrderStatus]
      } else if (useFor === EnumGetMaterialPurpose.PACK) {
        return EnumPackOrderStatusMap[sourceStatus as EnumPackOrderStatus]
      } else if (useFor === EnumGetMaterialPurpose.DELIVERY) {
        return EnumDeliveryOrderStatusMap[sourceStatus as EnumDeliveryOrderStatus]
      }
    }
  },
  {
    label: "备注：",
    field: "remarks",
    colspan: 2
  }
])

const activeTabName = ref("materialList")

onBeforeMount(() => {
  getPreparationMaterialPlanDetail(props.selectId)
})

/** 获取领料计划详情 */
const getPreparationMaterialPlanDetail = async (id: string) => {
  const data = await queryPreparationMaterialPlanDetail(id)
  if (data) {
    formData.value = data
  }
}
</script>

<style lang="scss" scoped>
.preparation-material-plan-detail {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: var(--g-color);
}

.detail-top {
  padding: 12px 16px;
  border-bottom: 1px solid #e4e7ed;

  .order {
    font-weight: bold;
    margin: 0 0 16px 20px;
    line-height: 24px;

    .status {
      margin-left: 16px;
    }
  }
}

.base-info-content {
  display: flex;
  flex-wrap: wrap;
  font-size: 14px;
  border-bottom: 1px solid #e4e7ed;
  padding-bottom: 12px;

  .item {
    display: flex;
    width: 25%;
    min-width: 320px;
    margin-bottom: 14px;
    line-height: 20px;

    .label {
      width: 128px;
      text-align: right;
      color: #a8abb2;
    }

    .value {
      flex: 1;
    }
  }
}

.material-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 12px 20px 16px;
  overflow: hidden;

  .table-container {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    margin-top: 12px;
  }
}
</style>
