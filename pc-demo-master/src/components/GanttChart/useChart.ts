// import type { components } from "@/types/shengjiu";
import dayjs, { type Dayjs } from "dayjs"
import { computed, type Ref } from "vue"

export enum IceFloat {
  Ready = "Ready",
  UnPubProcess = "UnPubProcess",
  InPubProcess = "InPubProcess",
  Stop = "Stop",
  Error = "Error",
  Closed = "Closed",

  // 当前集成吉文项目中的状态，上面之前的先保持不动
  // 可排产241， 不可排产242， 计划停产243，未发布251， 审批中253， 已发布257， 已加工262
  ScheOk = 241,
  ScheNo = 242,
  ScheStop = 243,
  ScheUnPub = 251,
  ScheExaming = 253,
  ScheInPub = 257,
  ScheProcessed = 262
}

export const IceFloatColorMap: Record<string, string> = {
  [IceFloat.ScheOk]: "rgba(255,255,255,0.7)",
  [IceFloat.ScheStop]: "rgba(245, 247, 250, .7)",
  [IceFloat.ScheNo]: "rgba(230, 232, 235, .7)",
  [IceFloat.ScheUnPub]: "rgba(245, 34, 45, 0.50)",
  [IceFloat.ScheExaming]: "rgba(250, 173, 20, 0.50)",
  [IceFloat.ScheInPub]: "rgba(22, 119, 255, 0.50)",
  [IceFloat.ScheProcessed]: "rgba(19, 194, 194, 0.50)"
}

type SchedulingOrderPoolSegmentsResult = {}
// components["schemas"]["DTOSchedulingOrderPoolSegmentsResult-1"];
type SourceType = "手动" | "自动"
// components["schemas"]["EnumProductionJobSourceType"];
type Status = "可排产" | "已排产" | "已发布" | "已关闭" | "已取消" // 随便写的先
// components["schemas"]["EnumProductionJobStatus"];

export interface GanttChartDataType {
  id: string // 产线Id
  lineName?: string // 产线名称
  /** @description 产线下所有任务,排序为二维数组 */
  originData?: any
  onClick?: (data: any) => any
  data: {
    jobId: string // 任务Id
    startTime: Dayjs // 任务开始时间
    endTime: Dayjs // 任务结束时间
    type: SourceType // 手动、自动
    status: Status // 任务状态
    originData?: any
    onClick?: (data: any) => any
    items: {
      originData?: any
      onClick?: (data: any) => any
      type: IceFloat
      startTime: Dayjs
      endTime: Dayjs
    }[]
  }[][]
}

export interface DropAreaData {
  startTime: Dayjs
  lineId: string
}

export interface DragData {
  type: "Outer" | "Inner"
  outerData?: SchedulingOrderPoolSegmentsResult & {
    dropAreaData?: DropAreaData
  }
  innerData?: {
    jobId: string // 任务Id
    startTime: Dayjs // 任务开始时间
    endTime: Dayjs // 任务结束时间
    type: SourceType // 手动、自动
    status: Status // 任务状态
    items: {
      type: IceFloat
      startTime: Dayjs
      endTime: Dayjs
    }[]
  } & Omit<GanttChartDataType, "data"> & {
      dropAreaData: DropAreaData
    }
}

/** 基础颜色 */
export const BLUE = "#8CC1DD"
export const BLUE_DEEP = "#3090C2"

export const YELLOW = "#F2D3AE"
export const YELLOW_DEEP = "#E8AF6D"

export const GRAY = "#D1D1D1"
export const GRAY_DEEP = "#ABABAB"

export const RED = "#FCC1BD"
export const RED_DEEP = "#FD8984"

export const GREEN = "#8FD1A6"
export const GREEN_DEEP = "#36AB5F"

export const PURPULE = "#C7C1FF"
export const PURPULE_DEEP = "#9A90FF"

const toPx = (val: number) => val + "px"

/** 单元格默认宽度 */
const rectWidth = 61
/** 单元格最小高度 */
const rectHeight = 50
/** 浮块高度 */
const iceFloatHeight = 16

/** 单元格宽度样式 */
const rectWidthClass = toPx(rectWidth)
/** 单元格最小高度样式 */
const rectHeightClass = toPx(rectHeight)
/** 浮块高度样式 */
const iceFloatHeightClass = toPx(iceFloatHeight)
/** 日期宽度样式 */
const dateWidthClass = toPx(rectWidth * 24 - 23)
/** 日期高度样式 */
const dateHeightClass = rectHeightClass
/** 提示宽度样式 */
const tipWidthClass = toPx((rectWidth - 1) * 2.5)
/** 提示高度样式 */
const tipHeightClass = toPx(rectHeight * 2 - 1)
/** 斜线长度样式 */
const tipLineWidthClass = toPx(Math.sqrt((rectWidth * 2.5) ** 2 + (rectHeight * 2 - 1) ** 2))
//ASIN(A2/（SQRT(A2*A2+B2*B2)))/PI()*180 正弦计算角度
const rotateDeg =
  (Math.asin((rectHeight * 2 - 1) / Math.sqrt((rectWidth * 2.5) ** 2 + (rectHeight * 2 - 1) ** 2)) /
    Math.PI) *
    180 +
  "deg"

const getIceFloatBgColor = (type: IceFloat) => {
  switch (type) {
    case IceFloat.Ready:
      return BLUE
    case IceFloat.UnPubProcess:
      return YELLOW
    case IceFloat.Stop:
      return GRAY
    case IceFloat.Error:
      return RED
    case IceFloat.Closed:
      return GREEN
    case IceFloat.InPubProcess:
      return PURPULE
    case IceFloat.ScheOk:
      return IceFloatColorMap[IceFloat.ScheOk]
    case IceFloat.ScheNo:
      return IceFloatColorMap[IceFloat.ScheNo]
    case IceFloat.ScheStop:
      return IceFloatColorMap[IceFloat.ScheStop]
    case IceFloat.ScheUnPub:
      return IceFloatColorMap[IceFloat.ScheUnPub]
    case IceFloat.ScheExaming:
      return IceFloatColorMap[IceFloat.ScheExaming]
    case IceFloat.ScheInPub:
      return IceFloatColorMap[IceFloat.ScheInPub]
    case IceFloat.ScheProcessed:
      return IceFloatColorMap[IceFloat.ScheProcessed]
    default:
      return BLUE
  }
}

const getIceFloatBorderColor = (type: IceFloat) => {
  if (type === IceFloat.Ready) {
    return BLUE_DEEP
  } else if (type === IceFloat.UnPubProcess) {
    return YELLOW_DEEP
  } else if (type === IceFloat.Stop) {
    return GRAY_DEEP
  } else if (type === IceFloat.Error) {
    return RED_DEEP
  } else if (type === IceFloat.Closed) {
    return GREEN_DEEP
  } else if (type === IceFloat.InPubProcess) {
    return PURPULE_DEEP
  }
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

export const useChart = (
  startTime: Ref<Dayjs>,
  endTime: Ref<Dayjs>,
  gantType: Ref<"day" | "month">
) => {
  const days = computed(() => endTime.value.diff(startTime.value.format(), "day") + 1)
  const months = computed(() => endTime.value.diff(startTime.value.format(), "month") + 1)

  const rectangleCount = computed<string[]>(() => {
    if (gantType.value === "day") return new Array(days.value * 24).fill("")
    const monthStart = dayjs(startTime.value).startOf("month")
    const monthEnd = dayjs(endTime.value).endOf("month")
    const count = monthEnd.diff(monthStart.format(), "day") + 1

    return new Array(count)
      .fill("")
      .map((item, index) => monthStart.add(index, "day").format("YYYY-MM-DD"))
  })

  const getDaysInMonth = (time: Dayjs) => {
    return time.daysInMonth()
  }

  const getIceFloatLeft = (
    targetTime: Dayjs,
    baseTime = startTime.value,
    baseWidth = rectWidth
  ) => {
    const counts = dayjs(targetTime).diff(
      baseTime.format(),
      gantType.value === "day" ? "hour" : "day"
    )
    const integralTime = dayjs(baseTime).add(counts, gantType.value === "day" ? "hour" : "day")
    const minutes = dayjs(targetTime).diff(
      integralTime.format(),
      gantType.value === "day" ? "minute" : "hour"
    )
    const left = (counts + minutes / (gantType.value === "day" ? 60 : 24)) * (baseWidth - 1)

    return left
  }

  const getIceFloatWidth = (startTime: Dayjs, endTime: Dayjs, baseWidth = rectWidth) => {
    const hours = dayjs(endTime).diff(startTime.format(), gantType.value === "day" ? "hour" : "day")
    const integralTime = dayjs(startTime).add(hours, gantType.value === "day" ? "hour" : "day")
    const minutes = dayjs(endTime).diff(
      integralTime.format(),
      gantType.value === "day" ? "minute" : "hour"
    )
    const width = (hours + minutes / (gantType.value === "day" ? 60 : 24)) * (baseWidth - 1)

    let count = days.value * 24
    if (gantType.value === "month") {
      count = rectangleCount.value.length
    }

    // 最大距离为开始节点至表格末尾的距离
    const maxWidth = (rectWidth - 1) * count - getIceFloatLeft(startTime)
    return Math.min(width, maxWidth) + "px"
  }

  const getIceFloatItemsHeight = (type: IceFloat) => {
    // 排班计划相关的是背景底色，需要有个最大的背景排班
    if ([IceFloat.ScheOk, IceFloat.ScheNo, IceFloat.ScheStop].includes(type)) {
      return "100%"
    }
    return iceFloatHeightClass
  }

  return {
    rectWidth,
    rectHeight,
    iceFloatHeight,
    rectWidthClass,
    rectHeightClass,
    iceFloatHeightClass,
    dateWidthClass,
    dateHeightClass,
    tipWidthClass,
    tipHeightClass,
    tipLineWidthClass,
    days,
    months,
    rotateDeg,
    rectangleCount,
    getDaysInMonth,
    getIceFloatLeft,
    getIceFloatWidth,
    getIceFloatBorderColor,
    getIceFloatBgColor,
    getTime,
    getIceFloatItemsHeight,
    toPx
  }
}
