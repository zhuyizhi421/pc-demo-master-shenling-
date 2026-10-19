<template>
  <div class="order-edit-view" v-loading="loading">
    <!-- 编辑订单工艺页面 -->
    <div v-if="showCraftConfig" class="craft-config-wrapper">
      <CraftRouteConfig
        :data="craftConfigData!"
        @close="handleCraftConfigClose"
        @update-page-list="handleCraftConfigUpdate"
      />
    </div>

    <!-- 编辑查看页面 -->
    <div v-else class="update-production-order">
      <div class="production-order-content">
        <div class="top-back">
          <el-button
            v-if="!isView"
            type="primary"
            :disabled="!formData.productModelId || (!curOrderCraftData?.value?.no && isCreateMode)"
            @click="handleSave"
          >保存</el-button>
          <el-button icon="ArrowLeft" @click="handleBack">返回</el-button>
        </div>
        <CustomTitle
          :isTableTitle="false"
          class="pl-[20px]"
          showShortBar
          :title="isCreateMode ? '新建生产订单' : (isView ? '查看生产订单' : '编辑生产订单')"
        />

        <CustomForm
          class="pr-[20px]"
          ref="customFormRef"
          v-model="formData"
          :configs="formConfigs"
          :labelWidth="120"
          :readonly="isView"
        >
          <template #productBatchNo-default>
            <div class="production-batch-wrap">
              <el-input
                v-model="formData.productBatchNo"
                placeholder="请选择生产批次"
                disabled
                style="flex: 1; margin-right: 8px"
              />
              <el-button
                v-if="!isView"
                type="primary"
                link
                @click="selectProductionBatchVisible = true"
              >选择</el-button>
              <el-button
                v-if="!isView && formData.productBatchNo"
                type="primary"
                link
                @click="onClearProductBatch"
              >清除</el-button>
            </div>
          </template>

          <template #fileList-default>
            <UploadFile v-model="fileList" :limit="3" :show-tip="false" multiple :disabled="isView">
              <el-button type="primary" icon="Upload" plain :disabled="isView">上传附件</el-button>
            </UploadFile>
          </template>
        </CustomForm>

        <!-- 工艺流程 -->
        <div class="craft-flow">
          <CustomTitle :isTableTitle="false" title="工艺流程">
            <el-button
              v-if="!isView"
              type="primary"
              icon="Edit"
              plain
              @click="onEditCraftFlowClick()"
              :disabled="!hasSelectedCraft"
              style="margin-right: 8px"
            >编辑订单工艺</el-button>
            <el-button
              v-if="!isView"
              :disabled="!formData.productModelId && isCreateMode"
              @click="handleSelectCraft"
            >
              选择工艺流程
            </el-button>
          </CustomTitle>
          <CustomDescription
            :data="descData"
            :configs="descConfigs"
            :labelWidth="120"
            style="padding: 0"
          ></CustomDescription>

          <!-- 工序/用料 页签切换 -->
          <el-radio-group class="tab-group" v-model="craftTabValue">
            <el-radio-button :value="1">工序</el-radio-button>
            <el-radio-button :value="2">用料</el-radio-button>
            <el-radio-button :value="3">计划产出</el-radio-button>
          </el-radio-group>

          <!-- 工序表格 -->
          <CustomTable
            v-if="craftTabValue === 1"
            :table-data="processTableData"
            :config="processTableConfig"
            height="300"
          />

          <!-- 用料表格 -->
          <CustomTable
            v-if="craftTabValue === 2"
            v-model:table-data="materialTableData"
            :config="materialTableConfig"
          >
            <template #serials-default="{ row: { processSerials } }">
              {{ processSerials?.join(";") }}
            </template>
          </CustomTable>

          <!-- 计划产出表格 -->
          <CustomTable
            v-if="craftTabValue === 3"
            :table-data="outputTableData"
            :config="outputTableConfig"
            height="300"
          />
        </div>
      </div>

      <div class="layout-footer">
        <el-button @click="handleBack">{{ isView ? '关闭' : '取消' }}</el-button>
      </div>
    </div>

    <!-- 选择工艺路线弹窗 -->
    <SelectCraftRouteDialog
      v-model="selectCraftVisible"
      :selected-row-keys="selectedCraftId ? [selectedCraftId] : []"
      :disabled-no="true"
      :disabled-status="formData.type == 1"
      :publishStatus="formData.type == 1 ? 2 : undefined"
      @success="selectCraftRouteOk"
    />

    <!-- 选择生产批次弹窗 -->
    <SelectProductionBatchDialog
      v-model="selectProductionBatchVisible"
      :selected-row-keys="formData.productBatchId ? [formData.productBatchId] : []"
      @success="selectProductionBatchSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import type { ICustomDescriptionConfig } from "@/components/CustomDescription/type"
import CustomDescription from "@/components/CustomDescription/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import SelectCraftRouteDialog from "@/components/SelectCraftRouteDialog/index.vue"
import SelectProductionBatchDialog from "../../productionOrders/components/SelectProductionBatchDialog.vue"
import UploadFile from "@/components/UploadFile/index.vue"
import {
  EnumParentCraftType,
  EnumProductionOrderSourceMap,
  EnumProductionOrderStatus,
  EnumProductionOrderStatusMap,
  EnumProductionOrderType,
  EnumProductionOrderTypeMap
} from "@/constant/enums"
import type { ICraftConfigInfo, ICraftPageCrumbsData } from "@/types/base-info/craftRoute"
import type { IFile } from "@/types/base-info/implement-config"
import type { IProductionOrderMaterialItem, IProductionOrderItem } from "@/types/production-manage/product-order"

import CraftRouteConfig from "@/views/basicConfig/craftwork/craftRoute/components/CraftRouteConfig.vue"

const props = defineProps<{
  id: string
  isView?: boolean
}>()

const emit = defineEmits<{
  (e: "close"): void
  (e: "success"): void
  (e: "craft-config-change", isInCraftConfig: boolean): void
}>()

const loading = ref(false)
const customFormRef = ref<InstanceType<typeof CustomForm>>()

const selectCraftVisible = ref(false)
const selectedCraftId = ref("")
const selectProductionBatchVisible = ref(false) // 选择生产批次弹窗

// 订单工艺配置相关
const showCraftConfig = ref(false)
const craftConfigData = ref<ICraftPageCrumbsData>()

const fileList = ref<IFile[]>([])
const materialTableData = ref<IProductionOrderMaterialItem[]>([])
const curOrderCraftData = ref<any>({})
const craftTabValue = ref(1) // 工序/用料 tab 选中值

// 是否已选择工艺路线
const hasSelectedCraft = computed(() => {
  const data = curOrderCraftData.value || {}
  return !!(data.id || data.no || data.techId || data.craftId)
})

// 工序表格数据
const processTableData = ref<any[]>([])

// 工序表格配置
const processTableConfig = ref<ITableConfig>({
  height: 300,
  stripe: true,
  columns: [
    { type: "index", prop: "", label: "序号", width: 65, align: "center", fixed: "left" },
    { prop: "serial", label: "工序", minWidth: 160, showOverflowTooltip: true },
    { prop: "techName", label: "工艺名称", minWidth: 160, showOverflowTooltip: true },
    { prop: "nature", label: "加工性质", width: 120, align: "center", showOverflowTooltip: true },
    { prop: "totalAmount", label: "订单数量", width: 120, align: "right", showOverflowTooltip: true },
    { prop: "finishAmount", label: "完工数量", width: 120, align: "right", showOverflowTooltip: true },
    { prop: "unitName", label: "单位", width: 90, align: "center", showOverflowTooltip: true }
  ]
})

// 计划产出表格数据
const outputTableData = ref<any[]>([])

// 计划产出表格配置
const outputTableConfig = ref<ITableConfig>({
  height: 300,
  stripe: true,
  columns: [
    { type: "index", prop: "", label: "序号", width: 65, align: "center", fixed: "left" },
    { prop: "productModelName", label: "物料名称", minWidth: 160, showOverflowTooltip: true },
    { prop: "productModelCode", label: "编号", minWidth: 160, showOverflowTooltip: true },
    { prop: "specification", label: "规格", minWidth: 160, showOverflowTooltip: true },
    { prop: "outputAmount", label: "产出数量", width: 120, align: "right", showOverflowTooltip: true },
    { prop: "unitName", label: "单位", width: 90, align: "center", showOverflowTooltip: true },
    { prop: "remark", label: "备注", minWidth: 120, showOverflowTooltip: true }
  ]
})

const formData = ref<{
  id: string
  deliveryDate: string
  no: string
  orderAmount: number | undefined
  productModelId: string
  productModelName: string
  source: number
  techProcessId: string
  type: number
  unitId: string
  unitName: string
  specifiedInboundWarehouseId?: string
  productionMethod: number
  productModelNo: string
  orderId: string
  originalOrderNo: string
  productBatchId: string
  productBatchNo: string
  remark: string
  saleList: {
    label: string
    value: string
  }[]
}>({
  id: "",
  deliveryDate: "",
  no: "",
  orderAmount: undefined,
  productModelId: "",
  productModelName: "",
  source: 1,
  productionMethod: 1,
  type: 1,
  techProcessId: "",
  unitId: "",
  unitName: "",
  specifiedInboundWarehouseId: undefined,
  productModelNo: "",
  orderId: "",
  originalOrderNo: "",
  productBatchId: "",
  productBatchNo: "",
  remark: "",
  saleList: []
})

const productModelOptions = ref<{ label: string; value: string }[]>([])

const isView = computed(() => props.isView)
const isCreateMode = computed(() => !props.id)

/**
 * 表单配置
 */
const formConfigs = computed<ICustomFormConfigItem[]>(() => [
  {
    componentType: "el-select",
    label: "订单类型",
    colspan: 1,
    field: "type",
    props: {
      customChildren: Object.entries(EnumProductionOrderTypeMap).map(([value, key]) => ({
        componentType: "el-option",
        props: { label: key, value: +value }
      })),
      disabled: isView.value || !isCreateMode.value
    }
  },
  {
    componentType: "div",
    label: "生产批次",
    field: "productBatchNo",
    hidden: ![EnumProductionOrderType.REPAIR, EnumProductionOrderType.REMODEL].includes(formData.value.type),
    slots: {
      default: "productBatchNo-default"
    }
  },
  {
    componentType: "el-select",
    label: "产品名称",
    field: "productModelName",
    props: {
      placeholder: "请选择",
      customChildren: productModelOptions.value.map((item) => ({
        componentType: "el-option",
        props: { label: item.label, value: item.value }
      })),
      disabled: isView.value || !isCreateMode.value
    }
  },
  {
    componentType: "el-input",
    label: "产品编号",
    field: "productModelNo",
    props: {
      placeholder: "请选择产品",
      disabled: true
    }
  },
  {
    componentType: "el-input",
    label: "订单号",
    field: "no",
    props: {
      disabled: true
    }
  },
  {
    componentType: "el-input",
    label: "状态",
    field: "",
    props: {
      value: isCreateMode.value ? "待提交" : (orderData.value.status ? EnumProductionOrderStatusMap[orderData.value.status as EnumProductionOrderStatus] || "-" : "-"),
      disabled: true
    }
  },
  {
    componentType: "el-input-number",
    label: "数量",
    field: "orderAmount",
    props: {
      min: 1,
      disabled: isView.value || !isCreateMode.value
    }
  },
  {
    componentType: "el-select",
    label: "指定入库仓库",
    field: "specifiedInboundWarehouseId",
    props: {
      clearable: true,
      filterable: true,
      disabled: isView.value,
      customChildren: []
    }
  },
  {
    componentType: "el-input",
    label: "单位",
    field: "unitName",
    props: {
      disabled: true
    }
  },
  {
    componentType: "el-date-picker",
    label: "交货日期",
    field: "deliveryDate",
    props: {
      type: "date",
      placeholder: "请选择交货日期",
      format: "YYYY-MM-DD",
      valueFormat: "YYYY-MM-DD",
      disabled: isView.value
    }
  },
  {
    componentType: "el-input",
    label: "来源",
    field: "",
    props: {
      value: EnumProductionOrderSourceMap[formData.value?.source as any] || "-",
      disabled: true
    }
  },
  {
    componentType: "el-input",
    label: "创建时间",
    field: "",
    props: {
      value: orderData.value.createTime || "-",
      disabled: true
    }
  },
  {
    componentType: "el-input",
    label: "创建人",
    field: "",
    props: {
      value: orderData.value.createByName || "-",
      disabled: true
    }
  },
  {
    componentType: "el-select",
    label: "销售订单",
    field: "saleList",
    props: {
      disabled: true,
      customChildren: formData.value.saleList.map((item) => ({
        componentType: "el-option",
        props: { label: item.label, value: item.value }
      }))
    }
  },
  {
    componentType: "custom-component",
    label: "附件",
    field: "fileList",
    slots: {
      default: "fileList-default"
    }
  },
  {
    componentType: "el-input",
    label: "订单备注",
    field: "remark",
    colspan: -1,
    props: {
      type: "textarea",
      placeholder: "请输入备注",
      maxlength: 200,
      showWordLimit: true,
      disabled: isView.value
    }
  }
])

// 订单数据
const orderData = ref({
  id: "",
  no: "",
  saleCode: "",
  type: 1,
  source: 1,
  status: 1,
  productionProgress: 0,
  productModelName: "",
  productModelSpec: "",
  productModelCode: "",
  deliveryDate: "",
  orderAmount: 0,
  scheduledQuantity: 0,
  completeAmount: 0,
  unitName: "",
  decimalNumber: 2,
  createTime: "",
  createByName: "",
  remark: ""
})

/**
 * 工艺流程信息描述项
 */
const descData = computed(() => {
  const craftData = curOrderCraftData.value || {}
  // 判断是否是编辑订单工艺后生效的临时版本（orderProcessType === 2 表示订单工艺）
  const isTempVersion = craftData.orderProcessType === 2

  return {
    version: isTempVersion ? "临时版本" : (craftData.sourceVersion || "-"),
    remark: isTempVersion ? "" : (craftData.remark || "-")
  }
})

const descConfigs = computed<ICustomDescriptionConfig[]>(() => {
  return [
    { field: "version", label: "工艺路线版本：" },
    { field: "remark", label: "备注：" }
  ]
})

/**
 * 表格配置
 */
const materialTableConfig = ref<ITableConfig>({
  height: 300,
  stripe: true,
  columns: [
    { prop: "productModelName", label: "物料名称", minWidth: 160, showOverflowTooltip: true },
    { prop: "productModelCode", label: "编号", minWidth: 160, showOverflowTooltip: true },
    { prop: "processSerials", label: "投料工序", minWidth: 160, showOverflowTooltip: true, slots: { default: "serials-default" } },
    { prop: "totalAmount", label: "投料数量", width: 120, align: "right", showOverflowTooltip: true },
    { prop: "unitName", label: "单位", width: 90, align: "center", showOverflowTooltip: true }
  ]
})

// 模拟数据
const mockOrderData: Record<string, any> = {
  "1": {
    id: "1",
    no: "PO20240901001",
    saleCode: "WO2024090001",
    type: 1,
    source: 2,
    status: 5,
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
    createByName: "张三",
    remark: "ERP同步订单",
    techProcessId: "tech001",
    productModelId: "prod001"
  },
  "2": {
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
    createByName: "李四",
    remark: "紧急订单",
    techProcessId: "tech002",
    productModelId: "prod002"
  },
  "3": {
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
    createByName: "王五",
    remark: "返工订单",
    techProcessId: "tech003",
    productModelId: "prod003"
  },
  "po-unreview-1": {
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
    createByName: "赵六",
    remark: "待复核订单",
    techProcessId: "tech004",
    productModelId: "prod004"
  },
  "po-review-1": {
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
    createByName: "钱七",
    remark: "部分完成订单",
    techProcessId: "tech005",
    productModelId: "prod005"
  },
  "po-void-1": {
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
    createByName: "孙八",
    remark: "已作废订单",
    techProcessId: "tech006",
    productModelId: "prod006"
  }
}

// 模拟物料数据
const mockMaterialData: Record<string, IProductionOrderMaterialItem[]> = {
  "tech001": [
    { productModelName: "物料A1", productModelCode: "M001", processSerials: ["工序1", "工序2"], totalAmount: 500, unitName: "PCS", decimalNumber: 2 },
    { productModelName: "物料A2", productModelCode: "M002", processSerials: ["工序1"], totalAmount: 300, unitName: "PCS", decimalNumber: 2 }
  ],
  "tech002": [
    { productModelName: "物料B1", productModelCode: "M003", processSerials: ["工序1", "工序2", "工序3"], totalAmount: 1000, unitName: "PCS", decimalNumber: 2 }
  ],
  "tech003": [
    { productModelName: "物料C1", productModelCode: "M004", processSerials: ["工序1"], totalAmount: 250, unitName: "PCS", decimalNumber: 2 },
    { productModelName: "物料C2", productModelCode: "M005", processSerials: ["工序2"], totalAmount: 250, unitName: "PCS", decimalNumber: 2 }
  ],
  "tech004": [
    { productModelName: "物料D1", productModelCode: "M006", processSerials: ["工序1", "工序2"], totalAmount: 400, unitName: "PCS", decimalNumber: 2 },
    { productModelName: "物料D2", productModelCode: "M007", processSerials: ["工序3"], totalAmount: 200, unitName: "PCS", decimalNumber: 2 }
  ],
  "tech005": [
    { productModelName: "物料E1", productModelCode: "M008", processSerials: ["工序1", "工序2", "工序3"], totalAmount: 600, unitName: "PCS", decimalNumber: 2 }
  ],
  "tech006": [
    { productModelName: "物料F1", productModelCode: "M009", processSerials: ["工序1"], totalAmount: 300, unitName: "PCS", decimalNumber: 2 }
  ]
}

// 加载订单数据
const loadOrderData = () => {
  loading.value = true
  // 新建模式
  if (isCreateMode.value) {
    formData.value = {
      id: "",
      deliveryDate: "",
      no: "",
      orderAmount: undefined,
      productModelId: "",
      productModelName: "",
      source: 1,
      productionMethod: 1,
      type: 1,
      techProcessId: "",
      unitId: "",
      unitName: "",
      specifiedInboundWarehouseId: undefined,
      productModelNo: "",
      orderId: "",
      originalOrderNo: "",
      productBatchId: "",
      productBatchNo: "",
      remark: "",
      saleList: []
    }
    productModelOptions.value = [
      { label: "产品A", value: "prod001" },
      { label: "产品B", value: "prod002" },
      { label: "产品C", value: "prod003" }
    ]
    materialTableData.value = []
    processTableData.value = []
    outputTableData.value = []
    curOrderCraftData.value = {}
    craftTabValue.value = 1
    orderData.value = {
      status: 1,
      createTime: "",
      createByName: ""
    }
    loading.value = false
    return
  }
  setTimeout(() => {
    const data = mockOrderData[props.id]
    if (data) {
      orderData.value = { ...data }
      formData.value = {
        id: data.id,
        no: data.no,
        deliveryDate: data.deliveryDate || "",
        orderAmount: data.orderAmount,
        productModelId: data.productModelId,
        productModelName: data.productModelName,
        source: data.source,
        techProcessId: data.techProcessId,
        type: data.type,
        unitId: "",
        unitName: data.unitName,
        specifiedInboundWarehouseId: undefined,
        productionMethod: 1,
        productModelNo: data.productModelCode,
        orderId: "",
        originalOrderNo: "",
        productBatchId: "",
        productBatchNo: "",
        remark: data.remark || "",
        saleList: []
      }
      productModelOptions.value = [{ label: data.productModelName, value: data.productModelId }]

      // 加载工艺信息
      curOrderCraftData.value = {
        orderProcessType: 1,
        no: "CP202409001",
        sourceVersion: "V1.0",
        sourceNo: "GYLX001",
        id: "craft001"
      }

      // 加载物料数据
      materialTableData.value = mockMaterialData[data.techProcessId] || []
    }
    loading.value = false
  }, 300)
}

const handleBack = () => {
  emit("close")
}

const handleSave = async () => {
  // 新建模式验证
  if (isCreateMode.value) {
    if (!formData.value.productModelId) {
      ElMessage.warning("请选择产品")
      return
    }
    // 返工/改制类型需要选择生产批次
    if ([EnumProductionOrderType.REPAIR, EnumProductionOrderType.REMODEL].includes(formData.value.type)) {
      if (!formData.value.productBatchId) {
        ElMessage.warning("请选择生产批次")
        return
      }
    }
    if (!formData.value.orderAmount || formData.value.orderAmount <= 0) {
      ElMessage.warning("请输入订单数量")
      return
    }
    if (!formData.value.deliveryDate) {
      ElMessage.warning("请选择交货日期")
      return
    }
  }

  loading.value = true
  setTimeout(() => {
    ElMessage.success(isCreateMode.value ? "创建成功" : "保存成功")
    loading.value = false
    emit("success")
  }, 500)
}

/**
 * 编辑订单工艺 - 在当前页面打开订单工艺配置
 */
const onEditCraftFlowClick = () => {
  if (!formData.value.techProcessId) {
    ElMessage.warning("请先选择工艺流程")
    return
  }

  // 设置订单工艺配置数据
  craftConfigData.value = {
    craftRouteId: curOrderCraftData.value.id || formData.value.techProcessId,
    techVersionId: "",
    craftType: EnumParentCraftType.CRAFT_ROUTE,
    isOrderCraft: true,
    orderInfo: {
      id: formData.value.id,
      no: formData.value.no,
      type: formData.value.type as EnumProductionOrderType,
      status: orderData.value.status
    } as IProductionOrderItem
  }

  // 显示订单工艺配置页面
  showCraftConfig.value = true
  emit("craft-config-change", true)
}

/**
 * 关闭订单工艺配置页面
 */
const handleCraftConfigClose = () => {
  showCraftConfig.value = false
  emit("craft-config-change", false)
}

/**
 * 订单工艺配置更新回调
 */
const handleCraftConfigUpdate = (data: ICraftConfigInfo) => {
  // 刷新工艺流程信息，设置orderProcessType为2表示订单工艺（临时版本）
  curOrderCraftData.value = {
    ...curOrderCraftData.value,
    ...data,
    orderProcessType: 2,
    remark: ""
  }
  showCraftConfig.value = false
  ElMessage.success("订单工艺配置更新成功")
}

/**
 * 处理工艺流程下拉菜单命令
 */
const handleCraftCommand = (command: string) => {
  if (!formData.value.productModelId) {
    ElMessage.warning("请先选择产品")
    return
  }

  if (command === "copy") {
    // 复制已有的工艺路线
    selectCraftVisible.value = true
  } else if (command === "create") {
    // 创建新的订单工艺
    onCreateCraftRouteClick()
  }
}

// 选择工艺流程
const handleSelectCraft = () => {
  if (!formData.value.productModelId && isCreateMode.value) {
    ElMessage.warning("请先选择产品")
    return
  }
  selectCraftVisible.value = true
}

/**
 * 复制已有工艺路线
 */
const onCopyCraftRouteClick = () => {
  if (!formData.value.productModelId) {
    ElMessage.warning("请先选择产品")
    return
  }
  selectCraftVisible.value = true
}

/**
 * 创建新的订单工艺
 */
const onCreateCraftRouteClick = () => {
  if (!formData.value.productModelId) {
    ElMessage.warning("请先选择产品")
    return
  }
  // 模拟创建订单工艺
  loading.value = true
  setTimeout(() => {
    curOrderCraftData.value = {
      orderProcessType: 2,
      no: `CP${Date.now()}`,
      sourceVersion: "",
      sourceNo: "",
      id: `craft_${Date.now()}`
    }
    formData.value.techProcessId = curOrderCraftData.value.id
    materialTableData.value = []
    ElMessage.success("创建订单工艺成功")
    loading.value = false
  }, 500)
}

/**
 * 选择工艺路线回调
 */
const selectCraftRouteOk = (data: any[]) => {
  if (data.length) {
    // 模拟复制工艺路线
    loading.value = true
    setTimeout(() => {
      const craftRoute = data[0]
      curOrderCraftData.value = {
        orderProcessType: 1,
        no: craftRoute.id,
        sourceVersion: craftRoute.version || "V1.0",
        sourceNo: craftRoute.no,
        remark: craftRoute.remarks || "",
        id: craftRoute.id
      }
      formData.value.techProcessId = craftRoute.id
      selectedCraftId.value = craftRoute.id
      // 模拟加载物料数据
      materialTableData.value = mockMaterialData["tech001"] || []
      ElMessage.success("选择工艺路线成功")
      loading.value = false
    }, 500)
  }
}

/** 生产批次选择成功回调 */
const selectProductionBatchSuccess = (batches: any[]) => {
  const batchInfo = batches?.[0]
  if (batchInfo) {
    formData.value.productBatchId = batchInfo.id || ""
    formData.value.productBatchNo = batchInfo.batchNo || ""
    // 回显生产批次产品信息
    formData.value.productModelId = batchInfo.productModelId || ""
    formData.value.productModelName = batchInfo.productModelName || ""
    formData.value.productModelNo = batchInfo.productModelCode || ""
    formData.value.unitName = batchInfo.unitName || ""
    formData.value.orderAmount = Number(batchInfo.batchQuantity || 0) || formData.value.orderAmount
    // 清空工艺信息
    curOrderCraftData.value = {}
    materialTableData.value = []
    productModelOptions.value = [
      { label: batchInfo.productModelName || "", value: batchInfo.productModelId || "" }
    ]
    ElMessage.success("选择生产批次成功")
  }
}

/** 清除生产批次 */
const onClearProductBatch = () => {
  formData.value.productBatchId = ""
  formData.value.productBatchNo = ""
}

// 监听产品选择变化，自动填充产品信息
watch(
  () => formData.value.productModelName,
  (newVal) => {
    if (isCreateMode.value && newVal && productModelOptions.value.length > 0) {
      const product = productModelOptions.value.find((p) => p.value === newVal)
      if (product) {
        formData.value.productModelId = product.value
        formData.value.productModelNo = `P${product.value.slice(-3)}`
        formData.value.unitName = "PCS"
        formData.value.unitId = "unit001"

        // 根据产品设置对应的工艺路线
        // 工艺路线数据结构：支持多条工艺路线
        const techMap: Record<string, { techId: string; craftNo: string; craftId: string; version: string; remark: string; materials: IProductionOrderMaterialItem[]; processes: any[]; outputs: any[] }[]> = {
          "prod001": [
            {
              techId: "tech001",
              craftNo: "CP202409001",
              craftId: "craft001",
              version: "V1.0",
              remark: "工艺路线备注1",
              materials: [
                { productModelName: "物料A1", productModelCode: "M001", processSerials: ["工序1", "工序2"], totalAmount: 500, unitName: "PCS", decimalNumber: 2 },
                { productModelName: "物料A2", productModelCode: "M002", processSerials: ["工序1"], totalAmount: 300, unitName: "PCS", decimalNumber: 2 }
              ],
              processes: [
                { serial: "10", techName: "粗车", nature: "粗加工", totalAmount: 1000, finishAmount: 0, unitName: "PCS" },
                { serial: "20", techName: "精车", nature: "精加工", totalAmount: 1000, finishAmount: 0, unitName: "PCS" },
                { serial: "30", techName: "钻孔", nature: "加工", totalAmount: 1000, finishAmount: 0, unitName: "PCS" },
                { serial: "40", techName: "检验", nature: "检验", totalAmount: 1000, finishAmount: 0, unitName: "PCS" }
              ],
              outputs: [
                { productModelName: "产品A", productModelCode: "P001", specification: "规格A-001", outputAmount: 1000, unitName: "PCS", remark: "主产品" }
              ]
            }
          ],
          "prod002": [
            {
              techId: "tech002",
              craftNo: "CP202409002",
              craftId: "craft002",
              version: "V1.0",
              remark: "工艺路线备注2",
              materials: [
                { productModelName: "物料B1", productModelCode: "M003", processSerials: ["工序1", "工序2", "工序3"], totalAmount: 1000, unitName: "PCS", decimalNumber: 2 }
              ],
              processes: [
                { serial: "10", techName: "切割", nature: "粗加工", totalAmount: 2000, finishAmount: 0, unitName: "PCS" },
                { serial: "20", techName: "焊接", nature: "加工", totalAmount: 2000, finishAmount: 0, unitName: "PCS" },
                { serial: "30", techName: "打磨", nature: "精加工", totalAmount: 2000, finishAmount: 0, unitName: "PCS" }
              ],
              outputs: [
                { productModelName: "产品B-主材", productModelCode: "P002-A", specification: "规格B-主材", outputAmount: 1800, unitName: "PCS", remark: "主产品" },
                { productModelName: "产品B-尾料", productModelCode: "P002-B", specification: "规格B-尾料", outputAmount: 150, unitName: "PCS", remark: "尾料" }
              ]
            },
            {
              techId: "tech002-2",
              craftNo: "CP202409002-2",
              craftId: "craft002-2",
              version: "V2.0",
              remark: "工艺路线备注2-2",
              materials: [
                { productModelName: "物料B1", productModelCode: "M003", processSerials: ["工序1", "工序2", "工序3"], totalAmount: 1500, unitName: "PCS", decimalNumber: 2 }
              ],
              processes: [
                { serial: "10", techName: "切割", nature: "粗加工", totalAmount: 1500, finishAmount: 0, unitName: "PCS" },
                { serial: "20", techName: "焊接", nature: "加工", totalAmount: 1500, finishAmount: 0, unitName: "PCS" }
              ],
              outputs: [
                { productModelName: "产品B-主材", productModelCode: "P002-A", specification: "规格B-主材", outputAmount: 1400, unitName: "PCS", remark: "主产品" },
                { productModelName: "产品B-尾料", productModelCode: "P002-B", specification: "规格B-尾料", outputAmount: 80, unitName: "PCS", remark: "尾料" }
              ]
            }
          ],
          "prod003": [
            {
              techId: "tech003",
              craftNo: "CP202409003",
              craftId: "craft003",
              version: "V1.0",
              remark: "工艺路线备注3",
              materials: [
                { productModelName: "物料C1", productModelCode: "M004", processSerials: ["工序1"], totalAmount: 250, unitName: "PCS", decimalNumber: 2 },
                { productModelName: "物料C2", productModelCode: "M005", processSerials: ["工序2"], totalAmount: 250, unitName: "PCS", decimalNumber: 2 }
              ],
              processes: [
                { serial: "10", techName: "冲压", nature: "成型", totalAmount: 500, finishAmount: 0, unitName: "PCS" },
                { serial: "20", techName: "折弯", nature: "成型", totalAmount: 500, finishAmount: 0, unitName: "PCS" }
              ],
              outputs: [
                { productModelName: "产品C", productModelCode: "P003", specification: "规格C-003", outputAmount: 500, unitName: "PCS", remark: "主产品" }
              ]
            }
          ]
        }

        const techList = techMap[product.value]
        if (techList && techList.length > 0) {
          // 只有一条工艺路线时，直接选择
          if (techList.length === 1) {
            const techInfo = techList[0]
            formData.value.techProcessId = techInfo.techId
            curOrderCraftData.value = {
              orderProcessType: 1,
              no: techInfo.craftId,
              sourceVersion: techInfo.version,
              sourceNo: techInfo.craftNo,
              remark: techInfo.remark,
              id: techInfo.craftId
            }
            materialTableData.value = techInfo.materials
            processTableData.value = techInfo.processes
            outputTableData.value = techInfo.outputs
          } else {
            // 多条工艺路线时，弹出选择弹窗
            selectCraftVisible.value = true
          }
        }
      }
    }
  }
)

onMounted(() => {
  loadOrderData()
})
</script>

<style lang="scss" scoped>
.order-edit-view {
  height: 100%;
  color: #303133;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fff;
}

.craft-config-wrapper {
  height: 100%;
  overflow: hidden;
}

.update-production-order {
  height: 100%;
  display: flex;
  flex-direction: column;

  .production-order-content {
    overflow-y: auto;
    width: 100%;
    flex: 1;
  }
}

.top-back {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin: 12px 20px;
}

.top-back .el-button {
  margin-left: 8px;
}

.top-back .el-button:first-child {
  margin-left: 0;
}

.production-batch-wrap {
  display: flex;
  align-items: center;
}

.craft-flow {
  position: relative;
  padding: 6px 20px 0;
}

.production-material {
  padding: 0 20px 16px;
}

.tab-group {
  margin: 12px 0;
}

.layout-footer {
  padding: 16px 20px;
  border-top: 1px solid #e4e7ed;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background: #fff;
}
</style>
