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
        <div class="custom-report-content" v-loading="loading">
          <!-- 饼图 -->
          <div ref="charPieRef"></div>
        </div>

        <!-- 表格部分 -->
        <CustomTitle title="明细列表" show-short-bar />
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
          @change="getTableData()"
        />
      </div>
    </div>

    <CustomBackTop :instance="reportContainerRef" />
  </div>
</template>

<script setup lang="ts">
import {
  queryProduceProgressAnalysisReportPageList,
  requestProduceProgressAnalysisTopChart
} from "@/api/report/produce/droductInProgressAnalysisReport"
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
import { onPreventReClick } from "@/utils/common"

defineOptions({
  name: "ProductInProgressAnalysisReport"
})

type ITableRow = {
  productModelDesc: string // 产品描述
  productModelName: string // 产品名称
  productModelNo: string // 产品编号
  techVersion: string // 产品版本号
  inProcessQty: number // 在制数量
  processProductName: string // 过程产品名称
  processProductNo: string // 过程产品编号
  processSerial: string // 工序编号
  techName: string // 工艺名称
  row1: number
  row2: number
  row3: number
}

const loading = ref(false)
const { searchList, resetForm, getFormData } = useSearchForm<{
  productModelIds: string[]
}>([
  {
    type: EnumComponentType.Select,
    key: "productModelIds",
    label: "产品",
    value: [],
    placeholder: "请选择产品",
    options: [],
    multiple: true,
    dialogType: "craftRouteProduct",
    dialogProps: {
      multiple: true
    }
  }
])
const reportContainerRef = ref<HTMLElement>()
const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: 600,
  columns: [
    {
      prop: "productModelNo",
      label: "产品编号",
      minWidth: 160
    },
    {
      prop: "productModelName",
      label: "产品名称",
      minWidth: 160
    },
    {
      prop: "techVersion",
      label: "工艺路线版本号",
      minWidth: 280
    },
    {
      prop: "processSerial",
      label: "工序编号",
      minWidth: 160
    },
    {
      prop: "techName",
      label: "工艺名称",
      minWidth: 160
    },
    {
      prop: "processProductNo",
      label: "过程产品编号",
      minWidth: 160
    },
    {
      prop: "processProductName",
      label: "过程产品名称",
      minWidth: 160
    },
    {
      prop: "inProcessQty",
      label: "在制数量",
      minWidth: 120,
      align: "right"
    }
  ],
  spanMethod: (data) => {
    const { columnIndex, row } = data
    if ([3].includes(columnIndex)) {
      return [row.row2, 1]
    } else if ([4].includes(columnIndex)) {
      return [row.row3, 1]
    } else if ([0, 1, 2].includes(columnIndex)) {
      return [row.row1, 1]
    }
  }
})
const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const charPieRef = shallowRef<HTMLDivElement | undefined>(undefined)
const charPieInstance = shallowRef<ECharts | undefined>(undefined)
const { initChart } = useChartDomObserver({
  dom: charPieRef,
  chartInstance: charPieInstance,
  initChart: async () => {
    charPieInstance.value =
      charPieInstance.value || echarts.init(charPieRef.value as HTMLDivElement)
    loading.value = true
    const data = await requestProduceProgressAnalysisTopChart()
    const chartData =
      data?.map((item) => ({
        name: item.productModelName,
        value: item.inProcessAmountRate,
        processSerial: item.processSerial
      })) || []

    const option = {
      color: colors.series,
      series: [
        {
          type: "pie",
          radius: ["35%", "60%"],
          label: {
            alignTo: "edge",
            width: 300,
            formatter: ({ data }: { data: { name: string; value: number } }) => {
              return data.name + "\n\n{b|" + data.value + "%}"
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
          data: chartData
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
    loading.value = false

    charPieInstance.value?.setOption(option)
  },
  resizeChart: () => {
    charPieInstance.value?.resize()
  },
  removeChart: () => {
    charPieInstance.value?.dispose()
  }
})

onMounted(() => {
  handleSearch()
})

// 获取表格数据
const getTableData = async () => {
  customTableRef.value?.setLoading(true)
  const { records, total } = await queryProduceProgressAnalysisReportPageList({
    pageQuery: {
      pageNum: pagination.currentPage,
      pageSize: pagination.pageSize
    },
    queryParam: {
      ...getFormData()
    }
  })
  customTableRef.value?.setLoading(false)

  const tableList: ITableRow[] = []

  records.forEach((record) => {
    const list: ITableRow[] = []
    let row1 = 0

    const { inProcessSerialList, ...recordRest } = record

    inProcessSerialList.forEach((process) => {
      let row2 = 0
      const { processTechs, ...processRest } = process

      processTechs.forEach((tech) => {
        let row3 = 0
        const { processProduct, ...techRest } = tech

        processProduct.forEach((product) => {
          row1++
          row2++
          row3++

          list.push({
            ...recordRest,
            ...processRest,
            ...techRest,
            ...product,
            techVersion: recordRest.techVersion || "/",
            row1: 0,
            row2: 0,
            row3: 0
          })
        })
        list[list.length - row3].row3 = row3
      })

      list[list.length - row2].row2 = row2
    })

    list[list.length - row1].row1 = row1
    tableList.push(...list)
  })
  customTableData.value = tableList
  pagination.total = +total
}

const handleSearch = async () => {
  await initChart()
  await getTableData()
}

const onReset = onPreventReClick(async () => {
  resetForm()
  await handleSearch()
})

const onSubmit = onPreventReClick(handleSearch)
</script>

<style lang="scss" scoped></style>
