<template>
  <div class="check-config">
    <CustomTitle title="保养配置">
      <div v-if="!justSee">
        <el-button type="primary" icon="Plus" @click="onCreateBlank">新增保养项</el-button>
      </div>
    </CustomTitle>

    <CustomTable
      ref="customTableRef"
      v-model:table-data="tableData"
      :config="tableConfig"
      class="custom-table"
    >
      <template #inspectionCode-default="{ row }">
        <el-input
          v-model.trim="row.patrolItem.inspectionCode"
          :disabled="justSee"
          placeholder="请输入保养项编号"
          clearable
          class="table-input"
        />
      </template>

      <template #inspectionName-default="{ row }">
        <el-input
          v-model.trim="row.patrolItem.inspectionName"
          :disabled="justSee"
          placeholder="请输入保养项名称"
          clearable
          class="table-input"
        />
      </template>

      <template #maintenanceType-default="{ row }">
        <el-select
          v-model="row.patrolItem.maintenanceTypeId"
          :disabled="justSee"
          class="table-select"
          clearable
          filterable
          placeholder="请选择保养类型"
          @change="syncMaintenanceType(row.patrolItem, $event)"
        >
          <el-option
            v-for="item in maintenanceTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </template>

      <template #standardType-default="{ row }">
        <el-select
          v-model="row.patrolItem.inspectionStandard.standardType"
          :disabled="justSee"
          class="table-select"
          @change="onStandardTypeChange(row.patrolItem.inspectionStandard, $event)"
        >
          <el-option
            v-for="item in standardTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </template>

      <template #method-default="{ row }">
        <el-input
          v-model.trim="row.patrolItem.method"
          :disabled="justSee"
          placeholder="请输入探测方式"
          clearable
          class="table-input"
        />
      </template>

      <template #inspectionStandard-default="{ row }">
        <div class="standard-cell">
          <el-input
            v-if="Number(row.patrolItem.inspectionStandard.standardType) === InspectionStandardType.Text"
            v-model.trim="row.patrolItem.inspectionStandard.standardDesc"
            :disabled="justSee"
            placeholder="请输入检验标准"
            clearable
            class="table-input standard-input-text"
          />
          <span v-else class="standard-text">{{ formatStandard(row.patrolItem) || "-" }}</span>
          <el-button
            v-if="!justSee"
            link
            type="primary"
            size="small"
            class="standard-action"
            @click="onEditRow(row)"
          >
            详情配置
          </el-button>
        </div>
      </template>

      <template #inspectionExecutePosition-default="{ row }">
        <el-cascader
          v-model="row.patrolItem.inspectionPositionValue"
          :options="departmentPositionOptions"
          :props="departmentPositionCascaderProps"
          :disabled="justSee"
          filterable
          clearable
          class="table-cascader"
          placeholder="请选择保养执行职位"
          @change="onDepartmentPositionChange(row.patrolItem, $event)"
        />
      </template>

      <template #files-default="{ row }">
        <div v-if="row.patrolItem.files.length" class="image-list-cell">
          <el-image
            v-for="item in row.patrolItem.files"
            :key="item.fileId"
            class="image-item"
            :src="item.fileUrl"
            :preview-src-list="[item.fileUrl]"
            :preview-teleported="true"
            fit="contain"
          />
        </div>
        <span v-else>-</span>
      </template>

      <template #operation-default="{ row }">
        <el-button link type="primary" size="small" @click="onCopyRow(row)">复制</el-button>
        <el-button link type="danger" size="small" @click="onDeleteRow(row)">删除</el-button>
      </template>
    </CustomTable>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="1080px"
      destroy-on-close
      append-to-body
      class="mro-maintenance-config-dialog"
    >
      <el-form ref="formRef" :model="dialogForm" :rules="formRules" label-width="120px">
        <div class="section-title">基础信息</div>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="保养项编号" prop="inspectionCode">
              <el-input v-model.trim="dialogForm.inspectionCode" placeholder="请输入保养项编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="保养项名称" prop="inspectionName">
              <el-input v-model.trim="dialogForm.inspectionName" placeholder="请输入保养项名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="保养类型" prop="maintenanceTypeId">
              <el-select
                v-model="dialogForm.maintenanceTypeId"
                class="w-full"
                clearable
                filterable
                placeholder="请选择保养类型"
                @change="syncMaintenanceType(dialogForm, $event)"
              >
                <el-option
                  v-for="item in maintenanceTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="标准类型" prop="inspectionStandard.standardType">
              <el-select
                v-model="dialogForm.inspectionStandard.standardType"
                class="w-full"
                @change="onStandardTypeChange(dialogForm.inspectionStandard, $event)"
              >
                <el-option
                  v-for="item in standardTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="探测方式" prop="method">
              <el-input v-model.trim="dialogForm.method" placeholder="请输入探测方式" />
            </el-form-item>
          </el-col>
        </el-row>

        <div class="section-title">保养条件</div>
        <el-row :gutter="16">
          <el-col :span="24">
            <el-form-item label="检验标准">
              <div class="w-full">
                <template v-if="Number(dialogForm.inspectionStandard.standardType) === InspectionStandardType.Number">
                  <div class="quantitative-layout">
                    <div
                      class="quantitative-card"
                      :class="{ 'is-active': isSingleQuantitativeMode, 'is-inactive': !isSingleQuantitativeMode }"
                      @click="activateSingleMode"
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
                          :disabled="!isSingleQuantitativeMode"
                          @focus="activateSingleMode"
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
                          :disabled="!isSingleQuantitativeMode"
                          placeholder="请输入标准值"
                          @focus="activateSingleMode"
                        />
                      </div>
                    </div>

                    <div
                      class="quantitative-card"
                      :class="{ 'is-active': !isSingleQuantitativeMode, 'is-inactive': isSingleQuantitativeMode }"
                      @click="activateRangeMode"
                    >
                      <div class="quantitative-card__head">
                        <span class="mode-indicator" :class="{ 'is-active': !isSingleQuantitativeMode }"></span>
                        <span class="quantitative-card__title">双区间</span>
                        <span v-if="!isSingleQuantitativeMode" class="active-tag">当前生效</span>
                      </div>
                      <div class="standard-range-layout">
                        <div class="standard-value-card">
                          <span class="range-label">标准值</span>
                          <el-input-number
                            v-model="dialogForm.inspectionStandard.standardValue"
                            :controls="false"
                            class="range-number"
                            :disabled="isSingleQuantitativeMode"
                            placeholder="请输入标准值"
                            @focus="activateRangeMode"
                          />
                        </div>
                        <div class="tolerance-stack">
                          <div class="tolerance-row">
                            <span class="tolerance-row-label">上公差</span>
                            <el-select
                              v-model="dialogForm.inspectionStandard.upperToleranceSign"
                              class="tolerance-sign-select"
                              :disabled="isSingleQuantitativeMode"
                              @focus="activateRangeMode"
                            >
                              <el-option label="+" value="+" />
                              <el-option label="-" value="-" />
                            </el-select>
                            <el-input-number
                              v-model="dialogForm.inspectionStandard.upperTolerance"
                              :controls="false"
                              class="range-number"
                              :disabled="isSingleQuantitativeMode"
                              placeholder="请输入上公差"
                              @focus="activateRangeMode"
                            />
                          </div>
                          <div class="tolerance-row">
                            <span class="tolerance-row-label">下公差</span>
                            <el-select
                              v-model="dialogForm.inspectionStandard.lowerToleranceSign"
                              class="tolerance-sign-select"
                              :disabled="isSingleQuantitativeMode"
                              @focus="activateRangeMode"
                            >
                              <el-option label="+" value="+" />
                              <el-option label="-" value="-" />
                            </el-select>
                            <el-input-number
                              v-model="dialogForm.inspectionStandard.lowerTolerance"
                              :controls="false"
                              class="range-number"
                              :disabled="isSingleQuantitativeMode"
                              placeholder="请输入下公差"
                              @focus="activateRangeMode"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>

                <el-input
                  v-else
                  v-model.trim="dialogForm.inspectionStandard.standardDesc"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入检验标准"
                />
              </div>
            </el-form-item>
          </el-col>

          <el-col v-if="Number(dialogForm.inspectionStandard.standardType) === InspectionStandardType.Number" :span="12">
            <el-form-item label="检验标准预览">
              <div class="standard-preview">{{ standardPreview }}</div>
            </el-form-item>
          </el-col>
          <el-col v-if="Number(dialogForm.inspectionStandard.standardType) === InspectionStandardType.Number" :span="12">
            <el-form-item label="单位">
              <el-select
                v-model="dialogForm.inspectionStandard.unitId"
                class="w-full"
                clearable
                filterable
                placeholder="请选择单位"
              >
                <el-option v-for="item in unitOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="保养执行职位" prop="inspectionPositionValue">
              <el-cascader
                v-model="dialogForm.inspectionPositionValue"
                class="w-full"
                clearable
                filterable
                separator="-"
                :options="departmentPositionOptions"
                :props="departmentPositionCascaderProps"
                placeholder="请选择部门职位"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <div class="section-title">辅助信息</div>
        <el-form-item label="图片说明">
          <UploadImage v-model="dialogForm.files" :limit="5" multiple />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="onDialogSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from "element-plus"
import { ElMessage, ElMessageBox } from "element-plus"
import cloneDeep from "lodash/cloneDeep"

import { queryDepartmentWorkItemPageList } from "@/api/departmentWorkItem"
import { editEquipmentModelConfig, getEquipmentModelConfigPaged } from "@/api/equipmentModelConfig"
import { requestEquipmentMaintenanceTypeList } from "@/api/operation/equipment/equipment-maintenance-type"
import { requestAllEquipmentModel } from "@/api/operation/equipment/equipment-model"
import { DeviceInitSettingTabs, InspectionStandardType } from "@/api/operation/equipment/types"
import { getUnit } from "@/api/units"
import CustomTable from "@/components/CustomTable/index.vue"
import type { ComponentExposed, ITableConfig } from "@/components/CustomTable/type"
import CustomTitle from "@/components/CustomTitle/index.vue"
import UploadImage from "@/components/UploadImage/index.vue"
import type { IDepartmentWorkItem } from "@/types/base-info/department-work-item"
import type { IOption, IUploadPhoto } from "@/types/base-info/global-config"
import type { IEquipmentMaintenanceTypeItem } from "@/types/maintain/equipment-manage/equipment-maintenance-type"
import type { IEquipmentModelPageItem } from "@/types/maintain/equipment-manage/equipment-model"
import { isNumberStandardValid } from "@/utils"
import { formatImgUrlPreview } from "@/utils/common"
import { typeNumberHandle } from "@/utils/inspectStandard"

interface IDepartmentPositionOption {
  label: string
  value: string
  children?: IDepartmentPositionOption[]
}

type IQuantitativeMode = "lower" | "upper" | "range"

interface IInspectionStandard {
  standardDesc: string
  standardMax: string | number | null
  standardMaxInclusive: number
  standardMin: string | number | null
  standardMinInclusive: number
  standardType: number
  quantitativeMode?: IQuantitativeMode
  standardValue?: number | string | null
  upperTolerance?: number | string | null
  lowerTolerance?: number | string | null
  upperToleranceSign?: "+" | "-"
  lowerToleranceSign?: "+" | "-"
  unitId: string
  unitName: string
}

interface IPatrolItem {
  inspectionName: string
  inspectionCode: string
  maintenanceTypeId: string
  maintenanceTypeName: string
  inspectionFrequency: number
  inspectionPositionValue: string[]
  inspectionExecuteDepartmentId: string
  inspectionExecuteDepartmentName: string
  inspectionExecutePositionId: string
  inspectionExecutePositionName: string
  method: string
  inspectionStandard: IInspectionStandard
  files: IUploadPhoto[]
  fileDesc: string
  remarks: string
}

interface ITableRow {
  id: string
  equipmentModelId: string
  mconfigType: number
  isTemp?: boolean
  patrolItem: IPatrolItem
}

const props = defineProps<{
  modelId: string
  justSee?: boolean
}>()

const emit = defineEmits<{
  (e: "success"): void
  (e: "dirty-change", value: boolean): void
}>()

const departmentPositionCascaderProps = {
  emitPath: true,
  checkStrictly: false
}

const standardTypeOptions = [
  { label: "定量", value: InspectionStandardType.Number },
  { label: "定性", value: InspectionStandardType.Text }
]

const customTableRef = ref<ComponentExposed<typeof CustomTable>>()
const formRef = ref<FormInstance>()
const tableData = ref<ITableRow[]>([])
const dialogVisible = ref(false)
const editingRowId = ref("")
const maintenanceTypeOptions = ref<IOption[]>([])
const unitOptions = ref<IOption[]>([])
const departmentPositionOptions = ref<IDepartmentPositionOption[]>([])
const currentEquipmentModel = ref<IEquipmentModelPageItem>()
const dialogForm = ref<IPatrolItem>(createDefaultPatrolItem())
const loaded = ref(false)
const savedPayloadText = ref("[]")

const currentUnitName = computed(
  () =>
    unitOptions.value.find((item) => String(item.value) === String(dialogForm.value.inspectionStandard.unitId))?.label ||
    dialogForm.value.inspectionStandard.unitName || ""
)

const isSingleQuantitativeMode = computed(() => dialogForm.value.inspectionStandard.quantitativeMode !== "range")

function clearSingleQuantitativeFields(standard: IInspectionStandard) {
  standard.standardMax = null
  standard.standardMaxInclusive = 1
  standard.standardMin = null
  standard.standardMinInclusive = 1
}

function clearRangeQuantitativeFields(standard: IInspectionStandard) {
  standard.standardValue = null
  standard.upperTolerance = null
  standard.lowerTolerance = null
  standard.upperToleranceSign = "+"
  standard.lowerToleranceSign = "-"
}

function applySingleIntervalMode(standard: IInspectionStandard, mode: "lower" | "upper", inclusive: number) {
  clearRangeQuantitativeFields(standard)
  standard.quantitativeMode = mode
  if (mode === "upper") {
    standard.standardMin = null
    standard.standardMinInclusive = 1
    standard.standardMaxInclusive = inclusive
    return
  }
  standard.standardMax = null
  standard.standardMaxInclusive = 1
  standard.standardMinInclusive = inclusive
}

const singleIntervalOperator = computed({
  get: () => {
    const standard = dialogForm.value.inspectionStandard
    if (standard.quantitativeMode === "upper") {
      return Number(standard.standardMaxInclusive ?? 1) === 1 ? "<=" : "<"
    }
    return Number(standard.standardMinInclusive ?? 1) === 1 ? ">=" : ">"
  },
  set: (value: string) => {
    const standard = dialogForm.value.inspectionStandard
    if (value === "<" || value === "<=") {
      applySingleIntervalMode(standard, "upper", value === "<=" ? 1 : 0)
      return
    }
    applySingleIntervalMode(standard, "lower", value === ">=" ? 1 : 0)
  }
})

const singleIntervalValue = computed<number | undefined>({
  get: () => {
    const standard = dialogForm.value.inspectionStandard
    const value = standard.quantitativeMode === "upper" ? standard.standardMax : standard.standardMin
    return hasStandardNumericValue(value) ? Number(value) : undefined
  },
  set: (value) => {
    const standard = dialogForm.value.inspectionStandard
    if (standard.quantitativeMode === "upper") {
      standard.standardMax = value ?? null
      return
    }
    standard.standardMin = value ?? null
  }
})

const standardPreview = computed(() => {
  const standard = dialogForm.value.inspectionStandard
  if (Number(standard.standardType) === InspectionStandardType.Text) {
    return String(standard.standardDesc || "").trim()
  }
  return (
    typeNumberHandle(
      {
        standardType: InspectionStandardType.Number,
        standardDesc: "",
        standardMax: standard.quantitativeMode === "upper" ? standard.standardMax ?? null : null,
        standardMaxInclusive: standard.standardMaxInclusive,
        standardMin: standard.quantitativeMode === "lower" ? standard.standardMin ?? null : null,
        standardMinInclusive: standard.standardMinInclusive,
        quantitativeMode: standard.quantitativeMode,
        standardValue: standard.quantitativeMode === "range" ? standard.standardValue ?? null : null,
        upperTolerance: standard.quantitativeMode === "range" ? standard.upperTolerance ?? null : null,
        lowerTolerance: standard.quantitativeMode === "range" ? standard.lowerTolerance ?? null : null,
        upperToleranceSign: standard.upperToleranceSign,
        lowerToleranceSign: standard.lowerToleranceSign,
        unitName: currentUnitName.value
      },
      true
    ) || ""
  )
})

const dialogTitle = computed(() => {
  const row = tableData.value.find((item) => item.id === editingRowId.value)
  return row?.isTemp ? "新增保养项" : "编辑保养项"
})

function cloneData<T>(data: T): T {
  return JSON.parse(JSON.stringify(data ?? null))
}

const formRules = reactive<FormRules<IPatrolItem>>({
  inspectionName: [{ required: true, message: "请输入保养项名称", trigger: "blur" }],
  maintenanceTypeId: [{ required: true, message: "请选择保养类型", trigger: "change" }],
  inspectionPositionValue: [
    {
      validator: (rule, value, callback) => {
        if (!(value || []).length) {
          callback(new Error("请选择保养执行职位"))
          return
        }
        callback()
      },
      trigger: "change"
    }
  ],
  "inspectionStandard.standardDesc": [
    {
      validator: (rule, value, callback) => {
        if (Number(dialogForm.value.inspectionStandard.standardType) === InspectionStandardType.Text && !String(value || "").trim()) {
          callback(new Error("请输入检验标准"))
          return
        }
        callback()
      },
      trigger: "blur"
    }
  ]
})

const tableConfig = computed<ITableConfig>(() => ({
  height: "100%",
  columns: [
    { prop: "inspectionCode", label: "保养项编号", minWidth: 160, slots: { default: "inspectionCode-default" } },
    { prop: "inspectionName", label: "保养项名称", minWidth: 180, slots: { default: "inspectionName-default" } },
    { prop: "maintenanceTypeName", label: "保养类型", minWidth: 160, slots: { default: "maintenanceType-default" } },
    { prop: "standardType", label: "标准类型", width: 120, align: "center", slots: { default: "standardType-default" } },
    { prop: "method", label: "探测方式", minWidth: 180, slots: { default: "method-default" } },
    { prop: "inspectionStandard", label: "检验标准", minWidth: 240, slots: { default: "inspectionStandard-default" } },
    { prop: "inspectionExecutePosition", label: "保养执行职位", minWidth: 180, slots: { default: "inspectionExecutePosition-default" } },
    { prop: "files", label: "图片说明", minWidth: 180, slots: { default: "files-default" } },
    { prop: "operation", label: "操作", width: 120, fixed: "right", hidden: !!props.justSee, slots: { default: "operation-default" } }
  ]
}))

function createDefaultStandard(standardType: number = InspectionStandardType.Text): IInspectionStandard {
  return {
    standardDesc: "",
    standardMax: null,
    standardMaxInclusive: 1,
    standardMin: null,
    standardMinInclusive: 1,
    standardType,
    quantitativeMode: "lower",
    standardValue: null,
    upperTolerance: null,
    lowerTolerance: null,
    upperToleranceSign: "+",
    lowerToleranceSign: "-",
    unitId: "",
    unitName: ""
  }
}

function createDefaultPatrolItem(): IPatrolItem {
  const departmentId = currentEquipmentModel.value?.maintenanceExecuteDepartmentId || ""
  const departmentName = currentEquipmentModel.value?.maintenanceExecuteDepartmentName || ""
  const positionId = currentEquipmentModel.value?.maintenanceExecutePositionId || ""
  const positionName = currentEquipmentModel.value?.maintenanceExecutePositionName || ""
  return {
    inspectionName: "",
    inspectionCode: "",
    maintenanceTypeId: "",
    maintenanceTypeName: "",
    inspectionFrequency: 1,
    inspectionPositionValue: createDepartmentPositionValue(departmentId, positionId),
    inspectionExecuteDepartmentId: departmentId,
    inspectionExecuteDepartmentName: departmentName,
    inspectionExecutePositionId: positionId,
    inspectionExecutePositionName: positionName,
    method: "",
    inspectionStandard: createDefaultStandard(),
    files: [],
    fileDesc: "",
    remarks: ""
  }
}

function buildTempId() {
  return `temp-maintenance-check-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
}

function normalizeFile(item: Record<string, any>): IUploadPhoto {
  return {
    fileId: String(item?.id || item?.fileId || ""),
    fileName: item?.fileName || "",
    fileUrl: item?.fileUrl || formatImgUrlPreview(item?.path || "")
  }
}

function hasStandardNumericValue(value: unknown) {
  return value !== null && value !== undefined && value !== ""
}

function normalizeInspectionStandard(rawStandard: Record<string, any> = {}): IInspectionStandard {
  const hasRangeMode =
    rawStandard.quantitativeMode === "range" ||
    (hasStandardNumericValue(rawStandard.standardValue) &&
      hasStandardNumericValue(rawStandard.upperTolerance) &&
      hasStandardNumericValue(rawStandard.lowerTolerance))

  let quantitativeMode: IQuantitativeMode = "lower"
  if (hasRangeMode) {
    quantitativeMode = "range"
  } else if (hasStandardNumericValue(rawStandard.standardMax)) {
    quantitativeMode = "upper"
  }

  let standardValue = hasStandardNumericValue(rawStandard.standardValue) ? Number(rawStandard.standardValue) : null
  let upperTolerance = hasStandardNumericValue(rawStandard.upperTolerance) ? Number(rawStandard.upperTolerance) : null
  let lowerTolerance = hasStandardNumericValue(rawStandard.lowerTolerance) ? Number(rawStandard.lowerTolerance) : null
  let upperToleranceSign = (rawStandard.upperToleranceSign || "+") as "+" | "-"
  let lowerToleranceSign = (rawStandard.lowerToleranceSign || "-") as "+" | "-"

  if (
    quantitativeMode === "range" &&
    !hasStandardNumericValue(rawStandard.standardValue) &&
    hasStandardNumericValue(rawStandard.standardMin) &&
    hasStandardNumericValue(rawStandard.standardMax)
  ) {
    const min = Number(rawStandard.standardMin)
    const max = Number(rawStandard.standardMax)
    standardValue = Number(((min + max) / 2).toFixed(6))
    upperTolerance = Number((max - standardValue).toFixed(6))
    lowerTolerance = Number((min - standardValue).toFixed(6))
    upperToleranceSign = upperTolerance >= 0 ? "+" : "-"
    lowerToleranceSign = lowerTolerance >= 0 ? "+" : "-"
    upperTolerance = Math.abs(upperTolerance)
    lowerTolerance = Math.abs(lowerTolerance)
  }

  return {
    standardDesc: String(rawStandard.standardDesc || ""),
    standardMax: hasStandardNumericValue(rawStandard.standardMax) ? Number(rawStandard.standardMax) : null,
    standardMaxInclusive: Number(rawStandard.standardMaxInclusive ?? 1),
    standardMin: hasStandardNumericValue(rawStandard.standardMin) ? Number(rawStandard.standardMin) : null,
    standardMinInclusive: Number(rawStandard.standardMinInclusive ?? 1),
    standardType: Number(rawStandard.standardType || InspectionStandardType.Text),
    quantitativeMode,
    standardValue,
    upperTolerance,
    lowerTolerance,
    upperToleranceSign,
    lowerToleranceSign,
    unitId: String(rawStandard.unitId || ""),
    unitName: String(rawStandard.unitName || "")
  }
}

function createDepartmentPositionValue(departmentId?: string, positionId?: string) {
  if (!departmentId || !positionId) return []
  return [departmentId, positionId]
}

function normalizePatrolItem(rawItem: Record<string, any> = {}): IPatrolItem {
  const departmentId = String(rawItem?.maintenanceExecuteDepartmentId || rawItem?.inspectionExecuteDepartmentId || "")
  const departmentName = String(rawItem?.maintenanceExecuteDepartmentName || rawItem?.inspectionExecuteDepartmentName || "")
  const positionId = String(rawItem?.maintenanceExecutePositionId || rawItem?.inspectionExecutePositionId || "")
  const positionName = String(rawItem?.maintenanceExecutePositionName || rawItem?.inspectionExecutePositionName || "")
  const maintenanceTypeId = String(rawItem?.maintenanceTypeId || "")
  const maintenanceTypeName =
    String(rawItem?.maintenanceTypeName || "") || getMaintenanceTypeNameById(maintenanceTypeId)
  return {
    inspectionName: String(rawItem?.maintenanceName || rawItem?.inspectionName || "").trim(),
    inspectionCode: String(rawItem?.maintenanceCode || rawItem?.inspectionCode || "").trim(),
    maintenanceTypeId,
    maintenanceTypeName,
    inspectionFrequency: Number(rawItem?.maintenanceFrequency || rawItem?.inspectionFrequency || 1),
    inspectionPositionValue: createDepartmentPositionValue(departmentId, positionId),
    inspectionExecuteDepartmentId: departmentId,
    inspectionExecuteDepartmentName: departmentName,
    inspectionExecutePositionId: positionId,
    inspectionExecutePositionName: positionName,
    method: String(rawItem?.method || "").trim(),
    inspectionStandard: normalizeInspectionStandard(rawItem?.inspectionStandard || {}),
    files: Array.isArray(rawItem?.files) ? rawItem.files.map(normalizeFile) : [],
    fileDesc: String(rawItem?.fileDesc || ""),
    remarks: String(rawItem?.remarks || "")
  }
}

function parseConfigValue(value: unknown) {
  if (!value || typeof value !== "string") return value
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

function normalizeRow(row: Record<string, any>): ITableRow {
  const parsedMconfigValue = parseConfigValue(row?.mconfigValue) as Record<string, any>
  const parsedMaintenanceConfigValue = parseConfigValue(row?.maintenanceConfigValue) as Record<string, any>
  const rawPatrolItem =
    row?.maintenanceItem ||
    parsedMaintenanceConfigValue ||
    parseConfigValue(parsedMconfigValue?.maintenanceConfigValue) ||
    {}
  return {
    id: row?.id ? String(row.id) : buildTempId(),
    equipmentModelId: String(row?.equipmentModelId || props.modelId || ""),
    mconfigType: Number(row?.mconfigType || DeviceInitSettingTabs.maintain),
    isTemp: !row?.id,
    patrolItem: normalizePatrolItem(rawPatrolItem)
  }
}

function formatStandard(item: Pick<IPatrolItem, "inspectionStandard">) {
  return typeNumberHandle({ ...item.inspectionStandard, unitName: item.inspectionStandard.unitName || "" }, true) || item.inspectionStandard.standardDesc || ""
}

function onStandardTypeChange(standard: IInspectionStandard, value: number) {
  standard.standardType = Number(value || InspectionStandardType.Text)
  if (Number(standard.standardType) === InspectionStandardType.Text) {
    standard.standardMax = null
    standard.standardMin = null
    standard.standardValue = null
    standard.upperTolerance = null
    standard.lowerTolerance = null
    standard.quantitativeMode = "lower"
    standard.unitId = ""
    standard.unitName = ""
    return
  }
  standard.standardDesc = ""
  standard.upperToleranceSign = "+"
  standard.lowerToleranceSign = "-"
  if (standard.quantitativeMode === "range") return
  standard.quantitativeMode = hasStandardNumericValue(standard.standardMax) ? "upper" : "lower"
}

function getMaintenanceTypeNameById(id: string) {
  return (
    maintenanceTypeOptions.value.find((item) => String(item.value) === String(id || ""))?.label || ""
  )
}

function syncMaintenanceType(item: IPatrolItem, value?: string) {
  item.maintenanceTypeId = String(value ?? item.maintenanceTypeId ?? "")
  item.maintenanceTypeName = getMaintenanceTypeNameById(item.maintenanceTypeId)
}

function activateSingleMode() {
  const standard = dialogForm.value.inspectionStandard
  const nextMode = standard.quantitativeMode === "upper" ? "upper" : "lower"
  const inclusive =
    nextMode === "upper"
      ? Number(standard.standardMaxInclusive ?? 1)
      : Number(standard.standardMinInclusive ?? 1)
  applySingleIntervalMode(standard, nextMode, inclusive)
}

function activateRangeMode() {
  const standard = dialogForm.value.inspectionStandard
  clearSingleQuantitativeFields(standard)
  standard.quantitativeMode = "range"
}

const buildDepartmentPositionOptions = (departments: IDepartmentWorkItem[]) =>
  departments
    .filter((department) => (department.positionList || []).length)
    .map((department) => ({
      label: department.depName,
      value: department.id,
      children: (department.positionList || []).map((position) => ({ label: position.name, value: position.id }))
    }))

function ensureCurrentDepartmentPositionOption(params: { depId?: string; depName?: string; positionId?: string; positionName?: string }) {
  const { depId = "", depName = "", positionId = "", positionName = "" } = params
  if (!depId || !positionId) return

  let departmentNode = departmentPositionOptions.value.find((item) => item.value === depId)
  if (!departmentNode) {
    departmentNode = { label: depName || depId, value: depId, children: [] }
    departmentPositionOptions.value.unshift(departmentNode)
  }

  departmentNode.children ||= []
  if (!departmentNode.children.some((item) => item.value === positionId)) {
    departmentNode.children.unshift({
      label: positionName.replace(`${departmentNode.label}-`, "") || positionId,
      value: positionId
    })
  }
}

function syncDepartmentPositionValue(item: IPatrolItem) {
  item.inspectionPositionValue = createDepartmentPositionValue(
    item.inspectionExecuteDepartmentId,
    item.inspectionExecutePositionId
  )
}

function onDepartmentPositionChange(item: IPatrolItem, value?: string[]) {
  const [inspectionExecuteDepartmentId = "", inspectionExecutePositionId = ""] = value || []
  item.inspectionExecuteDepartmentId = inspectionExecuteDepartmentId
  item.inspectionExecutePositionId = inspectionExecutePositionId

  if (!inspectionExecuteDepartmentId || !inspectionExecutePositionId) {
    item.inspectionExecuteDepartmentName = ""
    item.inspectionExecutePositionName = ""
    item.inspectionPositionValue = []
    return
  }

  const department = departmentPositionOptions.value.find((option) => option.value === inspectionExecuteDepartmentId)
  const position = department?.children?.find((option) => option.value === inspectionExecutePositionId)

  item.inspectionExecuteDepartmentName = department?.label || ""
  item.inspectionExecutePositionName = position?.label ? `${department?.label || ""}-${position.label}` : ""
  item.inspectionPositionValue = value || []
}

function getSelectedDepartmentPosition(value: string[]) {
  const [departmentId = "", positionId = ""] = value || []
  const department = departmentPositionOptions.value.find((item) => item.value === departmentId)
  const position = department?.children?.find((item) => item.value === positionId)
  return {
    departmentId,
    departmentName: department?.label || "",
    positionId,
    positionName: position?.label || ""
  }
}

async function loadUnitOptions() {
  if (unitOptions.value.length) return
  const data = await getUnit()
  unitOptions.value = data.map((item) => ({ label: item.unitName, value: String(item.id) }))
}

async function loadMaintenanceTypeOptions() {
  if (maintenanceTypeOptions.value.length) return
  const data = await requestEquipmentMaintenanceTypeList()
  maintenanceTypeOptions.value = (data || []).map((item: IEquipmentMaintenanceTypeItem) => ({
    label: item.maintenanceTypeName,
    value: String(item.id)
  }))
}

async function loadCurrentEquipmentModel() {
  if (!props.modelId) {
    currentEquipmentModel.value = undefined
    return
  }
  const list = await requestAllEquipmentModel()
  currentEquipmentModel.value = list.find((item) => String(item.id) === String(props.modelId))
  ensureCurrentDepartmentPositionOption({
    depId: currentEquipmentModel.value?.maintenanceExecuteDepartmentId,
    depName: currentEquipmentModel.value?.maintenanceExecuteDepartmentName,
    positionId: currentEquipmentModel.value?.maintenanceExecutePositionId,
    positionName: currentEquipmentModel.value?.maintenanceExecutePositionName
  })
}

async function loadDepartmentPositionOptions() {
  const result = await queryDepartmentWorkItemPageList({ pageNum: 1, pageSize: 999 })
  departmentPositionOptions.value = buildDepartmentPositionOptions(result.records || [])
  ensureCurrentDepartmentPositionOption({
    depId: currentEquipmentModel.value?.maintenanceExecuteDepartmentId,
    depName: currentEquipmentModel.value?.maintenanceExecuteDepartmentName,
    positionId: currentEquipmentModel.value?.maintenanceExecutePositionId,
    positionName: currentEquipmentModel.value?.maintenanceExecutePositionName
  })
}

function getTableSavePayload(rows: ITableRow[] = tableData.value) {
  return rows.map((row) => mapRowToSaveParams(row))
}

function syncSavedSnapshot(rows: ITableRow[] = tableData.value) {
  savedPayloadText.value = JSON.stringify(getTableSavePayload(rows))
  loaded.value = true
  emit("dirty-change", false)
}

const isDirty = computed(() => {
  if (!loaded.value) return false
  return JSON.stringify(getTableSavePayload()) !== savedPayloadText.value
})

async function getTableData(syncSnapshot = true) {
  if (!props.modelId) {
    tableData.value = []
    if (syncSnapshot) {
      syncSavedSnapshot([])
    }
    return []
  }

  customTableRef.value?.setLoading(true)
  try {
    const { records } = await getEquipmentModelConfigPaged({
      pageQuery: { pageNum: 1, pageSize: 1000 },
      queryParam: { equipmentModelId: props.modelId, mconfigType: DeviceInitSettingTabs.maintain }
    })
    const rows = (records || []).map((item) => normalizeRow(item))
    rows.forEach((row) => {
      ensureCurrentDepartmentPositionOption({
        depId: row.patrolItem.inspectionExecuteDepartmentId,
        depName: row.patrolItem.inspectionExecuteDepartmentName,
        positionId: row.patrolItem.inspectionExecutePositionId,
        positionName: row.patrolItem.inspectionExecutePositionName
      })
      syncDepartmentPositionValue(row.patrolItem)
    })
    tableData.value = rows
    if (syncSnapshot) {
      syncSavedSnapshot(rows)
    }
    return rows
  } finally {
    customTableRef.value?.setLoading(false)
  }
}

async function onCreateBlank() {
  if (!currentEquipmentModel.value && props.modelId) {
    await loadCurrentEquipmentModel()
  }
  tableData.value.unshift({
    id: buildTempId(),
    equipmentModelId: props.modelId,
    mconfigType: DeviceInitSettingTabs.maintain,
    isTemp: true,
    patrolItem: createDefaultPatrolItem()
  })
}

function createCopiedRow(row: ITableRow): ITableRow {
  return {
    ...cloneDeep(row),
    id: buildTempId(),
    isTemp: true,
    patrolItem: { ...cloneDeep(row.patrolItem), inspectionCode: "" }
  }
}

function onCopyRow(row: ITableRow) {
  tableData.value.unshift(createCopiedRow(row))
}

async function onEditRow(row: ITableRow) {
  editingRowId.value = row.id
  dialogForm.value = cloneDeep(row.patrolItem)
  ensureCurrentDepartmentPositionOption({
    depId: row.patrolItem.inspectionExecuteDepartmentId,
    depName: row.patrolItem.inspectionExecuteDepartmentName,
    positionId: row.patrolItem.inspectionExecutePositionId,
    positionName: row.patrolItem.inspectionExecutePositionName
  })
  await Promise.all([
    loadUnitOptions(),
    loadCurrentEquipmentModel(),
    loadDepartmentPositionOptions(),
    loadMaintenanceTypeOptions()
  ])
  syncMaintenanceType(dialogForm.value)
  dialogVisible.value = true
}

function validateQuantitativeFields(standard: IInspectionStandard) {
  if (standard.quantitativeMode === "lower" && !hasStandardNumericValue(standard.standardMin)) return "请输入下限值"
  if (standard.quantitativeMode === "upper" && !hasStandardNumericValue(standard.standardMax)) return "请输入上限值"
  if (standard.quantitativeMode === "range") {
    if (!hasStandardNumericValue(standard.standardValue)) return "请输入标准值"
    if (!hasStandardNumericValue(standard.upperTolerance)) return "请输入上公差"
    if (!hasStandardNumericValue(standard.lowerTolerance)) return "请输入下公差"
  }
  return ""
}

function buildInspectionStandardPayload(standard: IInspectionStandard, previewText?: string) {
  if (Number(standard.standardType) === InspectionStandardType.Text) {
    return { standardType: InspectionStandardType.Text, standardDesc: String(standard.standardDesc || "").trim() }
  }

  const mode = standard.quantitativeMode || "lower"
  const upperDeviation = mode === "range" ? (standard.upperToleranceSign === "-" ? -1 : 1) * Number(standard.upperTolerance || 0) : 0
  const lowerDeviation = mode === "range" ? (standard.lowerToleranceSign === "-" ? -1 : 1) * Number(standard.lowerTolerance || 0) : 0

  return {
    standardType: InspectionStandardType.Number,
    standardDesc: previewText ?? standardPreview.value,
    standardMax: mode === "upper" ? Number(standard.standardMax) : mode === "range" ? Number(standard.standardValue) + Math.max(upperDeviation, lowerDeviation) : null,
    standardMaxInclusive: mode === "upper" ? Number(standard.standardMaxInclusive ?? 1) : 1,
    standardMin: mode === "lower" ? Number(standard.standardMin) : mode === "range" ? Number(standard.standardValue) + Math.min(upperDeviation, lowerDeviation) : null,
    standardMinInclusive: mode === "lower" ? Number(standard.standardMinInclusive ?? 1) : 1,
    quantitativeMode: mode,
    standardValue: mode === "range" ? Number(standard.standardValue) : null,
    upperTolerance: mode === "range" ? Number(standard.upperTolerance) : null,
    lowerTolerance: mode === "range" ? Number(standard.lowerTolerance) : null,
    upperToleranceSign: mode === "range" ? standard.upperToleranceSign || "+" : "+",
    lowerToleranceSign: mode === "range" ? standard.lowerToleranceSign || "-" : "-",
    unitId: String(standard.unitId || ""),
    unitName: String(standard.unitName || currentUnitName.value || "")
  }
}

function getInspectionStandardPreview(standard: IInspectionStandard) {
  if (Number(standard.standardType) === InspectionStandardType.Text) {
    return String(standard.standardDesc || "").trim()
  }

  return (
    typeNumberHandle(
      {
        standardType: InspectionStandardType.Number,
        standardDesc: "",
        standardMax: standard.quantitativeMode === "upper" ? standard.standardMax ?? null : null,
        standardMaxInclusive: standard.standardMaxInclusive,
        standardMin: standard.quantitativeMode === "lower" ? standard.standardMin ?? null : null,
        standardMinInclusive: standard.standardMinInclusive,
        quantitativeMode: standard.quantitativeMode,
        standardValue: standard.quantitativeMode === "range" ? standard.standardValue ?? null : null,
        upperTolerance: standard.quantitativeMode === "range" ? standard.upperTolerance ?? null : null,
        lowerTolerance: standard.quantitativeMode === "range" ? standard.lowerTolerance ?? null : null,
        upperToleranceSign: standard.upperToleranceSign,
        lowerToleranceSign: standard.lowerToleranceSign,
        unitName: standard.unitName || ""
      },
      true
    ) || ""
  )
}

async function validatePatrolItem(item: IPatrolItem, rowLabel: string) {
  item.inspectionName = String(item.inspectionName || "").trim()
  item.inspectionCode = String(item.inspectionCode || "").trim()
  item.method = String(item.method || "").trim()
  await loadMaintenanceTypeOptions()
  syncMaintenanceType(item)

  const selectedPosition = getSelectedDepartmentPosition(item.inspectionPositionValue)
  item.inspectionExecuteDepartmentId = selectedPosition.departmentId
  item.inspectionExecuteDepartmentName = selectedPosition.departmentName
  item.inspectionExecutePositionId = selectedPosition.positionId
  item.inspectionExecutePositionName = selectedPosition.positionName

  if (!item.inspectionName) {
    ElMessage.warning(`${rowLabel}请填写保养项名称`)
    return false
  }
  if (!item.maintenanceTypeId) {
    ElMessage.warning(`${rowLabel}请选择保养类型`)
    return false
  }
  if (!item.inspectionExecutePositionId) {
    ElMessage.warning(`${rowLabel}请选择保养执行职位`)
    return false
  }

  if (Number(item.inspectionStandard.standardType) === InspectionStandardType.Text) {
    item.inspectionStandard.standardDesc = String(item.inspectionStandard.standardDesc || "").trim()
    if (!item.inspectionStandard.standardDesc) {
      ElMessage.warning(`${rowLabel}请填写检验标准`)
      return false
    }
  } else {
    await loadUnitOptions()
    item.inspectionStandard.unitName = unitOptions.value.find((unit) => String(unit.value) === String(item.inspectionStandard.unitId))?.label || ""
    const errorMessage = validateQuantitativeFields(item.inspectionStandard)
    if (errorMessage) {
      ElMessage.warning(errorMessage)
      return false
    }

    const standardPayload = buildInspectionStandardPayload(item.inspectionStandard, getInspectionStandardPreview(item.inspectionStandard))
    if (!isNumberStandardValid(standardPayload.standardMax, standardPayload.standardMin, !!standardPayload.standardMaxInclusive, !!standardPayload.standardMinInclusive)) {
      ElMessage.warning(`${rowLabel}请完善定量检验标准`)
      return false
    }
  }

  return true
}

function mapRowToSaveParams(row: ITableRow) {
  const patrolItem = cloneDeep(row.patrolItem)
  const selectedPosition = getSelectedDepartmentPosition(patrolItem.inspectionPositionValue)
  patrolItem.inspectionExecuteDepartmentId = selectedPosition.departmentId
  patrolItem.inspectionExecuteDepartmentName = selectedPosition.departmentName
  patrolItem.inspectionExecutePositionId = selectedPosition.positionId
  patrolItem.inspectionExecutePositionName = selectedPosition.positionName
  const maintenanceDepartmentIds = patrolItem.inspectionExecuteDepartmentId
    ? [patrolItem.inspectionExecuteDepartmentId]
    : []
  const ngDepartmentIds = maintenanceDepartmentIds

  const payload: Record<string, any> = {
    mconfigType: DeviceInitSettingTabs.maintain,
    equipmentModelId: props.modelId,
    maintenanceConfigValue: {
      inspectionName: patrolItem.inspectionName,
      inspectionCode: patrolItem.inspectionCode,
      maintenanceTypeId: patrolItem.maintenanceTypeId,
      maintenanceTypeName: patrolItem.maintenanceTypeName,
      inspectionFrequency: Number(patrolItem.inspectionFrequency || 1),
      maintenanceName: patrolItem.inspectionName,
      maintenanceCode: patrolItem.inspectionCode,
      maintenanceFrequency: Number(patrolItem.inspectionFrequency || 1),
      method: patrolItem.method,
      maintenanceDepartmentIds,
      inspectionDepartmentIds: maintenanceDepartmentIds,
      inspectionExecuteDepartmentId: patrolItem.inspectionExecuteDepartmentId,
      inspectionExecuteDepartmentName: patrolItem.inspectionExecuteDepartmentName,
      inspectionExecutePositionId: patrolItem.inspectionExecutePositionId,
      inspectionExecutePositionName: patrolItem.inspectionExecutePositionName,
      maintenanceExecuteDepartmentId: patrolItem.inspectionExecuteDepartmentId,
      maintenanceExecuteDepartmentName: patrolItem.inspectionExecuteDepartmentName,
      maintenanceExecutePositionId: patrolItem.inspectionExecutePositionId,
      maintenanceExecutePositionName: patrolItem.inspectionExecutePositionName,
      files: patrolItem.files,
      inspectionStandard: buildInspectionStandardPayload(patrolItem.inspectionStandard, getInspectionStandardPreview(patrolItem.inspectionStandard)),
      fileIds: patrolItem.files.map((item) => item.fileId),
      fileDesc: patrolItem.fileDesc,
      remarks: patrolItem.remarks,
      ngDepartmentIds
    }
  }

  delete payload.maintenanceConfigValue.files
  if (!row.isTemp && !String(row.id).startsWith("temp-")) {
    payload.id = row.id
  }
  return payload
}

async function validateTableList() {
  const rows = cloneDeep(tableData.value)
  for (let index = 0; index < rows.length; index += 1) {
    const rowLabel = `第${index + 1}行`
    if (!(await validatePatrolItem(rows[index].patrolItem, rowLabel))) {
      return false
    }
  }
  return true
}

async function saveTableData() {
  if (!props.modelId) return false
  if (!(await validateTableList())) return false

  const currentRows = cloneDeep(tableData.value)
  for (const row of tableData.value) {
    await validatePatrolItem(row.patrolItem, "")
  }

  await editEquipmentModelConfig({
    mconfigType: DeviceInitSettingTabs.maintain,
    equipmentModelId: props.modelId,
    equipmentCommonConfigs: getTableSavePayload()
  })

  ElMessage.success("当前页签保存成功")
  const nextRows = await getTableData(true)
  if (currentRows.length && !nextRows?.length) {
    tableData.value = currentRows
    syncSavedSnapshot(currentRows)
  }
  emit("success")
  return true
}

async function onDialogSave() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  const row = tableData.value.find((item) => item.id === editingRowId.value)
  if (!row) return

  const nextPatrolItem = cloneDeep(dialogForm.value)
  if (!(await validatePatrolItem(nextPatrolItem, ""))) return
  row.patrolItem = nextPatrolItem
  dialogVisible.value = false
}

async function onDeleteRow(row: ITableRow) {
  const confirmed = await ElMessageBox.confirm("此操作将删除该保养项，是否继续？", "提示", { type: "warning" }).catch(() => false)
  if (!confirmed) return
  tableData.value = tableData.value.filter((item) => item.id !== row.id)
}

watch(
  () => props.modelId,
  async (value) => {
    if (!value) {
      currentEquipmentModel.value = undefined
      tableData.value = []
      syncSavedSnapshot([])
      return
    }
    await Promise.all([
      loadCurrentEquipmentModel(),
      loadDepartmentPositionOptions(),
      loadMaintenanceTypeOptions()
    ])
    await getTableData(true)
  },
  { immediate: true }
)

watch(
  isDirty,
  (value) => {
    if (!loaded.value) return
    emit("dirty-change", value)
  },
  { immediate: false }
)

defineExpose({
  getSavePayload: () => cloneData(getTableSavePayload()),
  isDirty: () => isDirty.value,
  isLoaded: () => loaded.value,
  saveTableData,
  validateTableList
})
</script>

<style scoped lang="scss">
.check-config {
  height: 100%;
  display: flex;
  flex-direction: column;

  .custom-table {
    height: 100%;
  }
}

.table-input,
.table-select,
.table-input-number {
  width: 100%;
}

.table-cascader {
  width: 100%;
}

.cycle-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cycle-unit {
  color: #606266;
  white-space: nowrap;
}

.execute-target-text {
  color: #606266;
}

.standard-cell {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 32px;
}

.standard-text {
  flex: 1;
  color: #606266;
  line-height: 20px;
  word-break: break-all;
}

.standard-action {
  flex-shrink: 0;
}

.standard-input-text {
  flex: 1;
}

.image-list-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.image-item {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  overflow: hidden;
  background: #f5f7fa;
}

.section-title {
  margin: 0 0 16px;
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.section-title:not(:first-child) {
  margin-top: 8px;
}

.mro-maintenance-config-dialog:deep(.el-dialog) {
  max-width: calc(100vw - 48px);
}

.mro-maintenance-config-dialog:deep(.el-dialog__body) {
  padding-top: 18px;
  padding-bottom: 18px;
}

.w-full {
  width: 100%;
}

.quantitative-layout {
  display: grid;
  gap: 12px;
}

.quantitative-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
  background: #fbfcfe;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease, transform 0.2s ease;
}

.quantitative-card.is-active {
  background: #f5f9ff;
  border-color: #9ec5ff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.12);
  transform: translateY(-1px);
}

.quantitative-card.is-inactive {
  background: #fafafa;
}

.quantitative-card__head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.quantitative-card__title {
  flex: 1;
  font-size: 13px;
  font-weight: 600;
  color: #303133;
}

.mode-indicator {
  width: 14px;
  height: 14px;
  border: 2px solid #c0c4cc;
  border-radius: 50%;
  background: #fff;
}

.mode-indicator.is-active {
  border-color: #409eff;
  box-shadow: inset 0 0 0 3px #fff;
  background: #409eff;
}

.active-tag {
  padding: 1px 8px;
  font-size: 12px;
  line-height: 18px;
  color: #1d4ed8;
  background: rgba(64, 158, 255, 0.1);
  border: 1px solid rgba(64, 158, 255, 0.18);
  border-radius: 999px;
}

.single-mode-row {
  display: grid;
  grid-template-columns: 96px minmax(0, 1fr);
  gap: 10px;
}

.operator-select,
.standard-input,
.range-number,
.tolerance-sign-select {
  width: 100%;
}

.standard-range-layout {
  display: grid;
  grid-template-columns: minmax(132px, 0.86fr) minmax(220px, 1.24fr);
  gap: 10px;
}

.standard-value-card,
.tolerance-row {
  display: grid;
  gap: 8px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid #e4e7ed;
  border-radius: 6px;
}

.standard-value-card {
  align-content: start;
}

.tolerance-stack {
  display: grid;
  gap: 10px;
}

.tolerance-row {
  grid-template-columns: 56px 76px minmax(0, 1fr);
  align-items: center;
}

.range-label,
.tolerance-row-label {
  font-size: 13px;
  color: #606266;
}

.standard-preview {
  min-height: 32px;
  width: 100%;
  padding: 6px 11px;
  line-height: 20px;
  color: #606266;
  background: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

@media (min-width: 961px) {
  .quantitative-layout {
    grid-template-columns: minmax(280px, 0.9fr) minmax(460px, 1.25fr);
    align-items: stretch;
  }
}

@media (max-width: 960px) {
  .single-mode-row,
  .standard-range-layout,
  .tolerance-row {
    grid-template-columns: 1fr;
  }
}

:deep(.table-input .el-input__wrapper),
:deep(.table-select .el-input__wrapper),
:deep(.table-input-number .el-input__wrapper),
:deep(.table-cascader .el-input__wrapper) {
  box-shadow: 0 0 0 1px #d8dee9 inset;
  background: #fff;
}

:deep(.table-input .el-input__wrapper:hover),
:deep(.table-select .el-input__wrapper:hover),
:deep(.table-input-number .el-input__wrapper:hover),
:deep(.table-cascader .el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #7f8ea3 inset;
}

:deep(.table-input .el-input__wrapper.is-focus),
:deep(.table-select .el-input__wrapper.is-focus),
:deep(.table-input-number .el-input__wrapper.is-focus),
:deep(.table-cascader .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409eff inset;
}

:deep(.el-table .cell) {
  padding-top: 6px;
  padding-bottom: 6px;
}
</style>
