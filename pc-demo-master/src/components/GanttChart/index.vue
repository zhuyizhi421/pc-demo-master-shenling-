<template>
  <div
    v-if="props.endTime && props.startTime && props.chartData.length > 0"
    class="chart-wrap"
    ref="chartRef"
  >
    <!-- 左侧 -->
    <div class="left-wrap" ref="leftList">
      <div class="chart-tip">
        <div class="time">时间</div>
        <div class="line">位置</div>
      </div>
      <div class="left-wrap-scroll" ref="leftWrap" @scroll="scrollYHandle">
        <div
          :class="['chart-row-head', data.data.length ? 'dynamic-height' : '']"
          v-for="data in props.chartData"
          :key="data.id"
          :style="{
            '--height': data.data.length * (iceFloatHeight - 1 + 4) + 22 + 'px'
          }"
        >
          <div
            class="w-full text-left truncate"
            :style="{
              lineHeight: data.data.length * (iceFloatHeight - 1 + 4) + 22 + 'px',
              height: data.data.length * (iceFloatHeight - 1 + 4) + 22 + 'px'
            }"
            :maxClampLine="1"
          >
            <el-tooltip :content="data.lineName" placement="top">
              {{ data.lineName }}
            </el-tooltip>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧 -->
    <div
      :key="gantIsDayType ? days : months"
      class="overflow-y-hidden overflow-x-hidden w-full h-auto relative"
    >
      <!-- 日期  -->
      <div class="date-wrap" ref="dateWrap">
        <el-button
          type="primary"
          :icon="ArrowLeft"
          class="last-day"
          @click="onClickChangeDate('pre')"
          >前一{{ gantIsDayType ? "天" : "月" }}</el-button
        >
        <el-button type="primary" class="next-day" @click="onClickChangeDate('after')">
          后一{{ gantIsDayType ? "天" : "月"
          }}<el-icon class="el-icon--right"><ArrowRight /></el-icon>
        </el-button>
        <div
          v-for="(day, index) in gantIsDayType ? days : months"
          :key="index"
          class="date"
          :style="{ width: getDateWidth(index) }"
        >
          <!-- 宽度要计算 -->
          {{
            dayjs(props.startTime)
              .add(index, gantType)
              .format(`YYYY/MM${gantType == "day" ? "/DD" : ""}`)
          }}
        </div>
      </div>
      <!-- 时间 -->
      <div class="time-wrap" ref="timeWrap">
        <div
          class="rectangle-sm"
          v-for="(col, colIndex) in rectangleCount"
          :style="{ '--col': '-' + colIndex + 'px' }"
          :key="colIndex"
        >
          <div class="time-point">
            {{ gantIsDayType ? getTime(colIndex) : dayjs(col).format("MM-DD") }}
          </div>
        </div>
      </div>
      <!-- 图表内容  -->
      <div
        v-if="props.chartData.length > 0"
        class="chart-content"
        ref="chartContentRef"
        @dragover.prevent
        @scroll="scrollYHandle"
      >
        <div v-for="(row, rowIndex) in props.chartData" :key="row.id" class="row">
          <div
            :class="['rectangle-sm', row.data.length ? 'dynamic-height' : '']"
            v-for="(col, colIndex) in rectangleCount"
            :style="{
              '--height': row.data.length * (iceFloatHeight - 1 + 4) + 22 + 'px'
            }"
            :key="colIndex"
            :lineId="row.id"
            :colIndex="colIndex"
            :date="dayjs(props.startTime).add(colIndex, 'hour')"
            @dragenter.prevent
          />
          <div
            v-for="(iceDataRow, iceRowIndex) in row.data"
            :key="iceRowIndex"
            class="ice-float-row"
            :style="{
              '--height':
                row.data.length * (iceFloatHeight - 1 + 4) +
                22 -
                (iceRowIndex * (iceFloatHeight - 1) + iceRowIndex * 4 + 11) +
                'px',
              '--top': iceRowIndex * (iceFloatHeight - 1) + iceRowIndex * 4 + 11 + 'px'
            }"
          >
            <div
              v-for="(iceData, iceIndex) in iceDataRow"
              :key="iceIndex"
              class="ice-float-data"
              :style="{
                '--width': getIceFloatWidth(iceData.startTime, iceData.endTime),
                '--height': '100%',
                '--left': getIceFloatLeft(iceData.startTime) + 'px'
              }"
            >
              <div class="piece-ice-wrap">
                <div
                  :class="[
                    'piece-ice',
                    isActiveJob(rowIndex, iceRowIndex, iceIndex) ? 'active' : '',
                    pieceIce.onClick ? 'cursor-pointer' : ''
                  ]"
                  v-for="(pieceIce, pieceIceIndex) in iceData.items"
                  :key="pieceIceIndex"
                  :style="{
                    '--display': pieceIce.startTime.isAfter(props.endTime) ? 'none' : 'unset',
                    '--width': getIceFloatWidth(pieceIce.startTime, pieceIce.endTime),
                    '--height': getIceFloatItemsHeight(pieceIce.type),
                    '--top': '-12px',
                    '--left': getIceFloatLeft(pieceIce.startTime, iceData.startTime) + 'px',
                    '--bg-color': getIceFloatBgColor(pieceIce.type),
                    '--border-color': getIceFloatBorderColor(pieceIce.type),
                    '--border-right':
                      iceData.items[pieceIceIndex + 1] &&
                      pieceIce.endTime.format() ==
                        iceData.items[pieceIceIndex + 1].startTime.format()
                        ? '0px solid #000'
                        : '1px solid #000',
                    'z-index': [IceFloat.ScheOk, IceFloat.ScheNo, IceFloat.ScheStop].includes(
                      pieceIce.type
                    )
                      ? 0
                      : 10
                  }"
                  @click="
                    () => {
                      if (pieceIce?.onClick) {
                        pieceIce.onClick(pieceIce.originData)
                      }
                      activeJobId = iceData.jobId
                    }
                  "
                  @contextmenu="
                    (e) => {
                      activeJobId = iceData.jobId
                      emit('ice-float-ctxmenu', e)
                    }
                  "
                  @mouseover="(e) => emit('piece-ice-mouseenter', e, iceData.jobId)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- </el-scrollbar> -->
  </div>

  <div v-else class="chart-empty">请选择生产区域与日期</div>

  <!-- 提示拖拽时间 -->
  <div ref="tootipRef" class="tootip-time">
    {{ tooltipContent?.format("HH:mm") }}
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, ArrowRight } from "@element-plus/icons-vue"
import { useMouseInElement } from "@vueuse/core"
import dayjs, { Dayjs } from "dayjs"
import { ElScrollbar } from "element-plus"

import { type DragData, type GanttChartDataType, IceFloat, useChart } from "./useChart"

defineOptions({
  name: "GanttChart"
})

interface Props {
  startTime: Dayjs
  endTime: Dayjs
  chartData: GanttChartDataType[]
  modelValue?: string
  gantType?: "day" | "month"
}

const props = withDefaults(defineProps<Props>(), {
  startTime: () => dayjs().startOf("day"),
  endTime: () => dayjs().add(1, "day").startOf("day"),
  chartData: () => [],
  modelValue: undefined,
  gantType: "day"
})

const emit = defineEmits<{
  (event: "ice-float-ctxmenu", e: MouseEvent): void
  (event: "inner-drop", val: DragData["innerData"]): void
  (event: "outer-drop", val: DragData["outerData"]): void
  (event: "piece-ice-mouseenter", e: MouseEvent, jobId: string): void
  (event: "drag-start"): void
  (event: "update:modelValue", val?: string): void
}>()

watch(
  () => props.chartData,
  () => {
    nextTick(() => {
      dateScrollRef.value?.setScrollTop(0)
    })
  },
  {
    deep: true
  }
)

const leftList = ref()
const dateScrollRef = ref<InstanceType<typeof ElScrollbar>>()

const startTime = toRef(props, "startTime") //起始时间
const endTime = toRef(props, "endTime")
const gantType = toRef(props, "gantType")
const {
  rectWidth,
  iceFloatHeight,
  rectWidthClass,
  rectHeightClass,
  dateWidthClass,
  dateHeightClass,
  tipWidthClass,
  tipHeightClass,
  tipLineWidthClass,
  days,
  months,
  rotateDeg,
  rectangleCount,
  getIceFloatLeft,
  getIceFloatWidth,
  getIceFloatBorderColor,
  getIceFloatBgColor,
  getTime,
  toPx,
  getIceFloatItemsHeight
} = useChart(startTime, endTime, gantType)

const chartRef = ref<HTMLElement | null>()
const tootipRef = ref<HTMLElement | null>()
const chartContentRef = ref<HTMLElement | null>()

const tooltipVisible = ref(false)
const tooltipElPosition = ref({ x: 0, y: 0 })
const tooltipContent = ref(props.startTime)

const leftWrap = ref<HTMLElement | null>()
const dateWrap = ref<HTMLElement | null>()
const timeWrap = ref<HTMLElement | null>()
const { isOutside: isLeftWrapOutside } = useMouseInElement(leftWrap)

const activeJobId = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val)
})

const gantIsDayType = computed(() => props.gantType === "day")

const scrollYHandle = (e: any) => {
  const scrollTop = e.target.scrollTop
  const scrollLeft = e.target.scrollLeft
  if (isLeftWrapOutside.value && e.target === chartContentRef.value) {
    dateWrap.value?.scrollTo(scrollLeft, 0)
    timeWrap.value?.scrollTo(scrollLeft, 0)
    chartContentRef.value?.scrollTo(scrollLeft, scrollTop)
  }
  if (!isLeftWrapOutside.value && e.target === leftWrap.value) {
    chartContentRef.value?.scrollTo({
      top: scrollTop
    })
  }

  leftWrap.value?.scrollTo(0, scrollTop)
}

const isActiveJob = (rowIndex: number, iceRowIndex: number, iceIndex: number) =>
  props.chartData[rowIndex].data[iceRowIndex][iceIndex].jobId === activeJobId.value

// 获取日期每项的宽度
const getDateWidth = (index: number) => {
  if (gantIsDayType.value) {
    return dateWidthClass
  } else {
    const days = dayjs(props.startTime).add(index, "month").daysInMonth()
    return days * rectWidth - days + 1 + "px"
  }
}

/** 点击日期自动滚动 */
const onClickChangeDate = async (handle: "pre" | "after") => {
  try {
    const dateHtmlList = dateWrap.value?.getElementsByClassName("date")
    const scrollLeft = dateWrap.value?.scrollLeft ?? 0 // 防止 undefined
    let sum = 0

    for (let i = 0; i < dateHtmlList?.length!; i++) {
      const item = dateHtmlList?.item(i)?.getBoundingClientRect()
      const preItem = dateHtmlList?.item(i - 1)?.getBoundingClientRect()

      if (!item) continue // 跳过无效项

      // 判断是否满足滚动条件
      const judge = handle === "pre" ? sum >= scrollLeft : sum > scrollLeft

      if (judge) {
        if (handle === "pre" && preItem) {
          // 向前滚动时，如果有上一个元素，减去它的宽度
          sum -= preItem.width
        }
        break // 找到合适的位置后退出循环
      } else {
        // 累加当前元素的宽度
        if (handle === "pre" && i === dateHtmlList?.length! - 1) {
          // 最后一项特殊处理
          console.log(i, dateHtmlList?.length! - 1)
          break
        }
        sum += item.width
      }
    }

    // 确保向前滚动时 sum 不会变成负值
    if (handle === "pre" && sum < 0) {
      sum = 0
    }

    dateWrap.value?.scrollTo(sum, 0)
    timeWrap.value?.scrollTo(sum, 0)
    chartContentRef.value?.scrollTo(sum, 0)
  } catch (error) {
    console.log(error)
  }
}

/** 滚动到今天0:00 */
const scrollToToday = () => {
  if (props.gantType === "month") {
    dateWrap.value?.scrollTo(0, 0)
    timeWrap.value?.scrollTo(0, 0)
    chartContentRef.value?.scrollTo(0, 0)
    return
  }
  // 判断今天是否在范围内
  const today = dayjs().startOf("day")
  if (today.isBefore(props.startTime) || today.isAfter(props.endTime)) {
    dateWrap.value?.scrollTo(0, 0)
    timeWrap.value?.scrollTo(0, 0)
    chartContentRef.value?.scrollTo(0, 0)
    return
  }
  // 计算今天0:00在甘特图中的横向位置
  let index = 0
  if (gantIsDayType.value) {
    index = today.diff(props.startTime, "hour")
  } else {
    // 月视图下可根据实际需求调整
    index = today.diff(props.startTime, "day")
  }
  // 计算 scrollLeft
  const left = index * (rectWidth - 1)
  // 设置滚动
  dateWrap.value?.scrollTo(left, 0)
  timeWrap.value?.scrollTo(left, 0)
  chartContentRef.value?.scrollTo(left, 0)
}

// 监听时间或数据变化时自动滚动
watch(
  () => props.chartData,
  () => {
    nextTick(() => {
      scrollToToday()
    })
  },
  {
    immediate: true
  }
)
</script>
<style scoped lang="scss">
$lineColor: rgba(220, 223, 230);
$border: $lineColor solid 1px;

.chart-wrap {
  height: 100%;
  display: flex;
  flex-direction: row;
  width: 100%;
  color: rgba(0, 0, 0, 0.85);
  border: 1px solid $lineColor;

  .left-wrap {
    width: v-bind(tipWidthClass);
    height: 100%;
    overflow: hidden;
    margin-right: -1px;
    // padding-bottom: 12px;

    .left-wrap-scroll {
      overflow-y: scroll;
      height: calc(100% - 106px);

      &::-webkit-scrollbar {
        display: none;
      }
    }

    .chart-tip {
      // width: v-bind(tipWidthClass);
      height: v-bind(tipHeightClass);
      border: $border;
      position: relative;
      border-top: none;
      border-left: none;

      &:before {
        width: v-bind(tipLineWidthClass);
        height: 1px;
        background: $lineColor;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(v-bind(rotateDeg));
        position: absolute;
        content: "";
        z-index: 12;
      }

      .time,
      .line {
        position: absolute;
      }

      .time {
        top: 4px;
        right: 8px;
      }

      .line {
        bottom: 4px;
        left: 8px;
      }
    }

    .chart-row-head {
      // width: v-bind(tipWidthClass);
      height: v-bind(rectHeightClass);
      border: $border;
      margin-top: -1px;
      display: flex;
      flex-direction: row;
      align-items: center;
      border-left: none;

      &.dynamic-height {
        height: var(--height);
      }
      .truncate {
        padding: 0 10px;
        font-size: 14px;
      }
    }
  }
  .el-scrollbar {
    flex: 1;
    position: relative;
  }
  .right-wrap {
    padding-bottom: 12px;
  }

  .date-wrap,
  .time-wrap {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-left: 1px;

    overflow-y: scroll;

    &::-webkit-scrollbar {
      display: none;
    }

    .time-point {
      width: 100%;
      height: 100%;
      line-height: v-bind(rectHeightClass);
      text-align: center;
    }
  }
  .date-wrap {
    .last-day {
      left: 24px;
      position: absolute;
      z-index: 100;
    }
    .next-day {
      right: 24px;
      position: absolute;
      z-index: 100;
    }
  }

  .date {
    width: v-bind(dateWidthClass);
    height: v-bind(dateHeightClass);
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
    border: $border;
    margin-left: -1px;
    border-top: none;
    background-color: #f2f7ff;
  }

  .chart-content {
    margin-left: 1px;

    height: calc(100% - 99px);
    overflow-x: overlay;
    overflow-y: visible;

    &::-webkit-scrollbar {
      height: 6px;
      width: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: #ccc;
      border-radius: 10px;
    }

    .row {
      display: flex;
      flex-direction: row;
      position: relative;
    }

    .ice-float-row {
      position: absolute;
      top: var(--top);
      left: 0px;
      height: var(--height);
    }

    .ice-float-data {
      position: absolute;
      left: var(--left);
      width: var(--width);
      height: calc(var(--height) + 11px);
      display: var(--display);
      background-color: var(--bg-color);
      border: solid var(--border-color) 1px;
      transition: all 0.15s ease-in-out;

      .piece-ice-wrap {
        position: relative;
        width: 100%;
        height: 100%;

        .piece-ice {
          position: absolute;
          left: var(--left);
          top: var(--top);
          width: var(--width);
          height: var(--height);
          background-color: var(--bg-color);
          border: solid var(--border-color) 1px;
          display: var(--display);

          &.active {
            border: 1px #000 solid;
            border-right: var(--border-right);
          }
        }
      }
    }
  }
}

.chart-empty {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  border: $border;
  color: rgba(99, 99, 99);
}

.data-empty {
  height: 200px;
  width: 100%;
  position: relative;

  .no-data {
    position: absolute;
    top: 50%;
    left: 50%;
  }
}

.rectangle-sm {
  width: v-bind(rectWidthClass);
  height: v-bind(rectHeightClass);
  border: $border;
  flex: none;
  margin-left: -1px;
  margin-top: -1px;

  &.dynamic-height {
    height: var(--height);
  }
}

.tootip-time {
  width: 64px;
  text-align: center;
  color: #fff;
  user-select: none;
  background-color: rgba(0, 0, 0, 0.5);
  position: fixed;
  top: v-bind("toPx(tooltipElPosition.y)");
  left: v-bind("toPx(tooltipElPosition.x)");
  display: v-bind("tooltipVisible ? 'block' : 'none'");
  z-index: 999;
}
</style>
