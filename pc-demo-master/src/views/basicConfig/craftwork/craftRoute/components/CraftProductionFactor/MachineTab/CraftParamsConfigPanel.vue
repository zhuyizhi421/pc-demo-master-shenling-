<template>
  <div class="craft-params-config-panel">
    <div class="toolbar" v-if="!isReadOnly">
      <el-button type="primary" @click="onAddClick">新增工艺参数</el-button>
    </div>

    <el-table :data="customTableData" border height="500">
      <el-table-column label="序号" width="70" align="center">
        <template #default="{ $index }">{{ $index + 1 }}</template>
      </el-table-column>

      <el-table-column label="工艺参数编号" min-width="150">
        <template #default="{ row }">
          <el-input
            v-model.trim="row.inspectItemCode"
            :disabled="isReadOnly"
            maxlength="50"
            placeholder="不填则自动生成"
          />
        </template>
      </el-table-column>

      <el-table-column label="工艺参数名称" min-width="170">
        <template #default="{ row }">
          <el-input v-model.trim="row.inspectItemName" :disabled="isReadOnly" maxlength="100" />
        </template>
      </el-table-column>

      <el-table-column label="工艺参数描述" min-width="200">
        <template #default="{ row }">
          <el-input v-model.trim="row.desc" :disabled="isReadOnly" maxlength="200" />
        </template>
      </el-table-column>

      <el-table-column label="探测方式" min-width="150">
        <template #default="{ row }">
          <el-input v-model.trim="row.detectMethod" :disabled="isReadOnly" maxlength="100" />
        </template>
      </el-table-column>

      <el-table-column label="检验标准类型" width="130" align="center">
        <template #default="{ row }">
          <el-select v-model="row.inspectionStandard.standardType" :disabled="isReadOnly" @change="onStandardTypeChange(row)">
            <el-option label="定量" :value="InspectionStandardType.Number" />
            <el-option label="定性" :value="InspectionStandardType.Text" />
          </el-select>
        </template>
      </el-table-column>

      <el-table-column label="检验标准" min-width="240">
        <template #default="{ row, $index }">
          <div class="cell-block">
            <template v-if="Number(row.inspectionStandard?.standardType) === InspectionStandardType.Text">
              <el-input
                v-model="row.inspectionStandard.standardDesc"
                :disabled="isReadOnly"
                placeholder="请输入检验标准"
                maxlength="300"
              />
            </template>
            <template v-else>
              <div class="cell-text" :class="{ empty: !getStandardPreview(row) }">
                {{ getStandardPreview(row) || "未配置" }}
              </div>
              <el-button link type="primary" @click="openDetailDialog(row, $index)">
                {{ isReadOnly ? "查看" : "配置" }}
              </el-button>
            </template>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="图片说明" min-width="180">
        <template #default="{ row, $index }">
          <div class="cell-block">
            <div v-if="row.files.length" class="file-list">
              <el-image
                v-for="item in row.files.slice(0, 3)"
                :key="`${item.fileId}-${item.fileUrl}`"
                :src="item.fileUrl"
                :preview-src-list="getFilePreviewList(row.files)"
                preview-teleported
                fit="cover"
                class="file-image"
              />
              <span class="file-count">共{{ row.files.length }}张</span>
            </div>
            <div v-else class="cell-text empty">未上传</div>
            <el-button link type="primary" @click="openDetailDialog(row, $index)">
              {{ isReadOnly ? "查看" : "维护" }}
            </el-button>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="110" align="center" fixed="right">
        <template #default="{ row, $index }">
          <template v-if="!isReadOnly">
            <el-button link type="primary" @click="onCopyClick(row)">复制</el-button>
            <el-button link type="danger" @click="onDeleteClick($index)">删除</el-button>
          </template>
          <span v-else>--</span>
        </template>
      </el-table-column>
    </el-table>

    <CustomDialog
      v-model="detailDialogVisible"
      :title="isReadOnly ? '查看工艺参数' : '配置检验标准与图片说明'"
      size="large"
      append-to-body
    >
      <div class="section">
        <div class="section-title">检验标准</div>
        <div class="field">
          <label>检验标准类型</label>
          <el-select
            v-model="detailForm.inspectionStandard.standardType"
            :disabled="isReadOnly"
            @change="onDetailStandardTypeChange"
          >
            <el-option label="定量" :value="InspectionStandardType.Number" />
            <el-option label="定性" :value="InspectionStandardType.Text" />
          </el-select>
        </div>

        <el-input
          v-if="detailForm.inspectionStandard.standardType === InspectionStandardType.Text"
          v-model="detailForm.inspectionStandard.standardDesc"
          :disabled="isReadOnly"
          type="textarea"
          :rows="4"
          maxlength="300"
          show-word-limit
          placeholder="请输入检验标准"
        />

        <template v-else>
          <div class="quantitative-config-wrapper">
            <div class="quantitative-config-label">定量配置</div>
            <div class="quantitative-layout">
              <div
                class="quantitative-card"
                :class="{ 'is-active': isSingleQuantitativeMode, 'is-inactive': !isSingleQuantitativeMode }"
                @click="!isReadOnly && activateSingleMode()"
              >
                <div class="quantitative-card__head">
                  <span class="mode-indicator" :class="{ 'is-active': isSingleQuantitativeMode }"></span>
                  <span class="quantitative-card__title">单区间</span>
                  <span v-if="isSingleQuantitativeMode" class="active-tag">当前生效</span>
                </div>
                <div class="single-mode-row">
                  <el-select
                    v-model="singleIntervalOperator"
                    class="operator-select"
                    :disabled="isReadOnly || !isSingleQuantitativeMode"
                    @focus="!isReadOnly && activateSingleMode()"
                  >
                    <el-option label=">" value=">" />
                    <el-option label=">=" value=">=" />
                    <el-option label="<" value="<" />
                    <el-option label="<=" value="<=" />
                  </el-select>
                  <el-input-number
                    v-model="singleIntervalValue"
                    class="standard-input"
                    :controls="false"
                    :disabled="isReadOnly || !isSingleQuantitativeMode"
                    placeholder="请输入标准值"
                    @focus="!isReadOnly && activateSingleMode()"
                  />
                </div>
              </div>

              <div
                class="quantitative-card"
                :class="{ 'is-active': !isSingleQuantitativeMode, 'is-inactive': isSingleQuantitativeMode }"
                @click="!isReadOnly && activateRangeMode()"
              >
                <div class="quantitative-card__head">
                  <span class="mode-indicator" :class="{ 'is-active': !isSingleQuantitativeMode }"></span>
                  <span class="quantitative-card__title">双区间</span>
                  <span v-if="!isSingleQuantitativeMode" class="active-tag">当前生效</span>
                </div>
                <div class="standard-range-layout">
                  <div class="standard-value-card standard-value-card--tall">
                    <span class="range-label">标准值</span>
                    <el-input-number
                      v-model="detailForm.inspectionStandard.standardValue"
                      :controls="false"
                      class="range-number"
                      :disabled="isReadOnly || isSingleQuantitativeMode"
                      placeholder="请输入标准值"
                      @focus="!isReadOnly && activateRangeMode()"
                    />
                  </div>
                  <div class="tolerance-row">
                    <span class="tolerance-row-label">上公差</span>
                    <el-select
                      v-model="detailForm.inspectionStandard.upperToleranceSign"
                      class="tolerance-sign-select"
                      :disabled="isReadOnly || isSingleQuantitativeMode"
                      @focus="!isReadOnly && activateRangeMode()"
                    >
                      <el-option label="+" value="+" />
                      <el-option label="-" value="-" />
                    </el-select>
                    <el-input-number
                      v-model="detailForm.inspectionStandard.upperTolerance"
                      :controls="false"
                      class="range-number"
                      :disabled="isReadOnly || isSingleQuantitativeMode"
                      placeholder="请输入上公差"
                      @focus="!isReadOnly && activateRangeMode()"
                    />
                  </div>
                  <div class="tolerance-row">
                    <span class="tolerance-row-label">下公差</span>
                    <el-select
                      v-model="detailForm.inspectionStandard.lowerToleranceSign"
                      class="tolerance-sign-select"
                      :disabled="isReadOnly || isSingleQuantitativeMode"
                      @focus="!isReadOnly && activateRangeMode()"
                    >
                      <el-option label="+" value="+" />
                      <el-option label="-" value="-" />
                    </el-select>
                    <el-input-number
                      v-model="detailForm.inspectionStandard.lowerTolerance"
                      :controls="false"
                      class="range-number"
                      :disabled="isReadOnly || isSingleQuantitativeMode"
                      placeholder="请输入下公差"
                      @focus="!isReadOnly && activateRangeMode()"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="grid">
            <div class="field">
              <label>检验标准预览</label>
              <div class="preview">{{ detailStandardPreview || "-" }}</div>
            </div>
            <div class="field field-required">
              <label>单位</label>
              <el-select v-model="detailForm.inspectionStandard.unitId" clearable filterable :disabled="isReadOnly">
                <el-option v-for="item in unitOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </div>
          </div>
        </template>
      </div>

      <div class="section">
        <div class="section-title">辅助信息</div>
        <div class="field">
          <label>图片说明</label>
          <UploadImage v-if="!isReadOnly" v-model="detailForm.files" :limit="5" multiple />
          <div v-else class="file-list">
            <el-image
              v-for="item in detailForm.files"
              :key="`${item.fileId}-${item.fileUrl}`"
              :src="item.fileUrl"
              :preview-src-list="getFilePreviewList(detailForm.files)"
              preview-teleported
              fit="cover"
              class="file-image large"
            />
            <div v-if="!detailForm.files.length" class="cell-text empty">未上传</div>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="detailDialogVisible = false">{{ isReadOnly ? "关闭" : "取消" }}</el-button>
        <el-button v-if="!isReadOnly" type="primary" @click="onDetailConfirm">确定</el-button>
      </template>
    </CustomDialog>
    <div class="operation">
      <el-button v-if="showCancel" @click="emit('close')">{{
        isReadOnly ? "关闭" : "取消"
      }}</el-button>
      <el-button v-if="!isReadOnly" type="primary" @click="onConfirmClick">保存</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus"

import { getProductBasicMachineCraft, setProduceBasicMachineCraft } from "@/api/craft"
import { InspectionStandardType } from "@/api/operation/equipment/types"
import { getUnit } from "@/api/units"
import CustomDialog from "@/components/CustomDialog/index.vue"
import UploadImage from "@/components/UploadImage/index.vue"
import type { IProduceBasicMachineCraftItem } from "@/types/base-info/craftRoute"
import type { IUploadPhoto } from "@/types/base-info/global-config"
import { typeNumberHandle } from "@/utils/inspectStandard"

type IQuantitativeMode = "lower" | "upper" | "range"
type IInspectionStandard = NonNullable<IProduceBasicMachineCraftItem["inspectionStandard"]>
interface ITableRow extends IProduceBasicMachineCraftItem {
  tempId?: string
}

const props = withDefaults(
  defineProps<{ data: any; techVersionId: string; readOnly?: boolean; showCancel?: boolean }>(),
  {
    data: () => ({}),
    readOnly: false,
    showCancel: false
  }
)

const emit = defineEmits<{
  (e: "close"): void
  (e: "success", data: ITableRow[]): void
}>()

const customTableData = ref<ITableRow[]>([])
const detailDialogVisible = ref(false)
const currentEditIndex = ref(-1)
const unitOptions = ref<{ label: string; value: string }[]>([])
const detailForm = ref<ITableRow>(createDefaultRow())
const isReadOnly = computed(() => !!props.readOnly)

const isSingleQuantitativeMode = computed(() => detailForm.value.inspectionStandard.quantitativeMode !== "range")
const detailStandardPreview = computed(() => getStandardPreview(detailForm.value))
const singleIntervalOperator = computed({
  get: () => {
    if (detailForm.value.inspectionStandard.quantitativeMode === "upper") {
      return Number(detailForm.value.inspectionStandard.standardMaxInclusive ?? 1) === 1 ? "<=" : "<"
    }
    return Number(detailForm.value.inspectionStandard.standardMinInclusive ?? 1) === 1 ? ">=" : ">"
  },
  set: (value: string) => {
    if (value === "<" || value === "<=") {
      applySingleIntervalMode("upper", value === "<=" ? 1 : 0)
      return
    }
    applySingleIntervalMode("lower", value === ">=" ? 1 : 0)
  }
})
const singleIntervalValue = computed<number | undefined>({
  get: () =>
    detailForm.value.inspectionStandard.quantitativeMode === "upper"
      ? normalizeNullableNumber(detailForm.value.inspectionStandard.standardMax)
      : normalizeNullableNumber(detailForm.value.inspectionStandard.standardMin),
  set: (value) => {
    if (detailForm.value.inspectionStandard.quantitativeMode === "upper") {
      detailForm.value.inspectionStandard.standardMax = value ?? null
    } else {
      detailForm.value.inspectionStandard.standardMin = value ?? null
    }
  }
})

onBeforeMount(async () => {
  await Promise.all([getUnitOptions(), getTableData()])
})

function buildTempId() {
  return `machine-craft-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
}

function hasStandardNumericValue(value: unknown) {
  return value !== null && value !== undefined && value !== ""
}

function normalizeNullableNumber(value: unknown) {
  return hasStandardNumericValue(value) ? Number(value) : undefined
}

function createDefaultStandard(standardType: number = InspectionStandardType.Text): IInspectionStandard {
  return {
    standardType,
    standardDesc: "",
    standardMax: null,
    standardMaxInclusive: 0,
    standardMin: null,
    standardMinInclusive: 1,
    quantitativeMode: "lower" as IQuantitativeMode,
    standardValue: null,
    upperTolerance: null,
    lowerTolerance: null,
    upperToleranceSign: "+" as "+" | "-",
    lowerToleranceSign: "-" as "+" | "-",
    unitId: "",
    unitName: ""
  }
}

function getFilePreviewList(files: IUploadPhoto[]) {
  return files.map((item) => item.fileUrl)
}

function normalizeFiles(files: unknown): IUploadPhoto[] {
  return (Array.isArray(files) ? files : []).map((item: any) => ({
    fileId: String(item?.fileId || item?.id || ""),
    fileName: String(item?.fileName || ""),
    fileUrl: String(item?.fileUrl || item?.url || item?.path || ""),
    selected: Boolean(item?.selected)
  }))
}

function inferQuantitativeMode(standard: Partial<ITableRow["inspectionStandard"]>): IQuantitativeMode {
  if (standard.quantitativeMode === "lower" || standard.quantitativeMode === "upper") return standard.quantitativeMode
  const hasRangeMode =
    standard.quantitativeMode === "range" ||
    (hasStandardNumericValue(standard.standardValue) &&
      hasStandardNumericValue(standard.upperTolerance) &&
      hasStandardNumericValue(standard.lowerTolerance))
  if (hasRangeMode) return "range"
  return hasStandardNumericValue(standard.standardMax) ? "upper" : "lower"
}

function normalizeInspectionStandard(raw: Record<string, any> = {}): IInspectionStandard {
  return {
    standardType: Number(raw.standardType || InspectionStandardType.Text),
    standardDesc: String(raw.standardDesc || ""),
    standardMax: normalizeNullableNumber(raw.standardMax) ?? null,
    standardMaxInclusive: Number(raw.standardMaxInclusive ?? 0),
    standardMin: normalizeNullableNumber(raw.standardMin) ?? null,
    standardMinInclusive: Number(raw.standardMinInclusive ?? 1),
    quantitativeMode: inferQuantitativeMode(raw),
    standardValue: normalizeNullableNumber(raw.standardValue) ?? null,
    upperTolerance: normalizeNullableNumber(raw.upperTolerance) ?? null,
    lowerTolerance: normalizeNullableNumber(raw.lowerTolerance) ?? null,
    upperToleranceSign: (raw.upperToleranceSign || "+") as "+" | "-",
    lowerToleranceSign: (raw.lowerToleranceSign || "-") as "+" | "-",
    unitId: String(raw.unitId || ""),
    unitName:
      raw.unitName || unitOptions.value.find((item) => item.value === String(raw.unitId || ""))?.label || ""
  }
}

function createDefaultRow(overrides: Partial<ITableRow> = {}): ITableRow {
  const baseRow: ITableRow = {
    id: "",
    tempId: buildTempId(),
    inspectItemCode: "",
    inspectItemName: "",
    detectMethod: "",
    files: [],
    inspectionStandard: createDefaultStandard(),
    key: "",
    val: "",
    desc: "",
    monitor: 0,
    refId: String(props.data?.refId || ""),
    techDetailId: String(props.data?.techDetailId || ""),
    techStandardMachineId: String(props.data?.id || ""),
    createBy: "",
    createTime: "",
    updateBy: "",
    updateTime: "",
    sort: 1
  }
  return {
    ...baseRow,
    ...overrides,
    inspectionStandard: normalizeInspectionStandard(overrides.inspectionStandard || baseRow.inspectionStandard || {}),
    files: normalizeFiles(overrides.files || baseRow.files || [])
  }
}

function normalizeRow(item: Partial<ITableRow>, index: number): ITableRow {
  return createDefaultRow({
    ...item,
    sort: Number(item.sort ?? index + 1)
  })
}

async function getUnitOptions() {
  const list = await getUnit()
  unitOptions.value = (list || []).map((item) => ({
    label: item.unitName,
    value: String(item.id)
  }))
}

async function getTableData() {
  const { records } = await getProductBasicMachineCraft({
    pageQuery: {
      pageNum: 1,
      pageSize: 1000
    },
    queryParam: {
      id: props.data.id
    }
  })
  customTableData.value = (records || []).map((item, index) => normalizeRow(item, index))
}

function onAddClick() {
  customTableData.value.unshift(createDefaultRow())
}

function onCopyClick(row: ITableRow) {
  customTableData.value.unshift(
    createDefaultRow({
      ...cloneDeep(row),
      id: "",
      tempId: buildTempId()
    })
  )
}

async function onDeleteClick(index: number) {
  const confirm = await ElMessageBox.confirm("确认删除该工艺参数吗？", "提示", {
    type: "warning",
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    closeOnClickModal: false,
    closeOnPressEscape: false,
    autofocus: false
  })
  if (confirm === "confirm") {
    customTableData.value.splice(index, 1)
  }
}

function onStandardTypeChange(row: ITableRow) {
  if (Number(row.inspectionStandard.standardType) === InspectionStandardType.Text) {
    row.inspectionStandard = {
      ...createDefaultStandard(InspectionStandardType.Text),
      standardDesc: row.inspectionStandard.standardDesc || ""
    }
  } else {
    row.inspectionStandard = {
      ...createDefaultStandard(InspectionStandardType.Number),
      unitId: row.inspectionStandard.unitId || "",
      unitName: row.inspectionStandard.unitName || ""
    }
  }
}

function openDetailDialog(row: ITableRow, index: number) {
  currentEditIndex.value = index
  detailForm.value = normalizeRow(cloneDeep(row), index)
  detailDialogVisible.value = true
}

function onDetailStandardTypeChange() {
  if (detailForm.value.inspectionStandard.standardType === InspectionStandardType.Text) {
    detailForm.value.inspectionStandard = {
      ...createDefaultStandard(InspectionStandardType.Text),
      standardDesc: detailForm.value.inspectionStandard.standardDesc || ""
    }
  } else {
    detailForm.value.inspectionStandard = {
      ...createDefaultStandard(InspectionStandardType.Number),
      unitId: detailForm.value.inspectionStandard.unitId || "",
      unitName: detailForm.value.inspectionStandard.unitName || ""
    }
  }
}

function resetRangeFields() {
  detailForm.value.inspectionStandard.standardValue = null
  detailForm.value.inspectionStandard.upperTolerance = null
  detailForm.value.inspectionStandard.lowerTolerance = null
  detailForm.value.inspectionStandard.upperToleranceSign = "+"
  detailForm.value.inspectionStandard.lowerToleranceSign = "-"
}

function clearSingleIntervalFields() {
  detailForm.value.inspectionStandard.standardMax = null
  detailForm.value.inspectionStandard.standardMin = null
}

function activateSingleMode() {
  resetRangeFields()
  if (detailForm.value.inspectionStandard.quantitativeMode === "range") {
    detailForm.value.inspectionStandard.quantitativeMode = "lower"
  }
}

function activateRangeMode() {
  clearSingleIntervalFields()
  detailForm.value.inspectionStandard.quantitativeMode = "range"
}

function applySingleIntervalMode(mode: "lower" | "upper", inclusive: number) {
  resetRangeFields()
  if (mode === "upper") {
    detailForm.value.inspectionStandard.quantitativeMode = "upper"
    detailForm.value.inspectionStandard.standardMaxInclusive = inclusive
    detailForm.value.inspectionStandard.standardMin = null
  } else {
    detailForm.value.inspectionStandard.quantitativeMode = "lower"
    detailForm.value.inspectionStandard.standardMinInclusive = inclusive
    detailForm.value.inspectionStandard.standardMax = null
  }
}

function buildStandardPreview(standard: ITableRow["inspectionStandard"]) {
  if (!standard) return ""
  if (Number(standard.standardType) === InspectionStandardType.Text) {
    return String(standard.standardDesc || "").trim()
  }
  return (
    typeNumberHandle(
      {
        ...standard,
        unitName:
          standard.unitName ||
          unitOptions.value.find((item) => item.value === String(standard.unitId || ""))?.label ||
          ""
      },
      true
    ) || ""
  )
}

function getStandardPreview(row: Pick<ITableRow, "inspectionStandard">) {
  return buildStandardPreview(row.inspectionStandard)
}

function getStandardValidationMessage(standard: ITableRow["inspectionStandard"]) {
  if (Number(standard.standardType) === InspectionStandardType.Text) {
    return String(standard.standardDesc || "").trim() ? "" : "请输入检验标准"
  }
  if (!String(standard.unitId || "").trim()) return "请选择单位"
  if (standard.quantitativeMode === "lower" && !hasStandardNumericValue(standard.standardMin)) {
    return "请输入单区间标准值"
  }
  if (standard.quantitativeMode === "upper" && !hasStandardNumericValue(standard.standardMax)) {
    return "请输入单区间标准值"
  }
  if (standard.quantitativeMode === "range") {
    if (!hasStandardNumericValue(standard.standardValue)) return "请输入标准值"
    if (!hasStandardNumericValue(standard.upperTolerance)) return "请输入上公差"
    if (!hasStandardNumericValue(standard.lowerTolerance)) return "请输入下公差"
  }
  return buildStandardPreview(standard) ? "" : "请完善检验标准"
}

function buildNormalizedStandard(standard: ITableRow["inspectionStandard"]): IInspectionStandard {
  if (Number(standard.standardType) === InspectionStandardType.Text) {
    return {
      ...createDefaultStandard(InspectionStandardType.Text),
      standardDesc: String(standard.standardDesc || "").trim()
    }
  }

  const upperDeviation =
    standard.quantitativeMode === "range"
      ? (standard.upperToleranceSign === "-" ? -1 : 1) * Number(standard.upperTolerance || 0)
      : 0
  const lowerDeviation =
    standard.quantitativeMode === "range"
      ? (standard.lowerToleranceSign === "-" ? -1 : 1) * Number(standard.lowerTolerance || 0)
      : 0

  return {
    standardType: InspectionStandardType.Number,
    standardDesc: buildStandardPreview(standard),
    standardMax:
      standard.quantitativeMode === "upper"
        ? Number(standard.standardMax ?? 0)
        : standard.quantitativeMode === "range"
          ? Number(standard.standardValue) + Math.max(upperDeviation, lowerDeviation)
          : null,
    standardMaxInclusive: standard.quantitativeMode === "upper" ? Number(standard.standardMaxInclusive ?? 0) : 1,
    standardMin:
      standard.quantitativeMode === "lower"
        ? Number(standard.standardMin ?? 0)
        : standard.quantitativeMode === "range"
          ? Number(standard.standardValue) + Math.min(upperDeviation, lowerDeviation)
          : null,
    standardMinInclusive: standard.quantitativeMode === "lower" ? Number(standard.standardMinInclusive ?? 1) : 1,
    quantitativeMode: standard.quantitativeMode || "lower",
    standardValue: standard.quantitativeMode === "range" ? Number(standard.standardValue ?? 0) : null,
    upperTolerance: standard.quantitativeMode === "range" ? Number(standard.upperTolerance ?? 0) : null,
    lowerTolerance: standard.quantitativeMode === "range" ? Number(standard.lowerTolerance ?? 0) : null,
    upperToleranceSign: standard.quantitativeMode === "range" ? standard.upperToleranceSign || "+" : "+",
    lowerToleranceSign: standard.quantitativeMode === "range" ? standard.lowerToleranceSign || "-" : "-",
    unitId: String(standard.unitId || ""),
    unitName:
      unitOptions.value.find((item) => item.value === String(standard.unitId || ""))?.label ||
      standard.unitName ||
      ""
  }
}

function onDetailConfirm() {
  const message = getStandardValidationMessage(detailForm.value.inspectionStandard)
  if (message) {
    ElMessage.warning(message)
    return
  }
  if (currentEditIndex.value < 0) return
  customTableData.value[currentEditIndex.value] = normalizeRow(
    {
      ...detailForm.value,
      inspectionStandard: buildNormalizedStandard(detailForm.value.inspectionStandard),
      files: detailForm.value.files
    },
    currentEditIndex.value
  )
  detailDialogVisible.value = false
}

function validateRows() {
  const codeSet = new Set<string>()
  const nameSet = new Set<string>()

  for (let index = 0; index < customTableData.value.length; index += 1) {
    const row = customTableData.value[index]
    const label = `第${index + 1}行`
    const code = String(row.inspectItemCode || "").trim()
    const name = String(row.inspectItemName || "").trim()

    if (!code) {
      ElMessage.warning(`${label}请输入工艺参数名称`)
      return false
    }
    if (!name) {
      ElMessage.warning(`${label}请输入工艺参数名称`)
      return false
    }

    const standardMessage = getStandardValidationMessage(row.inspectionStandard)
    if (standardMessage) {
      ElMessage.warning(`${label}${standardMessage}`)
      return false
    }

    if (codeSet.has(code)) {
      ElMessage.warning("工艺参数名称重复，请重新输入")
      return false
    }
    if (nameSet.has(name)) {
      ElMessage.warning("工艺参数名称重复，请重新输入")
      return false
    }

    codeSet.add(code)
    nameSet.add(name)
  }

  return true
}

async function onConfirmClick() {
  if (!validateRows()) return

  await setProduceBasicMachineCraft(props.techVersionId, {
    id: props.data.id,
    refId: props.data.refId,
    type: props.data.type,
    refSpecifications: customTableData.value.map((item, index) => {
      const standard = buildNormalizedStandard(item.inspectionStandard)
      const preview = buildStandardPreview(standard)
      return {
        id: item.id,
        inspectItemCode: String(item.inspectItemCode || "").trim(),
        inspectItemName: String(item.inspectItemName || "").trim(),
        detectMethod: String(item.detectMethod || "").trim(),
        sort: index + 1,
        key: String(item.inspectItemName || `参数${index + 1}`),
        val: preview,
        desc: String(item.desc || "").trim(),
        monitor: item.monitor ?? 0,
        refId: item.refId,
        files: normalizeFiles(item.files),
        standard
      }
    })
  })

  emit("success", cloneDeep(customTableData.value))
  emit("close")
  ElMessage.success("保存成功")
}
</script>

<style scoped lang="scss">
.craft-params-config-panel {
  min-height: 500px;
}

.toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.operation {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.cell-block,
.section,
.field,
.column {
  display: flex;
  flex-direction: column;
}

.cell-block,
.field,
.column {
  gap: 8px;
}

.cell-text.empty,
.file-count {
  color: var(--el-text-color-secondary);
}

.file-list,
.row,
.grid,
.quantitative,
.quantitative-layout {
  display: flex;
  gap: 12px;
}

.file-list {
  flex-wrap: wrap;
  align-items: center;
}

.file-image {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--el-border-color-light);
}

.file-image.large {
  width: 88px;
  height: 88px;
}

.section {
  gap: 12px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #f8fafc;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
}

.label {
  min-width: 52px;
  line-height: 32px;
}

.quantitative-config-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.quantitative-config-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.quantitative-layout {
  align-items: stretch;
}

.quantitative-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s ease;

  &.is-active {
    border-color: #2563eb;
    background: #eff6ff;
  }

  &.is-inactive {
    opacity: 0.7;
    background: #f9fafb;
  }
}

.quantitative-card__head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mode-indicator {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid #d1d5db;
  background: #fff;
  transition: all 0.2s ease;

  &.is-active {
    border-color: #2563eb;
    background: #2563eb;
    box-shadow: inset 0 0 0 3px #fff;
  }
}

.quantitative-card__title {
  font-weight: 600;
  font-size: 14px;
}

.active-tag {
  margin-left: auto;
  padding: 2px 8px;
  font-size: 12px;
  color: #2563eb;
  background: #dbeafe;
  border-radius: 4px;
}

.single-mode-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.operator-select {
  width: 80px;
}

.standard-input {
  flex: 1;
}

.standard-range-layout {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.standard-value-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f3f4f6;
  border-radius: 8px;

  &--tall {
    min-height: 40px;
  }
}

.range-label {
  min-width: 52px;
  font-size: 13px;
  color: #374151;
}

.tolerance-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tolerance-row-label {
  min-width: 52px;
  font-size: 13px;
  color: #374151;
}

.tolerance-sign-select {
  width: 60px;
}

.range-number {
  flex: 1;
}

.grid {
  align-items: flex-start;
}

.grid > .field {
  flex: 1;
}

.preview {
  min-height: 40px;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #fff;
  line-height: 20px;
}

.field-required label::before {
  content: "*";
  color: #f56c6c;
  margin-right: 4px;
}

@media (max-width: 1200px) {
  .quantitative,
  .quantitative-layout,
  .grid,
  .row {
    flex-direction: column;
  }
}
</style>


