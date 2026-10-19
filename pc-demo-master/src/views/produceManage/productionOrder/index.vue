<template>
  <div class="layout-container" v-loading="loading">
    <!-- 编辑查看页面 -->
    <div class="layout-child-page" v-if="showEditView">
      <CustomPageCrumbs v-model="curPageKey" :data="pageTree" />
      <OrderEditView
        :id="editViewId"
        :is-view="editViewType === 'view'"
        @close="handleCloseEditView"
        @success="handleEditSuccess"
        @craft-config-change="handleCraftConfigChange"
      />
    </div>

    <!-- 主列表页面 -->
    <div class="layout-main-page" v-show="!showEditView">
      <CustomTitle title="生产订单">
        <div>
          <el-button type="primary" plain icon="Refresh" @click="loadData">
            手动同步
          </el-button>
          <el-button type="primary" icon="Plus" @click="onCreateOrder">
            新建生产订单
          </el-button>
        </div>
      </CustomTitle>
      <el-table :data="tableData" border height="calc(100% - 52px)" :row-class-name="getRowClassName">
        <el-table-column prop="no" label="订单编号" width="150" />
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
        <el-table-column prop="workshopName" label="车间" width="120" align="center">
          <template #header>
            <ColumnSearch label="车间" v-model:visible="searchVisible.workshopName" :has-filter="hasFilter('workshopName')">
              <el-select v-model="searchParams.workshopName" placeholder="请选择" clearable size="small" @change="handleSearch">
                <el-option v-for="item in workshopOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
              <div class="search-btns">
                <el-button v-if="searchParams.workshopName" type="primary" link size="small" @click="clearSearch('workshopName')">清空</el-button>
              </div>
            </ColumnSearch>
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
        <el-table-column prop="productionProgress" label="生产进度" width="100" align="center">
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
        <el-table-column prop="productModelName" label="产品名称" width="180">
          <template #header>
            <ColumnSearch label="产品名称" v-model:visible="searchVisible.productModelName" :has-filter="hasFilter('productModelName')">
              <el-input v-model="searchParams.productModelName" placeholder="请输入" clearable size="small" @input="handleSearch" />
              <div class="search-btns">
                <el-button v-if="searchParams.productModelName" type="primary" link size="small" @click="clearSearch('productModelName')">清空</el-button>
              </div>
            </ColumnSearch>
          </template>
        </el-table-column>
        <el-table-column prop="productModelSpec" label="产品规格" width="150">
          <template #header>
            <ColumnSearch label="产品规格" v-model:visible="searchVisible.productModelSpec" :has-filter="hasFilter('productModelSpec')">
              <el-input v-model="searchParams.productModelSpec" placeholder="请输入" clearable size="small" @input="handleSearch" />
              <div class="search-btns">
                <el-button v-if="searchParams.productModelSpec" type="primary" link size="small" @click="clearSearch('productModelSpec')">清空</el-button>
              </div>
            </ColumnSearch>
          </template>
        </el-table-column>
        <el-table-column prop="productModelCode" label="产品编号" width="130">
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
              <el-date-picker v-model="searchParams.deliveryDate" type="daterange" range-separator="-" start-placeholder="开始" end-placeholder="结束" clearable size="small" @change="handleSearch" />
              <div class="search-btns">
                <el-button v-if="searchParams.deliveryDate && searchParams.deliveryDate.length" type="primary" link size="small" @click="clearSearch('deliveryDate')">清空</el-button>
              </div>
            </ColumnSearch>
          </template>
        </el-table-column>
        <el-table-column prop="orderAmount" label="订单数量" width="100" align="right">
          <template #default="{ row }">
            {{ row.orderAmount || row.orderAmount === 0 ? precisionConversion(row.orderAmount, row.decimalNumber ?? 2) : "-" }}
          </template>
        </el-table-column>
        <el-table-column prop="scheduledQuantity" label="排产数量" width="100" align="right">
          <template #default="{ row }">
            {{ row.scheduledQuantity || row.scheduledQuantity === 0 ? precisionConversion(row.scheduledQuantity, row.decimalNumber ?? 2) : "-" }}
          </template>
        </el-table-column>
        <el-table-column prop="completeAmount" label="完工数量" width="100" align="right">
          <template #default="{ row }">
            {{ row.completeAmount || row.completeAmount === 0 ? precisionConversion(row.completeAmount, row.decimalNumber ?? 2) : "-" }}
          </template>
        </el-table-column>
        <el-table-column prop="unitName" label="单位" width="80" align="center" />
        <el-table-column prop="createTime" label="创建时间" width="160" align="center" />
        <el-table-column prop="remark" label="备注" width="200" />
        <el-table-column label="操作" width="380" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === EnumProductionOrderStatus.REVIEW && !!isAuth"
              type="primary"
              link
              size="small"
              @click="onSplitOrderClick(row)"
            >
              订单拆分
            </el-button>
            <el-button
              v-if="row.status === EnumProductionOrderStatus.UN_REVIEW && !!isAuth"
              type="primary"
              link
              size="small"
              @click="onCheckOrderClick(row)"
            >
              复核
            </el-button>
            <el-button
              v-if="row.status === EnumProductionOrderStatus.REVIEW && row.productionProgress === 0 && !!isAuth"
              type="primary"
              link
              size="small"
              @click="onUncheckOrderClick(row)"
            >
              解复核
            </el-button>
            <el-button
              v-if="row.status === EnumProductionOrderStatus.UN_REVIEW && !!isAuth"
              link
              type="primary"
              size="small"
              @click="onEditClick(row)"
            >
              编辑查看
            </el-button>
            <el-button
              v-else
              link
              type="primary"
              size="small"
              @click="onViewClick(row)"
            >
              查看详情
            </el-button>
            <el-button
              v-if="row.status !== EnumProductionOrderStatus.SETTLE && row.status !== EnumProductionOrderStatus.VOID && !!isAuth"
              link
              :type="isUrgentOrder(row) ? 'warning' : 'danger'"
              size="small"
              @click="onToggleUrgentClick(row)"
            >
              {{ isUrgentOrder(row) ? "取消紧急" : "标记紧急" }}
            </el-button>
            <el-button
              v-if="row.status === EnumProductionOrderStatus.REVIEW && !!isAuth"
              link
              type="primary"
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
              @click="onDeleteClick(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <CustomPagination
        v-model:currentPage="pagination.currentPage"
        v-model:pageSize="pagination.pageSize"
        :total="pagination.total"
        border
      />
    </div>

    <!-- 订单拆分弹窗 -->
    <SplitOrderDialog
      v-model="splitDialogVisible"
      :order-info="splitOrderInfo"
      @success="handleSplitSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import { useRouter } from "vue-router"

import CustomPageCrumbs from "@/components/CustomPageCrumbs/index.vue"
import CustomPagination from "@/components/CustomPagination/index.vue"
import CustomTitle from "@/components/CustomTitle/index.vue"
import {
  EnumProductionOrderSource,
  EnumProductionOrderSourceMap,
  EnumProductionOrderStatus,
  EnumProductionOrderStatusMap,
  EnumProductionOrderStatusTagMap,
  EnumProductionOrderType,
  EnumProductionOrderTypeMap
} from "@/constant/enums"
import type { IDynamicProductionOrderPageItem } from "@/types/production-manage/product-order"
import { precisionConversion } from "@/utils/common"

import ColumnSearch from "./components/ColumnSearch.vue"
import OrderEditView from "./components/OrderEditView.vue"
import SplitOrderDialog from "./components/SplitOrderDialog.vue"

defineOptions({ name: "ProductionOrder" })

const router = useRouter()

// 临时设置isAuth为true，用于显示所有按钮
const isAuth = ref(true)

const loading = ref(false)
const tableData = ref<IDynamicProductionOrderPageItem[]>([])
const urgentOrderOverrides = ref<Record<string, { urgent: boolean; reason?: string }>>({})

// 工单状态映射（兼容旧代码）
const workOrderStatusMap: Record<number, string> = EnumProductionOrderStatusMap
const workOrderStatusTagMap: Record<number, string> = EnumProductionOrderStatusTagMap

// 生产进度映射
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

// 下拉选项
const typeOptions = computed(() =>
  Object.keys(EnumProductionOrderTypeMap).map((key) => ({
    label: EnumProductionOrderTypeMap[key as unknown as EnumProductionOrderType],
    value: +key
  }))
)

const sourceOptions = computed(() =>
  Object.keys(EnumProductionOrderSourceMap).map((key) => ({
    label: EnumProductionOrderSourceMap[key as unknown as EnumProductionOrderSource],
    value: +key
  }))
)

const statusOptions = computed(() =>
  Object.keys(EnumProductionOrderStatusMap).map((key) => ({
    label: EnumProductionOrderStatusMap[key as unknown as EnumProductionOrderStatus],
    value: +key
  }))
)

const workshopOptions = [
  { label: "一车间", value: "一车间" },
  { label: "二车间", value: "二车间" },
  { label: "三车间", value: "三车间" }
]

// 判断字段是否有筛选条件
const hasFilter = (key: string) => {
  const value = searchParams.value[key]
  if (key === "deliveryDate") {
    return Array.isArray(value) && value.length > 0
  }
  return value !== null && value !== "" && value !== undefined
}

const searchParams = ref<any>({
  saleCode: "",
  type: null,
  source: null,
  status: null,
  productionProgress: null,
  productModelName: "",
  productModelSpec: "",
  productModelCode: "",
  deliveryDate: [],
  workshopName: ""
})

const searchVisible = ref<any>({
  saleCode: false,
  type: false,
  source: false,
  status: false,
  productionProgress: false,
  productModelName: false,
  productModelSpec: false,
  productModelCode: false,
  deliveryDate: false,
  workshopName: false
})

const pagination = ref({ currentPage: 1, pageSize: 20, total: 0 })

// 编辑查看页面状态
const showEditView = ref(false)
const editViewId = ref("")
const editViewType = ref<"edit" | "view">("edit")
const curPageKey = ref(0) // 当前页面key
const isInCraftConfig = ref(false) // 是否在订单工艺配置页面

// 页面类型枚举
enum EnumPageType {
  Main, // 列表页
  Production_order_view, // 生产订单查看
  Order_craft_config // 订单工艺配置
}

// 面包屑导航数据
const pageTree = computed(() => {
  const baseName = editViewType.value === "edit" ? "生产订单编辑" : "生产订单查看"

  if (isInCraftConfig.value) {
    return [
      {
        name: "生产订单",
        key: EnumPageType.Main,
        children: [
          {
            name: baseName,
            key: EnumPageType.Production_order_view,
            children: [
              {
                name: "订单工艺配置",
                key: EnumPageType.Order_craft_config
              }
            ]
          }
        ]
      }
    ]
  }

  return [
    {
      name: "生产订单",
      key: EnumPageType.Main,
      children: [
        {
          name: baseName,
          key: EnumPageType.Production_order_view
        }
      ]
    }
  ]
})

// 判断是否紧急订单
const getUrgentOverride = (row: IDynamicProductionOrderPageItem) => urgentOrderOverrides.value[String(row.id || "")]

const isUrgentOrder = (row: IDynamicProductionOrderPageItem) => {
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

// 行样式
const getRowClassName = ({ row }: { row: IDynamicProductionOrderPageItem }) => {
  return isUrgentOrder(row) ? "production-order-urgent-row" : ""
}

const handleSearch = () => {
  pagination.value.currentPage = 1
  loadData()
}

const clearSearch = (key: string) => {
  const nullKeys = ["type", "source", "status", "productionProgress"]
  searchParams.value[key] = nullKeys.includes(key) ? null : ""
  if (key === "deliveryDate") {
    searchParams.value.deliveryDate = []
  }
  handleSearch()
}

// 模拟数据
const mockData: IDynamicProductionOrderPageItem[] = [
  {
    id: "1",
    no: "PO20240901001",
    saleCode: "WO2024090001",
    type: 1,
    source: 2,
    status: 1,
    productionProgress: 0.65,
    productModelName: "产品A",
    productModelSpec: "规格A-001",
    productModelCode: "P001",
    deliveryDate: "2024-10-15",
    orderAmount: 1000,
    scheduledQuantity: 800,
    completeAmount: 520,
    unitName: "PCS",
    decimalNumber: 2,
    createTime: "2024-09-01 10:00:00",
    remark: "ERP同步订单",
    workshopName: "一车间"
  },
  {
    id: "2",
    no: "PO20240901002",
    saleCode: "WO2024090002",
    type: 1,
    source: 2,
    status: 1,
    productionProgress: 0,
    productModelName: "产品B",
    productModelSpec: "规格B-002",
    productModelCode: "P002",
    deliveryDate: "2024-10-20",
    orderAmount: 2000,
    scheduledQuantity: 0,
    completeAmount: 0,
    unitName: "PCS",
    decimalNumber: 2,
    createTime: "2024-09-02 14:30:00",
    remark: "紧急订单",
    workshopName: "二车间"
  },
  {
    id: "3",
    no: "PO20240901003",
    saleCode: "WO2024090003",
    type: 5,
    source: 2,
    status: 9,
    productionProgress: 1,
    productModelName: "产品C",
    productModelSpec: "规格C-003",
    productModelCode: "P003",
    deliveryDate: "2024-10-25",
    orderAmount: 500,
    scheduledQuantity: 500,
    completeAmount: 500,
    unitName: "PCS",
    decimalNumber: 2,
    createTime: "2024-09-03 09:15:00",
    remark: "返工订单",
    workshopName: "三车间"
  },
  {
    id: "po-review-1",
    no: "PO20240901007",
    saleCode: "SO-REVIEW-001",
    type: 1,
    source: 1,
    status: 1,
    productionProgress: 0.45,
    productModelName: "减速器壳体B",
    productModelSpec: "B型 400x280x200",
    productModelCode: "GR-HSG-002",
    deliveryDate: "2026-06-15",
    orderAmount: 800,
    scheduledQuantity: 800,
    completeAmount: 360,
    unitName: "PCS",
    decimalNumber: 2,
    createTime: "2026-05-10 10:00:00",
    remark: "部分完成订单",
    workshopName: "二车间"
  },
  {
    id: "po-unreview-1",
    no: "PO20240901008",
    saleCode: "SO-UNREVIEW-001",
    type: 1,
    source: 1,
    status: 5,
    productionProgress: 0,
    productModelName: "减速器壳体C",
    productModelSpec: "C型 420x300x220",
    productModelCode: "GR-HSG-003",
    deliveryDate: "2026-07-01",
    orderAmount: 600,
    scheduledQuantity: 0,
    completeAmount: 0,
    unitName: "PCS",
    decimalNumber: 2,
    createTime: "2026-06-01 09:00:00",
    remark: "待复核订单",
    workshopName: "一车间"
  },
  {
    id: "po-void-1",
    no: "PO20240901006",
    saleCode: "SO-VOID-001",
    type: 1,
    source: 1,
    status: 3,
    productionProgress: 0,
    productModelName: "减速器壳体A",
    productModelSpec: "A型 380x260x180",
    productModelCode: "GR-HSG-001",
    deliveryDate: "2026-05-30",
    orderAmount: 500,
    scheduledQuantity: 0,
    completeAmount: 0,
    unitName: "PCS",
    decimalNumber: 2,
    createTime: "2026-05-01 08:00:00",
    remark: "已作废订单",
    workshopName: "一车间"
  }
]

const loadData = async () => {
  loading.value = true
  try {
    // 使用模拟数据
    await new Promise((resolve) => setTimeout(resolve, 300))

    // 根据ERP工单号自动计算来源：有ERP工单号则为ERP来源(2)，否则为MES来源(1)
    const processedData = mockData.map((item) => ({
      ...item,
      source: item.saleCode && item.saleCode.trim() ? 2 : 1
    }))

    // 应用筛选
    let filteredData = [...processedData]

    // 按来源筛选
    if (searchParams.value.source) {
      filteredData = filteredData.filter((item) => item.source === searchParams.value.source)
    }
    // 按状态筛选
    if (searchParams.value.status) {
      filteredData = filteredData.filter((item) => item.status === searchParams.value.status)
    }
    // 按类型筛选
    if (searchParams.value.type) {
      filteredData = filteredData.filter((item) => item.type === searchParams.value.type)
    }
    // 按生产进度筛选：0-未开始，1-部分完成，2-全部完成
    if (searchParams.value.productionProgress !== null && searchParams.value.productionProgress !== "") {
      const progressValue = Number(searchParams.value.productionProgress)
      filteredData = filteredData.filter((item) => {
        const progress = Number(item.productionProgress) || 0
        if (progressValue === 0) return progress === 0
        if (progressValue === 1) return progress > 0 && progress < 1
        if (progressValue === 2) return progress >= 1
        return true
      })
    }
    // 按ERP工单号筛选
    if (searchParams.value.saleCode) {
      filteredData = filteredData.filter((item) =>
        item.saleCode?.toLowerCase().includes(searchParams.value.saleCode.toLowerCase())
      )
    }
    // 按产品名称筛选
    if (searchParams.value.productModelName) {
      filteredData = filteredData.filter((item) =>
        item.productModelName?.toLowerCase().includes(searchParams.value.productModelName.toLowerCase())
      )
    }
    // 按产品编号筛选
    if (searchParams.value.productModelCode) {
      filteredData = filteredData.filter((item) =>
        item.productModelCode?.toLowerCase().includes(searchParams.value.productModelCode.toLowerCase())
      )
    }
    // 按车间筛选
    if (searchParams.value.workshopName) {
      filteredData = filteredData.filter((item) => item.workshopName === searchParams.value.workshopName)
    }

    pagination.value.total = filteredData.length
    const start = (pagination.value.currentPage - 1) * pagination.value.pageSize
    const end = start + pagination.value.pageSize
    tableData.value = filteredData.slice(start, end)
  } catch (error) {
    console.error("加载数据失败:", error)
  } finally {
    loading.value = false
  }
}

const onCreateOrder = () => {
  // 新建生产订单 - 打开编辑页面，传入空id表示新建模式
  editViewId.value = ""
  editViewType.value = "edit"
  isInCraftConfig.value = false
  curPageKey.value = EnumPageType.Production_order_view
  showEditView.value = true
}

// 编辑查看 - 在当前页面打开编辑查看页面
const onEditClick = async (row: IDynamicProductionOrderPageItem) => {
  try {
    await ElMessageBox.confirm(
      `确定要编辑订单【${row.no}】吗？`,
      "编辑订单",
      { type: "info" }
    )
    // 在当前页面显示编辑查看页面
    editViewId.value = row.id
    editViewType.value = "edit"
    isInCraftConfig.value = false
    curPageKey.value = EnumPageType.Production_order_view
    showEditView.value = true
  } catch {
    // 用户取消
  }
}

// 查看详情 - 在当前页面打开查看详情页面
const onViewClick = async (row: IDynamicProductionOrderPageItem) => {
  try {
    await ElMessageBox.confirm(
      `订单【${row.no}】详情：\n产品名称：${row.productModelName}\n产品规格：${row.productModelSpec}\n产品编号：${row.productModelCode}\n订单数量：${row.orderAmount}\n排产数量：${row.scheduledQuantity}\n完工数量：${row.completeAmount}\n交货日期：${row.deliveryDate}\n备注：${row.remark || "无"}`,
      "查看详情",
      { type: "info", confirmButtonText: "查看详情", cancelButtonText: "取消" }
    )
    // 在当前页面显示查看详情页面
    editViewId.value = row.id
    editViewType.value = "view"
    isInCraftConfig.value = false
    curPageKey.value = EnumPageType.Production_order_view
    showEditView.value = true
  } catch {
    // 用户取消
  }
}

// 编辑查看成功回调
const handleEditSuccess = () => {
  showEditView.value = false
  curPageKey.value = EnumPageType.Main
  loadData()
}

// 关闭编辑查看页面
const handleCloseEditView = () => {
  showEditView.value = false
  curPageKey.value = EnumPageType.Main
  editViewId.value = ""
  isInCraftConfig.value = false
}

// 处理订单工艺配置页面切换
const handleCraftConfigChange = (isInConfig: boolean) => {
  isInCraftConfig.value = isInConfig
  if (isInConfig) {
    curPageKey.value = EnumPageType.Order_craft_config
  } else {
    curPageKey.value = EnumPageType.Production_order_view
  }
}

// 订单拆分
const splitDialogVisible = ref(false)
const splitOrderInfo = ref<IDynamicProductionOrderPageItem | null>(null)

const onSplitOrderClick = async (row: IDynamicProductionOrderPageItem) => {
  const splittableQuantity = (row.orderAmount || 0) - (row.scheduledQuantity || 0)
  if (splittableQuantity <= 0) {
    ElMessage.warning("该订单无可拆分数量")
    return
  }
  splitOrderInfo.value = row
  splitDialogVisible.value = true
}

const handleSplitSuccess = () => {
  loadData()
}

// 追加数量
const onReAddClick = async (row: IDynamicProductionOrderPageItem) => {
  try {
    await ElMessageBox.confirm("确定追加数量么？", "提示", { type: "warning" })
    ElMessage.success("追加数量功能开发中")
  } catch {
    // 用户取消
  }
}

// 复核
const onCheckOrderClick = async (row: IDynamicProductionOrderPageItem) => {
  try {
    await ElMessageBox.confirm(
      "确定复核该生产订单么？",
      "提示",
      { type: "warning" }
    )

    // 模拟状态切换（本地数据）- 复核
    row.status = EnumProductionOrderStatus.REVIEW
    ElMessage.success("复核成功")

    // 刷新数据
    loadData()
  } catch (error: any) {
    if (error !== "cancel") {
      ElMessage.error(error.message || "操作失败")
    }
  }
}

// 解复核
const onUncheckOrderClick = async (row: IDynamicProductionOrderPageItem) => {
  try {
    await ElMessageBox.confirm(
      "确定解复核该生产订单么？",
      "提示",
      { type: "warning" }
    )

    // 模拟状态切换（本地数据）- 解复核
    row.status = EnumProductionOrderStatus.UN_REVIEW
    ElMessage.success("解复核成功")

    // 刷新数据
    loadData()
  } catch (error: any) {
    if (error !== "cancel") {
      ElMessage.error(error.message || "操作失败")
    }
  }
}

// 标记紧急/取消紧急
const onToggleUrgentClick = async (row: IDynamicProductionOrderPageItem) => {
  const orderId = String(row.id || "")
  if (!orderId) return

  if (isUrgentOrder(row)) {
    try {
      await ElMessageBox.confirm("确认取消该生产订单的紧急标记？", "取消紧急", {
        type: "warning",
        confirmButtonText: "确认",
        cancelButtonText: "取消"
      })
      urgentOrderOverrides.value = {
        ...urgentOrderOverrides.value,
        [orderId]: { urgent: false }
      }
      ElMessage.success("已取消紧急")
    } catch {
      // 用户取消
    }
    return
  }

  try {
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
    ElMessage.success("已标记紧急")
  } catch {
    // 用户取消
  }
}

// 结案
const onArchiveClick = async (row: IDynamicProductionOrderPageItem) => {
  try {
    await ElMessageBox.confirm(
      "结案操作将会结束该订单进行中的生产任务、删除未开始的生产任务，确认结案？",
      "提示",
      { type: "warning" }
    )
    // 模拟结案（本地数据）
    row.status = EnumProductionOrderStatus.SETTLE
    ElMessage.success("结案成功")
    loadData()
  } catch (error: any) {
    if (error !== "cancel") {
      ElMessage.error(error.message || "结案失败")
    }
  }
}

// 作废
const onVoidClick = async (row: IDynamicProductionOrderPageItem) => {
  // 已开始生产的订单无法作废
  if (row.productionProgress > 0) {
    ElMessage.warning("已开始生产的订单无法作废")
    return
  }

  try {
    await ElMessageBox.confirm("确定作废该生产订单么？", "提示", { type: "warning" })
    // 模拟作废（本地数据）- 将状态改为已结案
    row.status = EnumProductionOrderStatus.SETTLE
    ElMessage.success("作废成功")
    loadData()
  } catch (error: any) {
    if (error !== "cancel") {
      ElMessage.error(error.message || "作废失败")
    }
  }
}

// 删除
const onDeleteClick = async (row: IDynamicProductionOrderPageItem) => {
  try {
    await ElMessageBox.confirm("确定删除该生产订单么？", "提示", { type: "warning" })
    // 模拟删除（本地数据）
    const index = mockData.findIndex((item) => item.id === row.id)
    if (index > -1) {
      mockData.splice(index, 1)
    }
    ElMessage.success("删除成功")
    loadData()
  } catch (error: any) {
    if (error !== "cancel") {
      ElMessage.error(error.message || "删除失败")
    }
  }
}

onMounted(() => {
  loadData()
})

// 监听分页变化
watch(
  () => [pagination.value.currentPage, pagination.value.pageSize],
  () => {
    loadData()
  }
)
</script>

<style scoped lang="scss">
.layout-container { height: 100%; }
.layout-main-page { background: #fff; height: 100%; display: flex; flex-direction: column; padding: 0 16px; }
.search-btns { display: flex; justify-content: flex-end; margin-top: 8px; }

:deep(.production-order-urgent-row > td.el-table__cell) {
  background: #fff1f0 !important;
}

:deep(.production-order-urgent-row:hover > td.el-table__cell) {
  background: #ffd8d6 !important;
}
</style>
