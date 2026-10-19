<!-- 仓库运营管理 - 采购管理- 采购订单 -->
<template>
  <div class="layout-container">
    <div class="layout-main-page" v-show="curPageKey === EnumPageType.Main">
      <div class="custom-table-container">
        <CustomTitle title="采购订单">
          <el-button v-if="Authed" type="primary" icon="Plus" @click="onCreateOrderClick()">
            新建采购订单
          </el-button>
        </CustomTitle>
        <CustomSearchForm
          :form-list="searchList"
          @search="onSubmit"
          @reset="onReset"
        ></CustomSearchForm>
        <CustomTable
          ref="tableRef"
          v-model:table-data="tableData"
          v-model:total="pagination.total"
          :config="tableConfig"
          :query-config="queryConfig"
        >
          <template #purchaseStatus-default="{ row }">
            <el-tag
              :type="EnumPurchaseOrderStatusTagMap[row.purchaseStatus as EnumPurchaseOrderStatus]"
              >{{
                EnumPurchaseOrderStatusMap[row.purchaseStatus as EnumPurchaseOrderStatus] ?? ""
              }}</el-tag
            >
          </template>

          <template #purchaseContent-default="{ row: { contentList, purchaseContent } }">
            <el-popover effect="light" trigger="hover" placement="top" width="auto">
              <template #reference>
                {{ purchaseContent }}
              </template>
              <CustomTable :table-data="contentList" :config="contentTableConfig"></CustomTable>
            </el-popover>
          </template>

          <template #custom-operation-default="{ row }">
            <el-button
              v-if="
                row.purchaseStatus === EnumPurchaseOrderStatus.UN_RECHECK &&
                row.dataSource !== EnumProductionOrderSource.ERP &&
                Authed
              "
              link
              type="primary"
              size="small"
              @click="onCreateOrderClick(row)"
              >编辑查看
            </el-button>
            <el-button v-else link type="primary" size="small" @click="onViewDetailClick(row)"
              >查看详情
            </el-button>

            <el-button
              v-if="row.purchaseStatus === EnumPurchaseOrderStatus.UN_RECHECK && Authed"
              link
              type="primary"
              size="small"
              @click="onCheckClick(row)"
              >复核
            </el-button>
            <el-button
              v-else-if="row.purchaseStatus === EnumPurchaseOrderStatus.UN_RECEIPT && Authed"
              link
              type="primary"
              size="small"
              @click="onUnCheckClick(row)"
              >解复核
            </el-button>
            <el-button
              link
              type="primary"
              size="small"
              v-if="
                [EnumPurchaseOrderStatus.UN_RECEIPT, EnumPurchaseOrderStatus.PROCESSING].includes(
                  row.purchaseStatus
                ) && Authed
              "
              @click="completeFunc(row)"
              >结案
            </el-button>
            <el-button
              link
              type="danger"
              size="small"
              v-if="
                row.purchaseStatus === EnumPurchaseOrderStatus.UN_RECHECK &&
                row.dataSource !== EnumProductionOrderSource.ERP &&
                Authed
              "
              @click="handleDelete(row.id)"
              >删除</el-button
            >
          </template>
        </CustomTable>

        <CustomPagination
          v-model:currentPage="pagination.currentPage"
          v-model:pageSize="pagination.pageSize"
          :total="pagination.total"
          border
          @change="refreshTableData()"
        />
      </div>
    </div>

    <!-- 子页面部分 -->
    <div class="layout-child-page" v-if="curPageKey !== EnumPageType.Main">
      <CustomPageCrumbs v-model="curPageKey" :data="pageTree" />

      <!-- 采购订单新增、编辑子页面 -->
      <CreateProcureHandle
        v-if="
          [EnumPageType.Procurement_order_create, EnumPageType.Procurement_order_update].includes(
            curPageKey
          )
        "
        :select-id="selectedRowId"
        @success="refreshTableData()"
        @close="curPageKey = EnumPageType.Main"
      />

      <!-- 采购订单详情子页面 -->
      <ProcurementDetailHandle
        v-if="curPageKey === EnumPageType.Procurement_order_detail"
        :select-id="selectedRowId"
        @success="refreshTableData()"
        @close="curPageKey = EnumPageType.Main"
      />

      <!-- 送货单详情子页面 -->
      <DeliveryOrderDetail
        v-if="curPageKey === EnumPageType.Delivery_order_detail"
        :data="deliveryOrderData"
        @close="curPageKey = EnumPageType.Procurement_order_detail"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import {
  queryDynamicPurchaseOrderPageList,
  requestDeletePurchaseOrder,
  requestReviewPurchaseOrder,
  requestSettlePurchaseOrder,
  requestUnReviewPurchaseOrder
} from "@/api/logistics/purchase"
import CustomPageCrumbs from "@/components/CustomPageCrumbs/index.vue"
import CustomPagination from "@/components/CustomPagination/index.vue"
import useSearchForm from "@/components/CustomSearchForm/hooks/index"
import CustomSearchForm from "@/components/CustomSearchForm/index.vue"
import CustomTable from "@/components/CustomTable/index.vue"
import type {
  ComponentExposed,
  IColumnSortInfo,
  ITableConfig,
  ITableRequestConfig
} from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import {
  EnumProductionOrderSource,
  EnumProductionOrderSourceMap,
  EnumPurchaseOrderStatus,
  EnumPurchaseOrderStatusMap,
  EnumPurchaseOrderStatusTagMap
} from "@/constant/enums"
import useButtonAuth from "@/hooks/useButtonAuth"
import type { ISupplierDeliveryData } from "@/types/base-info/supplier-platform"
import type {
  IDynamicPurchaseOrderPageListParams,
  IPurchaseOrderPageListItem as ITableRow
} from "@/types/logistics/purchase"

import CreateProcureHandle from "./components/CreateProcureHandle.vue"
import DeliveryOrderDetail from "./components/DeliveryOrderDetail/index.vue"
import ProcurementDetailHandle from "./components/ProcurementDetailHandle.vue"

defineOptions({
  name: "ProcurementOrder"
})

const Authed = useButtonAuth("ProcurementOrder_update", "ProcurementOrder_query")

/** 页面显示类型枚举 */
enum EnumPageType {
  Main, // 列表页
  Procurement_order_create, // 采购订单新增
  Procurement_order_update, // 采购订单编辑
  Procurement_order_detail, // 采购订单详情
  Delivery_order_detail // 送货单详情
}

const curPageKey = ref(EnumPageType.Main)
const pageTree = ref([
  {
    name: "采购订单",
    key: EnumPageType.Main,
    children: [
      {
        name: "采购订单新建",
        key: EnumPageType.Procurement_order_create
      },
      {
        name: "采购订单编辑",
        key: EnumPageType.Procurement_order_update
      },
      {
        name: "采购订单详情",
        key: EnumPageType.Procurement_order_detail,
        children: [
          {
            name: "查看送货单",
            key: EnumPageType.Delivery_order_detail
          }
        ]
      }
    ]
  }
])

const { searchList, resetForm } = useSearchForm<{}>([])

const selectedRowId = ref("")
const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  remoteQueryKey: "PurchaseOrder",
  localTableKey: "PurchaseOrder",
  isSaveColumnWidth: true,
  columns: [
    {
      prop: "purchaseCode",
      label: "采购单号",
      minWidth: 160
    },
    {
      prop: "dataSource",
      label: "来源",
      width: 120,
      align: "center",
      formatter: ({ dataSource }) =>
        EnumProductionOrderSourceMap[dataSource as EnumProductionOrderSource]
    },
    {
      prop: "purchaseStatus",
      label: "状态",
      width: 120,
      align: "center",
      slots: {
        default: "purchaseStatus-default"
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
      prop: "purchaseContent",
      label: "采购内容",
      minWidth: 200,
      showOverflowTooltip: false,
      className: "custom-table-content-ellipsis",
      slots: {
        default: "purchaseContent-default"
      }
    },
    {
      prop: "eta",
      label: "预计收货日期",
      width: 180,
      align: "center",
      formatter: ({ eta }) => eta?.slice(0, 10)
    },
    {
      prop: "createTime",
      label: "创建时间",
      width: 160,
      align: "center"
    },
    {
      prop: "checkTime",
      label: "复核时间",
      width: 160,
      align: "center"
    },
    {
      prop: "statementTime",
      label: "结案时间",
      width: 160,
      align: "center"
    },
    {
      prop: "remarks",
      label: "备注",
      minWidth: 200
    },
    {
      prop: "custom-operation",
      label: "操作",
      width: 180,
      fixed: "right",
      slots: {
        default: "custom-operation-default"
      }
    }
  ]
})
const queryConfig: ITableRequestConfig<[IDynamicPurchaseOrderPageListParams], ITableRow, true> = {
  api: queryDynamicPurchaseOrderPageList,
  getParams: (sortData: IColumnSortInfo[], filterData: Record<string, any>) => {
    return [
      {
        pageQuery: {
          pageNum: pagination.currentPage,
          pageSize: pagination.pageSize
        },
        queryParam: {
          ...filterData
        },
        sort: sortData
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
      prop: "productModelName",
      label: "产品名称",
      minWidth: 160
    },
    {
      prop: "productModelCode",
      label: "产品编号",
      minWidth: 160
    },
    {
      prop: "arrivalQty",
      label: "收货数量",
      minWidth: 160,
      align: "right"
    },
    {
      prop: "unit",
      label: "单位",
      minWidth: 120,
      align: "center"
    }
  ]
})

const deliveryOrderData = ref<ISupplierDeliveryData>({
  sendOrderNo: "",
  orderNo: "",
  orderType: 1,
  supplierId: ""
}) // 送货单信息
provide("deliveryOrderDetail", {
  review: (data: ISupplierDeliveryData) => {
    deliveryOrderData.value = data
    curPageKey.value = EnumPageType.Delivery_order_detail
  }
})

onMounted(() => {
  refreshTableData()
})

/** 刷新列表 */
const refreshTableData = async () => {
  await tableRef.value?.requestData()
}

const onSubmit = () => {
  pagination.currentPage = 1
  refreshTableData()
}

const onReset = () => {
  tableRef.value?.resetSortList()
  tableRef.value?.resetFilterList()
  resetForm()
  onSubmit()
}

/** 新建采购订单 */
const onCreateOrderClick = (row?: ITableRow) => {
  curPageKey.value = row
    ? EnumPageType.Procurement_order_update
    : EnumPageType.Procurement_order_create
  selectedRowId.value = row?.id || ""
}

/** 查看详情 */
const onViewDetailClick = (row: ITableRow) => {
  curPageKey.value = EnumPageType.Procurement_order_detail
  selectedRowId.value = row.id
}

// 结案
const completeFunc = async (row: any) => {
  await ElMessageBox.confirm(`采购订单${row.purchaseCode}未结案，是否确认结案？`, "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "返回"
  })
  await requestSettlePurchaseOrder({ id: row.id })
  ElMessage.success("结案成功")
  refreshTableData()
}

//删除
const handleDelete = async (id: string) => {
  await ElMessageBox.confirm("删除订单后将无法找回，是否确认删除？", "提示", {
    type: "warning"
  })
  await requestDeletePurchaseOrder(id)
  ElMessage.success("删除成功")
  refreshTableData()
}

// 复核
const onCheckClick = async (row: ITableRow) => {
  await ElMessageBox.confirm("确定复核该采购订单么？", "提示", {
    type: "warning"
  })
  await requestReviewPurchaseOrder({ id: row.id })
  ElMessage.success("复核成功")
  refreshTableData()
}

// 解复核
const onUnCheckClick = async (row: ITableRow) => {
  await ElMessageBox.confirm("确定解复核该采购订单么？", "提示", {
    type: "warning"
  })
  await requestUnReviewPurchaseOrder({ id: row.id })
  ElMessage.success("解复核成功")
  refreshTableData()
}
</script>

<style scoped lang="scss">
.search-form {
  padding: 0;
}
</style>
