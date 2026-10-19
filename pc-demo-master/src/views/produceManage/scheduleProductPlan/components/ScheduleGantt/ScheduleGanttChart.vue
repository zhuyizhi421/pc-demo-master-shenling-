<template>
  <div class="flex-1 flex flex-col bg-dark-300 overflow-hidden">
    <div class="border-b border-gray-700 flex items-center">
      <h2 class="text-lg font-semibold title">生产排产甘特图</h2>
      <div class="search">
        <el-date-picker
        style="width:240px"
        max-range="2"
        v-model="renderTimes"
        type="daterange"
        value-format="YYYY-MM-DD HH:mm:ss"
        range-separator="至"
        start-placeholder="请选择开始时间"
        end-placeholder="请选择结束时间"
        :default-time="TIME_RANGE"
        @blur="onBlur"
      />
      </div>
    </div>
    <div class="flex-1 overflow-auto p-4 scrollbar-thin scrollbar-dark" id="gantt-container">
      <div class="chart-content">
        <!-- 日期行 -->
        <div class="date-wrapper flex">
          <div class="w-24 flex-shrink-0"></div>
          <div class="flex-1 flex date-container">
            <div
              v-for="(date, dateIndex) in dateAxis"
              :key="dateIndex"
              class="date-item text-center text-sm font-medium text-gray-600 border-r border-gray-300 py-2"
              :style="{ width: date.width + 'px' }"
            >
              {{ date.label }}
            </div>
          </div>
        </div>
        <!-- 时间轴 -->
        <div class="time-axis-wrapper flex mb-2">
          <div class="w-24 flex-shrink-0"></div>
          <div class="flex-1 flex time-axis-container" id="time-axis">
            <div
              v-for="(hour,hourIndex) in timeAxis"
              :key="hourIndex"
              class="time-axis-item text-center text-xs text-gray-400 border-r border-gray-700 py-1"
            >
              {{ getTime(hourIndex)  }}
            </div>
          </div>
        </div>

        <!-- 产线泳道 -->
        <div id="production-lines">
          <div
            v-for="line in productionLines"
            :key="line.id"
            class="production-line flex mb-4"
            :data-line-id="line.id"
          >
            <!-- 产线信息 -->
            <div class="w-24 flex-shrink-0 bg-dark-200 rounded-l-md p-2 border border-gray-700">
              <div class="flex items-center mb-1">
                <span class="status-indicator" :class="getLineStatusClass(line.status)"></span>
                <span class="font-medium">{{ line.name }}</span>
              </div>
            </div>

            <!-- 任务区域 -->
            <div
              class="flex-1 bg-dark-200 rounded-r-md border-t border-r border-b border-gray-700 relative"
              :data-line-id="line.id"
              @dragover="handleDragOver"
              @dragenter="handleDragEnter"
              @dragleave="handleDragLeave"
              @drop="handleDrop($event, line.id)"
            >
              <!-- 任务条 -->
              <TaskBar
                v-for="task in line.tasks"
                :key="task.id"
                :task="task"
                :time-range="{ start: getStartTime.toDate(), end: getEndTime.toDate() }"
                @dragstart="handleTaskDragStart"
                @dragend="handleTaskDragEnd"
                @resize-start="handleResizeStart"
                @show-tooltip="showTooltip"
                @hide-tooltip="hideTooltip"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from "dayjs"
import { computed, onMounted, ref } from "vue"

import { queryImplementConfigProductionDetail } from "@/api/implementConfig"
import useSearchForm from "@/components/CustomSearchForm/hooks"
import { EnumComponentType } from "@/components/CustomSearchForm/type"
import { TIME_RANGE } from "@/constant/time"

import TaskBar from "./TaskBar.vue"
import type { ProductionLine, Task, TaskDragInfo } from "./types"
import { findTaskById, getLineStatusClass } from "./utils"

// Props
const props = defineProps<{
  productionLines: ProductionLine[]
}>()
// Emits
const emit = defineEmits<{
  "task-moved": [
    taskId: string,
    sourceLineId: string,
    targetLineId: string,
    newStartTime: Date,
    newEndTime: Date
  ]
  "task-resized": [task: Task, newStartTime: Date, newEndTime: Date]
  "order-scheduled": [orderId: string, lineId: string]
  "show-tooltip": [event: MouseEvent, task: Task]
  "hide-tooltip": []
}>()

const isScheduleByDay = ref<boolean>(false) // 是否按天排产，否则是按时分秒
const getImplementConfig = async () => {
  try {
    const res = await queryImplementConfigProductionDetail()
    isScheduleByDay.value = res.scheduleTimeDimension === 1
  } catch (error) {
    console.log(error)
  }
}
const renderTimes = ref<string[]>([])
const gantType = computed<"day" | "month">(() => {
  return "day"
})

const { searchList, getFormData } = useSearchForm<{
  startDate: string
  endDate: string
  area: string[]
}>([
  {
    type: EnumComponentType.Date,
    dateType: "daterange",
    key: "date",
    label: "日期",
    value: [],
    placeholder: ["请选择开始时间", "请选择结束时间"],
    format: "YYYY-MM-DD",
    valueFormat: "YYYY-MM-DD HH:mm:ss",
    defaultTime: TIME_RANGE,
    keyword: ["startDate", "endDate"],
    disabledDateParams: {
      maxRange: 2
    },
    style: {
      width: 240
    }
  }
])

// 时间范围配置（与 GanttChart month 类型一致）
const getStartTime = computed(() => {
  return dayjs(renderTimes.value[0]).startOf(gantType.value)
})
const getEndTime = computed(() => {
  return dayjs(renderTimes.value[1]).endOf(gantType.value)
})
// Reactive data
const timeAxis = ref<string[]>([])
const dateAxis = ref<{ label: string; width: number }[]>([])
const HOUR_WIDTH = 50 // 每小时宽度，与时间轴 item 宽度一致

const initSearchTime = async () => {
  const now = dayjs().startOf('day')
  renderTimes.value = [
    now.format("YYYY-MM-DD HH:mm:ss"),
    now.add(2, 'day').endOf('day').format("YYYY-MM-DD HH:mm:ss")
  ]
  generateTimeData()
}

// 生成时间轴和日期轴数据
const generateTimeData = () => {
  const start = getStartTime.value
  const end = getEndTime.value
  const days = end.diff(start, "day") + 1

  // 生成时间轴（每小时）
  timeAxis.value = new Array(days * 24).fill("")

  // 生成日期轴
  dateAxis.value = []
  for (let i = 0; i < days; i++) {
    const date = start.add(i, 'day')
    dateAxis.value.push({
      label: date.format('MM-DD'),
      width: 24 * HOUR_WIDTH // 每天24小时，每小时50px
    })
  }
}

const onBlur = () => {
  generateTimeData()
}
const getTime = (count: number): string => {
  if (count >= 0 && count <= 23) {
    const hour = count < 10 ? "0" + count : "" + count
    return hour + ":00"
  } else if (count >= 24) {
    return getTime(count - 24)
  }
  return ""
}

onMounted(() => {
  getImplementConfig()
  initSearchTime()
})

// Methods
const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
}

const handleDragEnter = (event: DragEvent) => {
  ;(event.currentTarget as HTMLElement)?.classList.add("drag-over")
}

const handleDragLeave = (event: DragEvent) => {
  // 只有当鼠标离开整个产线区域时才移除drag-over类
  if (event.currentTarget && event.relatedTarget) {
    if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node)) {
      ;(event.currentTarget as HTMLElement).classList.remove("drag-over")
    }
  }
}

const handleDrop = (event: DragEvent, lineId: string) => {
  event.preventDefault()
  ;(event.currentTarget as HTMLElement)?.classList.remove("drag-over")

  if (!event.dataTransfer) return

  const id = event.dataTransfer.getData("text/plain")

  // 检查是订单还是任务
  if (id.startsWith("T")) {
    // 处理任务移动
    const task = findTaskById(id, props.productionLines)
    if (task) {
      // 计算新的时间位置
      try {
        const taskInfoStr = event.dataTransfer.getData("text/task-info")
        if (taskInfoStr) {
          const taskInfo: TaskDragInfo = JSON.parse(taskInfoStr)
          const duration = taskInfo.duration // 保持任务持续时间不变

          // 获取放置位置相对于产线泳道的坐标
          const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
          const relativeX = event.clientX - rect.left
          const percentage = relativeX / rect.width

          // 计算新的开始时间和结束时间（基于选择的时间范围，精确到小时）
          const rangeStart = getStartTime.value
          const rangeEnd = getEndTime.value
          const totalHours = rangeEnd.diff(rangeStart, "hour")
          const totalMs = totalHours * 60 * 60 * 1000

          // 根据百分比计算在时间范围中的位置（精确到小时）
          const hourOffset = Math.floor(percentage * totalHours)
          const hourPercentage = percentage * totalHours - hourOffset

          // 计算新的开始时间（精确到分钟）
          const newStartTime = rangeStart
            .add(hourOffset, "hour")
            .add(hourPercentage * 60, "minute")
            .toDate()

          // 计算新的结束时间（保持持续时间不变）
          const newEndTime = new Date(newStartTime.getTime() + duration)

          // 触发任务移动事件
          emit("task-moved", task.id, task.productionLineId, lineId, newStartTime, newEndTime)
        }
      } catch (error) {
        console.error("处理任务时间位置时出错:", error)
      }
    }
  } else {
    // 处理订单排产
    emit("order-scheduled", id, lineId)
  }
}

const handleTaskDragStart = (event: DragEvent, task: Task) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData("text/plain", task.id)
    event.dataTransfer.effectAllowed = "move"
    ;(event.target as HTMLElement)?.classList.add("dragging")

    // 保存拖拽开始时的任务信息
    event.dataTransfer.setData(
      "text/task-info",
      JSON.stringify({
        id: task.id,
        productionLineId: task.productionLineId,
        startTime: task.startTime.getTime(),
        endTime: task.endTime.getTime(),
        duration: task.endTime.getTime() - task.startTime.getTime()
      })
    )
  }
}

const handleTaskDragEnd = (event: DragEvent) => {
  ;(event.target as HTMLElement)?.classList.remove("dragging")
}

const handleResizeStart = (event: MouseEvent, task: Task, direction: "left" | "right") => {
  emit("task-resized", task, task.startTime, task.endTime)
}

const showTooltip = (event: MouseEvent, task: Task) => {
  emit("show-tooltip", event, task)
}

const hideTooltip = () => {
  emit("hide-tooltip")
}
</script>

<style lang="scss" scoped>
// 变量定义
$primary-color: #409eff;
$success-color: #67c23a;
$warning-color: #e6a23c;
$danger-color: #f56c6c;
$info-color: #909399;
$text-primary: #303133;
$text-regular: #606266;
$text-secondary: #909399;
$border-color: #e4e7ed;
$border-light: #ebeef5;
$bg-dark: #f5f7fa;
$bg-light: #ffffff;
$shadow-light: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
$shadow-hover: 0 4px 16px 0 rgba(0, 0, 0, 0.15);
$transition-base: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
$border-radius: 8px;

// 标题样式
.title {
  font-size: 18px;
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
  font-weight: 600;
  color: $text-primary;
  line-height: 28px;
  position: relative;
  margin-right: 50px;
  &::after {
    content: "";
    position: absolute;
    bottom: -2px;
    left: 20px;
    width: 60px;
    height: 2px;
  }
  .search {
    width: 240px;
  }
}

// 甘特图容器
#gantt-container {
  background-color: $bg-dark;
  padding: 20px;
  overflow: auto;

  // 自定义滚动条
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c0c4cc;
    border-radius: 4px;
    transition: background 0.3s;

    &:hover {
      background: #909399;
    }
  }
}

// 图表内容区域 - 确保可以水平滚动
.chart-content {
  min-width: fit-content;
  width: auto;
}

// 日期行包装器
.date-wrapper {
  position: sticky;
  top: 0;
  z-index: 101;
  background-color: $bg-dark;
}

// 日期容器
.date-container {
  display: flex;
  flex-wrap: nowrap;
  min-width: fit-content;
}

// 日期项
.date-item {
  flex-shrink: 0;
  background: linear-gradient(180deg, #e8f4ff 0%, #d1e9ff 100%);
  border-right: 1px solid $border-light;
  border-bottom: 1px solid $border-light;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: $primary-color;
  font-size: 13px;

  &:first-child {
    border-top-left-radius: $border-radius;
  }

  &:last-child {
    border-top-right-radius: $border-radius;
    border-right: none;
  }

  // 周末样式
  &:nth-child(7n),
  &:nth-child(7n + 1) {
    background: linear-gradient(180deg, #fff0f0 0%, #ffe0e0 100%);
    color: $danger-color;
  }
}

// 时间轴包装器 - 确保时间轴和产线泳道对齐
.time-axis-wrapper {
  position: sticky;
  top: 40px; // 日期行高度
  z-index: 100;
  background-color: $bg-dark;
}

// 时间轴容器
.time-axis-container {
  display: flex;
  flex-wrap: nowrap;
  min-width: fit-content;
}

// 时间轴每一项
.time-axis-item {
  flex-shrink: 0;
  width: 50px; // 固定宽度，确保每个日期都有足够的空间
  padding: 12px 2px;
  font-size: 11px;
  font-weight: 500;
  color: $text-regular;
  background: linear-gradient(180deg, $bg-light 0%, $bg-dark 100%);
  border-right: 1px solid $border-light;
  transition: $transition-base;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover {
    background: linear-gradient(
      180deg,
      lighten($primary-color, 45%) 0%,
      lighten($primary-color, 40%) 100%
    );
    color: $primary-color;
  }

  &:last-child {
    border-right: none;
  }
}

// 时间轴样式 - 已移至 .time-axis-item
#time-axis {
  background: $bg-light;
  border-radius: $border-radius $border-radius 0 0;
  box-shadow: $shadow-light;
  overflow: visible;
}

// 产线泳道
.production-line {
  transition: $transition-base;
  margin-bottom: 16px;
  display: flex;
  min-width: fit-content;

  &:hover {
    transform: translateX(4px);

    .w-24 {
      box-shadow: $shadow-hover;
      border-color: lighten($primary-color, 20%);
    }
  }

  // 产线信息卡片
  .w-24 {
    background: $bg-light;
    border: 1px solid $border-color;
    border-radius: $border-radius 0 0 $border-radius;
    padding: 16px 12px;
    box-shadow: $shadow-light;
    transition: $transition-base;
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 96px; // 固定宽度与时间轴左侧对齐
    flex-shrink: 0;

    .font-medium {
      font-size: 13px;
      font-weight: 600;
      color: $text-primary;
      line-height: 1.4;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  // 任务区域
  .flex-1 {
    background: $bg-light;
    border: 1px solid $border-color;
    border-left: none;
    border-radius: 0 $border-radius $border-radius 0;
    box-shadow: $shadow-light;
    min-height: 40px;
    transition: $transition-base;
    width: calc(50px * var(--time-axis-length)); // 与时间轴每一项宽度一致
    min-width: fit-content;
    position: relative;

    &.drag-over {
      background: linear-gradient(
        135deg,
        rgba($primary-color, 0.1) 0%,
        rgba($primary-color, 0.05) 100%
      );
      border: 2px dashed $primary-color;
      border-left: none;
      box-shadow: 0 0 0 4px rgba($primary-color, 0.1);

      &::before {
        content: "放置任务到这里";
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: $primary-color;
        font-size: 14px;
        font-weight: 500;
        pointer-events: none;
      }
    }
  }
}

// 状态指示器
.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 8px;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.8);
  transition: $transition-base;

  &.normal {
    background: linear-gradient(135deg, $success-color 0%, lighten($success-color, 15%) 100%);
    box-shadow:
      0 0 0 2px rgba(255, 255, 255, 0.8),
      0 0 8px rgba($success-color, 0.4);
  }

  &.maintenance {
    background: linear-gradient(135deg, $warning-color 0%, lighten($warning-color, 15%) 100%);
    box-shadow:
      0 0 0 2px rgba(255, 255, 255, 0.8),
      0 0 8px rgba($warning-color, 0.4);
    animation: pulse 2s infinite;
  }

  &.error {
    background: linear-gradient(135deg, $danger-color 0%, lighten($danger-color, 15%) 100%);
    box-shadow:
      0 0 0 2px rgba(255, 255, 255, 0.8),
      0 0 8px rgba($danger-color, 0.4);
    animation: pulse 1s infinite;
  }
}

// 脉冲动画
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

// 任务条悬停效果
:deep(.task-bar) {
  transition: $transition-base;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 10;
  }
}

// 响应式优化
@media (max-width: 1200px) {
  #gantt-container {
    padding: 12px;
  }

  .production-line {
    .w-24 {
      width: 160px;
      padding: 12px 8px;
    }
  }

  #time-axis > div {
    min-width: 35px;
    padding: 8px 2px;
    font-size: 11px;
  }
}

@media (max-width: 768px) {
  .production-line {
    flex-direction: column;

    .w-24 {
      width: 100%;
      border-radius: $border-radius $border-radius 0 0;
      border-bottom: none;
    }

    .flex-1 {
      border-radius: 0 0 $border-radius $border-radius;
      border-left: 1px solid $border-color;
      border-top: none;
      min-height: 60px;
    }
  }
}

// 动画效果
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.production-line {
  animation: slideInUp 0.4s ease-out;

  @for $i from 1 through 20 {
    &:nth-child(#{$i}) {
      animation-delay: #{$i * 0.05}s;
    }
  }
}

// 拖拽时的任务条样式
:deep(.dragging) {
  opacity: 0.7;
  transform: rotate(2deg) scale(1.02);
  cursor: grabbing;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  z-index: 100;
}
</style>
