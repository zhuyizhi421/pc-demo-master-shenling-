<!-- 物流运营-委外管理-委外退料 -->
<template>
  <div class="layout-container">
    <div class="layout-main-page" v-show="curPageKey === EnumPageType.Main">
      <CustomSearchForm
        :form-list="searchList"
        @search="onSubmit"
        @reset="onReset"
      ></CustomSearchForm>

      <div class="custom-table-container">
        <CustomTitle title="委外退料列表">
          <div v-if="!!Authed">
            <el-button type="primary" icon="Plus" @click="onCreateDeleteReturn()"
              >新建委外退料</el-button
            >
          </div>
        </CustomTitle>

        <CustomTable
          ref="tableRef"
          v-model:table-data="tableData"
          v-model:total="pagination.total"
          :config="tableConfig"
          :query-config="queryConfig"
        >
          <template #status-default="{ row: { status } }">
            <el-tag
              :type="
                EnumOutsourcingReturnOrderStatusTagMap[status as EnumOutsourcingReturnOrderStatus]
              "
              >{{
                EnumOutsourcingReturnOrderStatusMap[status as EnumOutsourcingReturnOrderStatus]
              }}</el-tag
            >
          </template>

          <template #detailContent-default="{ row: { detailVoList, detailContent } }">
            <el-popover effect="light" trigger="hover" placement="top" width="auto">
              <template #reference>
                {{ detailContent }}
              </template>
              <template #default>
                <CustomTable :table-data="detailVoList" :config="contentTableConfig"></CustomTable>
              </template>
            </el-popover>
          </template>

          <template #operation-default="{ row }">
            <el-button link type="primary" size="small" @click="onViewDetailClick(row)"
              >查看</el-button
            >
            <el-button
              v-if="row.status === EnumOutsourcingReturnOrderStatus.UN_RECEIPT && !!Authed"
              link
              type="primary"
              size="small"
              @click="onUnCheck(row)"
              >解复核</el-button
            >
            <el-button
              v-if="row.status === EnumOutsourcingReturnOrderStatus.PROCESSING && !!Authed"
              link
              type="primary"
              size="small"
              @click="onComplete(row)"
              >结案</el-button
            >
            <template v-if="row.status === EnumOutsourcingReturnOrderStatus.UN_RECHECK && !!Authed">
              <el-button link type="primary" size="small" @click="onCreateDeleteReturn(row)"
                >编辑</el-button
              >
              <el-button link type="primary" size="small" @click="onCheck(row)">复核</el-button>
              <el-button link type="danger" size="small" @click="onDeleteClick(row)"
                >删除</el-button
              >
            </template>
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

      <!-- 新建、编辑 -->
      <CreateReturn
        v-if="
          [EnumPageType.Outsource_return_create, EnumPageType.Outsource_return_update].includes(
            curPageKey
          )
        "
        :select-id="selectedRowId"
        @close="curPageKey = EnumPageType.Main"
        @success="tableRef?.requestData()"
      ></CreateReturn>

      <!-- 详情 -->
      <ReturnDetail
        v-if="curPageKey === EnumPageType.Outsource_return_detail"
        :select-id="selectedRowId"
        @close="curPageKey = EnumPageType.Main"
      ></ReturnDetail>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import {
  oustSourcingReturnArchive,
  oustSourcingReturnDelete,
  outsourcingReturnCheck,
  outsourcingReturnUnCheck,
  queryOutsourcingReturnPageList
} from "@/api/logistics/delegate"
import { querySupplierPageList } from "@/api/supplier"
import CustomPageCrumbs from "@/components/CustomPageCrumbs/index.vue"
import CustomPagination from "@/components/CustomPagination/index.vue"
import useSearchForm from "@/components/CustomSearchForm/hooks/index"
import CustomSearchForm from "@/components/CustomSearchForm/index.vue"
import { EnumComponentType } from "@/components/CustomSearchForm/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import {
  EnumOutsourcingReturnOrderStatus,
  EnumOutsourcingReturnOrderStatusMap,
  EnumOutsourcingReturnOrderStatusTagMap
} from "@/constant/enums"
import { FORMAT_TIME, TIME_RANGE } from "@/constant/time"
import useButtonAuth from "@/hooks/useButtonAuth"
import type { IOption } from "@/types/common"
import type {
  IDelegateReturnPageListParams,
  IDelegateReturnVo as ITableRow
} from "@/types/logistics/delegate"
import { precisionConversion } from "@/utils/common"

import CreateReturn from "./components/CreateReturn.vue"
import ReturnDetail from "./components/ReturnDetail.vue"

defineOptions({
  name: "OutsourcingReturn"
})

/** 页面显示类型枚举 */
enum EnumPageType {
  Main, // 列表页
  Outsource_return_create, // 退料订单新增
  Outsource_return_update, // 退料订单编辑
  Outsource_return_detail // 委外退料详情
}

const curPageKey = ref(EnumPageType.Main)
const pageTree = ref([
  {
    name: "委外退料",
    key: EnumPageType.Main,
    children: [
      {
        name: "委外退料新建",
        key: EnumPageType.Outsource_return_create
      },
      {
        name: "委外退料编辑",
        key: EnumPageType.Outsource_return_update
      },
      {
        name: "委外退料详情",
        key: EnumPageType.Outsource_return_detail
      }
    ]
  }
])
const supplierList = ref<IOption[]>([]) // 供应商列表

const Authed = useButtonAuth("OutsourcingReturn_update", "OutsourcingReturn_query")
const { searchList, resetForm, getFormData } = useSearchForm<{
  no: string
  source: number
  statusList: number[]
  supplierId: string
  startDate: string
  endDate: string
}>([
  {
    type: EnumComponentType.Input,
    label: "委外退料单",
    key: "no",
    value: "",
    placeholder: "请输入委外退料单号"
  },
  {
    type: EnumComponentType.Select,
    label: "来源",
    key: "source",
    value: "",
    placeholder: "请选择来源",
    options: [
      { label: "MES", value: 1 },
      { label: "ERP", value: 2 }
    ]
  },
  {
    type: EnumComponentType.Select,
    label: "状态",
    key: "statusList",
    value: "",
    placeholder: "请选择状态",
    options: Object.entries(EnumOutsourcingReturnOrderStatusMap).map(([key, value]) => ({
      label: value,
      value: +key
    })),
    multiple: true,
    maxTag: 2
  },
  {
    type: EnumComponentType.Select,
    label: "供应商名称",
    key: "supplierId",
    value: "",
    options: supplierList,
    placeholder: "请选择供应商",
    filterable: true
  },
  {
    type: EnumComponentType.Date,
    dateType: "datetimerange",
    label: "创建时间",
    key: "time",
    value: ["", ""],
    placeholder: ["开始时间", "结束时间"],
    format: FORMAT_TIME,
    valueFormat: FORMAT_TIME,
    defaultTime: TIME_RANGE,
    keyword: ["startDate", "endDate"]
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
      label: "委外退料单",
      minWidth: 160
    },
    {
      prop: "source",
      label: "来源",
      width: 90,
      align: "center",
      formatter: ({ source }) => (source === 1 ? "MES" : "ERP")
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
      prop: "detailContent",
      label: "退料",
      minWidth: 160,
      showOverflowTooltip: false,
      className: "custom-table-content-ellipsis",
      slots: {
        default: "detailContent-default"
      }
    },
    {
      prop: "supplierName",
      label: "供应商",
      minWidth: 160
    },
    {
      prop: "returnDate",
      label: "计划退料日期",
      minWidth: 160
    },
    {
      prop: "createTime",
      label: "创建时间",
      width: 160,
      align: "center"
    },
    {
      prop: "archiveTime",
      label: "结单时间",
      width: 160,
      align: "center"
    },
    {
      prop: "operation",
      label: "操作",
      width: 200,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})
const queryConfig: ITableRequestConfig<[IDelegateReturnPageListParams], ITableRow, true> = {
  api: queryOutsourcingReturnPageList,
  getParams: () => {
    const { startDate, endDate, ...restParams } = getFormData()
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
        queryParam: restParams
      }
    ]
  }
}
const contentTableConfig = ref<ITableConfig>({
  columns: [
    {
      prop: "productModelName",
      label: "物料名称",
      width: 160
    },
    {
      prop: "productModelCode",
      label: "物料编号",
      width: 160
    },
    {
      prop: "returnAmount",
      label: "退料数量",
      width: 120,
      align: "right",
      formatter: ({ returnAmount, decimalNumber }) =>
        precisionConversion(returnAmount, decimalNumber)
    },
    {
      prop: "unitName",
      label: "单位",
      width: 90,
      align: "center"
    }
  ]
})

const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

onMounted(() => {
  getSupplierList()
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

/** 获取供应商列表 */
const getSupplierList = async () => {
  const { records } = await querySupplierPageList({ pageNum: 1, pageSize: 1000 })
  supplierList.value =
    records?.map((item) => {
      return {
        value: item.id,
        label: item.supplierName || item.supplierAbbr
      }
    }) || []
}

/** 新建委外退料操作 */
const onCreateDeleteReturn = (row?: ITableRow) => {
  curPageKey.value = row
    ? EnumPageType.Outsource_return_update
    : EnumPageType.Outsource_return_create
  selectedRowId.value = row?.id || ""
}

/** 查看详情 */
const onViewDetailClick = (row: ITableRow) => {
  curPageKey.value = EnumPageType.Outsource_return_detail
  selectedRowId.value = row.id
}

// 复核
const onCheck = async (row: ITableRow) => {
  await ElMessageBox.confirm("确认要复核吗？", "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "返回"
  })
  await outsourcingReturnCheck({ id: row.id as string })
  ElMessage.success("复核成功")
  tableRef.value?.requestData()
}

// 解复核
const onUnCheck = async (row: ITableRow) => {
  await ElMessageBox.confirm("确认要解复核吗？", "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "返回"
  })
  await outsourcingReturnUnCheck({ id: row.id as string })
  ElMessage.success("解复核成功")
  tableRef.value?.requestData()
}

// 结案
const onComplete = async (row: ITableRow) => {
  await ElMessageBox.confirm(`委外退料单${row.no}未完成，是否确认结案？`, "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "返回"
  })
  await oustSourcingReturnArchive({ id: row.id as string })
  ElMessage.success("结案成功")
  tableRef.value?.requestData()
}

// 删除
const onDeleteClick = async (row: ITableRow) => {
  await ElMessageBox.confirm("确认要删除吗", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "error"
  })
  await oustSourcingReturnDelete({ id: row.id as string })
  ElMessage.success("删除成功")
  tableRef.value?.requestData()
}
</script>

<style lang="scss" scoped>
.status {
  width: 84px;
  height: 32px;
  background: #ecf5ff;
  border-radius: 4px 4px 4px 4px;
  font-weight: 400;
  font-size: 14px;
  line-height: 32px;
  text-align: center;
  &.status0 {
    color: #409eff;
    border: 1px solid #c6e2ff;
    background: #ecf5ff;
  }
  &.status1 {
    color: #faad14;
    border: 1px solid #fff1b8;
    background: #fffbe6;
  }
  &.status2 {
    color: #909399;
    background: #f4f4f5;
    border: 1px solid #e9e9eb;
  }
}
</style>
