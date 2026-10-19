<!-- 物流运营管理 - 销售订单 - 退货管理 -->
<template>
  <div class="layout-container">
    <div class="layout-main-page" v-show="curPageKey === EnumPageType.Main">
      <CustomSearchForm
        :form-list="searchList"
        @search="onSubmit"
        @reset="onReset"
      ></CustomSearchForm>

      <div class="custom-table-container">
        <CustomTitle title="退货管理">
          <el-dropdown v-if="Authed">
            <el-button
              type="primary"
              icon="Plus"
              @click="curPageKey = EnumPageType.Return_sale_create"
            >
              按销售订单退货
              <el-icon class="el-icon--right">
                <arrow-down />
              </el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  class="text-sky-500"
                  @click="curPageKey = EnumPageType.Return_no_sale_create"
                  icon="Plus"
                  >不按销售订单退货</el-dropdown-item
                >
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </CustomTitle>

        <CustomTable
          ref="tableRef"
          v-model:table-data="tableData"
          v-model:total="pagination.total"
          :config="tableConfig"
          :query-config="queryConfig"
        >
          <!-- 退货产品 -->
          <template #productModelName-default="{ row }">
            <el-button
              link
              type="primary"
              @click="productInfoModalRef!.setVisible(true, row.productModelId)"
              >{{ row.productModelName }}
            </el-button>
          </template>

          <!-- 状态 -->
          <template #returnStatus-default="{ row }">
            <el-tag :type="EnumReturnPlanStatusTagMap[row.returnStatus as EnumReturnPlanStatus]">{{
              EnumReturnPlanStatusMap[row.returnStatus as EnumReturnPlanStatus] ?? ""
            }}</el-tag>
          </template>

          <!-- 退货数量 -->
          <template #inspectionCode-default="{ row }">
            <el-button
              v-if="row.inspectionId"
              link
              type="primary"
              @click="onNavigateTo(row.inspectionId)"
              >{{ row.inspectionCode }}
            </el-button>
          </template>

          <!-- 操作列 -->
          <template #operation-default="{ row }">
            <el-button
              v-if="row.isSplit"
              link
              type="primary"
              size="small"
              @click="onViewDetailClick(row)"
              >查看详情
            </el-button>
            <el-button
              v-else-if="!row.isSplit && Authed"
              link
              type="primary"
              size="small"
              @click="barCodeSplitModalRef!.setVisible(true, row)"
              >拆分标签码</el-button
            >
            <el-button
              link
              type="primary"
              size="small"
              v-if="row.returnStatus === EnumReturnPlanStatus.Unfinished && row.isSplit && Authed"
              @click="handleComplete(row.id)"
              >结案</el-button
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

      <!-- 创建退货订单-按销售订单 -->
      <ReturnBySaleModal
        v-if="curPageKey === EnumPageType.Return_sale_create"
        @close="curPageKey = EnumPageType.Main"
        @success="tableRef?.requestData()"
      />

      <!-- 创建退货订单-不按销售订单 -->
      <ReturnNotBySaleModal
        v-if="curPageKey === EnumPageType.Return_no_sale_create"
        @close="curPageKey = EnumPageType.Main"
        @success="tableRef?.requestData()"
      />

      <!-- 退货订单详情 -->
      <ReturnDetailHandle
        v-if="curPageKey === EnumPageType.Return_detail"
        :currentRow="currentRow"
        @close="curPageKey = EnumPageType.Main"
      />
    </div>

    <!-- 产品信息弹窗 -->
    <ProductInfoModal ref="productInfoModalRef" />

    <!-- 拆分标签码弹窗 -->
    <BarCodeSplitModal ref="barCodeSplitModalRef" @success="tableRef?.requestData()" />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import { getSearchCustomer } from "@/api/customer"
import { queryReturnOrderPageList, requestSettleReturnOrder } from "@/api/logistics/return"
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
  EnumReturnPlanStatus,
  EnumReturnPlanStatusMap,
  EnumReturnPlanStatusTagMap,
  EnumReturnResultType,
  EnumReturnResultTypeMap
} from "@/constant/enums"
import { FORMAT_TIME, TIME_RANGE } from "@/constant/time"
import useButtonAuth from "@/hooks/useButtonAuth"
import type { IOption } from "@/types/common"
import type {
  IReturnOrderPageListItem as ITableRow,
  IReturnOrderPageListParams
} from "@/types/logistics/return"
import { precisionConversion } from "@/utils/common"
import ProductInfoModal from "@/views/logisticsOperate/components/productInfoHandle.vue"

import BarCodeSplitModal from "./components/BarCodeSplitModal.vue"
import ReturnBySaleModal from "./components/ReturnBySaleHandle.vue"
import ReturnDetailHandle from "./components/ReturnDetailHandle.vue"
import ReturnNotBySaleModal from "./components/ReturnNotBySaleHandle.vue"

defineOptions({
  name: "ReturnManagement"
})

/** 页面显示类型枚举 */
enum EnumPageType {
  Main, // 列表页
  Return_sale_create, // 退货管理按销售订单新增
  Return_no_sale_create, // 退货管理不按销售订单新增
  Return_detail // 退货管理详情
}

const curPageKey = ref(EnumPageType.Main) // 当前显示页面种类
const pageTree = ref([
  {
    name: "退货管理",
    key: EnumPageType.Main,
    children: [
      {
        name: "退货管理新建",
        key: EnumPageType.Return_sale_create
      },
      {
        name: "退货管理新建",
        key: EnumPageType.Return_no_sale_create
      },
      {
        name: "退货管理详情",
        key: EnumPageType.Return_detail
      }
    ]
  }
])

const router = useRouter()
const Authed = useButtonAuth("ReturnManagement_update", "ReturnManagement_query")

const customerOptions = ref<IOption[]>([])

const { searchList, resetForm, getFormData } = useSearchForm<{
  productModelName: string
  saleCode: string
  customerId: string
  createTimeStart: string
  createTimeEnd: string
}>([
  {
    type: EnumComponentType.Input,
    label: "产品名称",
    key: "productModelName",
    value: "",
    placeholder: "请输入产品名称"
  },
  {
    type: EnumComponentType.Input,
    label: "销售单号",
    key: "saleCode",
    value: "",
    placeholder: "请输入销售单号"
  },
  {
    type: EnumComponentType.Select,
    label: "客户",
    key: "customerId",
    value: "",
    placeholder: "请选择客户",
    options: customerOptions,
    filterable: true
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

const barCodeSplitModalRef = ref<InstanceType<typeof BarCodeSplitModal>>()
const productInfoModalRef = ref<InstanceType<typeof ProductInfoModal>>()

const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const tableData = ref<ITableRow[]>([])
const tableConfig = ref<ITableConfig>({
  height: "100%",
  columns: [
    {
      prop: "productModelName",
      label: "退货产品",
      minWidth: 160,
      slots: {
        default: "productModelName-default"
      }
    },
    {
      prop: "returnQty",
      label: "退货数量",
      minWidth: 120,
      align: "right",
      formatter: ({ returnQty, decimalNumber }) =>
        precisionConversion(returnQty, decimalNumber ?? 2)
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
      prop: "inboundQty",
      label: "实际入库数量",
      minWidth: 120,
      align: "right",
      formatter: ({ inboundQty, decimalNumber }) =>
        precisionConversion(inboundQty, decimalNumber ?? 2)
    },
    {
      prop: "unitName",
      label: "单位",
      minWidth: 90,
      align: "center"
    },
    {
      prop: "returnStatus",
      label: "状态",
      width: 120,
      align: "center",
      slots: {
        default: "returnStatus-default"
      }
    },
    {
      prop: "saleCode",
      label: "销售订单",
      minWidth: 160
    },
    {
      prop: "customerName",
      label: "客户名称",
      minWidth: 160
    },
    {
      prop: "customerCode",
      label: "客户编号",
      minWidth: 160
    },
    {
      prop: "isReturnInspection",
      label: "是否退货检验",
      minWidth: 120,
      align: "center",
      formatter: ({ isReturnInspection }) => (isReturnInspection ? "是" : "否")
    },
    {
      prop: "inspectionCode",
      label: "检验单号",
      minWidth: 160,
      slots: {
        default: "inspectionCode-default"
      }
    },
    {
      prop: "inspectionResult",
      label: "检验结果",
      minWidth: 120,
      align: "center",
      formatter: ({ inspectionResult }) =>
        EnumReturnResultTypeMap[inspectionResult as EnumReturnResultType]
    },
    {
      prop: "createTime",
      label: "创建时间",
      minWidth: 160,
      align: "center"
    },
    {
      prop: "statementTime",
      label: "结单时间",
      minWidth: 160,
      align: "center"
    },
    {
      prop: "operation",
      label: "操作",
      width: 160,
      fixed: "right",
      slots: {
        default: "operation-default"
      }
    }
  ]
})
const queryConfig: ITableRequestConfig<[IReturnOrderPageListParams], ITableRow, true> = {
  api: queryReturnOrderPageList,
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

const currentRow = ref<ITableRow>({} as ITableRow)

const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

onMounted(() => {
  getCustomerOptions()
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
const getCustomerOptions = async () => {
  const { records } = await getSearchCustomer({ pageNum: 1, pageSize: 1000, stateList: [0] })
  customerOptions.value = records.map((item) => ({
    label: item.customerAbbr,
    value: item.id
  }))
}

/** 结案操作 */
const handleComplete = async (id: string) => {
  await ElMessageBox.confirm("该退货还未完成，是否直接结案？", "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "返回"
  })
  await requestSettleReturnOrder(id)
  ElMessage.success("结案成功")
  tableRef.value?.requestData()
}

/** 跳转到检验单详情页 */
const onNavigateTo = (detailId: string) => {
  router.push({
    path: "/quality/InspectionTask/nonProcessInspect",
    query: {
      isDetail: 1,
      id: detailId
    }
  })
}

/** 查看详情 */
const onViewDetailClick = (row: ITableRow) => {
  curPageKey.value = EnumPageType.Return_detail
  currentRow.value = row
}
</script>

<style scoped lang="scss"></style>
