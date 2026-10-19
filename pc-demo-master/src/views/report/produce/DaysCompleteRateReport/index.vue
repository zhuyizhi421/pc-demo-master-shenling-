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
        <CustomTable
          ref="tableRef"
          v-model:table-data="tableData"
          v-model:total="pagination.total"
          :config="tableConfig"
          :query-config="queryConfig"
        >
          <template #completeRate-default="{ row }">
            <el-button type="primary" link @click="onReviewDetail(row)">{{
              row.completionRate + "%"
            }}</el-button>
          </template>
        </CustomTable>
        <CustomPagination
          v-model:currentPage="pagination.currentPage"
          v-model:pageSize="pagination.pageSize"
          :total="pagination.total"
          :border="false"
          @change="onSubmit"
        />
      </div>
    </div>

    <!-- 详情弹窗 -->
    <DetailDialog
      v-model="dialogVisible"
      :date="selectedRow?.time || ''"
      :entity-id="selectedRow?.facilityId || ''"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import { queryDaysCompleteRateReportPage } from "@/api/report/produce/daysCompleteRateReport"
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
import { FORMAT_TIME, getTimeRange, TIME_RANGE } from "@/constant/time"
import type {
  IDaysCompleteRateReportPageItem as ITableRow,
  IDaysCompleteRateReportPageParams
} from "@/types/report/produce/daysCompleteRateReport"
import { onPreventReClick } from "@/utils/common"

import DetailDialog from "./DetailDialog.vue"

defineOptions({
  name: "DaysCompleteRateReport"
})

const { searchList, resetForm, getFormData } = useSearchForm<{
  startDate: string
  endDate: string
  entityIds: string[]
}>([
  {
    type: EnumComponentType.Date,
    dateType: "datetimerange",
    key: "planArrivalTime",
    label: "时间",
    value: getTimeRange(-1),
    placeholder: ["请选择开始时间", "请选择结束时间"],
    format: FORMAT_TIME,
    valueFormat: FORMAT_TIME,
    defaultTime: TIME_RANGE,
    keyword: ["startDate", "endDate"]
  },
  {
    type: EnumComponentType.Area,
    key: "entityIds",
    label: "生产单位",
    value: [],
    placeholder: "请选择生产单位",
    props: {
      areaType: SelectType.ProductType,
      isEnable: true,
      containLastLevel: false,
      multiple: true
    }
  }
])
const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "time",
      label: "时间",
      minWidth: 160,
      align: "center"
    },
    {
      prop: "facilityName",
      label: "生产单位",
      minWidth: 160
    },
    {
      prop: "completionRate",
      label: "完成率",
      minWidth: 160,
      align: "center",
      slots: {
        default: "completeRate-default"
      }
    }
  ]
})
const queryConfig: ITableRequestConfig<[IDaysCompleteRateReportPageParams], ITableRow, true> = {
  api: queryDaysCompleteRateReportPage,
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

const dialogVisible = ref(false)
const selectedRow = ref<ITableRow | null>(null)

/** 查询校验 */
const validateSearchForm = () => {
  const { startDate, endDate, entityIds } = getFormData()
  if (!startDate || !endDate) {
    ElMessage.warning("请选择时间")
    return false
  }

  if (!entityIds.length) {
    ElMessage.warning("请选择生产单位")
    return false
  }

  return true
}

const handelSearch = async () => {
  if (!validateSearchForm()) {
    return
  }
  await tableRef.value?.requestData()
}

/** 重置 */
const onReset = onPreventReClick(async () => {
  resetForm()
  tableData.value = []
  pagination.total = 1
})

/** 查询 */
const onSubmit = onPreventReClick(handelSearch)

/** 查看详情 */
const onReviewDetail = (row: ITableRow) => {
  dialogVisible.value = true
  selectedRow.value = row
}
</script>

<style lang="scss" scoped></style>
