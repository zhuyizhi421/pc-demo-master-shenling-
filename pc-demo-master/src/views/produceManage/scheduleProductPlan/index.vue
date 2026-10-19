<!--
  生产运营管理 - 计划排产
-->
<template>
  <div class="schedule-product-plan">
    <div class="layout-child-header">
      <div class="schedule-title-group">
        <div class="schedule-page-title">计划排产</div>
        <el-date-picker
          v-model="scheduleDateRange"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          class="schedule-header-date"
        />
      </div>
      <div class="schedule-header-actions">
        <el-button @click="schedulePageRef?.handleCancelPublish()">取消发布</el-button>
        <el-button type="primary" @click="schedulePageRef?.handlePublish()">发布</el-button>
        <el-button @click="schedulePageRef?.handleCancelPreSchedule()">取消预排</el-button>
        <el-button type="success" @click="schedulePageRef?.openAutoScheduleDialog()">自动排产</el-button>
      </div>
    </div>

    <div class="layout-schedule-page">
      <SchedulePage
        ref="schedulePageRef"
        :initial-orders="scheduledOrders"
        :urgent-insert-reason="urgentInsertReason"
        v-model:date-range="scheduleDateRange"
        @orders-change="handleScheduleOrdersChange"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue"
import dayjs from "dayjs"

import SchedulePage from "./components/SchedulePage.vue"
import type { IProductionOrderPageItem } from "@/types/production-manage/product-order"

defineOptions({
  name: "ScheduleProductPlan"
})

const scheduledOrders = ref<IProductionOrderPageItem[]>([])
const urgentInsertReason = ref("")
const scheduleDateRange = ref<[string, string]>([
  dayjs().format("YYYY-MM-DD"),
  dayjs().add(7, "day").format("YYYY-MM-DD")
])
const schedulePageRef = ref<{
  handlePublish: () => Promise<void> | void
  handleCancelPublish: () => Promise<void> | void
  handleCancelPreSchedule: () => Promise<void> | void
  openAutoScheduleDialog: () => void
}>()

const handleScheduleOrdersChange = (orders: IProductionOrderPageItem[]) => {
  scheduledOrders.value = orders
}
</script>

<style scoped lang="scss">
.schedule-product-plan {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.layout-child-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-shrink: 0;
  border: 1px solid #e4e7ed;
  padding: 7px 12px;
  background: #fff;
}

.schedule-page-title {
  color: #909399;
  font-size: 14px;
  padding: 2px 12px;
  background: #f0f2f5;
  border-radius: 4px;
}

.schedule-title-group {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.schedule-header-date {
  width: 260px;

  :deep(.el-range-input) {
    font-size: 12px;
  }
}

.schedule-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.layout-schedule-page {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
</style>
