<template>
  <div class="layout-container">
    <div class="layout-main-page">
      <CustomSearchForm
        :form-list="searchList"
        @search="onSubmit"
        @reset="onReset"
      ></CustomSearchForm>

      <div class="custom-table-container">
        <CustomTitle title="明细列表" />
        <el-tabs class="custom-table-tabs" type="card" v-model="activeTab">
          <el-tab-pane :label="EnumTab.Detail" :name="EnumTab.Detail">
            <CustomTable
              ref="detailTableRef"
              v-model:table-data="detailTableData"
              v-model:total="detailPagination.total"
              :config="detailTableConfig"
              :query-config="detailQueryConfig"
            >
            </CustomTable>
            <CustomPagination
              v-model:currentPage="detailPagination.currentPage"
              v-model:pageSize="detailPagination.pageSize"
              :total="detailPagination.total"
              :border="false"
              @change="getDetailTableData"
            />
          </el-tab-pane>
          <el-tab-pane :label="EnumTab.Summary" :name="EnumTab.Summary">
            <CustomTable
              ref="summaryTableRef"
              v-model:table-data="summaryTableData"
              :config="summaryTableConfig"
            >
            </CustomTable>
            <CustomPagination
              v-model:currentPage="summaryPagination.currentPage"
              v-model:pageSize="summaryPagination.pageSize"
              :total="summaryPagination.total"
              :border="false"
              @change="getSummaryTableData"
            />
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import {
  queryProduceTaskCompleteRateReportPageList,
  queryProduceTaskCompleteRateReportSummaryPageList
} from "@/api/report/plan/produceTaskCompleteRateReport"
import CustomPagination from "@/components/CustomPagination/index.vue"
import useSearchForm from "@/components/CustomSearchForm/hooks"
import CustomSearchForm from "@/components/CustomSearchForm/index.vue"
import { EnumComponentType } from "@/components/CustomSearchForm/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  IColumnConfig,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import { SelectType } from "@/components/SelectFactoryModel/types"
import { FORMAT_TIME, getTimeRange, TIME_RANGE } from "@/constant/time"
import type {
  IProduceTaskCompleteRateReportDetailPageItem as IDetailTableRow,
  IProduceTaskCompleteRateReportPageParams
} from "@/types/report/plan/produceTaskCompleteRateReport"
import { isEffectiveValue, onPreventReClick } from "@/utils/common"

defineOptions({
  name: "ProduceTaskCompleteRateReport"
})

enum EnumTab {
  Detail = "详情",
  Summary = "汇总"
}

const activeTab = ref(EnumTab.Detail)
const { searchList, resetForm, getFormData } = useSearchForm<{
  startDate: string
  endDate: string
  entityIds: string[]
  entityLevel: string
}>([
  {
    type: EnumComponentType.Date,
    dateType: "datetimerange",
    key: "taskTime",
    label: "任务时间",
    value: getTimeRange(),
    placeholder: ["请选择开始时间", "请选择结束时间"],
    format: FORMAT_TIME,
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
      multiple: true
    }
  },
  {
    type: EnumComponentType.Select,
    key: "entityLevel",
    label: "汇总层级",
    value: "",
    placeholder: "请选择汇总层级",
    options: [
      {
        label: "公司",
        value: 1
      },
      {
        label: "工厂",
        value: 2
      },
      {
        label: "区域",
        value: 3
      },
      {
        label: "生产单位",
        value: 4
      }
    ]
  }
])
const detailTableRef = ref<ComponentExposed<typeof CustomTable>>()
const detailTableData = ref<IDetailTableRow[]>([])
const detailTableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "date",
      label: "日期",
      minWidth: 160,
      align: "center"
    },
    {
      prop: "entityName",
      label: "生产区域",
      minWidth: 160
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
      prop: "planProcessingQty",
      label: "计划加工量",
      minWidth: 160,
      align: "right"
    },
    {
      prop: "completeQty",
      label: "完工数量",
      minWidth: 160,
      align: "right"
    },
    {
      prop: "completionRate",
      label: "完成率",
      minWidth: 160,
      align: "right",
      formatter: ({ completionRate }) => `${completionRate}%`
    }
  ]
})
const detailQueryConfig: ITableRequestConfig<
  [IProduceTaskCompleteRateReportPageParams],
  IDetailTableRow,
  true
> = {
  api: queryProduceTaskCompleteRateReportPageList,
  getParams: () => {
    return [
      {
        pageQuery: {
          pageNum: detailPagination.currentPage,
          pageSize: detailPagination.pageSize
        },
        queryParam: {
          ...getFormData()
        }
      }
    ]
  }
}
const detailPagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const summaryTableRef = ref<ComponentExposed<typeof CustomTable>>()
const summaryTableData = ref<Record<string, any>[]>([])
const summaryTableConfig = ref<ITableConfig>({
  height: "100%",
  columns: []
})
const summaryPagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const handelSearch = async () => {
  const { startDate, endDate, entityIds, entityLevel } = getFormData()
  if (startDate && endDate && entityIds.length && isEffectiveValue(entityLevel)) {
    await Promise.allSettled([getDetailTableData(), getSummaryTableData()])
    return
  }

  if (activeTab.value === EnumTab.Detail) {
    await getDetailTableData()
  } else if (activeTab.value === EnumTab.Summary) {
    await getSummaryTableData()
  }
}

/** 重置 */
const onReset = onPreventReClick(async () => {
  resetForm()
  detailTableData.value = []
  detailPagination.total = 0
  summaryTableData.value = []
  summaryPagination.total = 0
})

/** 查询 */
const onSubmit = onPreventReClick(handelSearch)

/** 详情查询校验 */
const validateDetailSearchForm = () => {
  const { startDate, endDate, entityIds } = getFormData()
  if (!startDate || !endDate) {
    ElMessage.warning("请选择任务时间")
    return false
  }

  if (!entityIds.length) {
    ElMessage.warning("请选择生产区域")
    return false
  }

  return true
}

/** 汇总查询校验 */
const validateSummarySearchForm = () => {
  const { startDate, endDate, entityIds, entityLevel } = getFormData()
  if (!startDate || !endDate) {
    ElMessage.warning("请选择任务时间")
    return false
  }

  if (!entityIds.length) {
    ElMessage.warning("请选择生产区域")
    return false
  }
  if (!isEffectiveValue(entityLevel)) {
    ElMessage.warning("请选择汇总层级")
    return false
  }

  return true
}

/** 查询详情数据 */
const getDetailTableData = async () => {
  if (!validateDetailSearchForm()) {
    return
  }
  await detailTableRef.value?.requestData()
}

/** 查询汇总数据 */
const getSummaryTableData = async () => {
  if (!validateSummarySearchForm()) {
    return
  }

  summaryTableRef.value?.setLoading(true)
  const { records } = await queryProduceTaskCompleteRateReportSummaryPageList({
    pageQuery: {
      pageNum: summaryPagination.currentPage,
      pageSize: summaryPagination.pageSize
    },
    queryParam: { ...getFormData() }
  })

  let data: Record<string, any>[] = []
  let columns: IColumnConfig[] = [
    {
      prop: "entityName",
      label: "汇总层级",
      minWidth: 160
    }
  ]

  records.forEach((item, index) => {
    let row: Record<string, any> = {
      entityName: item.entityName
    }

    item.monthCompletionRate.forEach((month) => {
      if (index === 0) {
        columns.push({
          prop: month.monthDate,
          label: month.monthDate,
          minWidth: 160,
          align: "right"
        })
      }
      row[month.monthDate] = isEffectiveValue(month.monthCompletionRate)
        ? month.monthCompletionRate + "%"
        : ""
    })
    item.yearCompletionRate.forEach((year) => {
      if (index === 0) {
        columns.push({
          prop: year.year,
          label: year.year,
          minWidth: 160,
          align: "right"
        })
      }
      row[year.year] = isEffectiveValue(year.yearCompletionRate)
        ? year.yearCompletionRate + "%"
        : ""
    })

    data.push(row)
  })

  summaryTableConfig.value.columns = columns
  summaryTableData.value = data
  summaryPagination.total = records.length
  summaryTableRef.value?.setLoading(false)
}
</script>

<style lang="scss" scoped></style>
