<template>
  <div class="bg-dark-200 border-r border-gray-700 flex flex-col h-full">
    <div class="border-b border-gray-700">
      <h2 class="text-lg font-semibold mb-3 title">未排产订单</h2>
    </div>
    <div
      class="overflow-y-auto flex-1 scrollbar-thin scrollbar-dark task-list"
      id="orders-container"
    >
      <div v-if="orders.length === 0" class="text-gray-400 text-center py-8">暂无未排产订单</div>
      <div
        v-for="order in orders"
        :key="order.id"
        class="order-item bg-dark-100 border border-gray-700 rounded-md p-3 mb-3 cursor-move"
        :draggable="true"
        :data-order-id="order.id"
        @dragstart="handleDragStart($event, order)"
        @dragend="handleDragEnd"
      >
        <div class="flex justify-between items-start mb-2">
          <span class="font-sm text-[#000000] order-name">{{ order.orderNo }}</span>
        </div>
        <div class="text-sm text-[#000000] mb-2 order-name">{{ order.productName }}</div>
        <div class="flex justify-between text-xs text-gray-400">
          <span>数量: {{ order.quantity }}</span>
          <span>预计: {{ order.estimatedHours }}h</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Order } from "./types"


// Props
const props = defineProps<{
  orders: Order[]
}>()

// Emits
const emit = defineEmits<{
  refresh: []
}>()

const handleDragStart = (event: DragEvent, order: Order) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData("text/plain", order.id)
    ;(event.target as HTMLElement)?.classList.add("dragging")
  }
}

const handleDragEnd = (event: DragEvent) => {
  ;(event.target as HTMLElement)?.classList.remove("dragging")
}
</script>

<style lang="scss" scoped>
// 变量定义
$primary-color: #409eff;
$success-color: #67c23a;
$warning-color: #e6a23c;
$danger-color: #f56c6c;
$text-primary: #303133;
$text-regular: #606266;
$text-secondary: #909399;
$border-color: #e4e7ed;
$bg-dark: #f5f7fa;
$bg-light: #ffffff;
$shadow-light: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
$shadow-hover: 0 4px 16px 0 rgba(0, 0, 0, 0.15);
$transition-base: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

// 标题样式
.title {
  margin-left: 20px;
  font-size: 18px;
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
  font-weight: 600;
  color: $text-primary;
  line-height: 28px;
  position: relative;
  padding-left: 12px;

  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 18px;
    background: linear-gradient(180deg, $primary-color 0%, lighten($primary-color, 20%) 100%);
    border-radius: 2px;
  }
}

// 任务列表容器
.task-list {
  border-right: 1px solid $border-color;
  background-color: $bg-dark;
  padding: 16px;

  // 自定义滚动条
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c0c4cc;
    border-radius: 3px;
    transition: background 0.3s;

    &:hover {
      background: #909399;
    }
  }
}

// 空状态样式
.text-gray-400 {
  color: $text-secondary;
  font-size: 14px;

  &.text-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 200px;

    &::before {
      content: "📋";
      font-size: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }
  }
}

// 订单项样式
.order-item {
  background: $bg-light;
  border: 1px solid $border-color;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: move;
  transition: $transition-base;
  position: relative;
  overflow: hidden;

  // 左侧装饰条
  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: linear-gradient(180deg, $primary-color 0%, lighten($primary-color, 30%) 100%);
    opacity: 0;
    transition: opacity 0.3s;
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow: $shadow-hover;
    border-color: lighten($primary-color, 20%);

    &::before {
      opacity: 1;
    }

    .order-name {
      color: $primary-color;
    }
  }

  // 拖拽状态
  &.dragging {
    opacity: 0.6;
    transform: rotate(3deg) scale(0.98);
    box-shadow: $shadow-light;
    cursor: grabbing;

    &::before {
      opacity: 1;
      background: linear-gradient(180deg, $warning-color 0%, lighten($warning-color, 20%) 100%);
    }
  }

  // 订单号样式
  .order-name {
    font-size: 14px;
    font-weight: 600;
    color: $text-primary;
    transition: color 0.3s;
    line-height: 1.4;
  }

  // 产品名称样式
  .text-sm {
    font-size: 13px;
    color: $text-regular;
    line-height: 1.5;
    margin-top: 8px;
  }

  // 底部信息样式
  .text-xs {
    font-size: 12px;
    color: $text-secondary;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px dashed $border-color;
    display: flex;
    justify-content: space-between;
    align-items: center;

    span {
      display: flex;
      align-items: center;
      gap: 4px;

      // 数量标签
      &:first-child::before {
        content: "📦";
        font-size: 12px;
      }

      // 预计时间标签
      &:last-child::before {
        content: "⏱️";
        font-size: 12px;
      }
    }
  }
}

// 响应式优化
@media (max-width: 768px) {
  .task-list {
    padding: 12px;
  }

  .order-item {
    padding: 12px;

    .order-name {
      font-size: 13px;
    }
  }
}

// 动画效果
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.order-item {
  animation: slideIn 0.3s ease-out;

  @for $i from 1 through 10 {
    &:nth-child(#{$i}) {
      animation-delay: #{$i * 0.05}s;
    }
  }
}
</style>
