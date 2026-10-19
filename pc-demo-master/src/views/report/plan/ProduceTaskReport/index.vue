<template>
  <div class="layout-container">
    <div class="layout-main-page chart-main-page">
      <CustomSearchForm
        :form-list="searchList"
        @search="onSubmit"
        @reset="onReset"
      ></CustomSearchForm>

      <div ref="reportContainerRef" class="custom-report-container">
        <!-- 图表部分 -->
        <CustomTitle title="统计图" show-short-bar />
        <el-tabs type="card" @tab-change="onTabChange">
          <el-tab-pane label="user">
            <div class="custom-report-content multiple">
              <!-- 饼图 -->
              <div ref="charPieRef"></div>

              <!-- 环形图 -->
              <div ref="charPieRef1"></div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="config">
            <div class="custom-report-content">
              <!-- 柱形图 -->
              <div ref="charBarRef"></div>
            </div>
          </el-tab-pane>
        </el-tabs>

        <!-- 表格部分 -->
        <CustomTitle title="明细列表" show-short-bar />
        <el-tabs type="card">
          <el-tab-pane label="user">
            <CustomTable
              ref="customTableRef"
              v-model:table-data="customTableData"
              :config="tableConfig"
            >
            </CustomTable>
            <CustomPagination
              v-model:currentPage="pagination.currentPage"
              v-model:pageSize="pagination.pageSize"
              :total="pagination.total"
              :border="false"
              @change="getTableData"
            />
          </el-tab-pane>
          <el-tab-pane label="config"></el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <CustomBackTop :instance="reportContainerRef" />
  </div>
</template>

<script setup lang="ts">
import CustomBackTop from "@/components/CustomBackTop/index.vue"
import CustomPagination from "@/components/CustomPagination/index.vue"
import useSearchForm from "@/components/CustomSearchForm/hooks"
import CustomSearchForm from "@/components/CustomSearchForm/index.vue"
import { EnumComponentType } from "@/components/CustomSearchForm/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import useChartDomObserver from "@/hooks/useChartDomObserver"
import { type ECharts } from "@/plugins/echarts"
import { colors, echarts } from "@/plugins/echarts"

defineOptions({
  name: "ProduceTaskReport"
})

type ITableRow = {}

const { searchList, resetForm, getFormData } = useSearchForm<{}>([
  {
    type: EnumComponentType.Input,
    key: "test",
    label: "test",
    value: "",
    placeholder: "请输入"
  }
])
const reportContainerRef = ref<HTMLElement>()
const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: 400,
  columns: [
    {
      prop: "",
      label: "",
      minWidth: 160
    }
  ]
})

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const charPieRef = shallowRef<HTMLDivElement | undefined>(undefined)
const charPieInstance = shallowRef<ECharts | undefined>(undefined)
const { initChart } = useChartDomObserver({
  dom: charPieRef,
  chartInstance: charPieInstance,
  initChart: () => {
    charPieInstance.value =
      charPieInstance.value || echarts.init(charPieRef.value as HTMLDivElement)
    console.log("init")
    charPieInstance.value?.setOption({
      color: colors.series,
      series: [
        {
          type: "pie",
          radius: [0, "60%"],
          label: {
            formatter: "{b}:{c}（{d}%）"
          },
          labelLine: {
            length: 10,
            length2: 10
          },
          data: [
            { value: Math.random() * 100, name: "Search Engines" },
            { value: Math.random() * 100, name: "Direct" },
            { value: Math.random() * 100, name: "Email" },
            { value: Math.random() * 100, name: "Union Ads" },
            { value: Math.random() * 100, name: "Video Ads" }
          ]
        }
      ]
    })
  },
  resizeChart: () => {
    charPieInstance.value?.resize()
  },
  removeChart: () => {
    charPieInstance.value?.dispose()
  }
})

const charPieRef1 = shallowRef<HTMLDivElement | undefined>(undefined)
const charPieInstance1 = shallowRef<ECharts | undefined>(undefined)
useChartDomObserver({
  dom: charPieRef1,
  chartInstance: charPieInstance1,
  initChart: () => {
    charPieInstance1.value =
      charPieInstance1.value || echarts.init(charPieRef1.value as HTMLDivElement)
    const option = {
      color: colors.series,
      series: [
        {
          type: "pie",
          radius: ["35%", "60%"],
          label: {
            alignTo: "edge",
            edgeDistance: 10,
            width: 300,
            formatter: ({ data }: { data: { name: string; value: number } }) => {
              return data.name + "\n\n{b|" + data.value + "}"
            },
            rich: {
              b: {
                color: "#aaa"
              }
            }
          },
          labelLayout: (params: any) => {
            return params
          },
          data: [
            { value: 1048, name: "Search Enginesalfask 速度快放假啊开了房" },
            { value: 735, name: "Direct" },
            { value: 580, name: "Email" },
            { value: 484, name: "Union Ads" },
            { value: 300, name: "Video Ads" }
          ]
        }
      ]
    }

    option.series[0].labelLayout = (params) => {
      const isLeft = params.labelRect.x < (charPieInstance.value as ECharts).getWidth() / 2
      const points = params.labelLinePoints as number[][]
      points[2][0] = isLeft ? params.labelRect.x : params.labelRect.x + params.labelRect.width
      return {
        labelLinePoints: points
      }
    }
    charPieInstance1.value?.setOption(option)
  },
  resizeChart: () => {
    charPieInstance1.value?.resize()
  },
  removeChart: () => {
    charPieInstance1.value?.dispose()
  }
})

const charBarRef = shallowRef<HTMLDivElement | undefined>(undefined)
const charBarInstance = shallowRef<ECharts | undefined>(undefined)
const { onResize: resizeBarChart } = useChartDomObserver({
  dom: charPieRef1,
  chartInstance: charBarInstance,
  initChart: () => {
    charBarInstance.value =
      charBarInstance.value || echarts.init(charBarRef.value as HTMLDivElement)
    charBarInstance.value?.setOption({
      color: colors.primary,
      title: {
        text: "柱形图",
        left: "center",
        textAlign: "center"
      },
      tooltip: {
        trigger: "axis"
      },
      dataZoom: [
        {
          type: "slider",
          show: true,
          xAxisIndex: 0,
          minValueSpan: 7,
          maxValueSpan: 15,
          moveHandleSize: 20,
          height: 20
        }
      ],
      grid: {
        top: "70",
        left: "20",
        right: "20",
        bottom: "40",
        containLabel: true
      },
      xAxis: [
        {
          type: "category",
          data: [
            "法克斯大卡司漏发了手动阀法克斯大卡司漏发了手动阀",
            "法克斯大卡司漏发了手动阀",
            "法克斯大卡司漏发了手动阀",
            "Thu",
            "Fri",
            "Sat",
            "Sun"
          ],
          axisTick: {
            show: false,
            alignWithLabel: true
          },
          axisLabel: {
            interval: 0,
            formatter: (data: string) => {
              if (data.length > 5) {
                let result = ""
                for (let i = 0; i < data.length; i += 5) {
                  result += data.slice(i, i + 5) + "\n"
                }
                return result
              } else {
                return data
              }
            }
          }
        }
      ],
      yAxis: [
        {
          type: "value"
        }
      ],
      series: [
        {
          name: "Direct",
          type: "bar",
          barWidth: "60%",
          data: [10, 52, 200, 334, 390, 330, 220],
          label: {
            show: true,
            precision: 1,
            position: "top"
          }
        }
      ]
    })
  },
  resizeChart: () => {
    charBarInstance.value?.resize()
  },
  removeChart: () => {
    charBarInstance.value?.dispose()
  }
})

const onTabChange = (value: string) => {
  console.log(value)
  if (value === "1") {
    resizeBarChart()
  }
}

const onReset = () => {
  resetForm()
  onSubmit()
}

const onSubmit = () => {
  // resizeBarChart()
  initChart()
}

const getTableData = () => {}
</script>

<style lang="scss" scoped></style>
