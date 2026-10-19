<template>
  <CustomTitle title="" style="margin-top: 0">
    <div class="toolbar-row">
      <div class="toolbar-row__main">
        <el-input
          v-model="keyword"
          placeholder="请输入检验项名称/编号"
          style="width: 220px"
          clearable
          :prefix-icon="Search"
        />
        <span v-if="!isReadonly && selectedRowCount" class="selected-summary">
          已勾选 {{ selectedRowCount }} 条
        </span>
      </div>
      <template v-if="!isReadonly">
        <div class="toolbar-row__actions">
          <el-button type="danger" plain :disabled="!hasSelectedRows" @click="onBatchDelete">
            批量删除
          </el-button>
          <el-button :disabled="!hasSelectedRows" @click="onBatchStatusChange(1)"
            >批量启用</el-button
          >
          <el-button :disabled="!hasSelectedRows" @click="onBatchStatusChange(0)"
            >批量停用</el-button
          >
          <el-button :disabled="!isAll" @click="onOpenImportDialog">从其他产品带入</el-button>
          <el-button :disabled="!isAll" type="primary" icon="Plus" @click="onAdd">新增检验项</el-button>
        </div>
      </template>
    </div>
  </CustomTitle>

  <el-tabs
    v-model="activeTab"
    type="border-card"
    class="custom-tabs"
    :before-leave="handleBeforeLeave"
  >
    <el-tab-pane :name="EnumTab.ALL">
      <template #label>
        <span>{{ getTabLabel(EnumTab.ALL, "全部类型") }}</span>
        <el-tooltip
          effect="dark"
          content="除生产过程控制（工序-过程检中维护）以外的检验场景"
          placement="top-start"
        >
          <div class="custom-tooltip-icon">?</div>
        </el-tooltip>
      </template>
    </el-tab-pane>
    <el-tab-pane :name="EnumTab.PURCHASE">
      <template #label
        ><span>{{ getTabLabel(EnumTab.PURCHASE, "采购入库检") }}</span></template
      >
    </el-tab-pane>
    <el-tab-pane :name="EnumTab.OUT">
      <template #label
        ><span>{{ getTabLabel(EnumTab.OUT, "委外入库检") }}</span></template
      >
    </el-tab-pane>
    <el-tab-pane :name="EnumTab.PRODUCTION">
      <template #label
        ><span>{{ getTabLabel(EnumTab.PRODUCTION, "生产入库检") }}</span></template
      >
    </el-tab-pane>
    <el-tab-pane :name="EnumTab.RETURN">
      <template #label>
        <span>{{ getTabLabel(EnumTab.RETURN, "退货入库检") }}</span>
        <el-tooltip effect="dark" content="销售退货产品入库前的质量检验" placement="top-start">
          <div class="custom-tooltip-icon">?</div>
        </el-tooltip>
      </template>
    </el-tab-pane>
    <el-tab-pane :name="EnumTab.IN_LOCATION">
      <template #label
        ><span>{{ getTabLabel(EnumTab.IN_LOCATION, "在库检") }}</span></template
      >
    </el-tab-pane>
    <el-tab-pane :name="EnumTab.OUT_RETURN">
      <template #label>
        <span>{{ getTabLabel(EnumTab.OUT_RETURN, "委外退料入库检") }}</span>
        <el-tooltip effect="dark" content="供应商退还物料入库前的质量检验" placement="top-start">
          <div class="custom-tooltip-icon">?</div>
        </el-tooltip>
      </template>
    </el-tab-pane>
  </el-tabs>

  <CustomTable
    ref="tableRef"
    :table-data="tableData"
    :config="tableConfig"
    class="custom-detail-table"
    @select-change="onTableSelectionChange"
    @select-all="onTableSelectionChange"
  >
    <template #inspectType-default="{ row }">
      <span v-if="isAll">{{ formatInspectTypeDisplay(row.samplingConfigs) }}</span>
      <span v-else>{{ formatInspectType(row.inspectType) || "-" }}</span>
    </template>

    <template #status-default="{ row }">
      <div class="status-cell">
        <el-switch v-if="!isReadonly && isAll" v-model="row.status" :active-value="1" :inactive-value="0" @change="markRowDirty(row)" />
        <el-tag v-else :type="row.status === 0 ? 'info' : 'success'" effect="light" size="small">
          {{ formatStatus(row.status) }}
        </el-tag>
        <span v-if="!isReadonly && isAll" class="status-text" :class="{ 'is-disabled': row.status === 0 }">
          {{ formatStatus(row.status) }}
        </span>
      </div>
    </template>

    <template #inspectItemName-default="{ row }">
      <el-input
        v-if="!isReadonly && isAll"
        v-model.trim="row.inspectItemName"
        placeholder="请输入检验项名称"
        clearable
        @input="markRowDirty(row)"
      />
      <span v-else>{{ row.inspectItemName || "-" }}</span>
    </template>

    <template #inspectItemCode-default="{ row }">
      <el-input
        v-if="!isReadonly && isAll"
        v-model.trim="row.inspectItemCode"
        placeholder="请输入检验项编号"
        clearable
        @input="markRowDirty(row)"
      />
      <span v-else>{{ row.inspectItemCode || "-" }}</span>
    </template>

    <template #methodDesc-default="{ row }">
      <el-input
        v-if="!isReadonly && isAll"
        v-model.trim="row.methodDesc"
        placeholder="请输入探测方式"
        clearable
        @input="markRowDirty(row)"
      />
      <span v-else>{{ row.methodDesc || "-" }}</span>
    </template>

    <template #standardType-default="{ row }">
      <el-select
        v-if="!isReadonly && isAll"
        v-model="row.standardType"
        class="table-select"
        @change="onStandardTypeChange(row, $event)"
      >
        <el-option label="定量" :value="1" />
        <el-option label="定性" :value="2" />
      </el-select>
      <span v-else>{{ row.standardType === 1 ? "定量" : "定性" }}</span>
    </template>

    <template #standardValue-default="{ row }">
      <div class="standard-cell">
        <template v-if="!isReadonly && isAll && Number(row.standardType) === 2">
          <el-input v-model.trim="row.standardDesc" placeholder="请输入检验标准" clearable @input="markRowDirty(row)" />
        </template>
        <el-tooltip
          v-else
          :content="buildStandardPreview(row) || '-'"
          placement="top"
          :show-after="300"
        >
          <span class="standard-text">{{ buildStandardPreview(row) || "-" }}</span>
        </el-tooltip>
        <el-button
          v-if="!isReadonly && Number(row.standardType) !== 2"
          type="primary"
          link
          size="small"
          @click="onEdit(row)"
        >
          详情配置
        </el-button>
      </div>
    </template>

    <template #samplingMethod-default="{ row }">
      <el-select
        v-if="!isReadonly && isAll"
        v-model="row.samplingMethod"
        class="table-select"
        @change="onSamplingMethodChange(row, $event)"
      >
        <el-option
          v-for="item in samplingMethodOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <span v-else>{{
        EnumProductionSamplingMethodMap[row.samplingMethod as EnumProductionSamplingMethod] || "-"
      }}</span>
    </template>

    <template #samplingRatio-default="{ row }">
      <el-input-number
        v-if="!isReadonly && isAll && row.samplingMethod === EnumProductionSamplingMethod.PERCENTAGE"
        v-model="row.samplingRatio"
        :min="0"
        :max="100"
        :precision="2"
        :controls="false"
        class="table-number-input"
        placeholder="请输入比例"
        @change="markRowDirty(row)"
      />
      <span v-else class="summary-text" :class="{ 'is-muted': formatSamplingRatio(row) === '-' }">
        {{ formatSamplingRatio(row) }}
      </span>
    </template>

    <template #gradientModelId-default="{ row }">
      <el-select
        v-if="!isReadonly && isAll && row.samplingMethod === EnumProductionSamplingMethod.GRADIENT"
        v-model="row.gradientModelId"
        class="table-select"
        placeholder="请选择梯度方式"
        filterable
        @change="markRowDirty(row)"
      >
        <el-option
          v-for="item in gradientOptions"
          :key="item.value"
          :label="item.label"
          :value="String(item.value)"
        />
      </el-select>
      <span
        v-else
        class="summary-text"
        :class="{ 'is-muted': formatGradientModel(row.gradientModelId) === '-' }"
      >
        {{ formatGradientModel(row.gradientModelId) }}
      </span>
    </template>

    <template #isSampleReturn-default="{ row }">
      <div class="sample-return-cell">
        <el-switch v-if="!isReadonly && isAll" v-model="row.isSampleReturn" @change="markRowDirty(row)" />
        <span class="summary-text">{{ row.isSampleReturn ? "还回" : "不还回" }}</span>
      </div>
    </template>

    <template #operation-default="{ row }">
      <el-button type="primary" link size="small" @click="onEdit(row)" v-if="isAll"
        >详情配置</el-button
      >
      <el-button
        type="primary"
        link
        size="small"
        @click="onOpenSamplingConfigDialog(row)"
        v-if="isAll"
        >抽检配置</el-button
      >
      <el-button type="primary" link size="small" @click="onCopy(row)" v-if="isAll">复制</el-button>
      <el-button type="danger" link size="small" @click="onDelete(row)" v-if="isAll"
        >删除</el-button
      >
    </template>
  </CustomTable>

  <div v-if="!isReadonly" class="inspect-footer">
    <span class="save-status" :class="{ 'is-dirty': activeTabDirty }">{{
      activeTabStatusText
    }}</span>
    <div class="footer-actions">
      <el-button :disabled="!isAll" :loading="saveLoading" @click="onSaveAll">保存全部</el-button>
    </div>
  </div>

  <ProductInspectForm
    v-model="productInspectFormVisible"
    :title="productInspectFormTitle"
    :is-edit="currentEditingId !== ''"
    :form-data="inspectDemandForm"
    @onOk="onFormSubmit"
    @cancel="onFormCancel"
  />

  <el-dialog v-model="importVisible" title="从其他产品带入检验项配置" width="860px" append-to-body>
    <div class="import-toolbar">
      <el-input v-model.trim="importKeyword" clearable placeholder="搜索产品编号、产品名称、规格" />
    </div>
    <el-table
      :data="filteredImportProductList"
      height="420"
      v-loading="importLoading"
      @row-click="onSelectImportProduct"
    >
      <el-table-column label="选择" width="72" align="center">
        <template #default="{ row }">
          <el-radio
            :model-value="selectedImportProductId === row.id"
            :label="true"
            @change="onSelectImportProduct(row)"
          >
            &nbsp;
          </el-radio>
        </template>
      </el-table-column>
      <el-table-column prop="code" label="产品编号" min-width="150" />
      <el-table-column prop="name" label="产品名称" min-width="180" />
      <el-table-column prop="specification" label="规格" min-width="160" />
      <el-table-column prop="productCategoryName" label="产品分类" min-width="140" />
    </el-table>
    <template #footer>
      <el-button @click="importVisible = false">取消</el-button>
      <el-button type="primary" @click="onImportConfirm">整套带入</el-button>
    </template>
  </el-dialog>

  <ProductSamplingConfigDialog
    v-model="samplingConfigDialogVisible"
    :initial-data="samplingConfigData"
    @confirm="onSamplingConfigConfirm"
  />
</template>

<script setup lang="ts">
import { Search } from "@element-plus/icons-vue"
import { ElMessage, ElMessageBox } from "element-plus"

import {
  batchSaveProductInspectAll,
  getProductInspectList,
  queryProductModelPageList,
} from "@/api/product"
import { queryGradientList } from "@/api/quality/gradientModel"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import type { InspectDemandForm } from "@/components/InspectForm/type"
import {
  EnumProductInspectionMode,
  type EnumProductInspectionType,
  EnumProductInspectionTypeMap,
  EnumProductionSamplingMethod,
  EnumProductionSamplingMethodMap
} from "@/constant/enums"
import useResetRef from "@/hooks/useResetRef"
import type {
  InspectItemDetailParams,
  IProductInspectDetailCreateParams,
  IProductInspectListItem,
  IProductModelItem
} from "@/types/base-info/product"
import type { IOption } from "@/types/common"
import { isNumberStandardValid } from "@/utils"
import { typeNumberHandle } from "@/utils/inspectStandard"

import ProductInspectForm from "./ProductInspectForm.vue"
import ProductSamplingConfigDialog from "./ProductSamplingConfigDialog.vue"

type IQuantitativeMode = "lower" | "upper" | "range"

type IProductInspectDemandForm = Omit<InspectDemandForm, "inspectType" | "inspectionStandard"> & {
  inspectType?: number
  status: number
  samplingMethod: number
  samplingRatio: string
  gradientModelId: string
  isSampleReturn: boolean
  inspectionStandard: Omit<
    InspectDemandForm["inspectionStandard"],
    "standardMax" | "standardMin"
  > & {
    standardMax?: number | null
    standardMin?: number | null
    unitName?: string
    quantitativeMode?: IQuantitativeMode
    standardValue?: number | string | null
    upperTolerance?: number | string | null
    lowerTolerance?: number | string | null
    upperToleranceSign?: "+" | "-"
    lowerToleranceSign?: "+" | "-"
  }
}

interface ISamplingConfig {
  inspectionMode: number
  inspectType: number
  samplingMethod: number
  samplingRatio: number | undefined
  gradientModelId: string
}

interface ILocalInspectRow extends Omit<IProductInspectListItem, "standardMax" | "standardMin"> {
  id: string
  status: number
  samplingMethod: number
  samplingRatio?: number
  gradientModelId: string
  quantitativeMode?: IQuantitativeMode
  standardMax?: number
  standardMin?: number
  standardValue?: number | string
  upperTolerance?: number | string | null
  lowerTolerance?: number | string | null
  upperToleranceSign?: "+" | "-"
  lowerToleranceSign?: "+" | "-"
  isSampleReturn: boolean
  samplingConfigs: ISamplingConfig[]
  isSaved: boolean
}

type IInspectSavePayload = InspectItemDetailParams & {
  id: string
  inspectItemName: string
  inspectType: number
  samplingConfigs: ISamplingConfig[]
}

enum EnumTab {
  ALL = 0,
  PURCHASE = 7,
  OUT = 8,
  PRODUCTION = 9,
  SHIPPING = 10,
  RETURN = 11,
  IN_LOCATION = 12,
  OUT_RETURN = 13
}

type IProductInspectTabExpose = {
  hasDirty: () => boolean
  confirmBeforeLeave: () => Promise<boolean>
}

const INSPECT_TYPE_TABS = [
  EnumTab.PURCHASE,
  EnumTab.OUT,
  EnumTab.PRODUCTION,
  EnumTab.RETURN,
  EnumTab.IN_LOCATION,
  EnumTab.OUT_RETURN
] as const

const TEMP_ID_PREFIX = "temp-product-inspect-"

const props = withDefaults(
  defineProps<{
    id: string
    isReadonly?: boolean
  }>(),
  {
    id: "",
    isReadonly: false
  }
)

const activeTab = ref<EnumTab>(EnumTab.ALL)
const isAll = computed(() => activeTab.value === EnumTab.ALL)
const keyword = ref("")
const tableRef = ref<ComponentExposed<typeof CustomTable>>()
const draftRows = ref<ILocalInspectRow[]>([])
const selectedRows = ref<ILocalInspectRow[]>([])
const saveLoading = ref(false)
const importVisible = ref(false)
const importLoading = ref(false)
const importKeyword = ref("")
const selectedImportProductId = ref("")
const importProductList = ref<IProductModelItem[]>([])
const currentEditingId = ref("")
const productInspectFormVisible = ref(false)
const samplingConfigDialogVisible = ref(false)
const samplingConfigId = ref<string>("")
const samplingConfigData = ref<
  Array<{
    inspectionMode: number
    inspectType: number
    samplingMethod: number
    samplingRatio: number | undefined
    gradientModelId: string
  }>
>([])

const savedPayloadText = reactive<Record<number, string>>({
  [EnumTab.PURCHASE]: "[]",
  [EnumTab.OUT]: "[]",
  [EnumTab.PRODUCTION]: "[]",
  [EnumTab.RETURN]: "[]",
  [EnumTab.IN_LOCATION]: "[]",
  [EnumTab.OUT_RETURN]: "[]"
})
const snapshotLoaded = reactive<Record<number, boolean>>({
  [EnumTab.PURCHASE]: false,
  [EnumTab.OUT]: false,
  [EnumTab.PRODUCTION]: false,
  [EnumTab.RETURN]: false,
  [EnumTab.IN_LOCATION]: false,
  [EnumTab.OUT_RETURN]: false
})
const lastSavedAt = reactive<Record<number, string>>({
  [EnumTab.PURCHASE]: "",
  [EnumTab.OUT]: "",
  [EnumTab.PRODUCTION]: "",
  [EnumTab.RETURN]: "",
  [EnumTab.IN_LOCATION]: "",
  [EnumTab.OUT_RETURN]: ""
})
const allSavedAt = ref("")

const [inspectDemandForm, resetInspectDemandForm] = useResetRef<IProductInspectDemandForm>({
  id: "",
  productModelId: "",
  status: 1,
  inspectItemName: "",
  inspectItemCode: "",
  inspectItemId: "",
  inspectType: undefined,
  inspectionStandard: {
    standardDesc: "",
    standardMax: 0,
    standardMaxInclusive: 0,
    standardMin: 0,
    standardMinInclusive: 1,
    standardType: 2,
    quantitativeMode: "lower",
    standardValue: undefined,
    upperTolerance: undefined,
    lowerTolerance: undefined,
    upperToleranceSign: "+",
    lowerToleranceSign: "-",
    unitId: "",
    unitName: ""
  },
  methodDesc: "",
  laboratoryIdList: [],
  imageUrls: [],
  imageIds: [],
  samplingMethod: EnumProductionSamplingMethod.PERCENTAGE,
  samplingRatio: "",
  gradientModelId: "",
  isSampleReturn: false
})

const inspectTypeOptions = computed<IOption[]>(() =>
  INSPECT_TYPE_TABS.map((tab) => ({
    label: EnumProductInspectionTypeMap[tab as unknown as EnumProductInspectionType],
    value: tab
  }))
)
const samplingMethodOptions = computed<IOption[]>(() =>
  Object.entries(EnumProductionSamplingMethodMap).map(([key, label]) => ({
    label,
    value: Number(key)
  }))
)
const gradientOptions = ref<IOption[]>([])

const tableData = computed(() => {
  const keywordText = keyword.value.trim()
  if (activeTab.value === EnumTab.ALL) {
    return draftRows.value.filter((row) => {
      if (!keywordText) return true
      return [row.inspectItemName, row.inspectItemCode].some((field) =>
        String(field || "").includes(keywordText)
      )
    })
  }else {
    const list =  draftRows.value.filter((row) => {
      const hasMatchingType = row.samplingConfigs?.some(
        (config) => config.inspectType === activeTab.value
      )
      if (!hasMatchingType) return false
    if (!keywordText) return true
    return [row.inspectItemName, row.inspectItemCode].some((field) =>
      String(field || "").includes(keywordText)
    )
  })
  return list.map(item => {
    const obj = item.samplingConfigs?.find((config) => config.inspectType === activeTab.value)
    return {
      ...item,
      inspectionMode: obj?.inspectionMode || EnumProductInspectionMode.SAMPLING,
      inspectType: activeTab.value,
      samplingMethod: obj?.samplingMethod || EnumProductionSamplingMethod.PERCENTAGE,
      samplingRatio: obj?.samplingRatio || undefined,
      gradientModelId: obj?.gradientModelId || '',
      }
    })
  }
})
const selectedRowCount = computed(() => selectedRows.value.length)
const hasSelectedRows = computed(() => selectedRowCount.value > 0)

const activeTabDirty = computed(() => {
  if (activeTab.value === EnumTab.ALL) {
    return draftRows.value.some((row) => !row.isSaved)
  }
  const types = getCurrentTypeTabs()
  const rows = getRowsByTypes(types)
  return rows.some((row) => !row.isSaved)
})
const hasDirty = computed(() => draftRows.value.some((row) => !row.isSaved))
const activeTabStatusText = computed(() => {
  if (saveLoading.value) return "正在保存..."
  if (activeTabDirty.value) return "当前页签未保存"

  if (activeTab.value === EnumTab.ALL) {
    return allSavedAt.value ? `当前页签已保存 ${allSavedAt.value}` : ""
  }
  return lastSavedAt[activeTab.value] ? `当前页签已保存 ${lastSavedAt[activeTab.value]}` : ""
})
const productInspectFormTitle = computed(() => (currentEditingId.value ? "详情配置" : "新增检验项"))

const filteredImportProductList = computed(() => {
  const keywordText = importKeyword.value.trim()
  const rows = importProductList.value.filter((item) => item.id !== props.id)
  if (!keywordText) return rows
  return rows.filter((item) =>
    [item.code, item.name, item.specification].some((field) =>
      String(field || "").includes(keywordText)
    )
  )
})

const tableConfig = ref<ITableConfig>({
  height: "100%",
  rowKey: "id",
  stripe: true,
  rowClassName: ({ row }) =>
    Number((row as ILocalInspectRow).status ?? 1) === 0 ? "is-disabled-row" : "",
  columns: [
    {
      prop: "selection",
      label: "",
      width: 55,
      type: "selection",
      align: "center",
      get hidden() {
        return props.isReadonly || !isAll.value
      },
      multiple: true
    },
    {
      prop: "index",
      label: "序号",
      width: 60,
      type: "index",
      align: "center"
    },
    {
      prop: "inspectType",
      label: "检验类型",
      minWidth: 140,
      slots: {
        default: "inspectType-default"
      }
    },
    {
      prop: "inspectItemName",
      label: "检验项名称",
      minWidth: 170,
      slots: {
        default: "inspectItemName-default"
      }
    },
    {
      prop: "inspectItemCode",
      label: "检验项编号",
      minWidth: 160,
      slots: {
        default: "inspectItemCode-default"
      }
    },
    {
      prop: "methodDesc",
      label: "探测方式",
      minWidth: 180,
      slots: {
        default: "methodDesc-default"
      }
    },
    {
      prop: "standardType",
      label: "检验标准类型",
      width: 130,
      slots: {
        default: "standardType-default"
      }
    },
    {
      prop: "standardValue",
      label: "检验标准",
      minWidth: 260,
      slots: {
        default: "standardValue-default"
      }
    },
    {
      prop: "samplingMethod",
      label: "抽检方式",
      width: 140,
      get hidden() {
        return isAll.value
      },
      slots: {
        default: "samplingMethod-default"
      }
    },
    {
      prop: "samplingRatio",
      label: "抽检比例",
      width: 140,
      get hidden() {
        return isAll.value
      },
      slots: {
        default: "samplingRatio-default"
      }
    },
    {
      prop: "gradientModelId",
      label: "梯度方式",
      minWidth: 160,
      get hidden() {
        return isAll.value
      },
      slots: {
        default: "gradientModelId-default"
      }
    },
    {
      prop: "isSampleReturn",
      label: "样品是否还回",
      width: 140,
      slots: {
        default: "isSampleReturn-default"
      }
    },
    {
      prop: "status",
      label: "状态",
      width: 124,
      slots: {
        default: "status-default"
      }
    },
    {
      prop: "operation",
      label: "操作",
      width: 240,
      fixed: "right",
      get hidden() {
        return props.isReadonly
      },
      slots: {
        default: "operation-default"
      }
    }
  ]
})

const createTempId = () =>
  `${TEMP_ID_PREFIX}${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
const formatSaveTime = () =>
  new Date().toLocaleTimeString("zh-CN", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  })
const isTempRow = (id?: string) => String(id || "").startsWith(TEMP_ID_PREFIX)
const hasRealValue = (value: unknown) => value !== null && value !== undefined && value !== ""

const formatInspectType = (inspectType?: number) =>
  inspectType ? EnumProductInspectionTypeMap[inspectType as EnumProductInspectionType] || "" : ""

const formatInspectTypeDisplay = (samplingConfigs?: ISamplingConfig[]) => {
  if (!samplingConfigs) return ""
  return samplingConfigs.map((item) => formatInspectType(item.inspectType || undefined)).join(", ")
}

const formatStatus = (status?: number) => (Number(status) === 0 ? "停用" : "启用")
const formatSamplingRatio = (row: Partial<ILocalInspectRow>) =>
  row.samplingMethod === EnumProductionSamplingMethod.PERCENTAGE && hasRealValue(row.samplingRatio)
    ? `${row.samplingRatio}%`
    : "-"
const formatGradientModel = (gradientModelId?: string) => {
  if (!gradientModelId) return "-"
  return (
    gradientOptions.value.find((item) => String(item.value) === String(gradientModelId))?.label ||
    gradientModelId
  )
}
const hasStandardNumericValue = (value: unknown) =>
  value !== null && value !== undefined && value !== ""
const buildRowFallbackKey = (row: Partial<ILocalInspectRow>) =>
  [
    props.id,
    Number(row.inspectType || 0),
    String(row.inspectItemCode || ""),
    String(row.inspectItemName || "")
  ]
    .join("__")
    .trim()
const normalizeNullableNumber = (value: unknown) =>
  hasStandardNumericValue(value) ? Number(value) : undefined
const inferQuantitativeMode = (row: Partial<ILocalInspectRow>) => {
  if (row.quantitativeMode === "lower" || row.quantitativeMode === "upper") {
    return row.quantitativeMode
  }
  if (
    row.quantitativeMode === "range" ||
    (hasStandardNumericValue(row.standardValue) &&
      hasStandardNumericValue(row.upperTolerance) &&
      hasStandardNumericValue(row.lowerTolerance))
  ) {
    return "range" as IQuantitativeMode
  }
  return hasStandardNumericValue(row.standardMax) ? ("upper" as IQuantitativeMode) : "lower"
}

const validateSingleIntervalRow = (row: ILocalInspectRow, quantitativeMode: IQuantitativeMode) =>
  isNumberStandardValid(
    quantitativeMode === "upper" ? Number(row.standardMax) : (undefined as unknown as number),
    quantitativeMode === "lower" ? Number(row.standardMin) : (undefined as unknown as number),
    quantitativeMode === "upper" ? !!row.standardMaxInclusive : true,
    quantitativeMode === "lower" ? !!row.standardMinInclusive : true
  )

const buildStandardPreview = (row: Partial<ILocalInspectRow>) => {
  return (
    typeNumberHandle(
      {
        standardType: Number(row.standardType || 2),
        standardDesc: String(row.standardDesc || ""),
        standardMaxInclusive: Number(row.standardMaxInclusive ?? 0),
        standardMax: normalizeNullableNumber(row.standardMax) ?? null,
        standardMinInclusive: row.standardMinInclusive === 1,
        standardMin: normalizeNullableNumber(row.standardMin) ?? null,
        quantitativeMode: inferQuantitativeMode(row),
        standardValue: normalizeNullableNumber(row.standardValue) ?? null,
        upperTolerance: normalizeNullableNumber(row.upperTolerance) ?? null,
        lowerTolerance: normalizeNullableNumber(row.lowerTolerance) ?? null,
        upperToleranceSign: row.upperToleranceSign || "+",
        lowerToleranceSign: row.lowerToleranceSign || "-",
        unitName: String(row.unitName || "")
      },
      true
    ) || ""
  )
}

const mergeRowWithFallback = (
  item: Partial<ILocalInspectRow>,
  fallback?: Partial<ILocalInspectRow>
): ILocalInspectRow =>
  normalizeRow({
    ...(fallback ? cloneDeep(fallback) : {}),
    ...cloneDeep(item),
    status: item.status ?? fallback?.status,
    samplingMethod: item.samplingMethod ?? fallback?.samplingMethod,
    samplingRatio: item.samplingRatio ?? fallback?.samplingRatio,
    gradientModelId: item.gradientModelId ?? fallback?.gradientModelId,
    isSampleReturn: item.isSampleReturn ?? fallback?.isSampleReturn,
    standardType: item.standardType ?? fallback?.standardType,
    standardDesc: item.standardDesc ?? fallback?.standardDesc,
    standardMax: item.standardMax ?? fallback?.standardMax,
    standardMaxInclusive: item.standardMaxInclusive ?? fallback?.standardMaxInclusive,
    standardMin: item.standardMin ?? fallback?.standardMin,
    standardMinInclusive: item.standardMinInclusive ?? fallback?.standardMinInclusive,
    standardValue: item.standardValue ?? fallback?.standardValue,
    upperTolerance: item.upperTolerance ?? fallback?.upperTolerance,
    lowerTolerance: item.lowerTolerance ?? fallback?.lowerTolerance,
    upperToleranceSign: item.upperToleranceSign ?? fallback?.upperToleranceSign,
    lowerToleranceSign: item.lowerToleranceSign ?? fallback?.lowerToleranceSign,
    unitId: item.unitId ?? fallback?.unitId,
    unitName: item.unitName ?? fallback?.unitName,
    samplingConfigs: item.samplingConfigs ?? fallback?.samplingConfigs
  })

const normalizeRow = (item: Partial<ILocalInspectRow>): ILocalInspectRow => ({
  createBy: String(item.createBy || ""),
  createTime: item.createTime || "",
  id: String(item.id || createTempId()),
  status: Number(item.status ?? 1) === 0 ? 0 : 1,
  imageIds: cloneDeep(item.imageIds || []),
  imageUrls: cloneDeep(item.imageUrls || []),
  gradientModelId: String(item.gradientModelId || ""),
  inspectControl: Number(item.inspectControl || 0),
  inspectItemCode: String(item.inspectItemCode || ""),
  inspectItemId: String(item.inspectItemId || ""),
  inspectItemName: String(item.inspectItemName || ""),
  inspectRate: Number(item.inspectRate || 0),
  inspectSiteList: cloneDeep(item.inspectSiteList || []),
  inspectType: Number(item.inspectType || 0),
  laboratoryIdList: cloneDeep(item.laboratoryIdList || []),
  methodDesc: String(item.methodDesc || ""),
  productModelId: String(item.productModelId || props.id),
  qaInspectType: String(item.qaInspectType || ""),
  qaInspectTypeName: String(item.qaInspectTypeName || ""),
  samplingMethod: Number(item.samplingMethod || EnumProductionSamplingMethod.PERCENTAGE),
  samplingRatio: hasRealValue(item.samplingRatio) ? Number(item.samplingRatio) : undefined,
  quantitativeMode: inferQuantitativeMode(item),
  spcControl: Boolean(item.spcControl),
  spcLowerSpec: Number(item.spcLowerSpec || 0),
  spcUpperSpec: Number(item.spcUpperSpec || 0),
  standardDesc: String(item.standardDesc || ""),
  standardMax: hasStandardNumericValue(item.standardMax) ? Number(item.standardMax) : undefined,
  standardMaxInclusive: Number(item.standardMaxInclusive ?? 0),
  standardMin: hasStandardNumericValue(item.standardMin) ? Number(item.standardMin) : undefined,
  standardMinInclusive: Number(item.standardMinInclusive ?? 1),
  standardType: Number(item.standardType || 2),
  standardValue: item.standardValue,
  upperTolerance: hasStandardNumericValue(item.upperTolerance)
    ? Number(item.upperTolerance)
    : undefined,
  lowerTolerance: hasStandardNumericValue(item.lowerTolerance)
    ? Number(item.lowerTolerance)
    : undefined,
  upperToleranceSign: item.upperToleranceSign || "+",
  lowerToleranceSign: item.lowerToleranceSign || "-",
  unitId: String(item.unitId || ""),
  unitName: String(item.unitName || ""),
  updateBy: String(item.updateBy || ""),
  updateTime: item.updateTime || "",
  isSampleReturn: Boolean(item.isSampleReturn),
  samplingConfigs: cloneDeep(item.samplingConfigs || []).map((config) => ({
    ...config,
    inspectionMode: Number(config.inspectionMode || EnumProductInspectionMode.SAMPLING)
  })),
  isSaved: Boolean(item.isSaved)
})

const createEmptyRow = (): ILocalInspectRow =>
  normalizeRow({
    id: createTempId(),
    productModelId: props.id,
    inspectType: activeTab.value === EnumTab.ALL ? 0 : activeTab.value,
    status: 1,
    standardType: 2,
    samplingMethod: EnumProductionSamplingMethod.PERCENTAGE,
    isSampleReturn: false,
    isSaved: false
  })

const createCopiedRow = (row: ILocalInspectRow): ILocalInspectRow =>
  normalizeRow({
    ...cloneDeep(row),
    id: createTempId(),
    inspectItemCode: "",
    isSaved: false
  })

const createImportedRow = (row: ILocalInspectRow): ILocalInspectRow =>
  normalizeRow({
    ...cloneDeep(row),
    id: createTempId(),
    productModelId: props.id,
    isSaved: false
  })

const createInspectionStandard = (row: ILocalInspectRow) => {
  const quantitativeMode = inferQuantitativeMode(row)
  const upperDeviation =
    quantitativeMode === "range"
      ? (row.upperToleranceSign === "-" ? -1 : 1) * Number(row.upperTolerance || 0)
      : 0
  const lowerDeviation =
    quantitativeMode === "range"
      ? (row.lowerToleranceSign === "-" ? -1 : 1) * Number(row.lowerTolerance || 0)
      : 0

  return {
    standardDesc:
      Number(row.standardType || 2) === 2
        ? String(row.standardDesc || "")
        : buildStandardPreview(row),
    standardMax:
      Number(row.standardType || 2) === 1
        ? quantitativeMode === "upper"
          ? Number(row.standardMax ?? 0)
          : quantitativeMode === "range"
            ? Number(row.standardValue) + Math.max(upperDeviation, lowerDeviation)
            : 0
        : 0,
    standardMaxInclusive:
      Number(row.standardType || 2) === 1 && quantitativeMode === "upper"
        ? Number(row.standardMaxInclusive ?? 0)
        : 1,
    standardMin:
      Number(row.standardType || 2) === 1
        ? quantitativeMode === "lower"
          ? Number(row.standardMin ?? 0)
          : quantitativeMode === "range"
            ? Number(row.standardValue) + Math.min(upperDeviation, lowerDeviation)
            : 0
        : 0,
    standardMinInclusive:
      Number(row.standardType || 2) === 1 && quantitativeMode === "lower"
        ? Number(row.standardMinInclusive ?? 1)
        : 1,
    standardType: Number(row.standardType || 2),
    quantitativeMode: Number(row.standardType || 2) === 1 ? quantitativeMode : undefined,
    standardValue:
      Number(row.standardType || 2) === 1 && quantitativeMode === "range"
        ? (row.standardValue ?? null)
        : null,
    upperTolerance:
      Number(row.standardType || 2) === 1 && quantitativeMode === "range"
        ? (row.upperTolerance ?? null)
        : null,
    lowerTolerance:
      Number(row.standardType || 2) === 1 && quantitativeMode === "range"
        ? (row.lowerTolerance ?? null)
        : null,
    upperToleranceSign:
      Number(row.standardType || 2) === 1 && quantitativeMode === "range"
        ? row.upperToleranceSign || "+"
        : "+",
    lowerToleranceSign:
      Number(row.standardType || 2) === 1 && quantitativeMode === "range"
        ? row.lowerToleranceSign || "-"
        : "-",
    unitId: Number(row.standardType || 2) === 1 ? String(row.unitId || "") : ""
  }
}

const buildSavePayload = (row: ILocalInspectRow): IInspectSavePayload => ({
  id: isTempRow(row.id) ? "" : row.id,
  status: Number(row.status ?? 1) === 0 ? 0 : 1,
  productModelId: props.id,
  inspectItemCode: String(row.inspectItemCode || "").trim(),
  inspectItemId: String(row.inspectItemId || ""),
  inspectItemName: String(row.inspectItemName || "").trim(),
  inspectType: Number(row.inspectType || 0),
  inspectionStandard: createInspectionStandard(row),
  methodDesc: String(row.methodDesc || "").trim(),
  laboratoryIdList: cloneDeep(row.laboratoryIdList || []),
  imageIds: cloneDeep(row.imageIds || []),
  imageUrls: cloneDeep(row.imageUrls || []),
  samplingMethod: Number(row.samplingMethod || EnumProductionSamplingMethod.PERCENTAGE),
  samplingRatio: Number(row.samplingRatio || 0),
  gradientModelId: String(row.gradientModelId || ""),
  isSampleReturn: Boolean(row.isSampleReturn),
  samplingConfigs: cloneDeep(row.samplingConfigs || []).map((config) => ({
    ...config,
    inspectionMode: Number(config.inspectionMode || EnumProductInspectionMode.SAMPLING)
  }))
})

const getRowsByTypes = (types: readonly number[]) =>
  draftRows.value.filter((row) => types.includes(row.inspectType))

const serializePayload = (rows: ILocalInspectRow[]) =>
  JSON.stringify(rows.map((row) => buildSavePayload(row)))

const setSavedPayload = (type: number, rows: ILocalInspectRow[], saveTime = "") => {
  savedPayloadText[type] = serializePayload(rows.filter((row) => row.inspectType === type))
  snapshotLoaded[type] = true
  if (saveTime) {
    lastSavedAt[type] = saveTime
  }
}

const initializeSavedSnapshots = () => {
  INSPECT_TYPE_TABS.forEach((tab) => {
    setSavedPayload(tab, draftRows.value)
    lastSavedAt[tab] = ""
  })
  allSavedAt.value = ""
}

const getTabLabel = (tab: EnumTab, label: string) => {
  const types = tab === EnumTab.ALL ? INSPECT_TYPE_TABS : ([tab] as const)
  const rows = getRowsByTypes(types)
  const dirty = rows.some((row) => !row.isSaved)
  return dirty ? `${label} *` : label
}

const clearSelection = () => {
  selectedRows.value = []
  nextTick(() => {
    tableRef.value?.setSelectedRows([])
  })
}

const loadAllRows = async () => {
  const data = await getProductInspectList({ productModelId: props.id })
  draftRows.value = (data || []).map((item) => {
    const row = normalizeRow(item)
    row.isSaved = true
    return row
  })
  clearSelection()
}

const reloadRowsByTypes = async (types: readonly number[], saveTime: string) => {
  const fallbackRows = draftRows.value.filter((row) => types.includes(row.inspectType))
  const fallbackById = new Map(
    fallbackRows.filter((row) => !isTempRow(row.id)).map((row) => [String(row.id), row])
  )
  const fallbackByKey = new Map(fallbackRows.map((row) => [buildRowFallbackKey(row), row]))
  const result = await Promise.all(
    types.map((type) =>
      getProductInspectList({
        productModelId: props.id,
        inspectType: type
      })
    )
  )
  const nextRows = result.flat().map((item) => {
    const fallback =
      fallbackById.get(String(item.id || "")) ||
      fallbackByKey.get(
        buildRowFallbackKey({
          inspectType: Number(item.inspectType || 0),
          inspectItemCode: String(item.inspectItemCode || ""),
          inspectItemName: String(item.inspectItemName || "")
        })
      )
    const row = mergeRowWithFallback(item, fallback)
    row.isSaved = true
    return row
  })
  draftRows.value = [
    ...draftRows.value.filter((row) => !types.includes(row.inspectType)),
    ...nextRows
  ]
  types.forEach((type) => {
    setSavedPayload(type, draftRows.value, saveTime)
  })
  if (!hasDirty.value) {
    allSavedAt.value = saveTime
  }
  clearSelection()
}

const syncSelectedRows = () => {
  selectedRows.value = ((tableRef.value?.getCurrentMultipleRows() || []) as ILocalInspectRow[]).map(
    (row) => row
  )
}

const onTableSelectionChange = () => {
  nextTick(() => {
    syncSelectedRows()
  })
}

const validateRows = (rows: ILocalInspectRow[]) => {
  const codeMap = new Map<string, number>()

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index]
    const rowNumber = index + 1
    row.status = Number(row.status ?? 1) === 0 ? 0 : 1
    row.inspectItemName = String(row.inspectItemName || "").trim()
    row.inspectItemCode = String(row.inspectItemCode || "").trim()
    row.methodDesc = String(row.methodDesc || "").trim()
    row.standardDesc = String(row.standardDesc || "").trim()

    if (row.samplingConfigs.length === 0) {
      ElMessage.warning(`第${rowNumber}行请选择检验类型`)
      return false
    }

    if (!row.inspectItemName) {
      ElMessage.warning(`第${rowNumber}行请填写检验项名称`)
      return false
    }

    if (!row.inspectItemCode) {
      ElMessage.warning(`第${rowNumber}行请填写检验项编号`)
      return false
    }

    const duplicatedIndex = codeMap.get(row.inspectItemCode)
    if (duplicatedIndex !== undefined) {
      ElMessage.warning(`第${duplicatedIndex + 1}行和第${rowNumber}行检验项编号重复`)
      return false
    }
    codeMap.set(row.inspectItemCode, index)

    if (Number(row.standardType) === 2) {
      if (!row.standardDesc) {
        ElMessage.warning(`第${rowNumber}行请填写检验标准`)
        return false
      }
    } else {
      const quantitativeMode = inferQuantitativeMode(row)
      if (quantitativeMode === "range") {
        if (!hasStandardNumericValue(row.standardValue)) {
          ElMessage.warning(`第${rowNumber}行请输入标准值`)
          return false
        }
        if (!hasStandardNumericValue(row.upperTolerance)) {
          ElMessage.warning(`第${rowNumber}行请输入上公差`)
          return false
        }
        if (!hasStandardNumericValue(row.lowerTolerance)) {
          ElMessage.warning(`第${rowNumber}行请输入下公差`)
          return false
        }
      } else if (!validateSingleIntervalRow(row, quantitativeMode)) {
        ElMessage.warning(`第${rowNumber}行请配置正确的定量检验标准`)
        return false
      }
      if (!row.unitId) {
        ElMessage.warning(`第${rowNumber}行请选择单位`)
        return false
      }
    }
  }

  return true
}

const getCurrentTypeTabs = (targetTab = activeTab.value) =>
  targetTab === EnumTab.ALL ? INSPECT_TYPE_TABS : ([targetTab] as const)

const saveDraft = async (mode: "current" | "all", targetTab = activeTab.value) => {
  const rows = draftRows.value
  if (!rows.length) {
    ElMessage.info("没有需要保存的内容")
    return true
  }
  if (!validateRows(rows)) return false

  saveLoading.value = true
  try {
    await batchSaveProductInspectAll({
      productModelId: props.id,
      inspectItems: rows.map((row) => buildSavePayload(row))
    })

    const saveTime = formatSaveTime()
    await loadAllRows()
    INSPECT_TYPE_TABS.forEach((tab) => {
      setSavedPayload(tab, draftRows.value, saveTime)
    })
    allSavedAt.value = saveTime

    ElMessage.success("保存成功")
    return true
  } finally {
    saveLoading.value = false
  }
}

const confirmBeforeLeave = async () => {
  if (!hasDirty.value) return true

  try {
    await ElMessageBox.confirm("当前页面存在未保存内容，是否先保存？", "提示", {
      type: "warning",
      confirmButtonText: "保存全部并离开",
      cancelButtonText: "直接离开",
      distinguishCancelAndClose: true,
      closeOnClickModal: false,
      closeOnPressEscape: false
    })
    return await saveDraft("all")
  } catch (action) {
    return action === "cancel"
  }
}

const handleBeforeLeave = async (_nextName: string | number, currentName: string | number) => {
  const currentTab = Number(currentName) as EnumTab
  const types = currentTab === EnumTab.ALL ? INSPECT_TYPE_TABS : ([currentTab] as const)
  let rows: any[] = []
  if (currentName === EnumTab.ALL) {
    rows = draftRows.value.filter((row) => row.samplingConfigs.length > 0)
  } else {
    rows = getRowsByTypes(types)
  }
  const dirty = rows.some((row) => !row.isSaved)
  if (!dirty) return true

  const targetTypes = getCurrentTypeTabs(currentTab)

  try {
    await ElMessageBox.confirm("当前页签有未保存内容，是否先保存？", "提示", {
      type: "warning",
      confirmButtonText: "保存后切换",
      cancelButtonText: "直接切换",
      distinguishCancelAndClose: true,
      closeOnClickModal: false,
      closeOnPressEscape: false
    })
    return await saveDraft(currentTab === EnumTab.ALL ? "all" : "current", currentTab)
  } catch (action) {
    if (action === "cancel") {
      await reloadRowsByTypes(targetTypes, "")
      currentEditingId.value = ""
      productInspectFormVisible.value = false
      resetInspectDemandForm()
      return true
    }
    return action === "cancel"
  }
}

const onAdd = () => {
  currentEditingId.value = ""
  productInspectFormVisible.value = false
  resetInspectDemandForm()
  draftRows.value.push(createEmptyRow())
  clearSelection()
}

const onEdit = (row: ILocalInspectRow) => {
  currentEditingId.value = row.id
  inspectDemandForm.value = {
    id: row.id,
    productModelId: row.productModelId,
    status: Number(row.status ?? 1) === 0 ? 0 : 1,
    inspectItemName: row.inspectItemName,
    inspectItemCode: row.inspectItemCode,
    inspectItemId: row.inspectItemId || row.inspectItemName,
    inspectType: row.inspectType,
    inspectionStandard: {
      standardDesc: row.standardDesc,
      standardMax: row.standardMax,
      standardMaxInclusive: row.standardMaxInclusive,
      standardMin: row.standardMin,
      standardMinInclusive: row.standardMinInclusive,
      standardType: row.standardType,
      quantitativeMode: inferQuantitativeMode(row),
      standardValue: row.standardValue,
      upperTolerance: row.upperTolerance,
      lowerTolerance: row.lowerTolerance,
      upperToleranceSign: row.upperToleranceSign || "+",
      lowerToleranceSign: row.lowerToleranceSign || "-",
      unitId: row.unitId,
      unitName: row.unitName
    },
    methodDesc: row.methodDesc,
    laboratoryIdList: cloneDeep(row.laboratoryIdList || []),
    imageUrls: cloneDeep(row.imageUrls || []),
    imageIds: cloneDeep(row.imageIds || []),
    samplingMethod: row.samplingMethod || EnumProductionSamplingMethod.PERCENTAGE,
    samplingRatio: hasRealValue(row.samplingRatio) ? String(row.samplingRatio) : "",
    gradientModelId: String(row.gradientModelId || ""),
    isSampleReturn: Boolean(row.isSampleReturn)
  }
  productInspectFormVisible.value = true
}

const onFormSubmit = (formData: IProductInspectDemandForm) => {
  const targetIndex = draftRows.value.findIndex((item) => item.id === currentEditingId.value)
  const oldRow = targetIndex > -1 ? cloneDeep(draftRows.value[targetIndex]) : null
  
  const nextRow = normalizeRow({
    ...(targetIndex > -1 ? cloneDeep(draftRows.value[targetIndex]) : {}),
    id: targetIndex > -1 ? draftRows.value[targetIndex].id : createTempId(),
    productModelId: props.id,
    inspectItemId: String(formData.inspectItemId || ""),
    inspectItemName: String(formData.inspectItemName || formData.inspectItemId || ""),
    inspectItemCode: String(formData.inspectItemCode || "").trim(),
    inspectType: Number(formData.inspectType || 0),
    methodDesc: String(formData.methodDesc || "").trim(),
    laboratoryIdList: cloneDeep(formData.laboratoryIdList || []),
    imageIds: cloneDeep(formData.imageIds || []),
    imageUrls: cloneDeep(formData.imageUrls || []),
    status: Number(formData.status ?? 1) === 0 ? 0 : 1,
    samplingMethod: Number(formData.samplingMethod || EnumProductionSamplingMethod.PERCENTAGE),
    samplingRatio: hasRealValue(formData.samplingRatio)
      ? Number(formData.samplingRatio)
      : undefined,
    gradientModelId: String(formData.gradientModelId || ""),
    isSampleReturn: Boolean(formData.isSampleReturn),
    standardType: Number(formData.inspectionStandard.standardType || 2),
    standardDesc: String(formData.inspectionStandard.standardDesc || ""),
    quantitativeMode:
      formData.inspectionStandard.quantitativeMode ||
      (hasStandardNumericValue(formData.inspectionStandard.standardValue) &&
      hasStandardNumericValue(formData.inspectionStandard.upperTolerance) &&
      hasStandardNumericValue(formData.inspectionStandard.lowerTolerance)
        ? "range"
        : hasStandardNumericValue(formData.inspectionStandard.standardMax)
          ? "upper"
          : "lower"),
    standardMax: hasStandardNumericValue(formData.inspectionStandard.standardMax)
      ? Number(formData.inspectionStandard.standardMax)
      : undefined,
    standardMaxInclusive: Number(formData.inspectionStandard.standardMaxInclusive ?? 0),
    standardMin: hasStandardNumericValue(formData.inspectionStandard.standardMin)
      ? Number(formData.inspectionStandard.standardMin)
      : undefined,
    standardMinInclusive: Number(formData.inspectionStandard.standardMinInclusive ?? 1),
    standardValue: hasStandardNumericValue(formData.inspectionStandard.standardValue)
      ? Number(formData.inspectionStandard.standardValue)
      : undefined,
    upperTolerance: hasStandardNumericValue(formData.inspectionStandard.upperTolerance)
      ? Number(formData.inspectionStandard.upperTolerance)
      : undefined,
    lowerTolerance: hasStandardNumericValue(formData.inspectionStandard.lowerTolerance)
      ? Number(formData.inspectionStandard.lowerTolerance)
      : undefined,
    upperToleranceSign: formData.inspectionStandard.upperToleranceSign || "+",
    lowerToleranceSign: formData.inspectionStandard.lowerToleranceSign || "-",
    unitId: String(formData.inspectionStandard.unitId || ""),
    unitName: String(formData.inspectionStandard.unitName || ""),
    isSaved: targetIndex > -1 ? draftRows.value[targetIndex].isSaved : false
  })

  if (targetIndex > -1 && oldRow) {
    const hasChanged = JSON.stringify({
      inspectItemId: oldRow.inspectItemId,
      inspectItemName: oldRow.inspectItemName,
      inspectItemCode: oldRow.inspectItemCode,
      inspectType: oldRow.inspectType,
      methodDesc: oldRow.methodDesc,
      laboratoryIdList: oldRow.laboratoryIdList,
      imageIds: oldRow.imageIds,
      imageUrls: oldRow.imageUrls,
      status: oldRow.status,
      samplingMethod: oldRow.samplingMethod,
      samplingRatio: oldRow.samplingRatio,
      gradientModelId: oldRow.gradientModelId,
      isSampleReturn: oldRow.isSampleReturn,
      standardType: oldRow.standardType,
      standardDesc: oldRow.standardDesc,
      quantitativeMode: oldRow.quantitativeMode,
      standardMax: oldRow.standardMax,
      standardMaxInclusive: oldRow.standardMaxInclusive,
      standardMin: oldRow.standardMin,
      standardMinInclusive: oldRow.standardMinInclusive,
      standardValue: oldRow.standardValue,
      upperTolerance: oldRow.upperTolerance,
      lowerTolerance: oldRow.lowerTolerance,
      upperToleranceSign: oldRow.upperToleranceSign,
      lowerToleranceSign: oldRow.lowerToleranceSign,
      unitId: oldRow.unitId,
      unitName: oldRow.unitName
    }) !== JSON.stringify({
      inspectItemId: nextRow.inspectItemId,
      inspectItemName: nextRow.inspectItemName,
      inspectItemCode: nextRow.inspectItemCode,
      inspectType: nextRow.inspectType,
      methodDesc: nextRow.methodDesc,
      laboratoryIdList: nextRow.laboratoryIdList,
      imageIds: nextRow.imageIds,
      imageUrls: nextRow.imageUrls,
      status: nextRow.status,
      samplingMethod: nextRow.samplingMethod,
      samplingRatio: nextRow.samplingRatio,
      gradientModelId: nextRow.gradientModelId,
      isSampleReturn: nextRow.isSampleReturn,
      standardType: nextRow.standardType,
      standardDesc: nextRow.standardDesc,
      quantitativeMode: nextRow.quantitativeMode,
      standardMax: nextRow.standardMax,
      standardMaxInclusive: nextRow.standardMaxInclusive,
      standardMin: nextRow.standardMin,
      standardMinInclusive: nextRow.standardMinInclusive,
      standardValue: nextRow.standardValue,
      upperTolerance: nextRow.upperTolerance,
      lowerTolerance: nextRow.lowerTolerance,
      upperToleranceSign: nextRow.upperToleranceSign,
      lowerToleranceSign: nextRow.lowerToleranceSign,
      unitId: nextRow.unitId,
      unitName: nextRow.unitName
    })
    
    if (hasChanged) {
      nextRow.isSaved = false
    }
  }

  if (targetIndex === -1) {
    draftRows.value.unshift(nextRow)
  } else {
    draftRows.value[targetIndex] = nextRow
  }

  currentEditingId.value = ""
  resetInspectDemandForm()
}

const onFormCancel = () => {
  currentEditingId.value = ""
  resetInspectDemandForm()
}

const onCopy = (row: ILocalInspectRow) => {
  draftRows.value.push(createCopiedRow(row))
  clearSelection()
}

const onDelete = async (row: ILocalInspectRow) => {
  const confirmed = await ElMessageBox.confirm("此操作将删除该数据，是否继续？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).catch(() => false)
  if (!confirmed) return

  draftRows.value = draftRows.value.filter((item) => item.id !== row.id)
  clearSelection()
}

const onBatchDelete = async () => {
  if (!selectedRows.value.length) {
    ElMessage.warning("请至少勾选一条数据")
    return
  }

  const confirmed = await ElMessageBox.confirm(
    `此操作将删除勾选的${selectedRows.value.length}条数据，是否继续？`,
    "提示",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }
  ).catch(() => false)
  if (!confirmed) return

  const selectedIds = new Set(selectedRows.value.map((item) => item.id))
  draftRows.value = draftRows.value.filter((item) => !selectedIds.has(item.id))
  clearSelection()
}

const onBatchStatusChange = (targetStatus: 0 | 1) => {
  if (!selectedRows.value.length) {
    ElMessage.warning("请至少勾选一条数据")
    return
  }

  selectedRows.value.forEach((row) => {
    row.status = targetStatus
  })
  clearSelection()
  ElMessage.success(targetStatus === 1 ? "批量启用成功" : "批量停用成功")
}

const onStandardTypeChange = (row: ILocalInspectRow, value: number) => {
  row.standardType = Number(value)
  row.standardDesc = ""
  row.standardMax = 0
  row.standardMaxInclusive = 0
  row.standardMin = 0
  row.standardMinInclusive = 1
  row.unitId = ""
  row.unitName = ""
  markRowDirty(row)
}

const onSamplingMethodChange = (row: ILocalInspectRow, value: number) => {
  row.samplingMethod = Number(value)
  if (row.samplingMethod === EnumProductionSamplingMethod.PERCENTAGE) {
    row.gradientModelId = ""
  } else {
    row.samplingRatio = undefined
  }
  markRowDirty(row)
}

const markRowDirty = (row: ILocalInspectRow) => {
  row.isSaved = false
}

const onSaveAll = async () => {
  await saveDraft("all")
}

const onOpenSamplingConfigDialog = (row: ILocalInspectRow) => {
  const samplingConfigs = row.samplingConfigs || []
  samplingConfigId.value = row.id || ""
  samplingConfigData.value = samplingConfigs
  samplingConfigDialogVisible.value = true
}

const onSamplingConfigConfirm = (
  data: Array<{
    inspectionMode: number
    inspectType: number
    samplingMethod: number
    samplingRatio: number | undefined
    gradientModelId: string
  }>
) => {
  const index = draftRows.value.findIndex((row) => row.id === samplingConfigId.value)
  if (index === -1) {
    ElMessage.warning("未找到对应的检验项")
    return
  }
  const row = draftRows.value[index]
  row.samplingConfigs = data.map((item) => ({
    ...item,
    inspectionMode: Number(item.inspectionMode || EnumProductInspectionMode.SAMPLING)
  }))
  draftRows.value.splice(index, 1, row)
  markRowDirty(row)
  ElMessage.success("抽检配置已更新")
}

const onOpenImportDialog = async () => {
  importLoading.value = true
  try {
    const data = await queryProductModelPageList({
      pageNum: 1,
      pageSize: 999
    })
    importProductList.value = data.records || []
    importKeyword.value = ""
    selectedImportProductId.value = ""
    if (!filteredImportProductList.value.length) {
      ElMessage.warning("当前没有可带入的其他产品")
      return
    }
    importVisible.value = true
  } finally {
    importLoading.value = false
  }
}

const getGradientOptions = async () => {
  const data = await queryGradientList()
  gradientOptions.value = (data || []).map((item) => ({
    label: item.modelName,
    value: String(item.id)
  }))
}

const onSelectImportProduct = (row: IProductModelItem) => {
  selectedImportProductId.value = row.id
}

const onImportConfirm = async () => {
  if (!selectedImportProductId.value) {
    ElMessage.warning("请选择需要带入的产品")
    return
  }

  const confirmed = await ElMessageBox.confirm(
    "带入后将覆盖当前页面的检验项配置，是否继续？",
    "提示",
    {
      type: "warning"
    }
  ).catch(() => false)
  if (!confirmed) return

  importLoading.value = true
  try {
    const data = await getProductInspectList({
      productModelId: selectedImportProductId.value
    })
    draftRows.value = (data || []).map((item) => createImportedRow(normalizeRow(item)))
    importVisible.value = false
    clearSelection()
    ElMessage.success("带入成功")
  } finally {
    importLoading.value = false
  }
}

const handleBeforeUnload = (event: BeforeUnloadEvent) => {
  if (!hasDirty.value) return
  event.preventDefault()
  event.returnValue = ""
}

watch([keyword, activeTab], () => {
  clearSelection()
})

onMounted(async () => {
  await loadAllRows()
  await getGradientOptions().catch(() => undefined)
  initializeSavedSnapshots()
  window.addEventListener("beforeunload", handleBeforeUnload)
})

onUnmounted(() => {
  window.removeEventListener("beforeunload", handleBeforeUnload)
})

defineExpose<IProductInspectTabExpose>({
  hasDirty: () => hasDirty.value,
  confirmBeforeLeave
})

defineOptions({
  name: "ProductInspectTab"
})
</script>

<style scoped lang="scss">
.toolbar-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.toolbar-row__main,
.toolbar-row__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.selected-summary {
  height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  background: #f4f8ff;
  color: #3a7afe;
  font-size: 13px;
  line-height: 32px;
}

.custom-tabs {
  margin-bottom: 20px;

  :deep(.el-tabs__content) {
    padding: 0;
  }

  :deep(.el-tabs__header) {
    border: none;

    .el-tabs__nav-wrap {
      margin-bottom: 0 !important;
    }
  }

  .custom-tooltip-icon {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 1px solid #606266;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #606266;
    font-size: 12px;
    margin-left: 5px;
  }
}

.custom-detail-table {
  flex: 1;
  overflow: hidden;

  :deep(.is-disabled-row) {
    background: #fafafa;

    td {
      color: #909399;
    }
  }
}

.table-select {
  width: 100%;
}

.table-number-input {
  width: 100%;
}

.standard-cell {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.status-cell,
.sample-return-cell {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.status-text {
  color: #606266;
  font-size: 13px;
}

.status-text.is-disabled,
.summary-text.is-muted {
  color: #b1b3b8;
}

.standard-text {
  flex: 1;
  min-width: 0;
  color: #606266;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.summary-text {
  color: #606266;
}

.inspect-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 16px;
}

.footer-actions {
  display: flex;
  gap: 12px;
}

.save-status {
  min-height: 20px;
  font-size: 13px;
  color: #909399;
}

.save-status.is-dirty {
  color: #e6a23c;
}

.import-toolbar {
  margin-bottom: 12px;
}

@media (max-width: 1200px) {
  .toolbar-row {
    align-items: flex-start;
  }

  .toolbar-row__main,
  .toolbar-row__actions {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .inspect-footer {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
