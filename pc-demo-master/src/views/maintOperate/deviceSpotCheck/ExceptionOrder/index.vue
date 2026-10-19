<template>
  <div class="layout-container">
    <div class="layout-main-page">
      <CustomSearchForm
        :form-list="searchList"
        @search="onSubmit"
        @reset="onReset"
      ></CustomSearchForm>

      <div class="custom-table-container">
        <CustomTitle title="点检异常工单列表"></CustomTitle>
        <CustomTable
          ref="customTableRef"
          v-model:table-data="customTableData"
          v-model:total="pagination.total"
          :config="tableConfig"
          :query-config="queryConfig"
          class="custom-table"
        >
          <template #equipmentName-default="{ row }">
            <el-button type="primary" size="small" link @click="onReviewDeviceClick(row)">{{
              row.equipmentName
            }}</el-button>
          </template>

          <template #sourceName-default="{ row }">
            <el-button type="primary" size="small" link @click="onReviewExceptionClick(row)">{{
              row.sourceName
            }}</el-button>
          </template>

          <template #operation-default="{ row }">
            <el-button type="primary" size="small" link @click="onFeedbackClick(row)"
              >反馈查看</el-button
            >
          </template>
        </CustomTable>
      </div>

      <CustomPagination
        v-model:currentPage="pagination.currentPage"
        v-model:pageSize="pagination.pageSize"
        :total="pagination.total"
        border
        @change="customTableRef?.requestData()"
      />
    </div>

    <!-- 设备详情弹窗 -->
    <DeviceInfo v-model="deviceInfoShow" :id="currentInfoId" />

    <!-- 异常项详情弹窗 -->
    <ExceptInfo v-model="expectInfoShow" :id="currentInfoId" :type="currentExceptionSourceType" />

    <!-- 异常工单详情弹窗 -->
    <ExceptOrderDetail
      v-model="exceptDetail.show"
      :data="exceptDetail.data"
      :type="currentExceptionSourceType"
      @on-ok="customTableRef?.requestData()"
    />
  </div>
</template>

<script setup lang="ts">
import { queryEquipmentExceptionOrderPageList } from "@/api/operation/equipment/equipment-exception-order"
import {
  exceptionTaskSolutionTypeToNameMap,
  exceptionTaskStatusToNameMap
} from "@/api/operation/equipment/types"
import CustomPagination from "@/components/CustomPagination/index.vue"
import useSearchForm from "@/components/CustomSearchForm/hooks/index"
import CustomSearchForm from "@/components/CustomSearchForm/index.vue"
import { EnumComponentType, type ISearchItem } from "@/components/CustomSearchForm/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import {
  EnumEquipmentExceptionSourceType,
  EnumEquipmentExceptionSourceTypeMap
} from "@/constant/enums"
import { TIME_RANGE } from "@/constant/time"
import type {
  IEquipmentExceptionOrderPageListItem as ITableRow,
  IEquipmentExceptionOrderPageParams
} from "@/types/maintain/equipment-manage/equipment-exception-order"
import DeviceInfo from "@/views/maintOperate/components/DeviceInfo.vue"

import ExceptOrderDetail from "../../components/exceptOrderDetail.vue"
import ExceptInfo from "./ExceptInfo.vue"

defineOptions({
  name: "SpotCheckExpect"
})

enum EnumDeactive {
  "停用" = 1,
  "启用" = 0
}

const searchFormData = ref<ISearchItem[]>([
  {
    type: EnumComponentType.Input,
    key: "taskNo",
    label: "异常单号",
    value: "",
    placeholder: "请输入异常单号"
  },
  {
    type: EnumComponentType.Input,
    key: "equipmentNo",
    label: "设备编号",
    value: "",
    placeholder: "请输入设备编号"
  },
  {
    type: EnumComponentType.Select,
    key: "taskStatus",
    label: "状态",
    value: "",
    placeholder: "请选择状态",
    options: [
      {
        label: "待处理",
        value: 0
      },
      {
        label: "已完成",
        value: 1
      }
    ]
  },
  {
    type: EnumComponentType.Date,
    dateType: "datetimerange",
    key: "date",
    label: "生成时间",
    value: [],
    placeholder: ["请选择开始时间", "请选择结束时间"],
    format: "YYYY-MM-DD HH:mm:ss",
    valueFormat: "YYYY-MM-DD HH:mm:ss",
    defaultTime: TIME_RANGE,
    keyword: ["startDate", "endDate"]
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  taskNo: string
  taskStatus?: number
  startDate?: string
  endDate?: string
  equipmentNo: string
}>(searchFormData.value)

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "taskNo",
      label: "异常单号",
      width: 160
    },
    {
      prop: "taskStatus",
      label: "状态",
      width: 120,
      align: "center",
      formatter: (row: ITableRow) => {
        return exceptionTaskStatusToNameMap[row.taskStatus] ?? ""
      }
    },
    {
      prop: "createTime",
      label: "生成时间",
      width: 160
    },
    {
      prop: "sourceType",
      label: "来源",
      width: 120,
      align: "center",
      formatter: (row: ITableRow) => EnumEquipmentExceptionSourceTypeMap[row.sourceType] ?? ""
    },
    {
      prop: "sourceNo",
      label: "来源单号",
      width: 160,
      align: "center",
      formatter: (row: ITableRow) => {
        return row.sourceTaskNo || row.sourceNo || "--"
      }
    },
    {
      prop: "equipmentName",
      label: "设备名称",
      width: 160,
      slots: {
        default: "equipmentName-default"
      }
    },
    {
      prop: "sourceName",
      label: "异常项",
      width: 160,
      slots: {
        default: "sourceName-default"
      }
    },
    {
      prop: "reportUsersName",
      label: "报修人",
      width: 160,
      formatter: (row: ITableRow) => {
        return row.reportUsers?.map((item) => item?.name || "")?.join(",") ?? "--"
      }
    },
    {
      prop: "reportUsersNo",
      label: "报修人编号",
      width: 160,
      formatter: (row: ITableRow) => {
        return row.reportUsers?.map((item) => item?.empNo || "")?.join(",") ?? "--"
      }
    },
    {
      prop: "handleUsersName",
      label: "处理人",
      width: 160,
      formatter: (row: ITableRow) => {
        return row.handleUsers?.map((item) => item?.name || "")?.join(",") ?? "--"
      }
    },
    {
      prop: "handleUsersNo",
      label: "处理人工号",
      width: 160,
      formatter: (row: ITableRow) => {
        return row.handleUsers?.map((item) => item?.empNo || "")?.join(",") ?? "--"
      }
    },
    {
      prop: "faults",
      label: "故障",
      width: 160,
      formatter: (row: ITableRow) => {
        return row.faults?.map((item: any) => item?.faultName || "")?.join(",") ?? "--"
      }
    },
    {
      prop: "analysis",
      label: "分析备注",
      width: 160
    },
    {
      prop: "solution",
      label: "解决措施",
      width: 120,
      align: "center",
      formatter: (row: ITableRow) => {
        return exceptionTaskSolutionTypeToNameMap[row.solution] ?? ""
      }
    },
    {
      prop: "deactive",
      label: "设备是否停",
      width: 120,
      align: "center",
      formatter: (row: ITableRow) => {
        return EnumDeactive[row.deactive] ?? ""
      }
    },
    {
      prop: "completeTime",
      label: "办结时间",
      width: 160
    },
    {
      prop: "operation",
      label: "操作",
      width: 80,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})
const queryConfig: ITableRequestConfig<[IEquipmentExceptionOrderPageParams], ITableRow, true> = {
  api: queryEquipmentExceptionOrderPageList,
  getParams: () => {
    const { startDate, endDate, ...rest } = getFormData()
    return [
      {
        pageQuery: {
          pageNum: pagination.value.currentPage,
          pageSize: pagination.value.pageSize
        },
        queryParam: {
          sourceType: EnumEquipmentExceptionSourceType.SpotCheck,
          ...rest
        },
        dateRange: {
          startDate: startDate,
          endDate: endDate
        },
        sort: [
          {
            field: "createTime",
            order: "desc"
          }
        ]
      }
    ]
  }
}

const exceptDetail = ref({
  show: false,
  data: {}
})
const deviceInfoShow = ref(false)
const expectInfoShow = ref(false)
const currentInfoId = ref("") // 设备和异常id 共用
const currentExceptionSourceType = ref<EnumEquipmentExceptionSourceType>(
  EnumEquipmentExceptionSourceType.SpotCheck
)

onMounted(() => {
  customTableRef.value?.requestData()
})

const onReset = () => {
  resetForm()
  onSubmit()
}

const onSubmit = async () => {
  pagination.value.currentPage = 1
  await customTableRef.value?.requestData()
}

/** 查看设备详情 */
const onReviewDeviceClick = (row: any) => {
  deviceInfoShow.value = true
  currentInfoId.value = row.equipmentId
}

/** 查看异常项详情 */
const onReviewExceptionClick = (row: any) => {
  expectInfoShow.value = true
  currentInfoId.value = row.sourceId
}

/** 反馈查看 */
const onFeedbackClick = (row: any) => {
  exceptDetail.value = {
    show: true,
    data: row
  }
}
</script>

<style scoped lang="scss"></style>
