<template>
  <CustomDialog :title="title" v-model="visible" size="large">
    <CustomForm
      ref="customFormRef"
      v-model="inspectDemandForm"
      :configs="formConfigs"
      :columns="2"
      :label-width="104"
      class="inspect-form"
    >
      <template #baseTitle-default>
        <div class="section-title">基础信息</div>
      </template>

      <template #standardTitle-default>
        <div class="section-title">检验标准</div>
      </template>

      <!-- <template #samplingTitle-default>
        <div class="section-title">抽检配置</div>
      </template> -->

      <template #assistTitle-default>
        <div class="section-title">辅助信息</div>
      </template>

      <template #standardType-default>
        <el-select v-model="inspectDemandForm.inspectionStandard.standardType" class="w-full">
          <el-option label="定量" :value="1" />
          <el-option label="定性" :value="2" />
        </el-select>
      </template>

      <template #status-default>
        <div class="status-switch-field">
          <el-switch
            v-model="inspectDemandForm.status"
            :active-value="1"
            :inactive-value="0"
          />
          <span class="status-switch-text" :class="{ 'is-disabled': inspectDemandForm.status === 0 }">
            {{ inspectDemandForm.status === 0 ? "停用" : "启用" }}
          </span>
        </div>
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

      <template #imageList-default>
        <UploadImage v-model="imageList" :limit="5" multiple />
      </template>
    </CustomForm>

    <template #footer>
      <el-button @click="onCancelClick">取消</el-button>
      <el-button type="primary" @click="onConfirmClick" :loading="loading">确定</el-button>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import {
  queryInspectOptionTemplateDetail,
  queryInspectOptionTemplateList
} from "@/api/baseInfo/inspectOptionTemplate"
import { InspectionStandardType } from "@/api/operation/equipment/types"
import { queryGradientList } from "@/api/quality/gradientModel"
import { getUnit } from "@/api/units"
import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import type { ICustomFormConfigItem } from "@/components/CustomForm/type"
import type { InspectDemandForm } from "@/components/InspectForm/type"
import UploadImage from "@/components/UploadImage/index.vue"
import {
  EnumProductInspectionTypeMap,
  EnumProductionSamplingMethod,
  EnumProductionSamplingMethodMap
} from "@/constant/enums"
import useResetRef from "@/hooks/useResetRef"
import type { IUploadPhoto } from "@/types/base-info/global-config"
import type { IInspectOptionTemplateListItem } from "@/types/base-info/inspect-option-template"
import type { IOption } from "@/types/common"
import { isNumberStandardValid } from "@/utils"
import { formatImgUrlPreview } from "@/utils/common"
import { typeNumberHandle } from "@/utils/inspectStandard"

type IQuantitativeMode = "lower" | "upper" | "range"

type IProductInspectDemandForm = Omit<InspectDemandForm, "inspectType" | "inspectionStandard"> & {
  inspectType?: number
  status: number
  samplingMethod: number
  samplingRatio: string
  gradientModelId: string
  isSampleReturn: boolean
  inspectionStandard: Omit<InspectDemandForm["inspectionStandard"], "standardMax" | "standardMin"> & {
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

interface TypeOptions {
  inspectName: string
  inspectType: number
}

defineOptions({
  name: "ProductInspectForm"
})

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title: string
    isEdit: boolean
    formData: IProductInspectDemandForm
    inspectTypeOptions?: TypeOptions[]
  }>(),
  {
    isEdit: false,
    inspectTypeOptions: () =>
      Object.entries(EnumProductInspectionTypeMap)
        .filter((item) => +item[0] > 6 && +item[0] !== 10)
        .map((item) => ({
          inspectName: item[1],
          inspectType: +item[0]
        }))
  }
)

const emits = defineEmits<{
  (e: "onOk", value: IProductInspectDemandForm): void
  (e: "cancel"): void
  (e: "update:modelValue", value: boolean): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emits("update:modelValue", val)
})

const inspectTemplateOptions = ref<IInspectOptionTemplateListItem[]>([])

const [inspectDemandForm, resetInspectDemandForm] = useResetRef<IProductInspectDemandForm>({
  techVersionId: "",
  id: "",
  inspectItemCode: "",
  inspectItemId: "",
  inspectItemName: "",
  inspectType: undefined,
  status: 1,
  inspectionStandard: {
    standardDesc: "",
    standardMax: 0,
    standardMaxInclusive: 0,
    standardMin: 0,
    standardMinInclusive: 1,
    standardType: 1,
    quantitativeMode: "lower",
    standardValue: undefined,
    upperTolerance: undefined,
    lowerTolerance: undefined,
    upperToleranceSign: "+",
    lowerToleranceSign: "-",
    unitId: "",
    unitName: ""
  },
  productModelId: "",
  methodDesc: "",
  laboratoryIdList: [],
  imageIds: [],
  imageUrls: [],
  samplingMethod: EnumProductionSamplingMethod.PERCENTAGE,
  samplingRatio: "",
  gradientModelId: "",
  isSampleReturn: false
})

const customFormRef = ref<InstanceType<typeof CustomForm>>()
const imageList = ref<IUploadPhoto[]>([])
const unitOptions = ref<{ label: string; value: string }[]>([])
const gradientOptions = ref<IOption[]>([])
const loading = ref(false)

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

const resetRangeFields = () => {
  inspectDemandForm.value.inspectionStandard.standardValue = undefined
  inspectDemandForm.value.inspectionStandard.upperTolerance = undefined
  inspectDemandForm.value.inspectionStandard.lowerTolerance = undefined
  inspectDemandForm.value.inspectionStandard.upperToleranceSign = "+"
  inspectDemandForm.value.inspectionStandard.lowerToleranceSign = "-"
}

const clearSingleIntervalFields = () => {
  inspectDemandForm.value.inspectionStandard.standardMax = null
  inspectDemandForm.value.inspectionStandard.standardMin = null
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
    inspectDemandForm.value.inspectionStandard.standardMin = null
    return
  }
  inspectDemandForm.value.inspectionStandard.quantitativeMode = "lower"
  inspectDemandForm.value.inspectionStandard.standardMinInclusive = inclusive
  inspectDemandForm.value.inspectionStandard.standardMax = null
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
      inspectDemandForm.value.inspectionStandard.standardMax = value ?? null
      return
    }
    inspectDemandForm.value.inspectionStandard.standardMin = value ?? null
  }
})

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

const inferQuantitativeMode = (standard: Partial<IProductInspectDemandForm["inspectionStandard"]>) => {
  if (standard.quantitativeMode === "lower" || standard.quantitativeMode === "upper") {
    return standard.quantitativeMode
  }
  const hasRangeMode =
    standard.quantitativeMode === "range" ||
    (hasStandardNumericValue(standard.standardValue) &&
      hasStandardNumericValue(standard.upperTolerance) &&
      hasStandardNumericValue(standard.lowerTolerance))
  if (hasRangeMode) return "range" as IQuantitativeMode
  return hasStandardNumericValue(standard.standardMax) ? ("upper" as IQuantitativeMode) : "lower"
}

const applyInspectionStandard = (
  standard: Partial<IProductInspectDemandForm["inspectionStandard"]> | undefined
) => {
  const nextMode = inferQuantitativeMode(standard || {})
  inspectDemandForm.value.inspectionStandard = {
    standardType: Number(standard?.standardType || InspectionStandardType.Text),
    standardDesc: String(standard?.standardDesc || ""),
    standardMax: normalizeNullableNumber(standard?.standardMax) ?? null,
    standardMaxInclusive: Number(standard?.standardMaxInclusive ?? 0),
    standardMin: normalizeNullableNumber(standard?.standardMin) ?? null,
    standardMinInclusive: Number(standard?.standardMinInclusive ?? 1),
    quantitativeMode: nextMode,
    standardValue: normalizeNullableNumber(standard?.standardValue) ?? undefined,
    upperTolerance: normalizeNullableNumber(standard?.upperTolerance) ?? undefined,
    lowerTolerance: normalizeNullableNumber(standard?.lowerTolerance) ?? undefined,
    upperToleranceSign: standard?.upperToleranceSign || "+",
    lowerToleranceSign: standard?.lowerToleranceSign || "-",
    unitId: String(standard?.unitId || ""),
    unitName:
      standard?.unitName ||
      unitOptions.value.find((item) => item.value === String(standard?.unitId || ""))?.label ||
      ""
  }
}

const resetQuantitativeFields = () => {
  inspectDemandForm.value.inspectionStandard.quantitativeMode = "lower"
  inspectDemandForm.value.inspectionStandard.standardMax = null
  inspectDemandForm.value.inspectionStandard.standardMaxInclusive = 0
  inspectDemandForm.value.inspectionStandard.standardMin = null
  inspectDemandForm.value.inspectionStandard.standardMinInclusive = 1
  inspectDemandForm.value.inspectionStandard.standardValue = undefined
  inspectDemandForm.value.inspectionStandard.upperTolerance = undefined
  inspectDemandForm.value.inspectionStandard.lowerTolerance = undefined
  inspectDemandForm.value.inspectionStandard.upperToleranceSign = "+"
  inspectDemandForm.value.inspectionStandard.lowerToleranceSign = "-"
  inspectDemandForm.value.inspectionStandard.unitId = ""
  inspectDemandForm.value.inspectionStandard.unitName = ""
}

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

const validateSingleIntervalStandard = (standard: IProductInspectDemandForm["inspectionStandard"]) => {
  if (standard.quantitativeMode === "range") return true
  return isNumberStandardValid(
    standard.quantitativeMode === "upper" ? Number(standard.standardMax) : (undefined as unknown as number),
    standard.quantitativeMode === "lower" ? Number(standard.standardMin) : (undefined as unknown as number),
    standard.quantitativeMode === "upper" ? !!standard.standardMaxInclusive : true,
    standard.quantitativeMode === "lower" ? !!standard.standardMinInclusive : true
  )
}

const buildNormalizedStandard = () => {
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
      quantitativeMode: "lower" as IQuantitativeMode,
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
  // {
  //   componentType: "el-select",
  //   label: "检验类型",
  //   field: "inspectType",
  //   colspan: 1,
  //   rules: [
  //     {
  //       required: true,
  //       message: "请选择检验类型",
  //       trigger: "change"
  //     }
  //   ],
  //   props: {
  //     placeholder: "请选择检验类型",
  //     filterable: true,
  //     get disabled() {
  //       return props.isEdit
  //     },
  //     get customChildren() {
  //       return props.inspectTypeOptions.map((item) => ({
  //         componentType: "el-option",
  //         props: {
  //           label: item.inspectName,
  //           value: item.inspectType
  //         }
  //       }))
  //     }
  //   }
  // },
  {
    componentType: "el-input",
    label: "检验项名称",
    field: "inspectItemName",
    colspan: 1,
    rules: [
      {
        required: true,
        message: "请输入检验项名称",
        trigger: "blur"
      }
    ],
    props: {
      placeholder: "请输入检验项名称",
      maxlength: 200,
      showWordLimit: true,
      clearable: true
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
    props: {
      class: "w-[100%]"
    },
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
    props: {
      class: "w-[100%]"
    },
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
      class: "w-[100%] quantitative-config-item"
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
      class: "w-[100%] quantitative-preview-item"
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
    get hidden() {
      return inspectDemandForm.value.inspectionStandard.standardType !== InspectionStandardType.Number
    },
    props: {
      class: "w-[100%] quantitative-unit-item"
    },
    slots: {
      default: "unitId-default"
    }
  },
  // {
  //   componentType: "div",
  //   special: true,
  //   field: "samplingTitle",
  //   colspan: -1,
  //   slots: {
  //     default: "samplingTitle-default"
  //   }
  // },
  // {
  //   componentType: "el-select",
  //   label: "抽检方式",
  //   field: "samplingMethod",
  //   colspan: 1,
  //   props: {
  //     placeholder: "请选择抽检方式",
  //     clearable: false,
  //     get customChildren() {
  //       return Object.entries(EnumProductionSamplingMethodMap).map(([key, value]) => ({
  //         componentType: "el-option",
  //         props: { label: value, value: +key }
  //       }))
  //     }
  //   }
  // },
  // {
  //   componentType: "el-input",
  //   label: "建议抽检比例",
  //   field: "samplingRatio",
  //   colspan: 1,
  //   props: {
  //     type: "number",
  //     placeholder: "请输入建议抽检比例",
  //     clearable: false,
  //     min: 0,
  //     max: 100
  //   },
  //   get hidden() {
  //     return inspectDemandForm.value.samplingMethod !== EnumProductionSamplingMethod.PERCENTAGE
  //   },
  //   slots: {
  //     suffix: "%"
  //   }
  // },
  // {
  //   componentType: "el-select",
  //   label: "梯度方式",
  //   field: "gradientModelId",
  //   colspan: 1,
  //   get hidden() {
  //     return inspectDemandForm.value.samplingMethod !== EnumProductionSamplingMethod.GRADIENT
  //   },
  //   props: {
  //     placeholder: "请选择梯度方式",
  //     clearable: false,
  //     get customChildren() {
  //       return gradientOptions.value.map((item) => ({
  //         componentType: "el-option",
  //         props: { label: item.label, value: item.value }
  //       }))
  //     }
  //   }
  // },
  {
    componentType: "el-switch",
    label: "样品是否还回",
    field: "isSampleReturn",
    colspan: 1,
    props: {
      class: "w-[100%]"
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
    label: "状态",
    field: "status",
    colspan: 1,
    rules: [
      {
        required: true,
        message: "请选择状态",
        trigger: "change"
      }
    ],
    props: {
      class: "w-[100%]"
    },
    slots: {
      default: "status-default"
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
  () => props.modelValue,
  async (val) => {
    if (!val) {
      resetInspectDemandForm()
      customFormRef.value?.resetForm()
      imageList.value = []
      return
    }

    loading.value = true
    try {
      customFormRef.value?.resetForm()
      await Promise.all([getUnitOptions(), getGradientOptions(), getInspectOptionTemplate()])
      inspectDemandForm.value = cloneDeep(props.formData)
      inspectDemandForm.value.status = Number(props.formData.status ?? 1) === 0 ? 0 : 1
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
  () => inspectDemandForm.value.samplingMethod,
  (value) => {
    if (value === EnumProductionSamplingMethod.PERCENTAGE) {
      inspectDemandForm.value.gradientModelId = ""
      return
    }
    inspectDemandForm.value.samplingRatio = ""
  }
)

const getUnitOptions = async () => {
  const data = await getUnit()
  unitOptions.value = data.map((item) => ({
    label: item.unitName,
    value: String(item.id)
  }))
}

const getInspectOptionTemplate = async () => {
  const res = await queryInspectOptionTemplateList({})
  inspectTemplateOptions.value = res || []
}

const getGradientOptions = async () => {
  const data = await queryGradientList()
  gradientOptions.value = (data || []).map((item) => ({
    label: item.modelName,
    value: item.id
  }))
}

const onInspectNameChange = async (val: string) => {
  if (!val) return

  const isSelect = inspectTemplateOptions.value.some((item) => item.id === val)
  if (isSelect) {
    const detailInfo = await queryInspectOptionTemplateDetail(val)
    if (!detailInfo) return

    inspectDemandForm.value.inspectItemName = detailInfo.inspectItemName
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
    inspectDemandForm.value.imageIds = detailInfo.images?.map((item) => item.id) || []
    imageList.value =
      detailInfo.images?.map((item) => ({
        fileName: item.fileName,
        fileUrl: formatImgUrlPreview(item.path),
        fileId: item.id
      })) || []
    return
  }

  inspectDemandForm.value.inspectItemId = val
  inspectDemandForm.value.inspectItemName = val
}

const onCancelClick = () => {
  resetInspectDemandForm()
  visible.value = false
  emits("cancel")
}

const onConfirmClick = async () => {
  const valid = await customFormRef.value?.validateForm()
  if (!valid) return

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

    const standard = inspectDemandForm.value.inspectionStandard
    if (!validateSingleIntervalStandard(standard)) {
      return
    }
  }

  const normalizedStandard = buildNormalizedStandard()

  loading.value = true
  try {
    emits("onOk", {
      ...cloneDeep(inspectDemandForm.value),
      inspectItemName: inspectDemandForm.value.inspectItemName || inspectDemandForm.value.inspectItemId,
      inspectionStandard: normalizedStandard,
      imageIds: imageList.value.map((item) => String(item.fileId || "")),
      imageUrls: imageList.value.map((item) => item.fileUrl || "")
    })
    visible.value = false
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.inspect-form {
  max-height: 70vh;
  overflow-y: auto;
  padding-right: 6px;

  &:deep(.el-form) {
    gap: 0 20px;
  }

  &:deep(.el-form-item) {
    margin-bottom: 18px;

    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
      -webkit-appearance: none;
    }

    input[type="number"] {
      -moz-appearance: textfield;
    }
  }

  &:deep(.el-form-item__label) {
    padding-right: 10px;
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

.status-switch-field {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.status-switch-text {
  color: #606266;
  font-size: 13px;
  white-space: nowrap;
}

.status-switch-text.is-disabled {
  color: #b1b3b8;
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

.mode-indicator {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #c0c4cc;
}

.mode-indicator.is-active {
  background: var(--el-color-primary);
}

.quantitative-card__title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.active-tag {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  line-height: 18px;
  color: var(--el-color-primary);
  background: rgb(64 158 255 / 10%);
}

.single-mode-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.operator-select {
  width: 96px;
  flex-shrink: 0;
}

.standard-input,
.range-number {
  width: 100%;
}

.standard-range-layout {
  display: grid;
  grid-template-columns: minmax(118px, 150px) minmax(0, 1fr);
  grid-template-rows: repeat(2, minmax(44px, auto));
  gap: 8px 10px;
  align-items: stretch;
}

.standard-value-card {
  display: grid;
  gap: 8px;
}

.standard-value-card--tall {
  grid-row: 1 / span 2;
  min-width: 0;
  padding: 10px;
  border-radius: 10px;
  background: #f7f9fc;
  align-content: center;
}

.range-label {
  font-size: 13px;
  color: #606266;
}

.tolerance-row {
  display: grid;
  grid-template-columns: 52px 72px minmax(0, 1fr);
  gap: 8px;
  align-items: center;
}

.tolerance-row-label {
  font-size: 13px;
  color: #606266;
}

.tolerance-sign-select {
  width: 72px;
}

.standard-preview {
  min-height: 48px;
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #e4e7ed;
  background: linear-gradient(180deg, #fbfcff 0%, #f5f7fa 100%);
  color: #606266;
  word-break: break-all;
}

@media (max-width: 960px) {
  .inspect-form {
    &:deep(.el-form) {
      grid-template-columns: 1fr !important;
    }

    &:deep(.quantitative-preview-item),
    &:deep(.quantitative-unit-item) {
      grid-column: 1 / -1 !important;
    }
  }

  .quantitative-layout,
  .single-mode-row {
    grid-template-columns: 1fr;
  }

  .standard-range-layout,
  .tolerance-row {
    grid-template-columns: 1fr;
  }

  .standard-value-card--tall {
    grid-row: auto;
  }
}
</style>
