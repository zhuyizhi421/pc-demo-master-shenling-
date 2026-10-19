<template>
  <CustomDialog :title="title" v-model="show" size="large">
    <CustomForm
      ref="customFormRef"
      v-model="inspectDemandForm"
      :configs="formConfigs"
      :columns="2"
      :label-width="110"
      class="inspect-form"
    >
      <template #baseTitle-default>
        <div class="section-title">基础信息</div>
      </template>

      <template #standardTitle-default>
        <div class="section-title">检验标准</div>
      </template>

      <template #conditionTitle-default>
        <div class="section-title">检验条件</div>
      </template>

      <template #assistTitle-default>
        <div class="section-title">辅助信息</div>
      </template>

      <template #standardType-default>
        <el-select v-model="inspectDemandForm.inspectionStandard.standardType" class="w-full">
          <el-option label="定量" :value="1" />
          <el-option label="定性" :value="2" />
        </el-select>
      </template>

      <template #standardDesc-default>
        <el-input
          v-model="inspectDemandForm.inspectionStandard.standardDesc"
          type="textarea"
          :rows="4"
          maxlength="300"
          show-word-limit
          placeholder="请输入检验标准"
        />
      </template>

      <template #quantitativeStandard-default>
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
              <div class="standard-value-card standard-value-card--tall">
                <span class="range-label">标准值</span>
                <el-input-number
                  v-model="inspectDemandForm.inspectionStandard.standardValue"
                  :controls="false"
                  class="range-number"
                  :disabled="isSingleQuantitativeMode"
                  placeholder="请输入标准值"
                  @focus="activateRangeMode"
                />
              </div>
              <div class="tolerance-row">
                <span class="tolerance-row-label">上公差</span>
                <el-select
                  v-model="inspectDemandForm.inspectionStandard.upperToleranceSign"
                  class="tolerance-sign-select"
                  :disabled="isSingleQuantitativeMode"
                  @focus="activateRangeMode"
                >
                  <el-option label="+" value="+" />
                  <el-option label="-" value="-" />
                </el-select>
                <el-input-number
                  v-model="inspectDemandForm.inspectionStandard.upperTolerance"
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
                  v-model="inspectDemandForm.inspectionStandard.lowerToleranceSign"
                  class="tolerance-sign-select"
                  :disabled="isSingleQuantitativeMode"
                  @focus="activateRangeMode"
                >
                  <el-option label="+" value="+" />
                  <el-option label="-" value="-" />
                </el-select>
                <el-input-number
                  v-model="inspectDemandForm.inspectionStandard.lowerTolerance"
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
      </template>

      <template #quantitativePreview-default>
        <div class="standard-preview">{{ standardPreview || "-" }}</div>
      </template>

      <template #unitId-default>
        <el-select
          v-model="inspectDemandForm.inspectionStandard.unitId"
          placeholder="请选择"
          clearable
          filterable
        >
          <el-option
            v-for="item in unitOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </template>

      <template #firstInspectionCondition-default>
        <el-checkbox-group v-model="inspectDemandForm.firstInspectionCondition">
          <el-checkbox
            v-for="(label, value) in EnumFirstInspectionTriggerTypeMap"
            :key="value"
            :label="Number(value)"
          >
            {{ label }}
          </el-checkbox>
        </el-checkbox-group>
      </template>

      <template #pollingTrigger-default>
        <el-radio-group v-model="inspectDemandForm.pollingTrigger">
          <el-radio :value="1">按时间</el-radio>
          <el-radio :value="2">按数量</el-radio>
        </el-radio-group>
      </template>

      <template #inspectRate-default>
        <CustomNumberInput
          v-if="inspectDemandForm.pollingTrigger === 1"
          v-model="inspectDemandForm.inspectRate!"
          :type="1"
          :decimalNumber="0"
          placeholder="请输入1-1440"
        >
          <template #suffix> 分钟 </template>
        </CustomNumberInput>
        <CustomNumberInput
          v-else
          v-model="inspectDemandForm.triggerAmount!"
          :type="1"
          placeholder="请输入"
        >
          <template #suffix>{{ productInfo.defaultUnitName || "" }}</template>
        </CustomNumberInput>
      </template>

      <template #laboratoryId-default>
        <el-select
          v-model="inspectDemandForm.laboratoryId"
          placeholder="请选择检验场所"
          filterable
          clearable
        >
          <el-option
            v-for="item in inspectSiteOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </template>

      <template #isSampleReturn-default>
        <el-switch v-model="inspectDemandForm.isSampleReturn" />
      </template>

      <template #imageList-default>
        <UploadImage v-model="imageList" :limit="5" multiple />
      </template>
    </CustomForm>

    <template #footer>
      <el-button @click="onCancelClick">取消</el-button>
      <el-button type="primary" @click="onConfirmClick" :loading="loading">保存</el-button>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import { queryInspectOptionTemplateDetail, queryInspectOptionTemplateList } from "@/api/baseInfo/inspectOptionTemplate"
import {
  createTechStandardMeasurementWithInspectItem,
  getProcessControlPlanList,
  updateTechStandardMeasurement
} from "@/api/craft"
import { queryFactoryModelList } from "@/api/fm"
import { InspectionStandardType } from "@/api/operation/equipment/types"
import { getProductModelById, type IProductModelListItem } from "@/api/product"
import { getUnit } from "@/api/units"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import CustomNumberInput from "@/components/CustomNumberInput/index.vue"
import { EnumFormType, type InspectDemandForm } from "@/components/InspectForm/type"
import UploadImage from "@/components/UploadImage/index.vue"
import {
  EnumFirstInspectionTriggerTypeMap,
  EnumProductInspectionType
} from "@/constant/enums"
import useResetRef from "@/hooks/useResetRef"
import type { IUploadPhoto } from "@/types/base-info/global-config"
import type { IInspectOptionTemplateListItem } from "@/types/base-info/inspect-option-template"
import { isNumberStandardValid } from "@/utils"
import { formatImgUrlPreview } from "@/utils/common"
import { typeNumberHandle } from "@/utils/inspectStandard"

type IProcessInspectionStandard = InspectDemandForm["inspectionStandard"] & {
  quantitativeMode?: "lower" | "upper" | "range"
  standardValue?: number | null
  upperTolerance?: number | null
  lowerTolerance?: number | null
  upperToleranceSign?: "+" | "-"
  lowerToleranceSign?: "+" | "-"
}

defineOptions({
  name: "ProcessInspectForm"
})

const props = defineProps<{
  title: string
  inspectFormType: EnumFormType
  formData: InspectDemandForm
}>()

const emits = defineEmits<{
  (e: "onOk"): void
  (e: "cancel"): void
}>()

const show = ref(false)
const loading = ref(false)
const customFormRef = ref<InstanceType<typeof CustomForm>>()
const inspectTemplateOptions = ref<IInspectOptionTemplateListItem[]>([])
const inspectSiteOptions = ref<{ label: string; value: string }[]>([])
const unitOptions = ref<{ label: string; value: string }[]>([])
const imageList = ref<IUploadPhoto[]>([])
const productInfo = ref<Partial<IProductModelListItem>>({})

const [inspectDemandForm, resetInspectDemandForm] = useResetRef<InspectDemandForm>({
  techVersionId: "",
  id: "",
  inspectItemCode: "",
  inspectItemId: "",
  inspectItemName: "",
  inspectType: 0,
  sampleNum: undefined,
  inspectionStandard: {
    standardDesc: "",
    standardMax: null as any,
    standardMaxInclusive: 0,
    standardMin: null as any,
    standardMinInclusive: 1,
    standardType: 1,
    quantitativeMode: "lower",
    standardValue: undefined,
    upperTolerance: undefined,
    lowerTolerance: undefined,
    upperToleranceSign: "+",
    lowerToleranceSign: "-",
    unitId: ""
  },
  productModelId: "",
  methodDesc: "",
  laboratoryId: "",
  imageIds: [],
  imageUrls: [],
  pollingTrigger: 1,
  inspectRate: undefined,
  triggerAmount: undefined,
  firstInspectionCondition: [],
  isSampleReturn: true
})

const hasStandardNumericValue = (value: unknown) => value !== null && value !== undefined && value !== ""
const normalizeNullableNumber = (value: unknown) =>
  hasStandardNumericValue(value) ? Number(value) : undefined
const currentUnitName = computed(
  () =>
    unitOptions.value.find((item) => item.value === String(inspectDemandForm.value.inspectionStandard.unitId))
      ?.label || ""
)
const isSingleQuantitativeMode = computed(
  () => inspectDemandForm.value.inspectionStandard.quantitativeMode !== "range"
)

const isFirstCheck = computed(() =>
  [EnumProductInspectionType.FIRST_SELF, EnumProductInspectionType.FIRST_SPECIAL].includes(
    inspectDemandForm.value.inspectType as EnumProductInspectionType
  )
)

const isPollingCheck = computed(() =>
  [EnumProductInspectionType.POLLING_SELF, EnumProductInspectionType.POLLING_SPECIAL].includes(
    inspectDemandForm.value.inspectType as EnumProductInspectionType
  )
)

const hasConditionSection = computed(() => isFirstCheck.value || isPollingCheck.value)

const resetRangeFields = () => {
  inspectDemandForm.value.inspectionStandard.standardValue = undefined
  inspectDemandForm.value.inspectionStandard.upperTolerance = undefined
  inspectDemandForm.value.inspectionStandard.lowerTolerance = undefined
  inspectDemandForm.value.inspectionStandard.upperToleranceSign = "+"
  inspectDemandForm.value.inspectionStandard.lowerToleranceSign = "-"
}

const clearSingleIntervalFields = () => {
  inspectDemandForm.value.inspectionStandard.standardMax = null as any
  inspectDemandForm.value.inspectionStandard.standardMin = null as any
}

const activateSingleMode = () => {
  resetRangeFields()
  if (inspectDemandForm.value.inspectionStandard.quantitativeMode === "range") {
    clearSingleIntervalFields()
    inspectDemandForm.value.inspectionStandard.quantitativeMode = "lower"
  }
}

const activateRangeMode = () => {
  clearSingleIntervalFields()
  inspectDemandForm.value.inspectionStandard.quantitativeMode = "range"
}

const applySingleIntervalMode = (mode: "lower" | "upper", inclusive: number) => {
  resetRangeFields()
  if (mode === "upper") {
    inspectDemandForm.value.inspectionStandard.quantitativeMode = "upper"
    inspectDemandForm.value.inspectionStandard.standardMaxInclusive = inclusive
    inspectDemandForm.value.inspectionStandard.standardMin = null as any
    return
  }
  inspectDemandForm.value.inspectionStandard.quantitativeMode = "lower"
  inspectDemandForm.value.inspectionStandard.standardMinInclusive = inclusive
  inspectDemandForm.value.inspectionStandard.standardMax = null as any
}

const singleIntervalOperator = computed({
  get: () => {
    if (inspectDemandForm.value.inspectionStandard.quantitativeMode === "upper") {
      return Number(inspectDemandForm.value.inspectionStandard.standardMaxInclusive ?? 1) === 1
        ? "<="
        : "<"
    }
    return Number(inspectDemandForm.value.inspectionStandard.standardMinInclusive ?? 1) === 1
      ? ">="
      : ">"
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
    inspectDemandForm.value.inspectionStandard.quantitativeMode === "upper"
      ? normalizeNullableNumber(inspectDemandForm.value.inspectionStandard.standardMax)
      : normalizeNullableNumber(inspectDemandForm.value.inspectionStandard.standardMin),
  set: (value) => {
    if (inspectDemandForm.value.inspectionStandard.quantitativeMode === "upper") {
      inspectDemandForm.value.inspectionStandard.standardMax = value ?? (null as any)
      return
    }
    inspectDemandForm.value.inspectionStandard.standardMin = value ?? (null as any)
  }
})

const inferQuantitativeMode = (standard: Partial<InspectDemandForm["inspectionStandard"]> | undefined) => {
  if (standard?.quantitativeMode === "lower" || standard?.quantitativeMode === "upper") {
    return standard.quantitativeMode
  }
  const hasRangeMode =
    standard?.quantitativeMode === "range" ||
    (hasStandardNumericValue(standard?.standardValue) &&
      hasStandardNumericValue(standard?.upperTolerance) &&
      hasStandardNumericValue(standard?.lowerTolerance))
  if (hasRangeMode) return "range" as const
  return hasStandardNumericValue(standard?.standardMax) ? ("upper" as const) : ("lower" as const)
}

const applyInspectionStandard = (standard: Partial<InspectDemandForm["inspectionStandard"]> | undefined) => {
  const nextMode = inferQuantitativeMode(standard)
  inspectDemandForm.value.inspectionStandard = {
    standardType: Number(standard?.standardType || InspectionStandardType.Number),
    standardDesc: String(standard?.standardDesc || ""),
    standardMax: normalizeNullableNumber(standard?.standardMax) ?? (null as any),
    standardMaxInclusive: Number(standard?.standardMaxInclusive ?? 0),
    standardMin: normalizeNullableNumber(standard?.standardMin) ?? (null as any),
    standardMinInclusive: Number(standard?.standardMinInclusive ?? 1),
    quantitativeMode: nextMode,
    standardValue: normalizeNullableNumber(standard?.standardValue) ?? undefined,
    upperTolerance: normalizeNullableNumber(standard?.upperTolerance) ?? undefined,
    lowerTolerance: normalizeNullableNumber(standard?.lowerTolerance) ?? undefined,
    upperToleranceSign: standard?.upperToleranceSign || "+",
    lowerToleranceSign: standard?.lowerToleranceSign || "-",
    unitId: String(standard?.unitId || "")
  }
}

const resetQuantitativeFields = () => {
  inspectDemandForm.value.inspectionStandard.quantitativeMode = "lower"
  inspectDemandForm.value.inspectionStandard.standardMax = null as any
  inspectDemandForm.value.inspectionStandard.standardMaxInclusive = 0
  inspectDemandForm.value.inspectionStandard.standardMin = null as any
  inspectDemandForm.value.inspectionStandard.standardMinInclusive = 1
  inspectDemandForm.value.inspectionStandard.standardValue = undefined
  inspectDemandForm.value.inspectionStandard.upperTolerance = undefined
  inspectDemandForm.value.inspectionStandard.lowerTolerance = undefined
  inspectDemandForm.value.inspectionStandard.upperToleranceSign = "+"
  inspectDemandForm.value.inspectionStandard.lowerToleranceSign = "-"
  inspectDemandForm.value.inspectionStandard.unitId = ""
}

const standardPreview = computed(() => {
  if (inspectDemandForm.value.inspectionStandard.standardType === InspectionStandardType.Text) {
    return inspectDemandForm.value.inspectionStandard.standardDesc.trim()
  }
  return (
    typeNumberHandle(
      {
        standardType: InspectionStandardType.Number,
        standardDesc: "",
        standardMax:
          inspectDemandForm.value.inspectionStandard.quantitativeMode === "upper"
            ? (normalizeNullableNumber(inspectDemandForm.value.inspectionStandard.standardMax) ?? null)
            : null,
        standardMaxInclusive: inspectDemandForm.value.inspectionStandard.standardMaxInclusive,
        standardMin:
          inspectDemandForm.value.inspectionStandard.quantitativeMode === "lower"
            ? (normalizeNullableNumber(inspectDemandForm.value.inspectionStandard.standardMin) ?? null)
            : null,
        standardMinInclusive: inspectDemandForm.value.inspectionStandard.standardMinInclusive,
        quantitativeMode: inspectDemandForm.value.inspectionStandard.quantitativeMode,
        standardValue:
          inspectDemandForm.value.inspectionStandard.quantitativeMode === "range"
            ? (normalizeNullableNumber(inspectDemandForm.value.inspectionStandard.standardValue) ?? null)
            : null,
        upperTolerance:
          inspectDemandForm.value.inspectionStandard.quantitativeMode === "range"
            ? (normalizeNullableNumber(inspectDemandForm.value.inspectionStandard.upperTolerance) ?? null)
            : null,
        lowerTolerance:
          inspectDemandForm.value.inspectionStandard.quantitativeMode === "range"
            ? (normalizeNullableNumber(inspectDemandForm.value.inspectionStandard.lowerTolerance) ?? null)
            : null,
        upperToleranceSign: inspectDemandForm.value.inspectionStandard.upperToleranceSign,
        lowerToleranceSign: inspectDemandForm.value.inspectionStandard.lowerToleranceSign,
        unitName: currentUnitName.value
      },
      true
    ) || ""
  )
})

const validateQuantitativeFields = () => {
  const standard = inspectDemandForm.value.inspectionStandard
  if (standard.quantitativeMode === "lower" && !hasStandardNumericValue(standard.standardMin)) {
    return "请输入下限值"
  }
  if (standard.quantitativeMode === "upper" && !hasStandardNumericValue(standard.standardMax)) {
    return "请输入上限值"
  }
  if (standard.quantitativeMode === "range") {
    if (!hasStandardNumericValue(standard.standardValue)) return "请输入标准值"
    if (!hasStandardNumericValue(standard.upperTolerance)) return "请输入上公差"
    if (!hasStandardNumericValue(standard.lowerTolerance)) return "请输入下公差"
  }
  return ""
}

const validateSingleIntervalStandard = (standard: InspectDemandForm["inspectionStandard"]) => {
  if (standard.quantitativeMode === "range") return true
  return isNumberStandardValid(
    standard.quantitativeMode === "upper" ? Number(standard.standardMax) : (undefined as unknown as number),
    standard.quantitativeMode === "lower" ? Number(standard.standardMin) : (undefined as unknown as number),
    standard.quantitativeMode === "upper" ? !!standard.standardMaxInclusive : true,
    standard.quantitativeMode === "lower" ? !!standard.standardMinInclusive : true
  )
}

const buildNormalizedStandard = (): IProcessInspectionStandard => {
  const standard = cloneDeep(inspectDemandForm.value.inspectionStandard)
  if (standard.standardType === InspectionStandardType.Text) {
    return {
      standardType: InspectionStandardType.Text,
      standardDesc: standard.standardDesc.trim(),
      standardMax: 0,
      standardMaxInclusive: 0,
      standardMin: 0,
      standardMinInclusive: 1,
      unitId: "",
      quantitativeMode: "lower" as const,
      standardValue: null,
      upperTolerance: null,
      lowerTolerance: null,
      upperToleranceSign: "+",
      lowerToleranceSign: "-"
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
    standardDesc: standardPreview.value,
    standardMax:
      standard.quantitativeMode === "upper"
        ? Number(standard.standardMax ?? 0)
        : standard.quantitativeMode === "range"
          ? Number(standard.standardValue) + Math.max(upperDeviation, lowerDeviation)
          : 0,
    standardMaxInclusive: standard.quantitativeMode === "upper" ? Number(standard.standardMaxInclusive ?? 0) : 1,
    standardMin:
      standard.quantitativeMode === "lower"
        ? Number(standard.standardMin ?? 0)
        : standard.quantitativeMode === "range"
          ? Number(standard.standardValue) + Math.min(upperDeviation, lowerDeviation)
          : 0,
    standardMinInclusive: standard.quantitativeMode === "lower" ? Number(standard.standardMinInclusive ?? 1) : 1,
    quantitativeMode: standard.quantitativeMode || "lower",
    standardValue: standard.quantitativeMode === "range" ? Number(standard.standardValue ?? 0) : null,
    upperTolerance: standard.quantitativeMode === "range" ? Number(standard.upperTolerance ?? 0) : null,
    lowerTolerance: standard.quantitativeMode === "range" ? Number(standard.lowerTolerance ?? 0) : null,
    upperToleranceSign: standard.quantitativeMode === "range" ? standard.upperToleranceSign || "+" : "+",
    lowerToleranceSign: standard.quantitativeMode === "range" ? standard.lowerToleranceSign || "-" : "-",
    unitId: String(standard.unitId || ""),
    unitName: currentUnitName.value
  }
}

const formConfigs = computed<ICustomFormConfigItem[]>(() => [
  {
    componentType: "div",
    special: true,
    field: "baseTitle",
    colspan: -1,
    slots: {
      default: "baseTitle-default"
    }
  },
  {
    componentType: "el-select",
    label: "检验项名称",
    field: "inspectItemId",
    colspan: 1,
    rules: [
      {
        required: true,
        message: "请输入检验项名称",
        trigger: "change"
      }
    ],
    props: {
      placeholder: "请输入",
      filterable: true,
      allowCreate: true,
      defaultFirstOption: true,
      get customChildren() {
        return inspectTemplateOptions.value.map((item) => ({
          componentType: "el-option",
          props: {
            label: item.itemName,
            value: item.id
          }
        }))
      }
    },
    events: {
      change: onInspectNameChange
    }
  },
  {
    componentType: "el-input",
    label: "检验项编号",
    field: "inspectItemCode",
    colspan: 1,
    props: {
      placeholder: "不填则自动生成"
    }
  },
  {
    componentType: "el-input",
    label: "探测方式",
    field: "methodDesc",
    colspan: 1,
    rules: [
      {
        required: true,
        message: "请输入探测方式",
        trigger: "blur"
      }
    ],
    props: {
      placeholder: "请输入探测方式",
      maxlength: 200,
      showWordLimit: true,
      clearable: true
    }
  },
  {
    componentType: "el-input-number",
    label: "样本数",
    field: "sampleNum",
    colspan: 1,
    props: {
      min: 1,
      precision: 0,
      controls: false,
      placeholder: "请输入样本数"
    }
  },
  {
    componentType: "div",
    special: true,
    field: "standardTitle",
    colspan: -1,
    slots: {
      default: "standardTitle-default"
    }
  },
  {
    componentType: "div",
    label: "检验标准类型",
    field: "standardType",
    colspan: 1,
    slots: {
      default: "standardType-default"
    }
  },
  {
    componentType: "div",
    label: "检验标准",
    field: "inspectionStandard.standardDesc",
    colspan: -1,
    get hidden() {
      return inspectDemandForm.value.inspectionStandard.standardType !== InspectionStandardType.Text
    },
    rules: [
      {
        required: true,
        message: "请输入检验标准",
        trigger: "blur"
      }
    ],
    slots: {
      default: "standardDesc-default"
    }
  },
  {
    componentType: "div",
    label: "定量配置",
    field: "quantitativeStandard",
    colspan: -1,
    get hidden() {
      return inspectDemandForm.value.inspectionStandard.standardType !== InspectionStandardType.Number
    },
    props: {
      class: "quantitative-config-item"
    },
    slots: {
      default: "quantitativeStandard-default"
    }
  },
  {
    componentType: "div",
    label: "检验标准",
    field: "quantitativePreview",
    colspan: 1,
    get hidden() {
      return inspectDemandForm.value.inspectionStandard.standardType !== InspectionStandardType.Number
    },
    props: {
      class: "quantitative-preview-item"
    },
    slots: {
      default: "quantitativePreview-default"
    }
  },
  {
    componentType: "div",
    label: "单位",
    field: "inspectionStandard.unitId",
    colspan: 1,
    get hidden() {
      return inspectDemandForm.value.inspectionStandard.standardType !== InspectionStandardType.Number
    },
    get rules() {
      return inspectDemandForm.value.inspectionStandard.standardType !== InspectionStandardType.Number
        ? []
        : [
            {
              required: true,
              message: "请选择单位",
              trigger: "change"
            }
          ]
    },
    props: {
      class: "quantitative-unit-item"
    },
    slots: {
      default: "unitId-default"
    }
  },
  {
    componentType: "div",
    special: true,
    field: "conditionTitle",
    colspan: -1,
    hidden: !hasConditionSection.value,
    slots: {
      default: "conditionTitle-default"
    }
  },
  {
    componentType: "div",
    label: "首检触发条件",
    field: "firstInspectionCondition",
    colspan: -1,
    hidden: !isFirstCheck.value,
    rules: isFirstCheck.value
      ? [
          {
            required: true,
            type: "array",
            message: "请选择首检触发条件",
            trigger: "change"
          }
        ]
      : [],
    slots: {
      default: "firstInspectionCondition-default"
    }
  },
  {
    componentType: "div",
    label: "巡检触发方式",
    field: "pollingTrigger",
    colspan: 1,
    hidden: !isPollingCheck.value,
    slots: {
      default: "pollingTrigger-default"
    }
  },
  {
    componentType: "div",
    label: "检验频率",
    field: "inspectRate",
    colspan: 1,
    hidden: !isPollingCheck.value,
    slots: {
      default: "inspectRate-default"
    }
  },
  {
    componentType: "div",
    special: true,
    field: "assistTitle",
    colspan: -1,
    slots: {
      default: "assistTitle-default"
    }
  },
  {
    componentType: "div",
    label: "检验场所",
    field: "laboratoryId",
    colspan: 1,
    slots: {
      default: "laboratoryId-default"
    }
  },
  {
    componentType: "div",
    label: "样品是否还回",
    field: "isSampleReturn",
    colspan: 1,
    slots: {
      default: "isSampleReturn-default"
    }
  },
  {
    componentType: "div",
    label: "图片",
    field: "imageList",
    colspan: -1,
    slots: {
      default: "imageList-default"
    }
  }
])

watch(
  () => show.value,
  async (val) => {
    if (!val) {
      resetInspectDemandForm()
      customFormRef.value?.resetForm()
      imageList.value = []
      productInfo.value = {}
      return
    }

    loading.value = true
    try {
      customFormRef.value?.resetForm()
      await Promise.all([
        getUnitOptions(),
        getInspectSiteOptions(),
        getInspectOptionTemplate(),
        getProductInfo()
      ])

      inspectDemandForm.value = cloneDeep(props.formData)
      inspectDemandForm.value.inspectItemId = String(props.formData.inspectItemId || "")
      inspectDemandForm.value.inspectItemName = String(props.formData.inspectItemName || "")
      inspectDemandForm.value.inspectItemCode = String(props.formData.inspectItemCode || "")
      inspectDemandForm.value.methodDesc = String(props.formData.methodDesc || "")
      inspectDemandForm.value.laboratoryId = String(props.formData.laboratoryId || "")
      inspectDemandForm.value.firstInspectionCondition = (props.formData.firstInspectionCondition || []).map((item) =>
        Number(item)
      )
      inspectDemandForm.value.imageIds = (props.formData.imageIds || []).map((item) => String(item))
      inspectDemandForm.value.imageUrls = (props.formData.imageUrls || []).map((item) => String(item))
      inspectDemandForm.value.sampleNum = hasStandardNumericValue(props.formData.sampleNum)
        ? Number(props.formData.sampleNum)
        : undefined
      inspectDemandForm.value.inspectRate = hasStandardNumericValue(props.formData.inspectRate)
        ? Number(props.formData.inspectRate)
        : undefined
      inspectDemandForm.value.triggerAmount = hasStandardNumericValue(props.formData.triggerAmount)
        ? Number(props.formData.triggerAmount)
        : undefined
      inspectDemandForm.value.pollingTrigger = Number(props.formData.pollingTrigger || 1)
      inspectDemandForm.value.isSampleReturn =
        props.formData.isSampleReturn ?? Number(props.formData.isSampleReturn) !== 1

      applyInspectionStandard(props.formData.inspectionStandard)

      const { imageIds, imageUrls } = props.formData
      imageList.value =
        imageIds?.length && imageUrls?.length
          ? imageIds.map((item, index) => ({
              fileName: "",
              fileUrl: formatImgUrlPreview(imageUrls[index]),
              fileId: item
            }))
          : []
    } finally {
      loading.value = false
    }
  }
)

watch(
  () => inspectDemandForm.value.inspectionStandard.standardType,
  (value) => {
    if (value === InspectionStandardType.Text) {
      resetQuantitativeFields()
      return
    }
    inspectDemandForm.value.inspectionStandard.standardDesc = ""
  }
)

watch(
  () => inspectDemandForm.value.pollingTrigger,
  (value) => {
    if (value === 1) {
      inspectDemandForm.value.triggerAmount = undefined
      return
    }
    inspectDemandForm.value.inspectRate = undefined
  }
)

const getUnitOptions = async () => {
  const data = await getUnit()
  unitOptions.value = data.map((item) => ({
    label: item.unitName,
    value: String(item.id)
  }))
}

const getInspectSiteOptions = async () => {
  const data = await queryFactoryModelList({
    isEnable: true,
    isInspection: true
  })
  inspectSiteOptions.value = (data || []).map((item) => ({
    label: item.entityName,
    value: String(item.id)
  }))
}

const getInspectOptionTemplate = async () => {
  const data = await queryInspectOptionTemplateList({})
  inspectTemplateOptions.value = data || []
}

const getProductInfo = async () => {
  if (!props.formData.productModelId) {
    productInfo.value = {}
    return
  }
  productInfo.value = await getProductModelById(props.formData.productModelId)
}

const onInspectNameChange = async (val: string) => {
  if (!val) return

  const target = inspectTemplateOptions.value.find((item) => item.id === val)
  if (!target) {
    inspectDemandForm.value.inspectItemId = val
    inspectDemandForm.value.inspectItemName = val
    return
  }

  const detailInfo = await queryInspectOptionTemplateDetail(val)
  if (!detailInfo) return

  inspectDemandForm.value.inspectItemId = val
  inspectDemandForm.value.inspectItemName = detailInfo.inspectItemName
  inspectDemandForm.value.inspectItemCode = detailInfo.inspectItemCode
  inspectDemandForm.value.methodDesc = detailInfo.methodDesc
  applyInspectionStandard({
    standardType: detailInfo.standardType,
    standardDesc: detailInfo.standardDesc,
    standardMax: detailInfo.standardMax,
    standardMaxInclusive: detailInfo.standardMaxInclusive ?? 0,
    standardMin: detailInfo.standardMin,
    standardMinInclusive: detailInfo.standardMinInclusive ?? 1,
    unitId: detailInfo.unitId
  })
  inspectDemandForm.value.imageIds = detailInfo.images?.map((item) => String(item.id)) || []
  imageList.value =
    detailInfo.images?.map((item) => ({
      fileName: item.fileName,
      fileUrl: formatImgUrlPreview(item.path),
      fileId: item.id
    })) || []
}

const onCancelClick = () => {
  resetInspectDemandForm()
  show.value = false
  emits("cancel")
}

const onConfirmClick = async () => {
  const valid = await customFormRef.value?.validateForm()
  if (!valid) return

  if (
    hasStandardNumericValue(inspectDemandForm.value.sampleNum) &&
    (!Number.isInteger(Number(inspectDemandForm.value.sampleNum)) ||
      Number(inspectDemandForm.value.sampleNum) <= 0)
  ) {
    ElMessage.warning("样本数必须为正整数")
    return
  }

  if (isFirstCheck.value && !inspectDemandForm.value.firstInspectionCondition?.length) {
    ElMessage.warning("请选择首检触发条件")
    return
  }

  if (isPollingCheck.value) {
    if (inspectDemandForm.value.pollingTrigger === 1) {
      const inspectRate = Number(inspectDemandForm.value.inspectRate || 0)
      if (!Number.isInteger(inspectRate) || inspectRate < 1 || inspectRate > 1440) {
        ElMessage.warning("按时间触发时，检验频率需填写1-1440的整数")
        return
      }
    } else {
      const triggerAmount = Number(inspectDemandForm.value.triggerAmount || 0)
      if (triggerAmount <= 0) {
        ElMessage.warning("按数量触发时，请输入大于0的触发数量")
        return
      }
    }
  }

  if (inspectDemandForm.value.inspectionStandard.standardType === InspectionStandardType.Number) {
    const errorMessage = validateQuantitativeFields()
    if (errorMessage) {
      ElMessage.warning(errorMessage)
      return
    }
    if (!inspectDemandForm.value.inspectionStandard.unitId) {
      ElMessage.warning("请选择单位")
      return
    }
    if (!validateSingleIntervalStandard(inspectDemandForm.value.inspectionStandard)) {
      return
    }
  }

  const normalizedStandard = buildNormalizedStandard()
  const selectedTemplate = inspectTemplateOptions.value.find(
    (item) => item.id === inspectDemandForm.value.inspectItemId
  )
  const inspectItemName =
    inspectDemandForm.value.inspectItemName || selectedTemplate?.itemName || inspectDemandForm.value.inspectItemId

  const payload = {
    ...(props.inspectFormType === EnumFormType.Edit ? { id: String(inspectDemandForm.value.id || "") } : {}),
    destructive: inspectDemandForm.value.isSampleReturn ? 0 : 1,
    isSampleReturn: !!inspectDemandForm.value.isSampleReturn,
    firstInspectionCondition: isFirstCheck.value
      ? (inspectDemandForm.value.firstInspectionCondition || []).map((item) => Number(item))
      : [],
    imageIds: imageList.value.map((item) => String(item.fileId || "")),
    inspectItemCode: String(inspectDemandForm.value.inspectItemCode || "").trim(),
    inspectItemId:
      props.inspectFormType === EnumFormType.Edit
        ? String(inspectDemandForm.value.inspectItemId || "")
        : selectedTemplate
          ? String(selectedTemplate.id)
          : undefined,
    inspectItemName: String(inspectItemName || ""),
    inspectRate:
      isPollingCheck.value && inspectDemandForm.value.pollingTrigger === 1
        ? Number(inspectDemandForm.value.inspectRate || 0)
        : undefined,
    sampleNum: hasStandardNumericValue(inspectDemandForm.value.sampleNum)
      ? Number(inspectDemandForm.value.sampleNum)
      : undefined,
    laboratoryId: String(inspectDemandForm.value.laboratoryId || ""),
    inspectType: Number(inspectDemandForm.value.inspectType || 0),
    inspectionStandard: normalizedStandard,
    methodDesc: String(inspectDemandForm.value.methodDesc || "").trim(),
    pollingTrigger: isPollingCheck.value ? Number(inspectDemandForm.value.pollingTrigger || 1) : undefined,
    triggerAmount:
      isPollingCheck.value && inspectDemandForm.value.pollingTrigger === 2
        ? Number(inspectDemandForm.value.triggerAmount || 0)
        : undefined,
    productModelId: String(inspectDemandForm.value.productModelId || ""),
    techVersionId: String(inspectDemandForm.value.techVersionId || "")
  }

  loading.value = true
  try {
    if (props.inspectFormType === EnumFormType.Edit) {
      await updateTechStandardMeasurement(payload)
    } else {
      await createTechStandardMeasurementWithInspectItem(payload)
    }
    ElMessage.success(props.inspectFormType === EnumFormType.Edit ? "编辑成功" : "新增成功")
    show.value = false
    emits("onOk")
    // 刷新过程控制计划列表
    if (inspectDemandForm.value.techVersionId) {
      await getProcessControlPlanList(inspectDemandForm.value.techVersionId)
    }
  } finally {
    loading.value = false
  }
}

defineExpose({
  setShow: () => {
    show.value = true
  }
})
</script>

<style scoped lang="scss">
.inspect-form {
  max-height: 72vh;
  overflow-y: auto;
  padding-right: 6px;

  &:deep(.el-form-item) {
    margin-bottom: 18px;
  }

  &:deep(.el-form-item__content) {
    min-width: 0;
  }

  &:deep(.el-form-item__content > .el-select),
  &:deep(.el-form-item__content > .el-input),
  &:deep(.el-form-item__content > .el-input-number),
  &:deep(.el-form-item__content > .el-radio-group),
  &:deep(.el-form-item__content > .el-switch) {
    width: 100%;
  }

  &:deep(.quantitative-config-item) {
    grid-column: 1 / -1 !important;
  }

  &:deep(.quantitative-preview-item) {
    grid-column: 1 / 2 !important;
  }

  &:deep(.quantitative-unit-item) {
    grid-column: 2 / 3 !important;
  }
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 8px 0 14px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;

  &::before {
    content: "";
    width: 4px;
    height: 16px;
    border-radius: 999px;
    background: var(--el-color-primary);
  }
}

.quantitative-layout {
  display: grid;
  gap: 10px;
  grid-template-columns: minmax(260px, 0.9fr) minmax(420px, 1.1fr);
  align-items: stretch;
}

.quantitative-card {
  border: 1px solid #dcdfe6;
  border-radius: 12px;
  min-width: 0;
  padding: 12px 14px;
  background: #fff;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease;
  cursor: pointer;
}

.quantitative-card.is-active {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 2px rgb(64 158 255 / 12%);
}

.quantitative-card.is-inactive {
  opacity: 0.72;
}

.quantitative-card__head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}

.quantitative-card__title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.mode-indicator {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #c0c4cc;
}

.mode-indicator.is-active {
  background: var(--el-color-primary);
}

.active-tag {
  margin-left: auto;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgb(64 158 255 / 12%);
  color: var(--el-color-primary);
  font-size: 12px;
}

.single-mode-row {
  display: grid;
  gap: 10px;
  grid-template-columns: 104px 1fr;
}

.standard-range-layout {
  display: grid;
  gap: 10px;
}

.standard-value-card,
.tolerance-row {
  display: grid;
  gap: 10px;
  align-items: center;
  grid-template-columns: 72px 84px 1fr;
}

.standard-value-card {
  grid-template-columns: 72px 1fr;
}

.standard-value-card--tall {
  padding: 10px 12px;
  border-radius: 10px;
  background: #f7f9fc;
}

.range-label,
.tolerance-row-label {
  color: #606266;
  font-size: 13px;
}

.standard-preview {
  min-height: 32px;
  padding: 6px 0;
  color: #303133;
  line-height: 1.6;
}

@media (max-width: 1200px) {
  .quantitative-layout {
    grid-template-columns: 1fr;
  }

  .inspect-form {
    &:deep(.quantitative-preview-item),
    &:deep(.quantitative-unit-item) {
      grid-column: 1 / -1 !important;
    }
  }
}
</style>
