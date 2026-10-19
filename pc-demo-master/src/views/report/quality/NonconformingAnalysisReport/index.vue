<template>
  <div class="layout-container">
    <div class="layout-main-page chart-main-page">
      <CustomSearchForm
        :form-list="searchList"
        @search="onSubmit"
        @reset="onReset"
      ></CustomSearchForm>

      <div ref="reportContainerRef" class="custom-report-container" v-loading="loading">
        <!-- 图表部分 -->
        <CustomTitle title="统计图" show-short-bar />
        <div class="custom-report-content">
          <!-- 柱形图 -->
          <div ref="charBarRef"></div>
        </div>

        <!-- 表格部分 -->
        <CustomTitle title="明细列表" show-short-bar />
        <CustomTable
          ref="customTableRef"
          v-model:table-data="customTableData"
          v-model:total="pagination.total"
          :config="tableConfig"
          :query-config="queryConfig"
        >
        </CustomTable>
        <CustomPagination
          v-model:currentPage="pagination.currentPage"
          v-model:pageSize="pagination.pageSize"
          :total="pagination.total"
          :border="false"
          @change="customTableRef?.requestData()"
        />
      </div>
    </div>

    <CustomBackTop :instance="reportContainerRef" />
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import { getFlawGradeList } from "@/api/quality/defectGrades"
import {
  queryNonconformingAnalysisReportPageList,
  requestNonconformingAnalysisReportChart
} from "@/api/report/quality/nonconformingAnalysisReport"
import CustomBackTop from "@/components/CustomBackTop/index.vue"
import CustomPagination from "@/components/CustomPagination/index.vue"
import useSearchForm from "@/components/CustomSearchForm/hooks"
import CustomSearchForm from "@/components/CustomSearchForm/index.vue"
import { EnumComponentType } from "@/components/CustomSearchForm/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import { SelectType } from "@/components/SelectFactoryModel/types"
import {
  EnumNonconformingAnalysisReportStatus,
  EnumNonconformingAnalysisReportStatusMap,
  EnumResultNameMap
} from "@/constant/enums"
import { FORMAT_DATE, FORMAT_TIME, getTimeRange, TIME_RANGE } from "@/constant/time"
import useChartDomObserver from "@/hooks/useChartDomObserver"
import { type ECharts } from "@/plugins/echarts"
import { colors, echarts } from "@/plugins/echarts"
import type {
  INonconformingAnalysisReportPageItem as ITableRow,
  INonconformingAnalysisReportPageParams
} from "@/types/report/quality/nonconformingAnalysisReport"
import { isEffectiveValue, onPreventReClick, precisionConversion } from "@/utils/common"

defineOptions({
  name: "NonconformingAnalysisReport"
})

const loading = ref(false)
const flawGradeTypeOptions = ref<{ label: string; value: string }[]>([]) // 缺陷类型下拉

const { searchList, resetForm, getFormData } = useSearchForm<{
  startDate: string
  endDate: string
  entityIds: string[]
  defectTypeIds: string[]
  status: number
}>([
  {
    type: EnumComponentType.Date,
    dateType: "daterange",
    key: "taskTime",
    label: "登记日期",
    value: getTimeRange(),
    placeholder: ["请选择开始时间", "请选择结束时间"],
    format: FORMAT_DATE,
    valueFormat: FORMAT_TIME,
    defaultTime: TIME_RANGE,
    keyword: ["startDate", "endDate"]
  },
  {
    type: EnumComponentType.Area,
    key: "entityIds",
    label: "生产区域",
    value: [],
    placeholder: "请选择生产区域",
    props: {
      areaType: SelectType.ProductType,
      isEnable: true,
      multiple: true,
      checkStrictly: true,
      disabledNonPeer: true
    }
  },
  {
    type: EnumComponentType.Select,
    key: "defectTypeIds",
    label: "缺陷类型",
    value: [],
    placeholder: "请选择缺陷类型",
    options: flawGradeTypeOptions,
    filterable: true,
    multiple: true
  },
  {
    type: EnumComponentType.Select,
    key: "status",
    label: "状态",
    value: "",
    placeholder: "请选择状态",
    options: Object.entries(EnumNonconformingAnalysisReportStatusMap).map(([key, value]) => ({
      label: value,
      value: +key
    }))
  }
])
const reportContainerRef = ref<HTMLElement>()
const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: 400,
  columns: [
    {
      prop: "index",
      type: "index",
      label: "序号",
      width: 60,
      align: "center"
    },
    {
      prop: "registerDate",
      label: "登记日期",
      minWidth: 160,
      align: "center"
    },
    {
      prop: "createDate",
      label: "创建日期",
      minWidth: 160,
      align: "center"
    },
    {
      prop: "productCode",
      label: "产品编号",
      minWidth: 160
    },
    {
      prop: "productName",
      label: "产品名称",
      minWidth: 160
    },
    {
      prop: "drawingNumber",
      label: "产品图号",
      minWidth: 160
    },
    {
      prop: "specification",
      label: "产品规格",
      minWidth: 160
    },
    {
      prop: "defectName",
      label: "缺陷名称",
      minWidth: 160
    },
    {
      prop: "defectTypeName",
      label: "缺陷类型",
      minWidth: 160
    },
    {
      prop: "reviewResult",
      label: "处理方式",
      minWidth: 160,
      align: "center",
      formatter: ({ reviewResult }) => EnumResultNameMap[reviewResult]
    },
    {
      prop: "quantity",
      label: "处理数量",
      minWidth: 160,
      align: "right",
      formatter: ({ quantity, decimalNumber }) =>
        isEffectiveValue(quantity) ? precisionConversion(quantity, decimalNumber) : ""
    },
    {
      prop: "unitName",
      label: "单位",
      minWidth: 90,
      align: "center"
    },
    {
      prop: "status",
      label: "状态",
      minWidth: 90,
      align: "center",
      formatter: ({ status }) =>
        EnumNonconformingAnalysisReportStatusMap[status as EnumNonconformingAnalysisReportStatus]
    }
  ]
})
const queryConfig: ITableRequestConfig<[INonconformingAnalysisReportPageParams], ITableRow, true> =
  {
    api: queryNonconformingAnalysisReportPageList,
    getParams: () => {
      const { startDate, endDate, ...rest } = getFormData()
      return [
        {
          dateRange: {
            startDate,
            endDate
          },
          pageQuery: {
            pageNum: pagination.currentPage,
            pageSize: pagination.pageSize
          },
          queryParam: {
            ...rest
          }
        }
      ]
    }
  }

const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const charBarRef = shallowRef<HTMLDivElement | undefined>(undefined)
const charBarInstance = shallowRef<ECharts | undefined>(undefined)
const { initChart } = useChartDomObserver({
  dom: charBarRef,
  chartInstance: charBarInstance,
  initChart: async () => {
    charBarInstance.value =
      charBarInstance.value || echarts.init(charBarRef.value as HTMLDivElement)
    const { startDate, endDate, ...rest } = getFormData()
    const data = await requestNonconformingAnalysisReportChart({
      dateRange: {
        startDate,
        endDate
      },
      pageQuery: {
        pageNum: pagination.currentPage,
        pageSize: pagination.pageSize
      },
      queryParam: {
        ...rest
      }
    })

    let barData: number[] = [],
      lineData: number[] = [],
      xAxisData: string[] = []

    data?.barChart?.forEach((item, index) => {
      xAxisData.push(item.title)
      barData.push(item.value)
      lineData.push(data.lineChart[index].value)
    })

    let max1 = Math.ceil(Math.max(...barData) / 5) * 5
    let max2 = Math.ceil(Math.max(...lineData) / 5) * 5

    charBarInstance.value?.setOption({
      color: colors.series,
      title: {
        text: "缺陷类型统计",
        left: "center",
        textAlign: "center"
      },
      dataZoom:
        xAxisData.length > 16
          ? [
              {
                type: "slider",
                show: true,
                xAxisIndex: 0,
                minValueSpan: 7,
                maxValueSpan: 15,
                moveHandleSize: 20,
                height: 20
              }
            ]
          : undefined,
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
          data: xAxisData,
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
          type: "value",
          name: "缺陷数量",
          min: 0,
          max: max1,
          interval: max1 / 5
        },
        {
          type: "value",
          name: "百分比",
          min: 0,
          max: max2,
          interval: max2 / 5,
          axisLabel: {
            formatter: "{value}%"
          }
        }
      ],
      series: [
        {
          name: "缺陷数量",
          type: "bar",
          barWidth: 40,
          data: barData,
          label: {
            show: true,
            precision: 1,
            position: ["140%", -20]
          },
          labelLine: {
            show: true
          }
        },
        {
          name: "累计百分比",
          type: "line",
          yAxisIndex: 1,
          data: lineData,
          label: {
            show: true,
            precision: 1,
            position: "top",
            formatter: "{c}%"
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

onMounted(() => {
  getFlawGradeOptions()
  handleSearch()
})

/** 查询校验 */
const validateSearchForm = () => {
  const { startDate, endDate } = getFormData()
  if (!startDate || !endDate) {
    ElMessage.warning("请选择登记日期")
    return false
  }

  return true
}

const handleSearch = async () => {
  try {
    if (!validateSearchForm()) {
      return
    }

    loading.value = true
    await initChart()
    await customTableRef.value?.requestData()
  } finally {
    loading.value = false
  }
}

const onReset = onPreventReClick(async () => {
  resetForm()
  handleSearch()
})

const onSubmit = onPreventReClick(handleSearch)

/** 获取缺陷类型下拉 */
const getFlawGradeOptions = async () => {
  const data = await getFlawGradeList({})
  flawGradeTypeOptions.value = data.map((item) => {
    return { label: item.gradeName, value: item.id }
  })
}
</script>

<style lang="scss" scoped></style>
