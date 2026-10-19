import {
  BarChart,
  type BarSeriesOption,
  LineChart,
  type LineSeriesOption,
  PieChart
} from "echarts/charts"
import {
  DataZoomComponent,
  type DataZoomComponentOption,
  GridComponent,
  type GridComponentOption,
  TitleComponent,
  TooltipComponent,
  type TooltipComponentOption
} from "echarts/components"
import type { ComposeOption, ECharts } from "echarts/core"
import * as echarts from "echarts/core"
import { LabelLayout, UniversalTransition } from "echarts/features"
import type { XAXisComponentOption, YAXisComponentOption } from "echarts/index"
import { CanvasRenderer } from "echarts/renderers"
import type { CallbackDataParams, TopLevelFormatterParams } from "echarts/types/dist/shared.js"

interface ToolTipFormatterParams extends CallbackDataParams {
  axisDim: string
  axisIndex: number
  axisType: string
  axisId: string
  axisValue: string
  axisValueLabel: string
}

echarts.use([
  TitleComponent,
  LineChart,
  BarChart,
  PieChart,
  TooltipComponent,
  GridComponent,
  DataZoomComponent,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer
])

export type {
  BarSeriesOption,
  // core
  ComposeOption,
  DataZoomComponentOption,
  ECharts,
  GridComponentOption,
  // chart
  LineSeriesOption,
  // components
  TooltipComponentOption,
  XAXisComponentOption,
  YAXisComponentOption
}

const colors = {
  primary: ["#409eff"],
  series: [
    "#5a6fc0",
    "#59a076",
    "#ec8a5d",
    "#9263af",
    "#d25d5a",
    "#85bedb",
    "#9eca7f",
    "#f2ca6b",
    "#dc82c8",
    "#de6e6a"
  ]
}

/**
 * tooltip 自定义样式
 */
function tooltipItemsHtmlString(items: ToolTipFormatterParams[], unit?: string) {
  return items
    .map(
      (el) => `<div class="content-panel">
      <p>
        <span style="background-color: ${el.color}" class="tooltip-item-icon"></span>
        ${el.seriesName}
      </p>
      <span class="tooltip-value">
      ${(el.value as number[])[1]}${unit ? unit : ""}
      </span>
    </div>`
    )
    .join("")
}

function multiSeriesTooltipFormatter(
  params: TopLevelFormatterParams,
  titleFormatter: (title: string | number) => string
) {
  const [firstElement] = params as ToolTipFormatterParams[]
  return `<div>
    <p class="tooltip-title">${titleFormatter(firstElement.axisValueLabel)}</p>
    ${tooltipItemsHtmlString(params as ToolTipFormatterParams[])}
  </div>`
}

export { colors, echarts, multiSeriesTooltipFormatter, tooltipItemsHtmlString }
