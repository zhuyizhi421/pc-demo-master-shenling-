<template>
  <div 
    id="tooltip" 
    class="tooltip"
    :class="{ visible: visible }"
    :style="{
      left: `${position.x}px`,
      top: `${position.y}px`,
      transform: 'translateX(-100%) translateY(-100%)'
    }"
  >
    <div v-if="task" class="font-medium mb-1">
      {{ task.orderNo }} - {{ task.productName }}
    </div>
    <div v-if="task" class="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
      <div>数量:</div>
      <div>{{ task.quantity }}</div>
      <div>开始时间:</div>
      <div>{{ formatDateTime(task.startTime) }}</div>
      <div>结束时间:</div>
      <div>{{ formatDateTime(task.endTime) }}</div>
      <div>状态:</div>
      <div>{{ getStatusText(task.status) }}</div>
      <div>进度:</div>
      <div>{{ task.progress }}%</div>
    </div>
  </div>
</template>

<script setup lang="ts">

import type { Task } from "./types"
import { formatDateTime, getStatusText } from "./utils"

// Props
const props = defineProps<{
  visible: boolean;
  task: Task | null;
  position: { x: number; y: number };
}>();
</script>
<style lang="scss" scoped>
.tooltip{
    position: absolute;
    z-index: 1000;
    background-color: #fff;
    padding: 8px;
    border-radius: 4px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    font-size: 12px;
    color: #333;
    white-space: nowrap;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    pointer-events: none;
    display: none;
    &.visible{
        display: block;
    }
}
</style>
