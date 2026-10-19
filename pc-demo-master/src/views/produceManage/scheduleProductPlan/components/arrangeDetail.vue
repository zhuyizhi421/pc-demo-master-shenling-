<!-- 排班信息 -->
<template>
  <div class="scheduleInfo">
    <CustomDrawer
      :title="`${isArrangePlanType ? '排班' : '排产'}信息`"
      :model-value="modelValue"
      size="small"
      @close="emits('update:modelValue', false)"
    >
      <!-- 订单信息 -->
      <div class="mt-[12px] gray-box" v-if="!isArrangePlanType">
        <div class="title">
          <span>订单信息</span>
        </div>
        <div class="line">
          <div class="label">生产订单：</div>
          <div class="value">
            {{ detailInfo?.orderDetail?.no ?? "--" }}
          </div>
        </div>
        <div class="line">
          <div class="label">产品名称：</div>
          <div class="value">
            {{ detailInfo?.orderDetail?.productModel?.name ?? "--" }}
          </div>
        </div>
        <div class="line">
          <div class="label">产品编号：</div>
          <div class="value">
            {{ detailInfo?.orderDetail?.productModel?.code ?? "--" }}
          </div>
        </div>
        <div class="line">
          <div class="label">订单数：</div>
          <div class="value">
            {{ detailInfo?.orderDetail?.orderAmount ?? "--" }}
            {{ detailInfo?.orderDetail?.unitItem?.unitName ?? "" }}
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
        <div class="line">
          <div class="label">工序：</div>
          <div class="value">
            {{ detailInfo?.orderPlanDetail?.processSerial ?? "--" }}
          </div>
        </div>
        <div class="line">
          <div class="label">工艺名称：</div>
          <div class="value">
            {{ detailInfo?.orderPlanDetail?.techName ?? "--" }}
          </div>
        </div>
        <div class="line">
          <div class="label">产出名称：</div>
          <div class="value">
            {{ detailInfo?.orderPlanDetail?.productModelName ?? "--" }}
          </div>
        </div>
        <div class="line">
          <div class="label">计划生产数：</div>
          <div class="value">
            {{ detailInfo?.orderPlanDetail?.planAmount ?? "--" }}
            {{ detailInfo?.orderDetail?.unitItem?.unitName ?? "" }}
          </div>
        </div>
        <div class="line">
          <div class="label">可排生产数：</div>
          <div class="value">
            {{ detailInfo?.orderPlanDetail?.availableAmount ?? "--" }}
            {{ detailInfo?.orderDetail?.unitItem?.unitName ?? "" }}
          </div>
        </div>
        <div class="line">
          <div class="label">未发布生产数：</div>
          <div class="value">
            {{ detailInfo?.orderPlanDetail?.unPublishAmount ?? "--" }}
            {{ detailInfo?.orderDetail?.unitItem?.unitName ?? "" }}
          </div>
        </div>
        <div class="line">
          <div class="label">本次排产数：</div>
          <div class="value">
            {{ detailInfo?.orderPlanDetail?.taskAmount ?? "--" }}
            {{ detailInfo?.orderDetail?.unitItem?.unitName ?? "" }}
          </div>
        </div>
        <div class="line">
          <div class="label">预计生产耗时：</div>
          <div class="value">
            {{
              detailInfo?.orderPlanDetail?.ctTime
                ? detailInfo?.orderPlanDetail?.ctTime + " 分钟"
                : "--"
            }}
          </div>
        </div>
        <div class="line">
          <div class="label">开始时间：</div>
          <div class="value">
            {{ detailInfo?.orderPlanDetail?.planBeginTime ?? "--" }}
          </div>
        </div>
        <div class="line">
          <div class="label">结束时间：</div>
          <div class="value">
            {{ detailInfo?.orderPlanDetail?.planEndTime ?? "--" }}
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
  </div>
</template>

<script setup lang="ts" name="">
import { getProductionOrderItemDetail } from "@/api/scheduling"
import CustomDrawer from "@/components/CustomDrawer/index.vue"
import { IceFloat, IceFloatColorMap } from "@/components/GanttChart/useChart"
import { useAreaLocation } from "@/hooks/useAreaLocation"

const typeToNameMap: Record<string, string> = {
  [IceFloat.ScheOk]: "可排产",
  [IceFloat.ScheNo]: "不可排产",
  [IceFloat.ScheStop]: "计划停产",
  [IceFloat.ScheUnPub]: "未发布排产",
  [IceFloat.ScheInPub]: "已发布排产",
  [IceFloat.ScheProcessed]: "已加工排产"
}

const props = defineProps<{
  modelValue: boolean
  data: any
}>()
const emits = defineEmits<{
  (e: "update:modelValue", value: boolean): void
  (e: "onOk"): void
}>()

const { curLocation } = useAreaLocation()

const detailInfo = ref<any>()
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
      try {
        const res = await getProductionOrderItemDetail({
          entityId: props.data.facilityId,
          taskType: props.data.taskType,
          level: curLocation.level,
          taskId: props.data.taskId,
          currentTime: dayjs(props.data.beginTime).add(1, "second").format("YYYY-MM-DD HH:mm:ss"), // 时间随机
          source: "productionOrder"
        })
        detailInfo.value = res
      } catch (error) {
        /* empty */
      }
    }
  }
)
</script>

<style scoped lang="scss">
.scheduleInfo {
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
}
</style>
