<template>
  <div class="layout-container">
    <div class="layout-main-page" v-show="curPageKey == EnumPageType.Main">
      <CustomSearchForm
        :form-list="searchList"
        @search="onSubmit"
        @reset="onReset"
      ></CustomSearchForm>

      <div class="custom-table-container">
        <CustomTitle title="委外单号列表">
          <div v-if="isAuth">
            <el-button type="primary" @click="onAddClick">新建订单</el-button>
          </div>
        </CustomTitle>

        <CustomTable
          ref="tableRef"
          v-model:table-data="tableData"
          v-model:total="pagination.total"
          :config="tableConfig"
          :query-config="queryConfig"
        >
          <template #status-default="{ row }">
            <el-tag
              :type="EnumOutsourcingOrderStatusTagMap[row.status as EnumOutsourcingOrderStatus]"
              >{{
                EnumOutsourcingOrderStatusMap[row.status as EnumOutsourcingOrderStatus] ?? ""
              }}</el-tag
            >
          </template>

          <template #operation-default="{ row }">
            <el-button link type="primary" size="small" @click="onViewClick(row)">查看</el-button>
            <el-button
              v-if="
                row.status === EnumOutsourcingOrderStatus.UN_REVIEW && row.source != 2 && isAuth
              "
              link
              type="primary"
              size="small"
              @click="onEditClick(row)"
              >编辑
            </el-button>
            <el-button
              v-if="row.status === EnumOutsourcingOrderStatus.UN_REVIEW && isAuth"
              link
              type="primary"
              size="small"
              @click="onCheckClick(row)"
              >复核
            </el-button>
            <el-button
              v-if="row.status === EnumOutsourcingOrderStatus.REVIEWED && isAuth"
              link
              type="primary"
              size="small"
              @click="onUnCheckClick(row)"
              >解复核
            </el-button>
            <el-button
              v-if="
                [EnumOutsourcingOrderStatus.RECEIVED, EnumOutsourcingOrderStatus.REVIEWED].includes(
                  row.status
                ) && isAuth
              "
              link
              type="primary"
              size="small"
              @click="onArchive(row)"
              >结案
            </el-button>
            <el-button
              v-if="
                row.status === EnumOutsourcingOrderStatus.UN_REVIEW && row.source != 2 && isAuth
              "
              link
              type="danger"
              size="small"
              @click="onDeleteClick(row)"
              >删除
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
    <div class="layout-child-page" v-if="curPageKey !== EnumPageType.Main">
      <CustomPageCrumbs v-model="curPageKey" :data="pageTree" />

      <!-- 新建、编辑委外订单页面 -->
      <CreateOutsourcingOrder
        v-if="
          [EnumPageType.Outsource_order_create, EnumPageType.Outsource_order_update].includes(
            curPageKey
          )
        "
        :select-id="selectRowData!.id"
        @cancel="exitSubPage"
      />

      <!-- 委外订单详情页面 -->
      <OutsourcingOrderDetail
        v-if="curPageKey == EnumPageType.Outsource_order_detail"
        :select-id="selectRowData!.id"
        :select-no="selectRowData!.no"
        @cancel="curPageKey = EnumPageType.Main"
      />

      <!-- 送货单详情页面 -->
      <DeliveryOrderDetail
        v-if="curPageKey === EnumPageType.Delivery_order_detail"
        :data="deliveryOrderData"
        @close="curPageKey = EnumPageType.Outsource_order_detail"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import {
  archiveProductionOrder,
  checkProductionOrder,
  deleteProductionOrder,
  queryOutsourcingOrderPageList,
  unCheckProductionOrder
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
  EnumOutsourcingOrderStatus,
  EnumOutsourcingOrderStatusMap,
  EnumOutsourcingOrderStatusTagMap,
  EnumOutsourcingType,
  EnumOutsourcingTypeMap
} from "@/constant/enums"
import { FORMAT_TIME, TIME_RANGE } from "@/constant/time"
import useButtonAuth from "@/hooks/useButtonAuth"
import type { ISupplierDeliveryData } from "@/types/base-info/supplier-platform"
import type { IOptionItem } from "@/types/common"
import type {
  DelegateOrder as ITableRow,
  IDelegateOrderPageParams
} from "@/types/logistics/delegate"
import { precisionConversion } from "@/utils/common"
import DeliveryOrderDetail from "@/views/logisticsOperate/procurementManage/procurementOrders/components/DeliveryOrderDetail/index.vue"

import CreateOutsourcingOrder from "./components/CreateOutsourcingOrder.vue"
import OutsourcingOrderDetail from "./components/OutsourcingOrderDetail.vue"

defineOptions({
  name: "OutsourcingOrders"
})

/** 页面显示类型枚举 */
enum EnumPageType {
  Main, // 列表页
  Outsource_order_create, // 委外订单新建
  Outsource_order_update, // 委外订单编辑
  Outsource_order_detail, // 委外订单详情
  Delivery_order_detail // 送货单详情
}

const curPageKey = ref(EnumPageType.Main) // 当前显示页面种类
const pageTree = ref([
  {
    name: "委外订单",
    key: EnumPageType.Main,
    children: [
      {
        name: "委外订单新建",
        key: EnumPageType.Outsource_order_create
      },
      {
        name: "委外订单编辑",
        key: EnumPageType.Outsource_order_update
      },
      {
        name: "委外订单详情",
        key: EnumPageType.Outsource_order_detail,
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

const isAuth = useButtonAuth("OutsourcingOrders_update", "OutsourcingOrders_query")
const supplierOptions = ref<IOptionItem[]>([])
const { searchList, resetForm, getFormData } = useSearchForm<{
  productModelName: string
  productModelNo: string
  no: string
  statues: number[]
  supplierId: string
  startDate: string
  endDate: string
}>([
  {
    type: EnumComponentType.Input,
    key: "productModelName",
    label: "产品名称",
    value: "",
    placeholder: "请输入"
  },
  {
    type: EnumComponentType.Input,
    key: "productModelNo",
    label: "产品编号",
    value: "",
    placeholder: "请输入"
  },
  {
    type: EnumComponentType.Input,
    key: "no",
    label: "订单编号",
    value: "",
    placeholder: "请输入"
  },
  {
    type: EnumComponentType.Select,
    key: "statues",
    label: "状态",
    value: "",
    options: Object.entries(EnumOutsourcingOrderStatusMap).map(([key, value]) => ({
      label: value,
      value: +key
    })),
    placeholder: "请选择",
    multiple: true,
    maxTag: 2
  },
  {
    type: EnumComponentType.Select,
    key: "supplierId",
    value: "",
    label: "供应商名称",
    placeholder: "请选择",
    options: supplierOptions
  },
  {
    type: EnumComponentType.Date,
    dateType: "datetimerange",
    key: "date",
    label: "创建时间",
    value: [],
    placeholder: ["开始时间", "结束时间"],
    format: FORMAT_TIME,
    valueFormat: FORMAT_TIME,
    defaultTime: TIME_RANGE,
    keyword: ["startDate", "endDate"]
  }
])

const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "no",
      label: "委外单号",
      minWidth: 160
    },
    {
      prop: "source",
      label: "来源",
      width: 90,
      align: "center",
      formatter: (row) => (row.source === 1 ? "MES" : "ERP")
    },
    {
      prop: "delegateType",
      label: "委外类型",
      width: 120,
      align: "center",
      formatter: (row) => EnumOutsourcingTypeMap[row.delegateType as EnumOutsourcingType]
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
      prop: "amount",
      label: "委外数量",
      width: 120,
      align: "right",
      formatter: (row) =>
        row.amount || row.amount == 0
          ? precisionConversion(row.amount, row?.decimalNumber ?? 2)
          : ""
    },
    {
      prop: "receiveAmount",
      label: "已收货数量",
      width: 120,
      align: "right",
      formatter: (row) =>
        row.receiveAmount || row.receiveAmount == 0
          ? precisionConversion(row.receiveAmount, row?.decimalNumber ?? 2)
          : ""
    },
    {
      prop: "unitName",
      label: "单位",
      width: 90,
      align: "center"
    },
    {
      prop: "expectedReceiveTime",
      label: "计划收货日期",
      width: 160,
      align: "center",
      formatter: (row) => row.expectedReceiveTime?.slice(0, 10)
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
      prop: "archiveTime",
      label: "结案时间",
      width: 160,
      align: "center"
    },
    {
      prop: "remark",
      label: "备注",
      minWidth: 250
    },
    {
      prop: "operation",
      label: "操作",
      minWidth: 200,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})
const queryConfig: ITableRequestConfig<[IDelegateOrderPageParams], ITableRow, true> = {
  api: queryOutsourcingOrderPageList,
  getParams: () => {
    return [
      {
        pageQuery: {
          pageNum: pagination.currentPage,
          pageSize: pagination.pageSize
        },
        queryParam: getFormData(),
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

const selectRowData = ref<ITableRow>()
const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const deliveryOrderData = ref<ISupplierDeliveryData>({
  sendOrderNo: "",
  orderNo: "",
  orderType: 2,
  supplierId: ""
}) // 送货单信息
provide("deliveryOrderDetail", {
  review: (data: ISupplierDeliveryData) => {
    console.log("review", data)
    deliveryOrderData.value = data
    curPageKey.value = EnumPageType.Delivery_order_detail
  }
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

/** 查看详情 */
const onViewClick = (row: ITableRow) => {
  selectRowData.value = row
  curPageKey.value = EnumPageType.Outsource_order_detail
}

/** 获取供应商下拉 */
const getSupplierOptions = async () => {
  const { records } = await querySupplierPageList({ pageNum: 1, pageSize: 1000 })
  const list = records?.map((item) => ({
    label: item.supplierName || item.supplierAbbr,
    value: item.id
  }))
  supplierOptions.value = list
}

/** 编辑操作 */
const onEditClick = (row: ITableRow) => {
  selectRowData.value = row
  curPageKey.value = EnumPageType.Outsource_order_update
}

/** 新建订单操作 */
const onAddClick = (row: ITableRow) => {
  selectRowData.value = row
  curPageKey.value = EnumPageType.Outsource_order_create
}

/** 复核操作 */
const onCheckClick = async (row: ITableRow) => {
  await ElMessageBox.confirm("确认复核吗", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  })
  await checkProductionOrder({ id: row.id as string })
  ElMessage({
    message: "复核成功",
    type: "success"
  })
  tableRef.value?.requestData()
}

/** 解复核操作 */
const onUnCheckClick = async (row: ITableRow) => {
  await ElMessageBox.confirm("确定解复核该委外订单么？", "提示", {
    type: "warning"
  })
  await unCheckProductionOrder({ id: row.id as string })
  ElMessage({
    message: "解复核成功",
    type: "success"
  })
  tableRef.value?.requestData()
}

/** 删除操作 */
const onDeleteClick = async (row: any) => {
  await ElMessageBox.confirm("删除订单后将无法找回，是否确认删除？", "提示", {
    type: "warning"
  })
  await deleteProductionOrder({ id: row.id })
  ElMessage({
    message: "删除成功",
    type: "success"
  })
  tableRef.value?.requestData()
}

/** 结案操作 */
const onArchive = async (row: any) => {
  const mes =
    row.receiveAmount !== row.amount
      ? `委外订单 ${row.no} 未完成，是否确认结案？`
      : "确认结案该委外订单吗？"
  await ElMessageBox.confirm(mes, "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "返回"
  })
  await archiveProductionOrder({ id: row.id })
  ElMessage({
    message: "结案成功",
    type: "success"
  })
  tableRef.value?.requestData()
}

/** 退出子页面 */
const exitSubPage = () => {
  curPageKey.value = EnumPageType.Main
  setTimeout(() => {
    tableRef.value?.requestData()
  })
}
</script>

<style lang="scss" scoped></style>
