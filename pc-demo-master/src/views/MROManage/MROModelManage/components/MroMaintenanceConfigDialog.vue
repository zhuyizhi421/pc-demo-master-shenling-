<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="1080px"
    destroy-on-close
    append-to-body
    class="mro-maintenance-config-dialog"
  >
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px">
      <div class="section-title">基础信息</div>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="保养项编号" prop="configItemNo">
            <el-input v-model.trim="formData.configItemNo" placeholder="请输入保养项编号" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="保养项名称" prop="configItemName">
            <el-input v-model.trim="formData.configItemName" placeholder="请输入保养项名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="标准类型" prop="standardType">
            <el-select v-model="formData.standardType" class="w-full">
              <el-option label="定量" :value="1" />
              <el-option label="定性" :value="2" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="探测方式" prop="detectMethod">
            <el-input v-model.trim="formData.detectMethod" placeholder="请输入探测方式" />
          </el-form-item>
        </el-col>
      </el-row>

      <div class="section-title">保养条件</div>
      <el-row :gutter="16">
        <el-col :span="24">
          <el-form-item label="检验标准">
            <div class="w-full">
              <template v-if="formData.standardType === 1">
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
                          v-model="formData.standardValue"
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
                            v-model="formData.upperToleranceSign"
                            class="tolerance-sign-select"
                            :disabled="isSingleQuantitativeMode"
                            @focus="activateRangeMode"
                          >
                            <el-option label="+" value="+" />
                            <el-option label="-" value="-" />
                          </el-select>
                          <el-input-number
                            v-model="formData.upperTolerance"
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
                            v-model="formData.lowerToleranceSign"
                            class="tolerance-sign-select"
                            :disabled="isSingleQuantitativeMode"
                            @focus="activateRangeMode"
                          >
                            <el-option label="+" value="+" />
                            <el-option label="-" value="-" />
                          </el-select>
                          <el-input-number
                            v-model="formData.lowerTolerance"
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
                v-model.trim="formData.standardDesc"
                type="textarea"
                :rows="3"
                placeholder="请输入检验标准"
              />
            </div>
          </el-form-item>
        </el-col>

        <el-col v-if="formData.standardType === 1" :span="12">
          <el-form-item label="检验标准预览">
            <div class="standard-preview">{{ standardPreview }}</div>
          </el-form-item>
        </el-col>
        <el-col v-if="formData.standardType === 1" :span="12">
          <el-form-item label="单位">
            <el-select v-model="formData.unitId" class="w-full" clearable filterable placeholder="请选择单位">
              <el-option
                v-for="item in unitOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="6">
          <el-form-item label="保养类型" prop="maintenanceType">
            <el-select v-model="formData.maintenanceType" class="w-full maintenance-type-select">
              <el-option label="按次" value="count" />
              <el-option label="按周" value="week" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="保养周期" prop="configFrequency">
            <div class="frequency-field">
              <el-input-number
                v-model="formData.configFrequency"
                :min="1"
                :max="365"
                :step="1"
                :precision="0"
                class="w-full"
                controls-position="right"
              />
              <span class="frequency-field__suffix">{{ frequencySuffix }}</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="保养执行职位" prop="departmentPositionValue">
            <el-cascader
              v-model="formData.departmentPositionValue"
              class="w-full"
              :options="departmentPositionOptions"
              :props="departmentPositionCascaderProps"
              filterable
              clearable
              separator="-"
              placeholder="请选择部门职位"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <div class="section-title">辅助信息</div>
      <el-form-item label="图片说明">
        <UploadImage v-model="formData.imageList" :limit="5" multiple />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="onSubmit">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from "element-plus"
import { ElMessage } from "element-plus"

import { queryDepartmentWorkItemPageList } from "@/api/departmentWorkItem"
import { getUnit } from "@/api/units"
import UploadImage from "@/components/UploadImage/index.vue"
import type { IDepartmentWorkItem } from "@/types/base-info/department-work-item"
import type { IUploadPhoto } from "@/types/base-info/global-config"
import type { IPhoto } from "@/types/common"
import { typeNumberHandle } from "@/utils/inspectStandard"

type IStandardType = 1 | 2
type IQuantitativeMode = "lower" | "upper" | "range"
type IMaintenanceType = "count" | "week"

interface IMaintenanceStandardValue {
  standardDesc: string
  standardMax: number | string | null
  standardMaxInclusive: number
  standardMin: number | string | null
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

interface IMaintenanceConfigRow {
  checkStandardValue: IMaintenanceStandardValue
  configFrequency: number
  configItemName: string
  configItemNo: string
  detectMethod?: string
  executeDepartmentId?: string
  executeDepartmentName?: string
  executePositionId?: string
  executePositionName?: string
  id?: string
  maintenanceType?: IMaintenanceType
  methodRequire?: string
  files: IPhoto[]
}

interface IDepartmentPositionOption {
  label: string
  value: string
  children?: IDepartmentPositionOption[]
}

const props = defineProps<{
  modelValue: boolean
  data?: IMaintenanceConfigRow | null
  existingItemNos?: string[]
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
  (e: "success", value: IMaintenanceConfigRow): void
}>()

const formRef = ref<FormInstance>()
const unitOptions = ref<{ label: string; value: string }[]>([])
const departmentPositionOptions = ref<IDepartmentPositionOption[]>([])
const departmentPositionCascaderProps = {
  emitPath: true,
  checkStrictly: false
}

const formData = reactive({
  configItemName: "",
  configItemNo: "",
  detectMethod: "",
  standardType: 2 as IStandardType,
  quantitativeMode: "lower" as IQuantitativeMode,
  standardDesc: "",
  standardMax: undefined as number | undefined,
  standardMaxInclusive: 1,
  standardMin: undefined as number | undefined,
  standardMinInclusive: 1,
  standardValue: undefined as number | undefined,
  upperTolerance: undefined as number | undefined,
  lowerTolerance: undefined as number | undefined,
  upperToleranceSign: "+" as "+" | "-",
  lowerToleranceSign: "-" as "+" | "-",
  unitId: "",
  maintenanceType: "week" as IMaintenanceType,
  configFrequency: 1,
  departmentPositionValue: [] as string[],
  imageList: [] as IUploadPhoto[]
})

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit("update:modelValue", value)
})

const dialogTitle = computed(() => (props.data?.id ? "编辑保养项" : "新增保养项"))
const frequencySuffix = computed(() => (formData.maintenanceType === "count" ? "次" : "周"))
const currentUnitName = computed(
  () => unitOptions.value.find((item) => item.value === formData.unitId)?.label || ""
)
const isSingleQuantitativeMode = computed(() => formData.quantitativeMode !== "range")

const formRules = computed<FormRules>(() => ({
  configItemNo: [
    { required: true, message: "请输入保养项编号", trigger: "blur" },
    {
      validator: (_rule, value, callback) => {
        const currentNo = String(props.data?.configItemNo || "").trim()
        const nextValue = String(value || "").trim()
        const usedNos = (props.existingItemNos || [])
          .map((item) => String(item || "").trim())
          .filter(Boolean)
          .filter((item) => item !== currentNo)
        if (usedNos.includes(nextValue)) {
          callback(new Error("保养项编号不能重复"))
          return
        }
        callback()
      },
      trigger: "blur"
    }
  ],
  configItemName: [{ required: true, message: "请输入保养项名称", trigger: "blur" }],
  detectMethod: [{ required: true, message: "请输入探测方式", trigger: "blur" }],
  maintenanceType: [{ required: true, message: "请选择保养类型", trigger: "change" }],
  configFrequency: [
    { required: true, message: "请输入保养周期", trigger: "change" },
    {
      validator: (_rule, value, callback) => {
        if (Number.isInteger(value) && value >= 1 && value <= 365) {
          callback()
          return
        }
        callback(new Error("请输入1-365的整数"))
      },
      trigger: "change"
    }
  ],
  departmentPositionValue: [
    { type: "array", required: true, message: "请选择保养执行职位", trigger: "change" }
  ]
}))

const selectedDepartmentPosition = computed(() => {
  const [departmentId = "", positionId = ""] = formData.departmentPositionValue
  const department = departmentPositionOptions.value.find((item) => item.value === departmentId)
  const position = department?.children?.find((item) => item.value === positionId)
  return {
    departmentId,
    departmentName: department?.label || "",
    positionId,
    positionName: position?.label || ""
  }
})

const clearSingleQuantitativeFields = () => {
  formData.standardMax = undefined
  formData.standardMaxInclusive = 1
  formData.standardMin = undefined
  formData.standardMinInclusive = 1
}

const clearRangeQuantitativeFields = () => {
  formData.standardValue = undefined
  formData.upperTolerance = undefined
  formData.lowerTolerance = undefined
  formData.upperToleranceSign = "+"
  formData.lowerToleranceSign = "-"
}

const activateSingleMode = () => {
  const nextMode = formData.quantitativeMode === "upper" ? "upper" : "lower"
  const inclusive =
    nextMode === "upper"
      ? Number(formData.standardMaxInclusive ?? 1)
      : Number(formData.standardMinInclusive ?? 1)
  applySingleIntervalMode(nextMode, inclusive)
}

const activateRangeMode = () => {
  clearSingleQuantitativeFields()
  formData.quantitativeMode = "range"
}

const applySingleIntervalMode = (mode: "lower" | "upper", inclusive: number) => {
  clearRangeQuantitativeFields()
  if (mode === "upper") {
    formData.quantitativeMode = "upper"
    formData.standardMin = undefined
    formData.standardMinInclusive = 1
    formData.standardMaxInclusive = inclusive
    return
  }
  formData.quantitativeMode = "lower"
  formData.standardMax = undefined
  formData.standardMaxInclusive = 1
  formData.standardMinInclusive = inclusive
}

const singleIntervalOperator = computed({
  get: () => {
    if (formData.quantitativeMode === "upper") {
      return Number(formData.standardMaxInclusive ?? 1) === 1 ? "<=" : "<"
    }
    return Number(formData.standardMinInclusive ?? 1) === 1 ? ">=" : ">"
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
  get: () => (formData.quantitativeMode === "upper" ? formData.standardMax : formData.standardMin),
  set: (value) => {
    if (formData.quantitativeMode === "upper") {
      formData.standardMax = value
      return
    }
    formData.standardMin = value
  }
})

const standardPreview = computed(() => {
  if (formData.standardType === 2) return formData.standardDesc.trim()
  return (
    typeNumberHandle(
      {
        standardType: 1,
        standardDesc: "",
        standardMax: formData.quantitativeMode === "upper" ? formData.standardMax ?? null : null,
        standardMaxInclusive: formData.standardMaxInclusive,
        standardMin: formData.quantitativeMode === "lower" ? formData.standardMin ?? null : null,
        standardMinInclusive: formData.standardMinInclusive,
        quantitativeMode: formData.quantitativeMode,
        standardValue: formData.quantitativeMode === "range" ? formData.standardValue ?? null : null,
        upperTolerance:
          formData.quantitativeMode === "range" ? formData.upperTolerance ?? null : null,
        lowerTolerance:
          formData.quantitativeMode === "range" ? formData.lowerTolerance ?? null : null,
        upperToleranceSign: formData.upperToleranceSign,
        lowerToleranceSign: formData.lowerToleranceSign,
        unitName: currentUnitName.value
      },
      true
    ) || ""
  )
})

watch(
  () => props.modelValue,
  async (value) => {
    if (!value) {
      resetForm()
      return
    }
    await Promise.all([loadUnitOptions(), loadDepartmentPositionOptions()])
    initForm()
  }
)

watch(
  () => formData.standardType,
  (value) => {
    if (value === 2) {
      formData.quantitativeMode = "lower"
      formData.standardMax = undefined
      formData.standardMin = undefined
      formData.standardValue = undefined
      formData.upperTolerance = undefined
      formData.lowerTolerance = undefined
      formData.upperToleranceSign = "+"
      formData.lowerToleranceSign = "-"
      formData.unitId = ""
      return
    }
    formData.standardDesc = ""
  }
)

const resetForm = () => {
  formData.configItemName = ""
  formData.configItemNo = ""
  formData.detectMethod = ""
  formData.standardType = 2
  formData.quantitativeMode = "lower"
  formData.standardDesc = ""
  formData.standardMax = undefined
  formData.standardMaxInclusive = 1
  formData.standardMin = undefined
  formData.standardMinInclusive = 1
  formData.standardValue = undefined
  formData.upperTolerance = undefined
  formData.lowerTolerance = undefined
  formData.upperToleranceSign = "+"
  formData.lowerToleranceSign = "-"
  formData.unitId = ""
  formData.maintenanceType = "week"
  formData.configFrequency = 1
  formData.departmentPositionValue = []
  formData.imageList = []
  nextTick(() => formRef.value?.clearValidate())
}

const hasStandardNumericValue = (value: unknown) => value !== null && value !== undefined && value !== ""

const normalizeUploadPhotos = (files: Array<Partial<IUploadPhoto> & { id?: string; path?: string }> = []) =>
  (Array.isArray(files) ? files : [])
    .filter((item) => item && (item.fileId || item.id || item.fileUrl || item.path))
    .map((item, index) => ({
      fileId: String(item.fileId || item.id || `maintenance-file-${index}`),
      fileName: item.fileName || `图片说明${index + 1}.png`,
      fileUrl: item.fileUrl || item.path || "",
      selected: Boolean(item.selected)
    }))

const toPhotoList = (files: IUploadPhoto[] = []): IPhoto[] =>
  files.map((item, index) => ({
    fileId: String(item.fileId || `maintenance-file-${index}`),
    fileName: item.fileName || `图片说明${index + 1}.png`,
    fileUrl: item.fileUrl || ""
  }))

const initForm = () => {
  resetForm()
  if (!props.data) return

  const standard = props.data.checkStandardValue || ({} as IMaintenanceStandardValue)
  const hasRangeMode =
    standard.quantitativeMode === "range" ||
    (hasStandardNumericValue(standard.standardValue) &&
      hasStandardNumericValue(standard.upperTolerance) &&
      hasStandardNumericValue(standard.lowerTolerance))

  formData.configItemName = props.data.configItemName || ""
  formData.configItemNo = props.data.configItemNo || ""
  formData.detectMethod = props.data.detectMethod || props.data.methodRequire || ""
  formData.standardType = Number(standard.standardType || 2) as IStandardType
  formData.quantitativeMode = hasRangeMode
    ? "range"
    : standard.quantitativeMode || (hasStandardNumericValue(standard.standardMax) ? "upper" : "lower")
  formData.standardDesc = standard.standardDesc || ""
  formData.standardMax = hasStandardNumericValue(standard.standardMax) ? Number(standard.standardMax) : undefined
  formData.standardMaxInclusive = Number(standard.standardMaxInclusive ?? 1)
  formData.standardMin = hasStandardNumericValue(standard.standardMin) ? Number(standard.standardMin) : undefined
  formData.standardMinInclusive = Number(standard.standardMinInclusive ?? 1)
  formData.standardValue = hasStandardNumericValue(standard.standardValue) ? Number(standard.standardValue) : undefined
  formData.upperTolerance = hasStandardNumericValue(standard.upperTolerance) ? Number(standard.upperTolerance) : undefined
  formData.lowerTolerance = hasStandardNumericValue(standard.lowerTolerance) ? Number(standard.lowerTolerance) : undefined
  formData.upperToleranceSign = standard.upperToleranceSign || "+"
  formData.lowerToleranceSign = standard.lowerToleranceSign || "-"
  formData.unitId = standard.unitId || ""
  formData.maintenanceType = props.data.maintenanceType || "week"
  formData.configFrequency = Number(props.data.configFrequency || 1)
  formData.departmentPositionValue = findDepartmentPositionPath(
    props.data.executeDepartmentId,
    props.data.executePositionId
  )
  formData.imageList = normalizeUploadPhotos(cloneDeep(props.data.files || []))
}

const loadUnitOptions = async () => {
  const data = await getUnit()
  unitOptions.value = (data || []).map((item) => ({
    label: item.unitName,
    value: String(item.id)
  }))
}

const buildDepartmentPositionOptions = (departments: IDepartmentWorkItem[]) =>
  departments
    .filter((department) => (department.positionList || []).length)
    .map((department) => ({
      label: department.depName,
      value: department.id,
      children: (department.positionList || []).map((position) => ({
        label: position.name,
        value: position.id
      }))
    }))

const ensureCurrentDepartmentPositionOption = (params: {
  depId?: string
  depName?: string
  positionId?: string
  positionName?: string
}) => {
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

const loadDepartmentPositionOptions = async () => {
  const result = await queryDepartmentWorkItemPageList({ pageNum: 1, pageSize: 999 })
  departmentPositionOptions.value = buildDepartmentPositionOptions(result.records || [])
  ensureCurrentDepartmentPositionOption({
    depId: props.data?.executeDepartmentId,
    depName: props.data?.executeDepartmentName,
    positionId: props.data?.executePositionId,
    positionName: props.data?.executePositionName
  })
}

const findDepartmentPositionPath = (departmentId?: string, positionId?: string) => {
  if (departmentId && positionId) {
    const department = departmentPositionOptions.value.find((item) => item.value === departmentId)
    if (department?.children?.some((item) => item.value === positionId)) {
      return [departmentId, positionId]
    }
  }
  if (!positionId) return []
  for (const department of departmentPositionOptions.value) {
    if (department.children?.some((item) => item.value === positionId)) {
      return [department.value, positionId]
    }
  }
  return []
}

const validateQuantitativeFields = () => {
  if (formData.quantitativeMode === "lower" && formData.standardMin === undefined) return "请输入下限值"
  if (formData.quantitativeMode === "upper" && formData.standardMax === undefined) return "请输入上限值"
  if (formData.quantitativeMode === "range") {
    if (formData.standardValue === undefined) return "请输入标准值"
    if (formData.upperTolerance === undefined) return "请输入上公差"
    if (formData.lowerTolerance === undefined) return "请输入下公差"
  }
  return ""
}

const onSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  if (formData.standardType === 2 && !formData.standardDesc.trim()) {
    ElMessage.warning("请输入检验标准")
    return
  }

  if (formData.standardType === 1) {
    const errorMessage = validateQuantitativeFields()
    if (errorMessage) {
      ElMessage.warning(errorMessage)
      return
    }
  }

  const upperDeviation =
    formData.quantitativeMode === "range"
      ? (formData.upperToleranceSign === "-" ? -1 : 1) * Number(formData.upperTolerance || 0)
      : 0
  const lowerDeviation =
    formData.quantitativeMode === "range"
      ? (formData.lowerToleranceSign === "-" ? -1 : 1) * Number(formData.lowerTolerance || 0)
      : 0

  const standardValue: IMaintenanceStandardValue =
    formData.standardType === 2
      ? {
          standardType: 2,
          standardDesc: formData.standardDesc.trim(),
          standardMax: null,
          standardMaxInclusive: 1,
          standardMin: null,
          standardMinInclusive: 1,
          unitId: "",
          unitName: ""
        }
      : {
          standardType: 1,
          standardDesc: standardPreview.value,
          standardMax:
            formData.quantitativeMode === "upper"
              ? formData.standardMax ?? null
              : formData.quantitativeMode === "range"
                ? Number(formData.standardValue) + Math.max(upperDeviation, lowerDeviation)
                : null,
          standardMaxInclusive: formData.quantitativeMode === "upper" ? formData.standardMaxInclusive : 1,
          standardMin:
            formData.quantitativeMode === "lower"
              ? formData.standardMin ?? null
              : formData.quantitativeMode === "range"
                ? Number(formData.standardValue) + Math.min(upperDeviation, lowerDeviation)
                : null,
          standardMinInclusive: formData.quantitativeMode === "lower" ? formData.standardMinInclusive : 1,
          quantitativeMode: formData.quantitativeMode,
          standardValue: formData.quantitativeMode === "range" ? formData.standardValue ?? null : null,
          upperTolerance: formData.quantitativeMode === "range" ? formData.upperTolerance ?? null : null,
          lowerTolerance: formData.quantitativeMode === "range" ? formData.lowerTolerance ?? null : null,
          upperToleranceSign: formData.quantitativeMode === "range" ? formData.upperToleranceSign : "+",
          lowerToleranceSign: formData.quantitativeMode === "range" ? formData.lowerToleranceSign : "-",
          unitId: formData.unitId,
          unitName: currentUnitName.value
        }

  emit("success", {
    id: props.data?.id,
    configItemName: formData.configItemName.trim(),
    configItemNo: formData.configItemNo.trim(),
    detectMethod: formData.detectMethod.trim(),
    methodRequire: formData.detectMethod.trim(),
    checkStandardValue: standardValue,
    maintenanceType: formData.maintenanceType,
    configFrequency: Number(formData.configFrequency),
    executeDepartmentId: selectedDepartmentPosition.value.departmentId,
    executeDepartmentName: selectedDepartmentPosition.value.departmentName,
    executePositionId: selectedDepartmentPosition.value.positionId,
    executePositionName: selectedDepartmentPosition.value.positionName
      ? `${selectedDepartmentPosition.value.departmentName}-${selectedDepartmentPosition.value.positionName}`
      : "",
    files: toPhotoList(cloneDeep(formData.imageList))
  })
  visible.value = false
}
</script>

<style scoped lang="scss">
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
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease,
    transform 0.2s ease;
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

.frequency-field {
  display: flex;
  align-items: center;
  gap: 8px;
}

.frequency-field__suffix {
  flex: none;
  color: #606266;
  white-space: nowrap;
}

.maintenance-type-select {
  max-width: 180px;
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
</style>
