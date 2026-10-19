<!-- 包装排班信息 -->
<template>
  <CustomDrawer v-model="visible" :title="`${isArrangePlanType ? '排班' : '排产'}信息`">
    <!-- 订单信息 -->
    <div class="mt-[12px] gray-box" v-if="!isArrangePlanType">
      <div class="title">
        <span>订单信息</span>
      </div>
      <div class="line">
        <div class="label">发货计划：</div>
        <div class="value">
          {{ detailInfo?.deliveryPlanVo?.deliveryCode ?? "--" }}
        </div>
      </div>
      <div class="line">
        <div class="label">客户名称：</div>
        <div class="value">
          {{ detailInfo?.deliveryPlanVo?.customerName ?? "--" }}
        </div>
      </div>
      <div class="line">
        <div class="label">发货内容：</div>
        <div class="value">
          {{ shipmentContent }}
        </div>
      </div>
      <div class="line">
        <div class="label">计划发货日期：</div>
        <div class="value">
          {{
            detailInfo?.deliveryPlanVo?.deliveryTime
              ? dayjs(detailInfo?.deliveryPlanVo?.deliveryTime).format("YYYY-MM-DD")
              : "--"
          }}
        </div>
      </div>
    </div>

    <!-- 排产/任务信息 -->
    <div class="mt-[12px] gray-box" v-if="!isArrangePlanType">
      <div class="title">
        <span>{{ isNotPublishPlanType ? "排产" : "任务" }}信息</span>
        <div class="flex items-center">
          <span
            class="inline-block w-[12px] h-[12px] rounded-[50%]"
            :style="{ 'background-color': IceFloatColorMap[data?.taskType] ?? 'pink' }"
          ></span>
          <span class="ml-[8px]">{{ typeToNameMap[data?.taskType] ?? "" }}</span>
        </div>
      </div>

      <CustomTable v-model:table-data="tableData" :config="tableConfig"></CustomTable>

      <div class="line">
        <div class="label">开始时间：</div>
        <div class="value">
          {{ detailInfo?.deliveryPlanVo?.planBeginTime ?? "--" }}
        </div>
      </div>
      <div class="line">
        <div class="label">结束时间：</div>
        <div class="value">
          {{ detailInfo?.deliveryPlanVo?.planEndTime ?? "--" }}
        </div>
      </div>
    </div>

    <!-- 生产区域信息 -->
    <div class="mt-[12px] gray-box">
      <div class="title">
        <span>生产区域信息</span>
      </div>
      <div class="line">
        <div class="label">生产区域名称：</div>
        <div class="value">
          {{ detailInfo?.entityName ?? "--" }}
        </div>
      </div>
      <div class="line">
        <div class="label">生产区域编号：</div>
        <div class="value">
          {{ detailInfo?.entityCode ?? "--" }}
        </div>
      </div>
    </div>
  </CustomDrawer>
</template>

<script setup lang="ts" name="">
import dayjs from "dayjs"

import { getProductionOrderItemDetail } from "@/api/scheduling"
import CustomDrawer from "@/components/CustomDrawer/index.vue"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ITableConfig } from "@/components/CustomTable/type"
import { IceFloat, IceFloatColorMap } from "@/components/GanttChart/useChart"
import { useAreaLocation } from "@/hooks/useAreaLocation"
import type { ISchedulePlanDetail } from "@/types/production-manage/scheduling"
import { isEffectiveValue, precisionConversion } from "@/utils/common"

const props = defineProps<{
  modelValue: boolean
  data: any
}>()
const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
  (e: "onOk"): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val)
})

const typeToNameMap: Record<string, string> = {
  [IceFloat.ScheOk]: "可排产",
  [IceFloat.ScheNo]: "不可排产",
  [IceFloat.ScheStop]: "计划停产",
  [IceFloat.ScheUnPub]: "未发布排产",
  [IceFloat.ScheInPub]: "已发布排产",
  [IceFloat.ScheProcessed]: "已包装排产"
}

const { curLocation } = useAreaLocation()

const detailInfo = ref<ISchedulePlanDetail>()
const tableConfig = ref<ITableConfig>({
  columns: [
    {
      prop: "productModelName",
      label: "产品名称",
      minWidth: 160
    },
    {
      prop: "productModelSpec",
      label: "产品规格",
      minWidth: 160,
      formatter: (row: any) => row.productModelSpec || row.productModel?.specification || "-"
    },
    {
      prop: "schedulableQty",
      label: "可排包装数",
      minWidth: 120,
      align: "right",
      formatter: ({ schedulableQty, decimalNumber }) =>
        isEffectiveValue(schedulableQty) ? precisionConversion(schedulableQty, decimalNumber) : ""
    },
    {
      prop: "unPublishQty",
      label: "未发布数",
      minWidth: 120,
      align: "right",
      formatter: ({ unPublishQty, decimalNumber }) =>
        isEffectiveValue(unPublishQty) ? precisionConversion(unPublishQty, decimalNumber) : ""
    },
    {
      prop: "planQty",
      label: "本次排产数",
      minWidth: 120,
      align: "right",
      formatter: ({ planQty, decimalNumber }) =>
        isEffectiveValue(planQty) ? precisionConversion(planQty, decimalNumber) : ""
    }
  ]
})
const tableData = computed(() => detailInfo.value?.deliveryPlanVo?.targetDetails || [])
const shipmentContent = computed(() => {
  return (
    detailInfo.value?.deliveryPlanVo?.details
      ?.map((item) => {
        const num = isEffectiveValue(item.planQty)
          ? precisionConversion(item.planQty, item.decimalNumber)
          : ""
        return `${item.productModelName} ${num} ${item.unitName}`
      })
      ?.join("；") + "；" || "--"
  )
})

const isArrangePlanType = computed(() => {
  // 是否是排班计划类型: 可排产和不可排产。。这是背景
  return [IceFloat.ScheOk, IceFloat.ScheNo, IceFloat.ScheStop].includes(props.data?.taskType)
})
const isNotPublishPlanType = computed(() => {
  // 未发布和审批中
  return [IceFloat.ScheExaming, IceFloat.ScheUnPub].includes(props.data?.taskType)
})

watch(
  () => props.modelValue,
  async (val) => {
    if (val) {
      const res = await getProductionOrderItemDetail({
        entityId: props.data.facilityId,
        taskType: props.data.taskType,
        level: curLocation.level,
        taskId: props.data.taskId,
        currentTime: dayjs(props.data.beginTime).add(1, "second").format("YYYY-MM-DD HH:mm:ss"), // 时间随机
        source: "deliveryPlan"
      })
      detailInfo.value = res
    }
  }
)
</script>

<style scoped lang="scss">
.gray-box {
  background-color: rgba(245, 247, 250, 1);
  padding: 10px 16px;
  .title {
    color: #303133;
    font-weight: bold;
    font-size: 16px;
    height: 28px;
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .line {
    padding: 6px 0;
    display: flex;
  }
  .label {
    color: #a8abb2;
    font-size: 14px;
    width: 96px;
    white-space: nowrap;
  }
  .value {
    color: #303133;
    font-size: 14px;
    max-width: calc(100% - 100px);
    white-space: wrap;
  }
  .type {
    font-size: 14px;
    font-weight: 400;
  }
}
</style>
