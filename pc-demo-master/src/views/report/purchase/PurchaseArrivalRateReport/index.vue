<template>
  <div class="layout-container">
    <div class="layout-main-page">
      <CustomSearchForm
        :form-list="searchList"
        @search="onSubmit"
        @reset="onReset"
      ></CustomSearchForm>

      <div class="custom-table-container" v-loading="loading">
        <CustomTitle title="汇总数据" />
        <CustomDescription :label-width="160" :data="summaryData || {}" :configs="summaryConfig" />

        <CustomTitle title="明细列表">
          <div class="table-legend">
            <div class="legend">
              <div class="legend-item">
                <span class="legend-warning"></span>
                容忍期
              </div>
              <div class="legend-item">
                <span class="legend-danger"></span>
                超期
              </div>
            </div>
          </div>
        </CustomTitle>

        <CustomTable
          ref="tableRef"
          class="detail-table"
          v-model:table-data="tableData"
          v-model:total="pagination.total"
          :config="tableConfig"
          :query-config="queryConfig"
        >
          <template #diffDays-default="{ row }">
            <span v-if="row.actualArrivalTime" :class="{ danger: row.diffDays > 0 }">{{
              row.diffDays
            }}</span>
          </template>
        </CustomTable>
        <CustomPagination
          v-model:currentPage="pagination.currentPage"
          v-model:pageSize="pagination.pageSize"
          :total="pagination.total"
          :border="false"
          @change="tableRef?.requestData()"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import {
  queryPurchaseArrivalRateReportPage,
  requestPurchaseArrivalRateReportSummary
} from "@/api/report/purchase/purchaseArrivalRateReport"
import { querySupplierPageList } from "@/api/supplier"
import CustomDescription from "@/components/CustomDescription/index.vue"
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
import { FORMAT_DATE, FORMAT_TIME, getTimeRange } from "@/constant/time"
import type { IOptionItem } from "@/types/common"
import type {
  IPurchaseArrivalRateReportPageItem,
  IPurchaseArrivalRateReportPageItem as ITableRow,
  IPurchaseArrivalRateReportPageParams,
  IPurchaseArrivalRateReportSummary
} from "@/types/report/purchase/purchaseArrivalRateReport"
import { isEffectiveValue, onPreventReClick } from "@/utils/common"

defineOptions({
  name: "PurchaseArrivalRateReport"
})

let overdueTime = 0 // 允许延迟天数，用于表格样式渲染
const loading = ref(false)
const supplierList = ref<IOptionItem[]>([])
const { searchList, resetForm, getFormData } = useSearchForm<{
  startDate: string
  endDate: string
  supplierIds: string[]
  overdueTime: number
}>([
  {
    type: EnumComponentType.Date,
    dateType: "daterange",
    key: "planArrivalTime",
    label: "预计收货日期",
    value: getTimeRange(),
    placeholder: ["请选择开始日期", "请选择结束日期"],
    format: FORMAT_DATE,
    valueFormat: FORMAT_TIME,
    keyword: ["startDate", "endDate"],
    shortcuts: [
      {
        text: "当天",
        type: "day",
        value: [0, 0]
      },
      {
        text: "近30天",
        type: "month",
        value: [-1, 0]
      },
      {
        text: "近半年",
        type: "month",
        value: [-6, 0]
      }
    ]
  },
  {
    type: EnumComponentType.Select,
    key: "supplierIds",
    label: "供应商",
    value: [],
    placeholder: "请选择供应商",
    options: supplierList,
    filterable: true,
    multiple: true
  },
  {
    type: EnumComponentType.InputNumber,
    key: "overdueTime",
    label: "允许延迟天数",
    value: 30,
    placeholder: "请输入允许延迟天数",
    min: 1,
    step: 1,
    stepStrictly: true
  }
])

const summaryData = ref<IPurchaseArrivalRateReportSummary | null>(null)
const summaryConfig = [
  {
    field: "totalPurchaseOrderItemCount",
    label: "采购订单物料总条目数：",
    colspan: -1
  },
  {
    field: "onTimeArrivalItemCount",
    label: "按期到货物料条目数："
  },
  {
    field: "onTimeNotArrivalItemCount",
    label: "按期未到货物料条目数："
  },
  {
    field: "onTimeArrivalRate",
    label: "准时到货率：",
    formatter: () =>
      isEffectiveValue(summaryData.value?.onTimeArrivalRate)
        ? summaryData.value?.onTimeArrivalRate + "%"
        : ""
  },
  {
    field: "overdueArrivalItemCount",
    label: "超期到货物料条目数："
  },
  {
    field: "overdueNotArrivalItemCount",
    label: "超期未到货物料条目数："
  },
  {
    field: "targetOverdueArrivalRate",
    label: "目标超时到货率：",
    formatter: () =>
      isEffectiveValue(summaryData.value?.targetOverdueArrivalRate)
        ? summaryData.value?.targetOverdueArrivalRate + "%"
        : ""
  }
]

const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "index",
      type: "index",
      label: "序号",
      minWidth: 60,
      align: "center",
      fixed: "left"
    },
    {
      prop: "purchaseOrderNo",
      label: "采购订单号",
      minWidth: 160
    },
    {
      prop: "productNo",
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
      prop: "purchaseQuantity",
      label: "采购数量",
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
      prop: "expectedArrivalTime",
      label: "预计收货日期",
      minWidth: 120,
      align: "center",
      formatter: (row) => row.expectedArrivalTime?.slice(0, 10)
    },
    {
      prop: "arrivalQuantity",
      label: "收货数量",
      minWidth: 120,
      align: "right"
    },
    {
      prop: "actualArrivalTime",
      label: "实际收货时间",
      minWidth: 160,
      align: "center"
    },
    {
      prop: "diffDays",
      label: "差异时间（天）",
      minWidth: 140,
      align: "right",
      slots: {
        default: "diffDays-default"
      }
    },
    {
      prop: "supplierCode",
      label: "供应商编号",
      minWidth: 160
    },
    {
      prop: "supplierName",
      label: "供应商简称",
      minWidth: 160
    },
    {
      prop: "status",
      label: "状态",
      minWidth: 120,
      align: "center"
    },
    {
      prop: "closingTime",
      label: "结案时间",
      minWidth: 160,
      align: "center"
    }
  ],
  rowClassName: (data: { row: IPurchaseArrivalRateReportPageItem; rowIndex: number }) => {
    if (!["进行中", "未到货"].includes(data.row.status)) {
      return ""
    }

    if (data.row.diffDays > overdueTime) {
      return "danger-row"
    } else if (data.row.diffDays > 0 && data.row.diffDays <= overdueTime) {
      return "warning-row"
    }
    return ""
  }
})
const queryConfig: ITableRequestConfig<[IPurchaseArrivalRateReportPageParams], ITableRow, true> = {
  api: queryPurchaseArrivalRateReportPage,
  getParams: () => {
    return [
      {
        pageQuery: {
          pageNum: pagination.currentPage,
          pageSize: pagination.pageSize
        },
        queryParam: {
          ...getFormData()
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

onMounted(async () => {
  getSupplierOptions()
  handelSearch()
})

/** 查询校验 */
const validateSearchForm = () => {
  const { startDate, endDate, overdueTime } = getFormData()
  if (!startDate || !endDate) {
    ElMessage.warning("请选择预计收货日期")
    return false
  }

  if (!overdueTime) {
    ElMessage.warning("请输入允许延迟天数")
    return false
  }

  return true
}

const handelSearch = async () => {
  if (!validateSearchForm()) {
    return
  }

  try {
    loading.value = true
    await getSummaryData()
    await tableRef.value?.requestData()
  } finally {
    loading.value = false
  }
}

/** 重置 */
const onReset = onPreventReClick(async () => {
  resetForm()
  await handelSearch()
})

/** 查询 */
const onSubmit = onPreventReClick(handelSearch)

/** 获取供应商下拉 */
const getSupplierOptions = async () => {
  const { records } = await querySupplierPageList({ pageNum: 1, pageSize: 1000 })
  const list = records?.map((item) => ({
    label: item.supplierName || item.supplierAbbr,
    value: item.id
  }))
  supplierList.value = list || []
}

/** 获取汇总数据 */
const getSummaryData = async () => {
  const params = {
    ...getFormData()
  }
  const data = await requestPurchaseArrivalRateReportSummary(params)
  summaryData.value = data
  overdueTime = params.overdueTime
}
</script>

<style lang="scss" scoped>
.danger {
  color: red;
}

.table-legend {
  display: flex;
  justify-content: flex-end;
  align-items: center;

  .legend {
    display: flex;
    align-items: center;

    .legend-item {
      display: flex;
      align-items: center;
      font-size: 14px;
      margin-right: 20px;

      span {
        width: 16px;
        height: 16px;
        margin-right: 6px;
        background-color: #ffffcc;

        &.legend-danger {
          background-color: #f4b3bb;
        }
      }
    }
  }
}

.detail-table {
  &:deep(.danger-row) {
    background-color: #f4b3bb;
  }

  &:deep(.warning-row) {
    background-color: #ffffcc;
  }
}
</style>
