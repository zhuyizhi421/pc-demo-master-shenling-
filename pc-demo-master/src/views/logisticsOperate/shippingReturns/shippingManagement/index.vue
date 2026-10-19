<!-- 物流运营管理 - 销售订单 - 发货计划 -->
<template>
  <div class="layout-container">
    <div class="layout-main-page" v-show="curPageKey === EnumPageType.Main">
      <CustomSearchForm :form-list="searchList" @search="onSubmit" @reset="onReset">
        <template #customerId-option="{ option }">
          <div class="customer-option">
            <span>{{ option.label }}</span>
            <span class="customer-full-name">{{ option.fullName }}</span>
          </div>
        </template>
      </CustomSearchForm>

      <div class="custom-table-container">
        <CustomTitle title="发货计划">
          <el-button v-if="Authed" type="primary" icon="Plus" @click="onShipmentOrderCreate()">
            新建发货计划
          </el-button>
        </CustomTitle>

        <CustomTable
          ref="tableRef"
          v-model:table-data="tableData"
          v-model:total="pagination.total"
          :config="tableConfig"
          :query-config="queryConfig"
        >
          <template #deliveryStatus-default="{ row }">
            <el-tag
              :type="EnumDeliveryPlanStatusTagMap[row.deliveryStatus as EnumDeliveryPlanStatus]"
              >{{
                EnumDeliveryPlanStatusMap[row.deliveryStatus as EnumDeliveryPlanStatus] ?? ""
              }}</el-tag
            >
          </template>

          <template #isPack-default="{ row }">
            <el-switch v-model="row.isPack" :active-value="true" :inactive-value="false" disabled />
          </template>

          <template #deliveryContent-default="{ row }">
            <el-popover placement="top-start" width="600">
              <template #reference>
                {{ row.deliveryContent }}
              </template>
              <CustomTable :table-data="row?.detailVOList || []" :config="productTableConfig">
              </CustomTable>
            </el-popover>
          </template>

          <template #operation-default="{ row }">
            <el-button
              v-if="Authed && row.deliveryStatus === EnumDeliveryPlanStatus.Not_reviewed"
              link
              type="primary"
              size="small"
              @click="onEditShipmentPlan(row)"
              >编辑</el-button
            >
            <el-button link type="primary" size="small" @click="onViewShipmentPlan(row)"
              >查看
            </el-button>
            <el-button
              v-if="Authed && row.deliveryStatus === EnumDeliveryPlanStatus.Not_reviewed"
              link
              type="primary"
              size="small"
              @click="onReviewShipmentPlan(row)"
              >复核
            </el-button>
            <el-button
              v-if="Authed && row.deliveryStatus === EnumDeliveryPlanStatus.Reviewed"
              link
              type="danger"
              size="small"
              @click="onCancelReviewShipmentPlan(row)"
              >解复核
            </el-button>
            <el-button
              v-if="Authed && row.deliveryStatus === EnumDeliveryPlanStatus.Not_reviewed"
              link
              type="danger"
              size="small"
              @click="onDeleteShipmentPlan(row)"
              >删除
            </el-button>
            <el-button
              v-if="
                row.dataSource === EnumProductionOrderSource.MES &&
                row.deliveryStatus === EnumDeliveryPlanStatus.Underway &&
                Authed
              "
              link
              type="danger"
              size="small"
              @click="onFinishDeliveryPlan(row)"
              >结案
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

      <!-- 新建、编辑发货计划 -->
      <ShippingCreate
        v-if="[EnumPageType.Shipping_create, EnumPageType.Shipping_update].includes(curPageKey)"
        :id="selectedRow?.id || ''"
        @close="curPageKey = EnumPageType.Main"
        @success="tableRef?.requestData()"
      />

      <!-- 发货计划详情弹窗 -->
      <ShippingDetail
        v-if="curPageKey === EnumPageType.Shipping_detail"
        :id="selectedRow?.id || ''"
        @close="curPageKey = EnumPageType.Main"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import { getSearchCustomer } from "@/api/customer"
import {
  queryDeliveryPlanPageList,
  requestCancelReviewDeliveryPlan,
  requestDeleteDeliveryPlan,
  requestReviewDeliveryPlan,
  requestSettleDeliveryPlan
} from "@/api/logistics/delivery"
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
  EnumDeliveryPlanStatus,
  EnumDeliveryPlanStatusMap,
  EnumDeliveryPlanStatusTagMap,
  EnumProductionOrderSource,
  EnumProductionOrderSourceMap
} from "@/constant/enums"
import { FORMAT_DATE, FORMAT_TIME, TIME_RANGE } from "@/constant/time"
import useButtonAuth from "@/hooks/useButtonAuth"
import type { IOption } from "@/types/common"
import type {
  IDeliveryPlanPageListItem as ITableRow,
  IDeliveryPlanPageListParams
} from "@/types/logistics/delivery"
import { isEffectiveValue, precisionConversion } from "@/utils/common"

import ShippingCreate from "./ShippingCreate.vue"
import ShippingDetail from "./ShippingDetail.vue"

type ICustomerOption = IOption & { fullName: string }

defineOptions({
  name: "ShippingManagement"
})

const Authed = useButtonAuth("ShippingManagement_update", "ShippingManagement_query")
const route = useRoute()

let customOptionsCopy: ICustomerOption[] = []
const customerOptions = ref<ICustomerOption[]>([])

/** 页面显示类型枚举 */
enum EnumPageType {
  Main, // 列表页
  Shipping_create, // 发货计划新增
  Shipping_update, // 发货计划编辑
  Shipping_detail // 发货计划详情
}

const curPageKey = ref(EnumPageType.Main)
const pageTree = ref([
  {
    name: "发货计划",
    key: EnumPageType.Main,
    children: [
      {
        name: "发货计划新建",
        key: EnumPageType.Shipping_create
      },
      {
        name: "发货计划编辑",
        key: EnumPageType.Shipping_update
      },
      {
        name: "发货计划详情",
        key: EnumPageType.Shipping_detail
      }
    ]
  }
])

const { searchList, resetForm, getFormData } = useSearchForm<{
  deliveryCode: string
  saleCode: string
  deliveryStatus: number
  customerId: string
  dataSource: number
  deliveryTimeStart: string
  deliveryTimeEnd: string
  startDate: string
  endDate: string
}>([
  {
    type: EnumComponentType.Input,
    label: "发货计划单号",
    key: "deliveryCode",
    value: "",
    placeholder: "请输入计划单号"
  },
  {
    type: EnumComponentType.Input,
    label: "销售订单号",
    key: "saleCode",
    value: "",
    placeholder: "请输入销售单号"
  },
  {
    type: EnumComponentType.Select,
    label: "状态",
    key: "deliveryStatus",
    value: "",
    options: Object.entries(EnumDeliveryPlanStatusMap).map(([key, value]) => ({
      label: value,
      value: +key
    })),
    placeholder: "请选择状态"
  },
  {
    type: EnumComponentType.Select,
    label: "客户",
    key: "customerId",
    value: "",
    placeholder: "请选择客户",
    options: customerOptions,
    filterable: true,
    slots: {
      option: "customerId-option"
    },
    filterMethod: (filterValue: string) => {
      filterValue = filterValue.trim().toLowerCase()
      customerOptions.value = customOptionsCopy.filter(
        (item) =>
          item.label.toLowerCase().includes(filterValue) ||
          item.fullName.toLowerCase().includes(filterValue)
      )
    }
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
    type: EnumComponentType.Date,
    dateType: "daterange",
    label: "计划发货日期",
    key: "date",
    value: ["", ""],
    placeholder: ["开始日期", "结束日期"],
    format: FORMAT_DATE,
    valueFormat: FORMAT_TIME,
    defaultTime: TIME_RANGE,
    keyword: ["deliveryTimeStart", "deliveryTimeEnd"],
    style: {
      width: 240
    }
  },
  {
    type: EnumComponentType.Date,
    dateType: "datetimerange",
    label: "创建时间",
    key: "createTime",
    value: ["", ""],
    placeholder: ["开始时间", "结束时间"],
    format: FORMAT_TIME,
    valueFormat: FORMAT_TIME,
    defaultTime: TIME_RANGE,
    keyword: ["startDate", "endDate"],
    style: {
      width: 360
    }
  }
])

const selectedRow = ref<ITableRow | null>(null)
const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "deliveryCode",
      label: "发货计划单号",
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
      prop: "deliveryStatus",
      label: "状态",
      width: 120,
      align: "center",
      slots: {
        default: "deliveryStatus-default"
      }
    },
    {
      prop: "saleCode",
      label: "销售订单编号",
      minWidth: 160
    },
    {
      prop: "customerName",
      label: "客户名称",
      minWidth: 160
    },
    {
      prop: "deliveryTime",
      label: "计划发货日期",
      minWidth: 160,
      align: "center",
      sortable: true,
      formatter: ({ deliveryTime }) => deliveryTime?.slice(0, 10)
    },
    {
      prop: "isPack",
      label: "是否包装",
      width: 90,
      align: "center",
      slots: {
        default: "isPack-default"
      }
    },
    {
      prop: "deliveryContent",
      label: "发货内容",
      minWidth: 250,
      showOverflowTooltip: false,
      className: "custom-table-content-ellipsis",
      slots: {
        default: "deliveryContent-default"
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
      prop: "statementTime",
      label: "结单时间",
      minWidth: 160,
      align: "center"
    },
    {
      prop: "remarks",
      label: "备注",
      minWidth: 200
    },
    {
      prop: "operation",
      label: "操作",
      width: 240,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})
const queryConfig: ITableRequestConfig<[IDeliveryPlanPageListParams], ITableRow, true> = {
  api: queryDeliveryPlanPageList,
  getParams: (sortData: IColumnSortInfo[]) => {
    const { startDate, endDate, ...rest } = getFormData()
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
        queryParam: { ...rest },
        sort: sortData.map((item) => ({ field: item.sortField, order: item.order! }))
      }
    ]
  }
}

const productTableConfig = ref<ITableConfig>({
  columns: [
    {
      prop: "productModelName",
      label: "产品名称",
      minWidth: 160
    },
    {
      prop: "productModelCode",
      label: "产品编号",
      width: 160
    },
    {
      prop: "planAmount",
      label: "计划发货数量",
      width: 120,
      align: "right",
      formatter: ({ planAmount, decimalNumber }) =>
        isEffectiveValue(planAmount) ? precisionConversion(planAmount, decimalNumber) : ""
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
  if (route.query) {
    if (route.query.saleCode) {
      searchList.value.find((item) => item.key === "saleCode")!.value = route.query
        .saleCode as string
    } else if (route.query.jumpKey) {
      ElMessage("查询值为空")
    }
  }
  getCustomOptions()
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

/** 获取客户下拉 */
const getCustomOptions = async () => {
  const { records } = await getSearchCustomer({ pageNum: 1, pageSize: 1000, stateList: [0] })
  customerOptions.value = records.map((item) => ({
    label: item.customerAbbr,
    value: item.id,
    fullName: item.customerName
  }))
  customOptionsCopy = records.map((item) => ({
    label: item.customerAbbr,
    value: item.id,
    fullName: item.customerName
  }))
}

/** 结案操作 */
const onFinishDeliveryPlan = async (rowData: any) => {
  await ElMessageBox.confirm("结案操作将会结束该订单未开始/暂停中的包装任务，确认结案?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
  await requestSettleDeliveryPlan(rowData?.id)
  ElMessage.success("结案成功")
  tableRef.value?.requestData()
}

const onShipmentOrderCreate = () => {
  curPageKey.value = EnumPageType.Shipping_create
  selectedRow.value = null
}

/** 编辑发货计划 */
const onEditShipmentPlan = (row: ITableRow) => {
  curPageKey.value = EnumPageType.Shipping_update
  selectedRow.value = row
}

/** 查看详情 */
const onViewShipmentPlan = (row: ITableRow) => {
  curPageKey.value = EnumPageType.Shipping_detail
  selectedRow.value = row
}

/** 复核 */
const onReviewShipmentPlan = async (row: ITableRow) => {
  await ElMessageBox.confirm("确定复核该发货计划吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    closeOnClickModal: false,
    closeOnPressEscape: false,
    autofocus: false,
    type: "warning"
  })
  await requestReviewDeliveryPlan(row.id)
  ElMessage.success("复核成功")
  tableRef.value?.requestData()
}

/** 解复核 */
const onCancelReviewShipmentPlan = async (row: ITableRow) => {
  await ElMessageBox.confirm("确定解除该发货计划复核吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    closeOnClickModal: false,
    closeOnPressEscape: false,
    autofocus: false,
    type: "warning"
  })
  await requestCancelReviewDeliveryPlan(row.id)
  ElMessage.success("解复核成功")
  tableRef.value?.requestData()
}

/** 删除发货计划 */
const onDeleteShipmentPlan = async (row: ITableRow) => {
  await ElMessageBox.confirm("确定删除该发货计划吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    closeOnClickModal: false,
    closeOnPressEscape: false,
    autofocus: false,
    type: "warning"
  })
  await requestDeleteDeliveryPlan(row.id)
  ElMessage.success("删除成功")
  tableRef.value?.requestData()
}
</script>

<style scoped lang="scss">
.customer-option {
  display: flex;
  align-items: center;
  justify-content: space-between;

  span {
    flex: 1;
  }

  .customer-full-name {
    margin-left: 12px;
  }
}
</style>
