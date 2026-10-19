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
          <el-tab-pane :label="EnumTab.Summary" :name="EnumTab.Summary">
            <CustomTable
              ref="summaryTableRef"
              v-model:table-data="summaryTableData"
              v-model:total="summaryPagination.total"
              :config="summaryTableConfig"
              :query-config="summaryQueryConfig"
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
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import {
  queryNonconformingRateReportDetail,
  queryNonconformingRateReportPageList
} from "@/api/report/quality/nonconformingRateReport"
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
import { FORMAT_DATE, FORMAT_TIME, getTimeRange, TIME_RANGE } from "@/constant/time"
import type { INonconformingRateReportPageParams } from "@/types/report/quality/nonconformingRateReport"
import { isEffectiveValue, onPreventReClick } from "@/utils/common"

defineOptions({
  name: "NonconformingRateReport"
})

type ITableRow = {}

enum EnumTab {
  Summary = "汇总",
  Detail = "详情"
}

const activeTab = ref(EnumTab.Summary)
const { searchList, resetForm, getFormData } = useSearchForm<{
  startDate: string
  endDate: string
  entityIds: string[]
  productModelIds: string[]
}>([
  {
    type: EnumComponentType.Date,
    dateType: "daterange",
    key: "time",
    label: "日期",
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
    key: "productModelIds",
    label: "产品",
    value: "",
    placeholder: "请选择产品",
    options: [],
    multiple: true,
    dialogType: "product",
    dialogProps: {
      multiple: true
    }
  }
])

const summaryTableRef = ref<ComponentExposed<typeof CustomTable>>()
const summaryTableData = ref<ITableRow[]>([])
const summaryTableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "index",
      type: "index",
      label: "序号",
      width: 60,
      align: "center"
    },
    {
      prop: "productionArea",
      label: "生产区域",
      minWidth: 160
    },
    {
      prop: "productionCount",
      label: "生产数",
      minWidth: 120,
      align: "right"
    },
    {
      prop: "qualifiedCount",
      label: "合格数",
      minWidth: 120,
      align: "right"
    },
    {
      prop: "unqualifiedCount",
      label: "不合格数",
      minWidth: 120,
      align: "right"
    },
    {
      prop: "unitName",
      label: "单位",
      minWidth: 90,
      align: "center"
    },
    {
      prop: "unqualifiedRate",
      label: "不合格率",
      minWidth: 120,
      align: "right",
      formatter: ({ unqualifiedRate }) =>
        isEffectiveValue(unqualifiedRate) ? `${unqualifiedRate}%` : ""
    }
  ]
})
const summaryQueryConfig: ITableRequestConfig<
  [INonconformingRateReportPageParams],
  ITableRow,
  true
> = {
  api: queryNonconformingRateReportPageList,
  getParams: () => {
    const { startDate, endDate, ...rest } = getFormData()
    return [
      {
        pageQuery: {
          pageNum: detailPagination.currentPage,
          pageSize: detailPagination.pageSize
        },
        queryParam: {
          ...rest
        },
        dateRange: {
          startDate,
          endDate
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

const detailTableRef = ref<ComponentExposed<typeof CustomTable>>()
const detailTableData = ref<ITableRow[]>([])
const detailTableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "index",
      type: "index",
      label: "序号",
      width: 60,
      align: "center"
    },
    {
      prop: "productionOrder",
      label: "生产订单",
      minWidth: 160
    },
    {
      prop: "productionArea",
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
      prop: "productionQty",
      label: "生产数",
      minWidth: 120,
      align: "right"
    },
    {
      prop: "qualifiedQty",
      label: "合格数",
      minWidth: 120,
      align: "right"
    },
    {
      prop: "unqualifiedQty",
      label: "不合格数",
      minWidth: 120,
      align: "right"
    },
    {
      prop: "unitName",
      label: "单位",
      minWidth: 90,
      align: "center"
    }
  ]
})
const detailQueryConfig: ITableRequestConfig<
  [INonconformingRateReportPageParams],
  ITableRow,
  true
> = {
  api: queryNonconformingRateReportDetail,
  getParams: () => {
    const { startDate, endDate, ...rest } = getFormData()
    return [
      {
        pageQuery: {
          pageNum: detailPagination.currentPage,
          pageSize: detailPagination.pageSize
        },
        queryParam: {
          ...rest
        },
        dateRange: {
          startDate,
          endDate
        }
      }
    ]
  }
}
const summaryPagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const handelSearch = async () => {
  const { startDate, endDate, entityIds } = getFormData()
  if (startDate && endDate && entityIds?.length) {
    await Promise.allSettled([getSummaryTableData(), getDetailTableData()])
    return
  }

  if (activeTab.value === EnumTab.Summary) {
    await getSummaryTableData()
  } else if (activeTab.value === EnumTab.Detail) {
    await getDetailTableData()
  }
}

/** 重置 */
const onReset = onPreventReClick(async () => {
  resetForm()
  await handelSearch()
})

/** 查询 */
const onSubmit = onPreventReClick(handelSearch)

/** 查询校验 */
const validateSearchForm = () => {
  const { startDate, endDate, entityIds } = getFormData()
  if (!startDate || !endDate) {
    ElMessage.warning("请选择日期")
    return false
  }

  if (!entityIds?.length) {
    ElMessage.warning("请选择生产区域")
    return false
  }

  return true
}

/** 查询汇总数据 */
const getSummaryTableData = async () => {
  if (!validateSearchForm()) {
    return
  }
  await summaryTableRef.value?.requestData()
}

/** 查询详情数据 */
const getDetailTableData = async () => {
  if (!validateSearchForm()) {
    return
  }
  await detailTableRef.value?.requestData()
}
</script>

<style lang="scss" scoped></style>
