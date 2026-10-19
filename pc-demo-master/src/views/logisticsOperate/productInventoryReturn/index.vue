<!-- 仓库管理-库存退货 -->
<template>
  <div class="layout-container">
    <div class="layout-main-page" v-show="curPageKey === EnumPageType.Main">
      <CustomSearchForm
        :form-list="searchList"
        @search="onSubmit"
        @reset="onReset"
      ></CustomSearchForm>
      <div class="custom-table-container">
        <CustomTitle title="库存退货列表">
          <el-button
            v-if="!!Authed"
            type="primary"
            icon="Plus"
            @click="onCreateProReturnClick('create')"
            >新建库存退货</el-button
          >
        </CustomTitle>

        <CustomTable
          ref="tableRef"
          v-model:table-data="tableData"
          v-model:total="pagination.total"
          :config="tableConfig"
          :query-config="queryConfig"
        >
          <!-- 状态 -->
          <template #taskStatus-default="{ row }">
            <el-tag
              :type="EnumPurchaseReturnStatusTagMap[row.taskStatus as EnumPurchaseReturnStatus]"
              >{{
                EnumPurchaseReturnStatusMap[row.taskStatus as EnumPurchaseReturnStatus] ?? ""
              }}</el-tag
            >
          </template>

          <template #operation-default="{ row }">
            <template v-if="row.taskStatus === EnumPurchaseReturnStatus.UN_START && !!Authed">
              <el-button
                link
                size="small"
                type="primary"
                @click="onCreateProReturnClick('edit', row)"
                >编辑</el-button
              >
              <el-button link size="small" type="danger" @click="onDeleteClick(row)"
                >删除</el-button
              >
            </template>
            <template v-else>
              <el-button link size="small" type="primary" @click="onViewDetailClick(row)"
                >查看</el-button
              >
              <el-button
                v-if="row.taskStatus === EnumPurchaseReturnStatus.PROCESSING && !!Authed"
                link
                size="small"
                type="danger"
                @click="onComplete(row)"
                >结案</el-button
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

      <!-- 库存退货新建、编辑 -->
      <CreateProcurementReturn
        v-if="
          [EnumPageType.Procurement_return_create, EnumPageType.Procurement_return_update].includes(
            curPageKey
          )
        "
        :select-id="selectedRowId"
        @close="curPageKey = EnumPageType.Main"
        @success="tableRef?.requestData()"
      ></CreateProcurementReturn>

      <!-- 库存退货详情 -->
      <ProcurementReturnDetail
        v-if="curPageKey === EnumPageType.Procurement_return_detail"
        :select-id="selectedRowId"
        @close="curPageKey = EnumPageType.Main"
      ></ProcurementReturnDetail>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import {
  closePurchaseReturnTask,
  deletePurchaseReturnTask,
  queryInventoryReturnPageList
} from "@/api/logistics/purchase"
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
  EnumProductionOrderSource,
  EnumProductionOrderSourceMap,
  EnumPurchaseReturnStatus,
  EnumPurchaseReturnStatusMap,
  EnumPurchaseReturnStatusTagMap
} from "@/constant/enums"
import { FORMAT_TIME, TIME_RANGE } from "@/constant/time"
import useButtonAuth from "@/hooks/useButtonAuth"
import type { IOption } from "@/types/common"
import type {
  IInventoryReturnPageListItem as ITableRow,
  IInventoryReturnPageListParams
} from "@/types/logistics/purchase"

import CreateProcurementReturn from "./components/CreateProductInventoryReturn.vue"
import ProcurementReturnDetail from "./components/ProductInventoryReturnDetail.vue"

defineOptions({
  name: "ProcurementReturn"
})

/** 页面显示类型枚举 */
enum EnumPageType {
  Main, // 列表页
  Procurement_return_create, // 采购退货新增
  Procurement_return_update, // 采购退货编辑
  Procurement_return_detail // 采购退货详情
}

const curPageKey = ref(EnumPageType.Main)
const pageTree = ref([
  {
    name: "库存退货",
    key: EnumPageType.Main,
    children: [
      {
        name: "库存退货新建",
        key: EnumPageType.Procurement_return_create
      },
      {
        name: "库存退货编辑",
        key: EnumPageType.Procurement_return_update
      },
      {
        name: "库存退货详情",
        key: EnumPageType.Procurement_return_detail
      }
    ]
  }
])

const Authed = useButtonAuth("ProcurementReturn_update", "ProcurementReturn_query")

const supplierOptions = ref<IOption[]>([])
const { searchList, resetForm, getFormData } = useSearchForm<{
  taskCode: string
  dataSource: number
  taskStatusList: number[]
  supplierId: string
  createTimeStart: string
  createTimeEnd: string
}>([
  {
    type: EnumComponentType.Input,
    label: "库存退货单",
    key: "taskCode",
    value: "",
    placeholder: "请输入库存退货单"
  },
  {
    type: EnumComponentType.Select,
    label: "来源",
    key: "dataSource",
    value: "",
    placeholder: "请选择来源",
    options: Object.entries(EnumProductionOrderSourceMap).map(([key, value]) => ({
      label: value,
      value: +key
    }))
  },
  {
    type: EnumComponentType.Select,
    label: "状态",
    key: "taskStatusList",
    value: "",
    placeholder: "请选择状态",
    options: Object.entries(EnumPurchaseReturnStatusMap).map(([key, value]) => ({
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
    placeholder: "请选择供应商名称",
    options: supplierOptions
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
      prop: "taskCode",
      label: "库存退货单",
      minWidth: 160
    },
    {
      prop: "dataSource",
      label: "来源",
      width: 90,
      align: "center",
      formatter: ({ dataSource }) =>
        EnumProductionOrderSourceMap[dataSource as EnumProductionOrderSource]
    },
    {
      prop: "taskStatus",
      label: "状态",
      width: 120,
      align: "center",
      slots: {
        default: "taskStatus-default"
      }
    },
    {
      prop: "supplierName",
      label: "供应商名称",
      minWidth: 160
    },
    {
      prop: "supplierCode",
      label: "供应商编号",
      minWidth: 160
    },
    {
      prop: "detailContent",
      label: "退货内容",
      minWidth: 160
    },
    {
      prop: "createTime",
      label: "创建时间",
      width: 160,
      align: "center"
    },
    {
      prop: "statementTime",
      label: "结单时间",
      width: 160,
      align: "center"
    },
    {
      prop: "operation",
      label: "操作",
      width: 120,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})
const queryConfig: ITableRequestConfig<[IInventoryReturnPageListParams], ITableRow, true> = {
  api: queryInventoryReturnPageList,
  getParams: () => {
    return [
      {
        ...getFormData(),
        pageNum: pagination.currentPage,
        pageSize: pagination.pageSize
      }
    ]
  }
}

const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

onMounted(() => {
  getSupplierOptions()
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

/** 获取供应商下拉 */
const getSupplierOptions = async () => {
  const { records } = await querySupplierPageList({ pageNum: 1, pageSize: 1000 })
  supplierOptions.value = records.map((item) => ({
    label: item.supplierName || item.supplierAbbr,
    value: item.id
  }))
}

/** 新建采购退货操作 */
const onCreateProReturnClick = (type: "create" | "edit", row?: ITableRow) => {
  curPageKey.value = row
    ? EnumPageType.Procurement_return_update
    : EnumPageType.Procurement_return_create
  selectedRowId.value = row?.id || ""
}

/** 查看详情 */
const onViewDetailClick = (row: ITableRow) => {
  curPageKey.value = EnumPageType.Procurement_return_detail
  selectedRowId.value = row.id
}

// 结案
const onComplete = async (row: ITableRow) => {
  await ElMessageBox.confirm("确认要结案吗？", "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "返回",
    type: "warning"
  })
  await closePurchaseReturnTask(row.id as string)
  ElMessage.success("结案成功")
  tableRef.value?.requestData()
}

// 删除
const onDeleteClick = async (row: ITableRow) => {
  await ElMessageBox.confirm("确认要删除吗", "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  })
  await deletePurchaseReturnTask(row.id as string)
  ElMessage.success("删除成功")
  tableRef.value?.requestData()
}
</script>

<style lang="scss" scoped></style>
