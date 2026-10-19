<!-- 物流运营管理 - 销售订单管理 - 销售订单 -->
<template>
  <div class="layout-container">
    <div class="layout-main-page" v-show="curPageKey === EnumPageType.Main">
      <div class="custom-table-container">
        <CustomTitle title="销售订单">
          <el-button v-if="Authed" type="primary" @click="onCreateClick()" icon="Plus"
            >新建销售订单</el-button
          >
        </CustomTitle>

        <CustomSearchForm :form-list="searchList" @search="onSubmit" @reset="onReset">
        </CustomSearchForm>

        <CustomTable
          ref="tableRef"
          v-model:table-data="tableData"
          v-model:total="pagination.total"
          :config="tableConfig"
          :query-config="queryConfig"
        >
          <template #saleStatus-default="{ row }">
            <el-tag :type="EnumSaleOrderStatusTagMap[row.saleStatus as EnumSaleOrderStatus]">{{
              EnumSaleOrderStatusMap[row.saleStatus as EnumSaleOrderStatus] ?? ""
            }}</el-tag>
          </template>

          <template #saleContent-default="{ row: { saleDetailVOList, saleContent } }">
            <el-popover trigger="hover" placement="top" width="auto">
              <template #reference>
                {{ saleContent }}
              </template>
              <CustomTable
                :table-data="saleDetailVOList"
                :config="contentTableConfig"
              ></CustomTable>
            </el-popover>
          </template>

          <template #custom-operation-default="{ row }">
            <el-button
              v-if="
                row.dataSource !== EnumProductionOrderSource.ERP &&
                row.saleStatus === EnumSaleOrderStatus.Un_Review &&
                Authed
              "
              link
              type="primary"
              size="small"
              @click="onCreateClick(true, row.id)"
              >编辑
            </el-button>
            <el-button
              type="primary"
              size="small"
              link
              @click="onViewDetailClick(row.id)"
              v-if="row.saleStatus !== EnumSaleOrderStatus.Un_Review"
              >查看
            </el-button>
            <el-button
              v-if="Authed && row.saleStatus === EnumSaleOrderStatus.Un_Review"
              type="primary"
              size="small"
              link
              @click="onReviewClick(row.id)"
              >复核</el-button
            >
            <el-button
              v-if="Authed && row.saleStatus === EnumSaleOrderStatus.UN_SHIPPED"
              type="primary"
              size="small"
              link
              @click="onUnReviewClick(row.id)"
              >解复核</el-button
            >
            <el-button
              v-if="row.saleStatus === EnumSaleOrderStatus.PROCESSING && Authed"
              link
              type="primary"
              size="small"
              @click="onSettleClick(row)"
              >结案
            </el-button>
            <el-button
              v-if="
                row.dataSource !== EnumProductionOrderSource.ERP &&
                row.saleStatus === EnumSaleOrderStatus.Un_Review &&
                Authed
              "
              link
              type="danger"
              size="small"
              @click="onDeleteRowClick(row.id)"
              >删除</el-button
            >
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

      <!-- 新建、编辑销售订单 -->
      <CreateSaleOrdersHandle
        v-if="
          [EnumPageType.Sales_order_create, EnumPageType.Sales_order_update].includes(curPageKey)
        "
        :select-id="selectedRowId"
        @close="curPageKey = EnumPageType.Main"
        @success="tableRef?.requestData()"
      />

      <!-- 查看详情 -->
      <SaleOrderDetail
        v-if="curPageKey === EnumPageType.Sales_order_detail"
        :select-id="selectedRowId"
        @close="curPageKey = EnumPageType.Main"
      />
    </div>

    <!-- 销售订单无法结案弹窗 -->
    <NotSettleDialog
      v-if="notSettleVisible"
      v-model:data="notSettleData"
      @close="notSettleVisible = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import {
  queryDynamicSaleOrderPageList,
  requestDeleteSaleOrder,
  requestReviewSaleOrder,
  requestSaleOrderCheckFinish,
  requestSaleOrderUnSettleDeliveryPlan,
  requestSettleSaleOrder,
  requestUnReviewSaleOrder
} from "@/api/logistics/sale"
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
import { EnumSaleOrderPriority, EnumSaleOrderPriorityMap } from "@/constant/enums"
import {
  EnumProductionOrderSource,
  EnumProductionOrderSourceMap,
  EnumSaleOrderStatus,
  EnumSaleOrderStatusMap,
  EnumSaleOrderStatusTagMap
} from "@/constant/enums"
import useButtonAuth from "@/hooks/useButtonAuth"
import type {
  IDynamicSaleOrderPageListParams,
  ISettleDeliveryPlan
} from "@/types/logistics/saleOrder"
import type { ISaleOrderPageListItem as ITableRow } from "@/types/logistics/saleOrder"
import { isEffectiveValue, precisionConversion } from "@/utils/common"

import CreateSaleOrdersHandle from "./components/CreateSaleOrdersHandle.vue"
import NotSettleDialog from "./components/NotSettleDialog.vue"
import SaleOrderDetail from "./components/SaleOrderDetail.vue"

defineOptions({
  name: "SalesOrders"
})

/** 页面显示类型枚举 */
enum EnumPageType {
  Main, // 列表页
  Sales_order_create, // 销售订单新增
  Sales_order_update, // 销售订单编辑
  Sales_order_detail // 销售订单详情
}

const curPageKey = ref(EnumPageType.Main)
const pageTree = ref([
  {
    name: "销售订单",
    key: EnumPageType.Main,
    children: [
      {
        name: "销售订单新建",
        key: EnumPageType.Sales_order_create
      },
      {
        name: "销售订单编辑",
        key: EnumPageType.Sales_order_update
      },
      {
        name: "销售订单详情",
        key: EnumPageType.Sales_order_detail
      }
    ]
  }
])

const { searchList, resetForm } = useSearchForm<{}>([])

const Authed = useButtonAuth("SalesOrders_update", "SalesOrders_query")

const selectedRowId = ref("") // 选中行id
const notSettleVisible = ref(false) // 销售订单无法结案弹窗
const notSettleData = ref<ISettleDeliveryPlan[]>([]) // 销售订单无法结案弹窗数据
const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  remoteQueryKey: "SaleOrder",
  localTableKey: "SaleOrder",
  isSaveColumnWidth: true,
  columns: [
    {
      prop: "saleCode",
      label: "销售单号",
      minWidth: 160
    },
    {
      prop: "dataSource",
      label: "来源",
      minWidth: 120,
      align: "center",
      formatter: ({ dataSource }) =>
        EnumProductionOrderSourceMap[dataSource as EnumProductionOrderSource]
    },
    {
      prop: "saleStatus",
      label: "状态",
      width: 120,
      align: "center",
      slots: {
        default: "saleStatus-default"
      }
    },
    {
      prop: "customerAbbr",
      label: "客户简称",
      minWidth: 160
    },
    {
      prop: "customerName",
      label: "客户全称",
      minWidth: 160
    },
    {
      prop: "saleContent",
      label: "销售内容",
      showOverflowTooltip: false,
      className: "custom-table-content-ellipsis",
      minWidth: 160,
      slots: {
        default: "saleContent-default"
      }
    },
    {
      prop: "priority",
      label: "优先级",
      minWidth: 160,
      align: "center",
      formatter: ({ priority }) => EnumSaleOrderPriorityMap[priority as EnumSaleOrderPriority]
    },
    {
      prop: "planDeliveryTime",
      label: "计划交货日期",
      minWidth: 180,
      align: "center",
      sortable: true,
      formatter: ({ planDeliveryTime }) => planDeliveryTime?.slice(0, 10)
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
      prop: "statementTime",
      label: "结案时间",
      minWidth: 160,
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
      width: 200,
      fixed: "right",
      slots: {
        default: "custom-operation-default"
      }
    }
  ]
})
const queryConfig: ITableRequestConfig<[IDynamicSaleOrderPageListParams], ITableRow, true> = {
  api: queryDynamicSaleOrderPageList,
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
const contentTableConfig = ref<ITableConfig>({
  maxHeight: 400,
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
      prop: "quantity",
      label: "数量",
      minWidth: 160,
      align: "right",
      formatter: ({ quantity, decimalNumber }) =>
        isEffectiveValue(quantity) ? precisionConversion(quantity, decimalNumber) : ""
    },
    {
      prop: "unitName",
      label: "单位",
      minWidth: 120,
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
  tableRef.value?.requestData()
})

const onSubmit = () => {
  pagination.currentPage = 1
  tableRef.value?.requestData()
}

const onReset = () => {
  tableRef.value?.resetSortList()
  tableRef.value?.resetFilterList()
  resetForm()
  onSubmit()
}

/** 新建、编辑操作 */
const onCreateClick = (isEdit?: boolean, id?: string) => {
  curPageKey.value = id ? EnumPageType.Sales_order_update : EnumPageType.Sales_order_create
  selectedRowId.value = isEdit ? id! : ""
}

/** 复核操作 */
const onReviewClick = async (id: string) => {
  await ElMessageBox.confirm("确定复核该销售订单?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    closeOnClickModal: false,
    closeOnPressEscape: false,
    autofocus: false,
    type: "warning"
  })
  await requestReviewSaleOrder(id)
  ElMessage.success("复核成功")
  tableRef.value?.requestData()
}

/** 解复核操作 */
const onUnReviewClick = async (id: string) => {
  await ElMessageBox.confirm("确定解复核该销售订单?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    closeOnClickModal: false,
    closeOnPressEscape: false,
    autofocus: false,
    type: "warning"
  })
  await requestUnReviewSaleOrder(id)
  ElMessage.success("解复核成功")
  tableRef.value?.requestData()
}

/** 查看操作 */
const onViewDetailClick = (id: string) => {
  selectedRowId.value = id
  curPageKey.value = EnumPageType.Sales_order_detail
}

/** 删除销售订单操作 */
const onDeleteRowClick = async (id: string) => {
  await ElMessageBox.confirm("删除订单后将无法找回，是否确认删除？", "删除操作", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  })
  await requestDeleteSaleOrder(id)
  ElMessage({
    message: "删除成功",
    type: "success"
  })
  tableRef.value?.requestData()
}

/** 结案操作 */
const onSettleClick = async (row: any) => {
  await ElMessageBox.confirm("该销售订单还未完成，是否直接结案？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })

  const data = await requestSaleOrderUnSettleDeliveryPlan(row.id)
  if (!data || !data.length) {
    const unFinishData = await requestSaleOrderCheckFinish(row.id)
    if (!unFinishData || !unFinishData.length) {
      // 销售订单未全部发货
      const confirm = await ElMessageBox.confirm(
        `销售订单${row.saleCode}未完成，是否确认结案？`,
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          closeOnClickModal: false,
          closeOnPressEscape: false,
          autofocus: false,
          type: "warning"
        }
      )
      if (confirm === "confirm") {
        await requestSettleSaleOrder(row.id)
        ElMessage({
          type: "success",
          message: "结案操作成功"
        })
        tableRef.value?.requestData()
      }
    } else {
      // 发货计划未结案
      notSettleData.value = unFinishData
      notSettleVisible.value = true
    }
  } else {
    // 发货计划未结案
    notSettleData.value = data
    notSettleVisible.value = true
  }
}
</script>

<style scoped lang="scss">
.search-form {
  padding: 0;
}
</style>
