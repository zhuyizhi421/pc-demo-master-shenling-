import { useResizeObserver } from "@vueuse/core"
import { type ShallowRef } from "vue"

import { type ECharts } from "@/plugins/echarts"

export interface IParams {
  dom: ShallowRef<HTMLElement | undefined>
  chartInstance: ShallowRef<ECharts | undefined>
  initChart: () => any
  resizeChart: () => any
  removeChart: () => any
}

export default function useChartDomObserver(params: IParams) {
  const { dom, chartInstance, initChart, resizeChart, removeChart } = params

  // init 或 resize chart
  let resizeTimeout: number | undefined = undefined

  const onResize = () => {
    window.clearTimeout(resizeTimeout)
    resizeTimeout = window.setTimeout(() => {
      if (chartInstance.value == undefined) {
        initChart()
      } else {
        resizeChart()
      }
    }, 100)
  }

  useResizeObserver(dom, (entries) => {
    const entry = entries[0]
    const { width, height } = entry.contentRect
    if (isNaN(width) || isNaN(height) || width === 0 || height === 0) {
      return
    }
    onResize()
  })

  // dispose chart
  onUnmounted(() => {
    removeChart()
  })

  return {
    onResize,
    initChart
  }
}
