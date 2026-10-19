<template>
  <div class="layout-container">
    <div class="layout-main-page" v-show="curPageKey === EnumPageType.Main">
      <CustomSearchForm
        :form-list="searchList"
        @search="onSubmit"
        @reset="onReset"
      ></CustomSearchForm>

      <div class="custom-table-container">
        <CustomTitle title="领料任务列表" />

        <CustomTable
          ref="tableRef"
          v-model:table-data="tableData"
          v-model:total="pagination.total"
          :config="tableConfig"
          :query-config="queryConfig"
        >
          <!-- 状态 -->
          <template #status-default="{ row }">
            <el-tag
              :type="
                EnumPreparationMaterialTaskStatusTagMap[
                  row.status as EnumPreparationMaterialTaskStatus
                ]
              "
              >{{
                EnumPreparationMaterialTaskStatusMap[
                  row.status as EnumPreparationMaterialTaskStatus
                ] ?? ""
              }}</el-tag
            >
          </template>

          <template #planContent-default="{ row }">
            <el-popover placement="left" width="630" trigger="hover">
              <template #reference> {{ planContentReference(row) }} </template>
              <CustomTable :table-data="row.planContent" :config="contentTableConfig"></CustomTable>
            </el-popover>
          </template>

          <template #operation-default="{ row }">
            <el-button link type="primary" size="small" @click="onViewDetailClick(row)"
              >查看
            </el-button>
          </template>
        </CustomTable>
      </div>
      <CustomPagination
        v-model:currentPage="pagination.currentPage"
        v-model:pageSize="pagination.pageSize"
        :total="pagination.total"
        border
        @change="tableRef?.requestData()"
      />
    </div>

    <!-- 子页面部分 -->
    <div class="layout-child-page" v-if="curPageKey !== EnumPageType.Main">
      <CustomPageCrumbs v-model="curPageKey" :data="pageTree" />

      <!-- 查看详情 -->
      <PreparationTaskDetail
        v-if="curPageKey === EnumPageType.Preparation_task_detail"
        :select-id="selectedRowId"
        @close="curPageKey = EnumPageType.Main"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { requestPreparationMaterialTaskPageList } from "@/api/logistics/preparationMaterial"
import CustomPageCrumbs from "@/components/CustomPageCrumbs/index.vue"
import CustomPagination from "@/components/CustomPagination/index.vue"
import useSearchForm from "@/components/CustomSearchForm/hooks/index"
import CustomSearchForm from "@/components/CustomSearchForm/index.vue"
import { EnumComponentType } from "@/components/CustomSearchForm/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  IColumnSortInfo,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import {
  EnumGetMaterialPurpose,
  EnumGetMaterialPurposeMap,
  EnumPreparationMaterialPlanType,
  EnumPreparationMaterialPlanTypeMap,
  EnumPreparationMaterialTaskStatus,
  EnumPreparationMaterialTaskStatusMap,
  EnumPreparationMaterialTaskStatusTagMap
} from "@/constant/enums"
import { FORMAT_TIME, TIME_RANGE } from "@/constant/time"
import type {
  IPreparationMaterialItem as ITableRow,
  IPreparationMaterialTaskPageListParams
} from "@/types/logistics/preparationMaterial"
import { precisionConversion } from "@/utils/common"

import PreparationTaskDetail from "./PreparationTaskDetail.vue"

defineOptions({
  name: "PreparationTask"
})

/** 页面显示类型枚举 */
enum EnumPageType {
  Main, // 列表页
  Preparation_task_detail // 领料任务详情
}

const curPageKey = ref(EnumPageType.Main)
const pageTree = ref([
  {
    name: "领料任务",
    key: EnumPageType.Main,
    children: [
      {
        name: "领料任务详情",
        key: EnumPageType.Preparation_task_detail
      }
    ]
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  no: string
  planNo: string
  productName: string
  statusList: number[]
  useForList: number[]
  type: number
  createTimeStart: string
  createTimeEnd: string
}>([
  {
    type: EnumComponentType.Input,
    label: "领料任务单号",
    key: "no",
    value: "",
    placeholder: "请输入领料任务单号"
  },
  {
    type: EnumComponentType.Input,
    label: "领料计划单号",
    key: "planNo",
    value: "",
    placeholder: "请输入领料计划单号"
  },
  {
    type: EnumComponentType.Input,
    label: "产品名称",
    key: "productName",
    value: "",
    placeholder: "请输入产品名称"
  },
  {
    type: EnumComponentType.Select,
    label: "状态",
    key: "statusList",
    value: [],
    placeholder: "请选择状态",
    multiple: true,
    options: Object.entries(EnumPreparationMaterialTaskStatusMap).map(([key, value]) => ({
      label: value,
      value: key
    }))
  },
  {
    type: EnumComponentType.Select,
    label: "领取用途",
    key: "useForList",
    value: [],
    placeholder: "请选择领取用途",
    multiple: true,
    options: Object.entries(EnumGetMaterialPurposeMap).map(([key, value]) => ({
      label: value,
      value: key
    }))
  },
  {
    type: EnumComponentType.Select,
    label: "类型",
    key: "type",
    value: "",
    placeholder: "请选择类型",
    options: Object.entries(EnumPreparationMaterialPlanTypeMap).map(([key, value]) => ({
      label: value,
      value: key
    }))
  },
  {
    type: EnumComponentType.Date,
    dateType: "datetimerange",
    label: "创建时间",
    key: "date",
    value: ["", ""],
    placeholder: ["开始时间", "结束时间"],
    format: FORMAT_TIME,
    valueFormat: FORMAT_TIME,
    defaultTime: TIME_RANGE,
    keyword: ["createTimeStart", "createTimeEnd"]
  }
])

const selectedRowId = ref("") // 选中行id
const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "no",
      label: "领料任务单号",
      minWidth: 160
    },
    {
      prop: "useFor",
      label: "领取用途",
      minWidth: 120,
      align: "center",
      formatter: ({ useFor }) => EnumGetMaterialPurposeMap[useFor as EnumGetMaterialPurpose]
    },
    {
      prop: "warehouseName",
      label: "仓库",
      minWidth: 160
    },
    {
      prop: "planNo",
      label: "领料计划单号",
      minWidth: 160
    },
    {
      prop: "status",
      label: "状态",
      width: 120,
      align: "center",
      slots: {
        default: "status-default"
      }
    },
    {
      prop: "type",
      label: "类型",
      minWidth: 120,
      align: "center",
      formatter: ({ type }) =>
        EnumPreparationMaterialPlanTypeMap[type as EnumPreparationMaterialPlanType]
    },
    {
      prop: "planContent",
      label: "备货内容",
      minWidth: 200,
      showOverflowTooltip: false,
      className: "custom-table-content-ellipsis",
      slots: {
        default: "planContent-default"
      }
    },
    {
      prop: "createTime",
      label: "创建时间",
      minWidth: 160,
      align: "center",
      sortable: true,
      sortOrder: "desc"
    },
    {
      prop: "operation",
      label: "操作",
      width: 70,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})
const queryConfig: ITableRequestConfig<[IPreparationMaterialTaskPageListParams], ITableRow, true> =
  {
    api: requestPreparationMaterialTaskPageList,
    getParams: (sortData: IColumnSortInfo[]) => {
      return [
        {
          pageQuery: {
            pageNum: pagination.currentPage,
            pageSize: pagination.pageSize
          },
          queryParam: getFormData(),
          sort: sortData.map((item) => ({ field: item.sortField, order: item.order! }))
        }
      ]
    }
  }

const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const contentTableConfig = ref<ITableConfig>({
  columns: [
    {
      prop: "productName",
      label: "产品名称",
      minWidth: 160
    },
    {
      prop: "productCode",
      label: "产品编号",
      minWidth: 160
    },
    {
      prop: "amount",
      label: "备货数量",
      minWidth: 160,
      align: "right",
      formatter: ({ amount, decimalNumber }) => precisionConversion(amount, decimalNumber)
    },
    {
      prop: "unit",
      label: "单位",
      minWidth: 120,
      align: "center"
    }
  ]
})

onMounted(() => {
  tableRef.value?.requestData()
})

const onSubmit = () => {
  pagination.currentPage = 1
  tableRef.value?.requestData()
}

const onReset = () => {
  resetForm()
  onSubmit()
}

/** 备货内容 */
const planContentReference = (data: ITableRow) => {
  if (!data.planContent.length) {
    return ""
  }
  return data.planContent.map((item) => item.productName).join(",")
}

/** 查看详情 */
const onViewDetailClick = (row: ITableRow) => {
  curPageKey.value = EnumPageType.Preparation_task_detail
  selectedRowId.value = row.id
}
</script>

<style lang="scss" scoped></style>
