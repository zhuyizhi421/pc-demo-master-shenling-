<template>
  <div
    class="task-bar absolute rounded-md flex items-center justify-center text-xs text-white font-medium cursor-pointer"
    :class="statusColor"
    :data-task-id="task.id"
    :draggable="true"
    :style="{
      left: `${position.left}%`,
      width: `${position.width}%`,
      height: '36px',
      top: '8px',
      zIndex: '1'
    }"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div class="text-center">
      <div>{{ task.orderNo }}</div>
      <div class="text-[10px] opacity-80">{{ task.productName }}</div>
    </div>
    
    <!-- 任务进度条 -->
    <div 
      v-if="task.status === '进行中' || task.status === '延期'"
      class="absolute bottom-0 left-0 h-0.5 bg-white bg-opacity-30"
      :style="{ width: `${task.progress}%` }"
    ></div>
    
    <!-- 调整大小手柄 -->
    <div 
      class="resize-handle left"
      @mousedown.stop="handleResizeStart($event, 'left')"
    ></div>
    <div 
      class="resize-handle right"
      @mousedown.stop="handleResizeStart($event, 'right')"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import type { Task } from './types';
import { calculateTaskPosition, getStatusColor } from './utils';

// Props
const props = defineProps<{
  task: Task;
  timeRange?: {
    start: Date;
    end: Date;
  };
}>();

// Emits
const emit = defineEmits<{
  'dragstart': [event: DragEvent, task: Task];
  'dragend': [event: DragEvent];
  'resize-start': [event: MouseEvent, task: Task, direction: 'left' | 'right'];
  'show-tooltip': [event: MouseEvent, task: Task];
  'hide-tooltip': [];
}>();

// Computed
const statusColor = computed(() => getStatusColor(props.task.status));

const position = computed(() => {
  return calculateTaskPosition(
    props.task.startTime,
    props.task.endTime,
    props.timeRange?.start,
    props.timeRange?.end
  );
});

// Methods
const handleDragStart = (event: DragEvent) => {
  emit('dragstart', event, props.task);
};

const handleDragEnd = (event: DragEvent) => {
  emit('dragend', event);
};

const handleResizeStart = (event: MouseEvent, direction: 'left' | 'right') => {
  emit('resize-start', event, props.task, direction);
};

const handleMouseEnter = (event: MouseEvent) => {
  emit('show-tooltip', event, props.task);
};

const handleMouseLeave = () => {
  emit('hide-tooltip');
};
</script>

<style scoped>
.task-bar {
  transition: all 0.3s ease;
}

.task-bar:hover {
  filter: brightness(1.1);
  transform: scaleY(1.05);
}

.task-bar.dragging {
  opacity: 0.7;
  z-index: 10;
}

.task-bar.resizing {
  opacity: 0.8;
}

.task-bar .resize-handle {
  position: absolute;
  width: 6px;
  height: 100%;
  top: 0;
  cursor: ew-resize;
  z-index: 2;
}

.task-bar .resize-handle.left {
  left: 0;
}

.task-bar .resize-handle.right {
  right: 0;
}
</style>