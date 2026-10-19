<template>
  <div class="layout-container" v-loading="loading">
    <!-- 主体列表页部分 -->
    <div class="layout-main-page" v-show="curPageKey === EnumPageType.Main">
      <div class="custom-table-container">
        <CustomTitle title="生产日计划">
          <div></div>
        </CustomTitle>
        <el-table :data="customTableData" border height="calc(100% - 52px)" :row-class-name="getRowClassName">
          <el-table-column prop="dailyPlanNo" label="日计划单号" width="150">
            <template #header>
              <ColumnSearch label="日计划单号" v-model:visible="searchVisible.dailyPlanNo" :has-filter="hasFilter('dailyPlanNo')">
                <el-input v-model="searchParams.dailyPlanNo" placeholder="请输入" clearable size="small" @input="handleSearch" />
                <div class="search-btns">
                  <el-button v-if="searchParams.dailyPlanNo" type="primary" link size="small" @click="clearSearch('dailyPlanNo')">清空</el-button>
                </div>
              </ColumnSearch>
            </template>
          </el-table-column>
          <el-table-column prop="no" label="订单编号" width="150">
            <template #header>
              <ColumnSearch label="订单编号" v-model:visible="searchVisible.no" :has-filter="hasFilter('no')">
                <el-input v-model="searchParams.no" placeholder="请输入" clearable size="small" @input="handleSearch" />
                <div class="search-btns">
                  <el-button v-if="searchParams.no" type="primary" link size="small" @click="clearSearch('no')">清空</el-button>
                </div>
              </ColumnSearch>
            </template>
          </el-table-column>
          <el-table-column prop="saleCode" label="ERP工单号" width="150">
            <template #header>
              <ColumnSearch label="ERP工单号" v-model:visible="searchVisible.saleCode" :has-filter="hasFilter('saleCode')">
                <el-input v-model="searchParams.saleCode" placeholder="请输入" clearable size="small" @input="handleSearch" />
                <div class="search-btns">
                  <el-button v-if="searchParams.saleCode" type="primary" link size="small" @click="clearSearch('saleCode')">清空</el-button>
                </div>
              </ColumnSearch>
            </template>
          </el-table-column>
          <el-table-column prop="type" label="类型" width="100" align="center">
            <template #header>
              <ColumnSearch label="类型" v-model:visible="searchVisible.type" :has-filter="hasFilter('type')">
                <el-select v-model="searchParams.type" placeholder="请选择" clearable size="small" @change="handleSearch">
                  <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <div class="search-btns">
                  <el-button v-if="searchParams.type !== null" type="primary" link size="small" @click="clearSearch('type')">清空</el-button>
                </div>
              </ColumnSearch>
            </template>
            <template #default="{ row }">
              {{ EnumProductionOrderTypeMap[row.type] || "-" }}
            </template>
          </el-table-column>
          <el-table-column prop="source" label="来源" width="100" align="center">
            <template #header>
              <ColumnSearch label="来源" v-model:visible="searchVisible.source" :has-filter="hasFilter('source')">
                <el-select v-model="searchParams.source" placeholder="请选择" clearable size="small" @change="handleSearch">
                  <el-option v-for="item in sourceOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <div class="search-btns">
                  <el-button v-if="searchParams.source !== null" type="primary" link size="small" @click="clearSearch('source')">清空</el-button>
                </div>
              </ColumnSearch>
            </template>
            <template #default="{ row }">
              {{ EnumProductionOrderSourceMap[row.source] || "-" }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="工单状态" width="100" align="center">
            <template #header>
              <ColumnSearch label="工单状态" v-model:visible="searchVisible.status" :has-filter="hasFilter('status')">
                <el-select v-model="searchParams.status" placeholder="请选择" clearable size="small" @change="handleSearch">
                  <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <div class="search-btns">
                  <el-button v-if="searchParams.status !== null" type="primary" link size="small" @click="clearSearch('status')">清空</el-button>
                </div>
              </ColumnSearch>
            </template>
            <template #default="{ row }">
              <el-tag :type="EnumProductionOrderStatusTagMap[row.status]" size="small">
                {{ EnumProductionOrderStatusMap[row.status] }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="productionProgress" label="生产进度" width="120" align="center">
            <template #header>
              <ColumnSearch label="生产进度" v-model:visible="searchVisible.productionProgress" :has-filter="hasFilter('productionProgress')">
                <el-select v-model="searchParams.productionProgress" placeholder="请选择" clearable size="small" @change="handleSearch">
                  <el-option label="未开始" :value="0" />
                  <el-option label="部分完成" :value="1" />
                  <el-option label="全部完成" :value="2" />
                </el-select>
                <div class="search-btns">
                  <el-button v-if="searchParams.productionProgress !== null" type="primary" link size="small" @click="clearSearch('productionProgress')">清空</el-button>
                </div>
              </ColumnSearch>
            </template>
            <template #default="{ row }">
              <el-tag :type="getProductionProgressTagType(row.productionProgress)" size="small">
                {{ getProductionProgressText(row.productionProgress) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="productModelName" label="产品名称" width="160">
            <template #header>
              <ColumnSearch label="产品名称" v-model:visible="searchVisible.productModelName" :has-filter="hasFilter('productModelName')">
                <el-input v-model="searchParams.productModelName" placeholder="请输入" clearable size="small" @input="handleSearch" />
                <div class="search-btns">
                  <el-button v-if="searchParams.productModelName" type="primary" link size="small" @click="clearSearch('productModelName')">清空</el-button>
                </div>
              </ColumnSearch>
            </template>
          </el-table-column>
          <el-table-column prop="productModelSpec" label="产品规格" width="160">
            <template #header>
              <ColumnSearch label="产品规格" v-model:visible="searchVisible.productModelSpec" :has-filter="hasFilter('productModelSpec')">
                <el-input v-model="searchParams.productModelSpec" placeholder="请输入" clearable size="small" @input="handleSearch" />
                <div class="search-btns">
                  <el-button v-if="searchParams.productModelSpec" type="primary" link size="small" @click="clearSearch('productModelSpec')">清空</el-button>
                </div>
              </ColumnSearch>
            </template>
          </el-table-column>
          <el-table-column prop="productModelCode" label="产品编号" width="150">
            <template #header>
              <ColumnSearch label="产品编号" v-model:visible="searchVisible.productModelCode" :has-filter="hasFilter('productModelCode')">
                <el-input v-model="searchParams.productModelCode" placeholder="请输入" clearable size="small" @input="handleSearch" />
                <div class="search-btns">
                  <el-button v-if="searchParams.productModelCode" type="primary" link size="small" @click="clearSearch('productModelCode')">清空</el-button>
                </div>
              </ColumnSearch>
            </template>
          </el-table-column>
          <el-table-column prop="deliveryDate" label="交货日期" width="120" align="center">
            <template #header>
              <ColumnSearch label="交货日期" v-model:visible="searchVisible.deliveryDate" :has-filter="hasFilter('deliveryDate')">
                <el-date-picker v-model="searchParams.deliveryDate" type="date" placeholder="请选择" clearable size="small" @change="handleSearch" />
                <div class="search-btns">
                  <el-button v-if="searchParams.deliveryDate" type="primary" link size="small" @click="clearSearch('deliveryDate')">清空</el-button>
                </div>
              </ColumnSearch>
            </template>
          </el-table-column>
          <el-table-column prop="orderAmount" label="订单数量" width="100" align="right" />
          <el-table-column prop="scheduledQuantity" label="排产数量" width="100" align="right" />
          <el-table-column prop="completeAmount" label="完工数量" width="100" align="right" />
          <el-table-column prop="unitName" label="单位" width="80" align="center" />
          <el-table-column prop="createTime" label="创建时间" width="160" align="center" />
          <el-table-column prop="remark" label="备注" width="150" />
          <el-table-column prop="operation" label="操作" width="200" align="center" fixed="right">
            <template #default="{ row }">
              <el-button
                v-if="row.status !== EnumProductionOrderStatus.SETTLE && row.status !== EnumProductionOrderStatus.VOID && !!isAuth"
                type="primary"
                link
                size="small"
                @click="onCheckOrderClick(row)"
              >
                {{ row.status === EnumProductionOrderStatus.UN_REVIEW ? "复核" : "解复核" }}
              </el-button>
              <el-button
                v-if="row.status === EnumProductionOrderStatus.REVIEW && !!isAuth"
                type="primary"
                link
                size="small"
                @click="onArchiveClick(row)"
              >
                结案
              </el-button>
              <el-button
                v-if="row.status === EnumProductionOrderStatus.REVIEW && row.productionProgress === 0 && !!isAuth"
                link
                type="danger"
                size="small"
                @click="onVoidClick(row)"
              >
                作废
              </el-button>
              <el-button
                v-if="row.status === EnumProductionOrderStatus.UN_REVIEW && row.source === 1 && !!isAuth"
                link
                type="danger"
                size="small"
                @click="onDeleteRowClick(row)"
              >
                删除
              </el-button>
              <el-button type="primary" link size="small" @click="onViewDetails(row)">
                查看详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <CustomPagination
          v-model:currentPage="pagination.currentPage"
          v-model:pageSize="pagination.pageSize"
          :total="pagination.total"
          @change="onPaginationChange"
        />
      </div>
    </div>

    <!-- 子页面部分 -->
    <div class="layout-child-page" v-if="curPageKey !== EnumPageType.Main">
      <CustomPageCrumbs ref="customPageCrumbsRef" v-model="curPageKey" :data="pageTree" />

      <!-- 新建、编辑生产订单子页面 -->
      <!-- 对生产订单页面缓存，保证编辑订单工艺后返回到生产订单页面时，仍然显示之前的编辑内容 -->
      <KeepAlive>
        <UpdateProductionOrder
          v-if="
            [EnumPageType.Production_order_create, EnumPageType.Production_order_update].includes(
              curPageKey
            )
          "
          :id="selectedRowId"
          :auto-craft-config="needAutoCraftConfig"
          @close="curPageKey = EnumPageType.Main"
          @success="refreshTableData()"
          @order-craft-config="onOrderCraftConfig"
        />
      </KeepAlive>

      <!-- 查看生产订单详情  -->
      <ProductionOrderDetail
        v-if="curPageKey === EnumPageType.Production_order_detail"
        :id="selectedRowId"
        @close="curPageKey = EnumPageType.Main"
        @order-craft-config="onOrderCraftConfig"
      />

      <!-- 编辑订单工艺子页面部分，与工艺路线部分类似 -->
      <!-- 配置订单工艺子页面 -->
      <CraftRouteConfig
        v-if="
          [
            EnumPageType.Order_craft_config_create,
            EnumPageType.Order_craft_config_update,
            EnumPageType.Order_craft_config_detail
          ].includes(curPageKey) && !!craftRouteConfigData
        "
        :data="craftRouteConfigData!"
        @close="onConfigClose()"
        @update-page-list="onUpdatePageList"
      ></CraftRouteConfig>

      <!-- 配置工艺组、且工艺子页面 -->
      <CraftConfig
        v-if="
          [
            EnumPageType.Craft_group_config_create,
            EnumPageType.Craft_group_config_update,
            EnumPageType.Craft_group_config_detail,
            EnumPageType.Craft_and_config_create,
            EnumPageType.Craft_and_config_update,
            EnumPageType.Craft_and_config_detail
          ].includes(curPageKey)
        "
        :data="craftConfigData!"
        @close="onConfigClose()"
      />

      <!-- 配置产品信息子页面 -->
      <ProductDetail
        v-if="
          [
            EnumPageType.Product_detail_order_create,
            EnumPageType.Product_detail_order_update,
            EnumPageType.Product_detail_order_detail,
            EnumPageType.Product_detail_group_create,
            EnumPageType.Product_detail_group_update,
            EnumPageType.Product_detail_group_detail,
            EnumPageType.Product_detail_and_create,
            EnumPageType.Product_detail_and_update,
            EnumPageType.Product_detail_and_detail
          ].includes(curPageKey)
        "
        isReadonly
        :product-info="productInfo"
        @close="onConfigClose()"
      />

      <!-- 订单追加记录子页面 -->
      <ReAddRecord
        v-if="curPageKey === EnumPageType.Re_add_record"
        :default-order-no="addRecordOrderNo"
        @close="curPageKey = EnumPageType.Main"
        @success="refreshTableData()"
      />
    </div>

    <!-- 追加数量弹窗 -->
    <ReAddDialog v-model="reAddVisible" :id="selectedRowId" @success="onReAddSuccess" />
  </div>
</template>
<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import { useRoute } from "vue-router"

import { getProductModelById } from "@/api/product"
import {
  archiveProductionOrderItem,
  checkProductionOrderItem,
  deleteProductionOrderItem,
  queryDynamicProductOrderPageList,
  queryProductOrderPageList,
  requestCheckReAddRecord,
  unCheckProductionOrderItem
} from "@/api/scheduling"
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
import ColumnSearch from "../productionOrder/components/ColumnSearch.vue"
import {
  EnumParentCraftType,
  EnumProductionOrderSource,
  EnumProductionOrderSourceMap,
  EnumProductionOrderStatus,
  EnumProductionOrderStatusMap,
  EnumProductionOrderStatusTagMap,
  EnumProductionOrderType,
  EnumProductionOrderTypeMap
} from "@/constant/enums"
import useButtonAuth from "@/hooks/useButtonAuth"
import type { ICraftConfigInfo, ICraftPageCrumbsData } from "@/types/base-info/craftRoute"
import type {
  IDynamicProductionOrderPageItem as ITableRow,
  IDynamicProductionOrderPageParams,
  IProductionOrderItem
} from "@/types/production-manage/product-order"
import { precisionConversion } from "@/utils/common"
import CraftConfig from "@/views/basicConfig/craftwork/craftRoute/components/CraftConfig.vue"
import CraftRouteConfig from "@/views/basicConfig/craftwork/craftRoute/components/CraftRouteConfig.vue"
import ProductDetail from "@/views/basicConfig/craftwork/productManage/components/ProductDetail.vue"

import ProductionOrderDetail from "./components/ProductOrderDetail/index.vue"
import ReAddDialog from "./components/ReAddDialog.vue"
import ReAddRecord from "./components/ReAddRecord.vue"
import UpdateProductionOrder from "./components/UpdateProductionOrder.vue"

defineOptions({
  name: "ProductionOrders"
})

const isAuth = useButtonAuth("ProductionOrders_update", "ProductionOrders_query")

/** 页面显示类型枚举 */
enum EnumPageType {
  Main, // 列表页
  Re_add_record, // 订单追加记录
  Production_order_create, // 生产订单新建
  Production_order_update, // 生产订单编辑
  Production_order_detail, // 生产订单详情
  Order_craft_config_create, // 生产订单新建-订单工艺配置
  Order_craft_config_update, // 生产订单编辑-订单工艺配置
  Order_craft_config_detail, // 生产订单详情-订单工艺配置
  Craft_group_config_create, // 生产订单新建-订单工艺配置_工艺组配置
  Craft_group_config_update, // 生产订单编辑-订单工艺配置_工艺组配置
  Craft_group_config_detail, // 生产订单详情-订单工艺配置_工艺组配置
  Craft_and_config_create, // 生产订单新建-订单工艺配置_且工艺配置
  Craft_and_config_update, // 生产订单编辑-订单工艺配置_且工艺配置
  Craft_and_config_detail, // 生产订单详情-订单工艺配置_且工艺配置
  Product_detail_order_create, // 生产订单新增-订单工艺配置_产品信息详情
  Product_detail_order_update, // 生产订单编辑-订单工艺配置_产品信息详情
  Product_detail_order_detail, // 生产订单详情-订单工艺配置_产品信息详情
  Product_detail_group_create, // 生产订单新增-订单工艺配置_工艺组配置_产品信息详情
  Product_detail_group_update, // 生产订单编辑-订单工艺配置_工艺组配置_产品信息详情
  Product_detail_group_detail, // 生产订单详情-订单工艺配置_工艺组配置_产品信息详情
  Product_detail_and_create, // 生产订单新增-订单工艺配置_切工艺配置_产品信息详情
  Product_detail_and_update, // 生产订单编辑-订单工艺配置_切工艺配置_产品信息详情
  Product_detail_and_detail // 生产订单详情-订单工艺配置_切工艺配置_产品信息详情
}

const loading = ref(false)
const curPageKey = ref(EnumPageType.Main)
const pageTree = ref([
  {
    name: "生产日计划",
    key: EnumPageType.Main,
    children: [
      {
        name: "订单追加记录",
        key: EnumPageType.Re_add_record
      },
      {
        name: "生产日计划新建",
        key: EnumPageType.Production_order_create,
        children: [
          {
            name: "订单工艺配置",
            key: EnumPageType.Order_craft_config_create,
            children: [
              {
                name: "产品信息详情",
                key: EnumPageType.Product_detail_order_create
              },
              {
                name: "工艺组配置",
                key: EnumPageType.Craft_group_config_create,
                children: [
                  {
                    name: "产品信息详情",
                    key: EnumPageType.Product_detail_group_create
                  }
                ]
              },
              {
                name: "且工艺配置",
                key: EnumPageType.Craft_and_config_create,
                children: [
                  {
                    name: "产品信息详情",
                    key: EnumPageType.Product_detail_and_create
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        name: "生产日计划编辑",
        key: EnumPageType.Production_order_update,
        children: [
          {
            name: "订单工艺配置",
            key: EnumPageType.Order_craft_config_update,
            children: [
              {
                name: "产品信息详情",
                key: EnumPageType.Product_detail_order_update
              },
              {
                name: "工艺组配置",
                key: EnumPageType.Craft_group_config_update,
                children: [
                  {
                    name: "产品信息详情",
                    key: EnumPageType.Product_detail_group_update
                  }
                ]
              },
              {
                name: "且工艺配置",
                key: EnumPageType.Craft_and_config_update,
                children: [
                  {
                    name: "产品信息详情",
                    key: EnumPageType.Product_detail_and_update
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        name: "生产日计划详情",
        key: EnumPageType.Production_order_detail,
        children: [
          {
            name: "订单工艺配置",
            key: EnumPageType.Order_craft_config_detail,
            children: [
              {
                name: "产品信息详情",
                key: EnumPageType.Product_detail_order_detail
              },
              {
                name: "工艺组配置",
                key: EnumPageType.Craft_group_config_detail,
                children: [
                  {
                    name: "产品信息详情",
                    key: EnumPageType.Product_detail_group_detail
                  }
                ]
              },
              {
                name: "且工艺配置",
                key: EnumPageType.Craft_and_config_detail,
                children: [
                  {
                    name: "产品信息详情",
                    key: EnumPageType.Product_detail_and_detail
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
])

const typeOptions = ref<
  {
    label: string
    value: number
  }[]
>([])
const sourceOptions = ref<
  {
    label: string
    value: number
  }[]
>([])
const statusOptions = ref<
  {
    label: string
    value: number
  }[]
>([])

const { searchList, resetForm } = useSearchForm<{}>([])

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

// 搜索参数
const searchParams = ref<Record<string, any>>({
  dailyPlanNo: "",
  no: "",
  saleCode: "",
  type: null,
  source: null,
  status: null,
  productionProgress: null,
  productModelName: "",
  productModelSpec: "",
  productModelCode: "",
  deliveryDate: null
})

// 搜索面板显示状态
const searchVisible = ref<Record<string, boolean>>({
  dailyPlanNo: false,
  no: false,
  saleCode: false,
  type: false,
  source: false,
  status: false,
  productionProgress: false,
  productModelName: false,
  productModelSpec: false,
  productModelCode: false,
  deliveryDate: false
})

// 判断是否有筛选值
const hasFilter = (key: string) => {
  const value = searchParams.value[key]
  if (value === null || value === undefined || value === "") return false
  if (Array.isArray(value) && value.length === 0) return false
  return true
}

// 清空搜索
const clearSearch = (key: string) => {
  const nullKeys = ["type", "source", "status", "productionProgress", "deliveryDate"]
  searchParams.value[key] = nullKeys.includes(key) ? null : ""
  handleSearch()
}

// 搜索处理
const handleSearch = () => {
  pagination.value.currentPage = 1
  loadData()
}

// 分页变化
const onPaginationChange = () => {
  loadData()
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await queryProductOrderPageList({
      pageQuery: { pageNum: pagination.value.currentPage, pageSize: pagination.value.pageSize },
      queryParam: { ...searchParams.value },
      sort: []
    })
    // mock API 返回的是 records 而不是 list，total 是字符串
    customTableData.value = res?.records || res?.list || []
    pagination.value.total = Number(res?.total) || 0
  } catch (error) {
    console.error("加载数据失败:", error)
  } finally {
    loading.value = false
  }
}

// 行样式
const getRowClassName = ({ row }: { row: any }) => {
  return isUrgentProductionOrder(row) ? "production-order-urgent-row" : ""
}

const customPageCrumbsRef = ref<InstanceType<typeof CustomPageCrumbs>>()
const craftRouteConfigData = ref<ICraftPageCrumbsData>()
const craftConfigData = ref<ICraftPageCrumbsData>()

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const customTableData = ref<ITableRow[]>([])
const urgentOrderOverrides = ref<Record<string, { urgent: boolean; reason?: string }>>({})
const tableConfig = ref<ITableConfig>({
  height: "100%",
  remoteQueryKey: "ProductionOrder",
  localTableKey: "ProductionOrder",
  isSaveColumnWidth: false,
  rowClassName: ({ row }) => (isUrgentProductionOrder(row as ITableRow) ? "production-order-urgent-row" : ""),
  columns: [
    {
      prop: "no",
      label: "订单编号",
      width: 160
    },
    {
      prop: "saleCode",
      label: "ERP工单号",
      width: 160
    },
    {
      prop: "type",
      label: "类型",
      width: 120,
      align: "center",
      formatter: (row: ITableRow) => {
        return EnumProductionOrderTypeMap[row.type as EnumProductionOrderType] ?? "-"
      }
    },
    {
      prop: "source",
      label: "来源",
      width: 120,
      align: "center",
      formatter: (row: ITableRow) => {
        return EnumProductionOrderSourceMap[row.source as EnumProductionOrderSource]
      }
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
      prop: "productModelName",
      label: "产品名称",
      width: 160
    },
    {
      prop: "productModelSpec",
      label: "产品规格",
      width: 160,
      formatter: (row: ITableRow) => {
        return row.productModelSpec || row.productModel?.specification || "-"
      }
    },
    {
      prop: "productModelCode",
      label: "产品编号",
      width: 160
    },
    {
      prop: "deliveryDate",
      label: "交货日期",
      width: 160,
      align: "center"
    },
    {
      prop: "orderAmount",
      label: "订单数量",
      width: 120,
      align: "right",
      formatter: (row: ITableRow) => {
        return row.orderAmount || row.orderAmount == 0
          ? precisionConversion(row.orderAmount, row.decimalNumber ?? 2)
          : ""
      }
    },
    {
      prop: "scheduledQuantity",
      label: "排产数量",
      width: 120,
      align: "right",
      formatter: (row: ITableRow) => {
        return row.scheduledQuantity || row.scheduledQuantity == 0
          ? precisionConversion(row.scheduledQuantity, row.decimalNumber ?? 2)
          : ""
      }
    },
    {
      prop: "completeAmount",
      label: "完工数量",
      width: 120,
      align: "right",
      formatter: (row: ITableRow) => {
        return row.bizType === 2
          ? ""
          : row.completeAmount || row.completeAmount == 0
            ? precisionConversion(row.completeAmount, row.decimalNumber ?? 2)
            : ""
      }
    },
    {
      prop: "unitName",
      label: "单位",
      width: 120,
      align: "center"
    },
    {
      prop: "productionProgress",
      label: "生产进度",
      width: 200,
      align: "center",
      slots: {
        default: "productionProgress-default"
      }
    },
    {
      prop: "createTime",
      label: "创建时间",
      width: 160,
      align: "center"
    },
    {
      prop: "remark",
      label: "备注",
      width: 200
    },
    {
      prop: "custom-operation",
      label: "操作",
      width: 220,
      fixed: "right",
      slots: {
        default: "custom-operation-default"
      }
    }
  ]
})
const queryConfig: ITableRequestConfig<[IDynamicProductionOrderPageParams], ITableRow, true> = {
  api: queryDynamicProductOrderPageList,
  getParams: (sortData: IColumnSortInfo[], filterData: Record<string, any>) => {
    return [
      {
        pageQuery: {
          pageNum: pagination.value.currentPage,
          pageSize: pagination.value.pageSize
        },
        queryParam: {
          ...filterData
        },
        sort: sortData
      }
    ]
  }
}

const selectedRowId = ref("") // 表格当前选中行id
const productInfo = ref() // 订单工艺配置页面产品配置操作中“料”、“产出”的产品信息

const viewStatus = ref(false) // 工单工艺编辑页查看权限
const orderType = ref(EnumProductionOrderType.QUANTITY) // 生产订单类型
const reAddVisible = ref(false) // 追加数量弹窗标识

// 处理路由参数
const route = useRoute()
const handleRouteParams = () => {
  const { id, type, craftConfig } = route.query
  if (id) {
    selectedRowId.value = String(id)
    if (type === "edit") {
      curPageKey.value = EnumPageType.Production_order_update
    } else if (type === "view") {
      curPageKey.value = EnumPageType.Production_order_detail
    }
  }
}

// 判断是否需要自动打开订单工艺配置
const needAutoCraftConfig = computed(() => route.query.craftConfig === "true")

const addRecordOrderNo = ref("") // 追加记录子页面默认订单号

provide("isOnlyView", viewStatus) // 用于订单工艺页面中所有子组件查看状态判断
provide("orderType", orderType)

// 向后代组件提供的产品配置页面信息
provide("productSettingObj", {
  /** 显示产品配置页面 */
  showProductSetting: async (id: string) => {
    const data = await getProductModelById(id)
    productInfo.value = data

    const map: Record<string, EnumPageType> = {
      [EnumPageType.Order_craft_config_create]: EnumPageType.Product_detail_order_create,
      [EnumPageType.Order_craft_config_update]: EnumPageType.Product_detail_order_update,
      [EnumPageType.Order_craft_config_detail]: EnumPageType.Product_detail_order_detail,
      [EnumPageType.Craft_group_config_create]: EnumPageType.Product_detail_group_create,
      [EnumPageType.Craft_group_config_update]: EnumPageType.Product_detail_group_update,
      [EnumPageType.Craft_group_config_detail]: EnumPageType.Product_detail_group_detail,
      [EnumPageType.Craft_and_config_create]: EnumPageType.Product_detail_and_create,
      [EnumPageType.Craft_and_config_update]: EnumPageType.Product_detail_and_update,
      [EnumPageType.Craft_and_config_detail]: EnumPageType.Product_detail_and_detail
    }
    curPageKey.value = map[curPageKey.value]
  }
})

onMounted(() => {
  buildOptions()
  loadData()
  // 处理路由参数
  handleRouteParams()
})

// 监听路由变化，处理从生产订单页面跳转过来的情况
watch(
  () => route.query,
  () => {
    handleRouteParams()
  },
  { immediate: true }
)

// 生产进度文本映射
const getProductionProgressText = (value: number) => {
  if (!value || value === 0) return "未开始"
  if (value >= 1) return "全部完成"
  return "部分完成"
}

const getProductionProgressTagType = (value: number) => {
  if (!value || value === 0) return "info"
  if (value < 1) return "warning"
  return "success"
}

/** 构建下拉选项 */
const buildOptions = () => {
  typeOptions.value = Object.keys(EnumProductionOrderTypeMap).map((key) => ({
    label: EnumProductionOrderTypeMap[key as unknown as EnumProductionOrderType],
    value: +key
  }))

  sourceOptions.value = Object.keys(EnumProductionOrderSourceMap).map((key) => ({
    label: EnumProductionOrderSourceMap[key as unknown as EnumProductionOrderSource],
    value: +key
  }))

  statusOptions.value = Object.keys(EnumProductionOrderStatusMap).map((key) => ({
    label: EnumProductionOrderStatusMap[key as unknown as EnumProductionOrderStatus],
    value: +key
  }))
}

const onReset = () => {
  resetForm()
  customTableRef.value?.resetFilterList()
  customTableRef.value?.resetSortList()
  onSubmit()
}

const onSubmit = async () => {
  pagination.value.currentPage = 1
  await refreshTableData()
}

/** 刷新表格数据 */
const refreshTableData = async () => {
  await customTableRef.value?.requestData()
}

/** 手动同步 */
const onManualSyncClick = async () => {
  await refreshTableData()
  ElMessage.success("手动同步成功")
}

const getUrgentOverride = (row: ITableRow) => urgentOrderOverrides.value[String(row.id || "")]

const isUrgentProductionOrder = (row: ITableRow) => {
  const override = getUrgentOverride(row)
  if (override) return override.urgent
  const data = row as any
  return Boolean(
    data?.isUrgent ||
      data?.urgent ||
      data?.isUrgentInsert ||
      Number(data?.priority || data?.saleVOList?.[0]?.priority || 0) === 3
  )
}

const onToggleUrgentOrderClick = async (row: ITableRow) => {
  const orderId = String(row.id || "")
  if (!orderId) return

  if (isUrgentProductionOrder(row)) {
    await ElMessageBox.confirm("确认取消该生产订单的紧急标记？", "取消紧急", {
      type: "warning",
      confirmButtonText: "确认",
      cancelButtonText: "取消"
    })
    urgentOrderOverrides.value = {
      ...urgentOrderOverrides.value,
      [orderId]: { urgent: false }
    }
    Object.assign(row as any, {
      isUrgent: false,
      urgent: false,
      isUrgentInsert: false,
      urgentReason: "",
      priority: 1
    })
    ElMessage.success("已取消紧急")
    return
  }

  const result = await ElMessageBox.prompt("请输入紧急原因", "标记紧急", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    inputType: "textarea",
    inputPlaceholder: "请输入紧急原因",
    inputValidator: (value) => {
      if (!String(value || "").trim()) return "请输入紧急原因"
      return true
    }
  })
  const reason = String(result.value || "").trim()
  urgentOrderOverrides.value = {
    ...urgentOrderOverrides.value,
    [orderId]: { urgent: true, reason }
  }
  Object.assign(row as any, {
    isUrgent: true,
    urgent: true,
    isUrgentInsert: true,
    urgentReason: reason,
    priority: 3
  })
  ElMessage.success("已标记紧急")
}

/** 新建生产订单 */
const onCreateProductionOrderClick = () => {
  curPageKey.value = EnumPageType.Production_order_create
  selectedRowId.value = ""
}

/** 生产订单编辑 */
const onEditProductionOrderClick = (row: ITableRow) => {
  curPageKey.value = EnumPageType.Production_order_update
  selectedRowId.value = row.id
}

/** 生产订单详情 */
const onViewProductionOrderClick = (row: ITableRow) => {
  curPageKey.value = EnumPageType.Production_order_detail
  selectedRowId.value = row.id
}

/** 订单删除 */
const onDeleteRowClick = async (data: ITableRow) => {
  await ElMessageBox.confirm("确定删除该生产订单么？", "提示", {
    type: "warning"
  })
  await deleteProductionOrderItem(data?.id)
  ElMessage.success("删除成功")
  refreshTableData()
}

/** 已复核订单追加数量 */
const onReAddClick = async (row: ITableRow) => {
  // 若当前生产订单是否存在待复核的追加订单，则不允许追加数量
  const data = await requestCheckReAddRecord({ id: row.id })
  if (data) {
    ElMessage.warning("当前存在待复核的追加订单")
    return
  }

  selectedRowId.value = row.id
  reAddVisible.value = true
}

/** 追加数量成功回调 */
const onReAddSuccess = async (orderNo: string) => {
  await refreshTableData()
  addRecordOrderNo.value = orderNo
  curPageKey.value = EnumPageType.Re_add_record
}

/** 订单复核、解复核 */
const onCheckOrderClick = async (data: ITableRow) => {
  await ElMessageBox.confirm(
    `确定${data.status === EnumProductionOrderStatus.UN_REVIEW ? "复核" : "解复核"}该生产订单么？`,
    "提示",
    {
      type: "warning"
    }
  )

  loading.value = true
  try {
    if (data.status === EnumProductionOrderStatus.UN_REVIEW) {
      await checkProductionOrderItem({
        id: data.id
      })
      ElMessage.success("复核成功")
    } else if (data.status === EnumProductionOrderStatus.REVIEW) {
      await unCheckProductionOrderItem(data.id)
      ElMessage.success("解复核成功")
    }
    loading.value = false
  } catch (error) {
    loading.value = false
  }

  refreshTableData()
}

/** 订单结案 */
const onArchiveRowClick = async (data: ITableRow) => {
  await ElMessageBox.confirm(
    "结案操作将会结束该订单进行中的生产任务、删除未开始的生产任务，确认结案？",
    "提示",
    {
      type: "warning"
    }
  )
  await archiveProductionOrderItem(data.id)
  ElMessage.success("结案成功")
  refreshTableData()
}

/** 订单作废 */
const onVoidRowClick = async (data: ITableRow) => {
  await ElMessageBox.confirm("确定作废该生产订单么？", "提示", {
    type: "warning"
  })
  await archiveProductionOrderItem(data.id)
  ElMessage.success("作废成功")
  refreshTableData()
}

/** 配置页返回 */
const onConfigClose = () => {
  const list = customPageCrumbsRef.value?.getCurRoute()
  curPageKey.value = list[list.length - 2].key
  customTableRef.value?.requestData()
}

/** 订单工艺配置页点击配置操作回调 */
const onUpdatePageList = (data: ICraftConfigInfo) => {
  if (data.isCraftGroup) {
    craftConfigData.value = {
      craftRouteId: "",
      techVersionId: data.techVersion.id, // 且工艺、工艺组需要传入的是techVersionId
      craftType: EnumParentCraftType.CRAFT_GROUP
    }

    let map: Record<string, EnumPageType> = {
      [EnumPageType.Order_craft_config_create]: EnumPageType.Craft_group_config_create,
      [EnumPageType.Order_craft_config_update]: EnumPageType.Craft_group_config_update,
      [EnumPageType.Order_craft_config_detail]: EnumPageType.Craft_group_config_detail
    }
    curPageKey.value = map[curPageKey.value]
  } else {
    craftConfigData.value = {
      craftRouteId: "",
      techVersionId: data.techVersion.id, // 且工艺、工艺组需要传入的是techVersionId
      craftType: EnumParentCraftType.CRAFT_AND
    }

    let map: Record<string, EnumPageType> = {
      [EnumPageType.Order_craft_config_create]: EnumPageType.Craft_and_config_create,
      [EnumPageType.Order_craft_config_update]: EnumPageType.Craft_and_config_update,
      [EnumPageType.Order_craft_config_detail]: EnumPageType.Craft_and_config_detail
    }
    curPageKey.value = map[curPageKey.value]
  }
}

/** 生产订单新增、编辑页、详情页订单工艺配置回调 */
const onOrderCraftConfig = (
  data: ICraftConfigInfo,
  type: EnumProductionOrderType,
  orderInfo?: IProductionOrderItem
) => {
  let map: Record<string, EnumPageType> = {
    [EnumPageType.Production_order_create]: EnumPageType.Order_craft_config_create,
    [EnumPageType.Production_order_update]: EnumPageType.Order_craft_config_update,
    [EnumPageType.Production_order_detail]: EnumPageType.Order_craft_config_detail
  }
  curPageKey.value = map[curPageKey.value]
  orderType.value = type
  craftRouteConfigData.value = {
    craftRouteId: data.id, // 工艺路线只需传入工艺路线id
    techVersionId: "",
    craftType: EnumParentCraftType.CRAFT_ROUTE,
    isOrderCraft: true, // 标识为订单工艺配置
    orderInfo: orderInfo // 生产订单信息
  }

  // 当生产订单存在时，才判断是否为查看状态；新增时进行工单工艺编辑操作，此时生产订单还未提交，故不判断
  if (orderInfo) {
    // 未复核状态，订单工艺允许修改；已复核、结案状态下，量产、返工、改制的订单，不允许编辑订单工艺，只能查看
    if (
      [
        EnumProductionOrderType.QUANTITY,
        EnumProductionOrderType.REPAIR,
        EnumProductionOrderType.REMODEL
      ].includes(orderInfo.type as EnumProductionOrderType) &&
      orderInfo.status !== EnumProductionOrderStatus.UN_REVIEW
    ) {
      viewStatus.value = true
    } else {
      viewStatus.value = false
    }
  } else {
    viewStatus.value = false
  }
}
</script>

<style scoped lang="scss">
.search-form {
  padding: 0;
}

.progress-wrap {
  display: flex;
  justify-content: center;
  align-items: center;

  .progress-text {
    width: 80px;
    flex: none;
  }

  .progress {
    width: 100px;
    height: 8px;
    border-radius: 4px;
    background-color: #ededed;
    position: relative;
    overflow: hidden;

    .progress-slid {
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      background: var(--el-color-primary);
    }
  }
}

:deep(.production-order-urgent-row > td.el-table__cell) {
  background: #fff1f0 !important;
}

:deep(.production-order-urgent-row:hover > td.el-table__cell) {
  background: #ffd8d6 !important;
}
</style>
