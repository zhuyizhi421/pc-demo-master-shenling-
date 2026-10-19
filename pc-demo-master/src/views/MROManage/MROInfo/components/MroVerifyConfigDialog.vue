<template>
  <el-dialog v-model="visible" :title="dialogTitle" width="920px" destroy-on-close append-to-body>
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px">
      <div class="section-title">基础信息</div>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="校验项编号" prop="configItemNo">
            <el-input v-model.trim="formData.configItemNo" placeholder="为空时自动生成" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="校验项名称" prop="configItemName">
            <el-input v-model.trim="formData.configItemName" placeholder="请输入校验项名称" />
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
          <el-form-item label="探测方式">
            <el-input v-model.trim="formData.detectMethod" placeholder="请输入探测方式" />
          </el-form-item>
        </el-col>
      </el-row>

      <div class="section-title">校验条件</div>
      <el-row :gutter="16">
        <el-col :span="24">
          <el-form-item label="检验标准">
            <div v-if="formData.standardType === 1" class="w-full">
              <el-radio-group v-model="formData.quantitativeMode" class="mode-group" @change="onQuantitativeModeChange">
                <el-radio-button label="lower">单边下限</el-radio-button>
                <el-radio-button label="upper">单边上限</el-radio-button>
                <el-radio-button label="range">双边公差</el-radio-button>
              </el-radio-group>
              <div v-if="formData.quantitativeMode !== 'range'" class="inline-grid">
                <el-select v-model="singleIntervalOperator">
                  <el-option label=">" value=">" />
                  <el-option label=">=" value=">=" />
                  <el-option label="<" value="<" />
                  <el-option label="<=" value="<=" />
                </el-select>
                <el-input-number v-model="singleIntervalValue" :controls="false" class="w-full" />
              </div>
              <div v-else class="range-grid">
                <el-input-number v-model="formData.standardValue" :controls="false" placeholder="标准值" />
                <div class="range-pair">
                  <el-select v-model="formData.upperToleranceSign">
                    <el-option label="+" value="+" />
                    <el-option label="-" value="-" />
                  </el-select>
                  <el-input-number v-model="formData.upperTolerance" :controls="false" placeholder="上公差" />
                </div>
                <div class="range-pair">
                  <el-select v-model="formData.lowerToleranceSign">
                    <el-option label="+" value="+" />
                    <el-option label="-" value="-" />
                  </el-select>
                  <el-input-number v-model="formData.lowerTolerance" :controls="false" placeholder="下公差" />
                </div>
              </div>
            </div>
            <el-input
              v-else
              v-model.trim="formData.standardDesc"
              type="textarea"
              :rows="3"
              placeholder="请输入检验标准"
            />
          </el-form-item>
        </el-col>
        <el-col v-if="formData.standardType === 1" :span="12">
          <el-form-item label="检验标准预览">
            <div class="preview-box">{{ standardPreview }}</div>
          </el-form-item>
        </el-col>
        <el-col v-if="formData.standardType === 1" :span="12">
          <el-form-item label="单位">
            <el-select v-model="formData.unitId" class="w-full" clearable filterable placeholder="请选择单位">
              <el-option v-for="item in unitOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="校验类型" prop="verifyType">
            <el-select v-model="formData.verifyType" class="w-full narrow-select">
              <el-option label="按次数" value="count" />
              <el-option label="按天" value="day" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="校验周期" prop="configFrequency">
            <div class="suffix-field">
              <el-input-number
                v-model="formData.configFrequency"
                :min="1"
                :step="1"
                :precision="0"
                class="w-full"
                controls-position="right"
              />
              <span>{{ frequencySuffix }}</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="校验执行职位" prop="departmentPositionValue">
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
        <el-col :span="12">
          <el-form-item label="校验机构">
            <el-input v-model.trim="formData.verifyOrg" maxlength="200" placeholder="请输入校验机构" />
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
import type { IMroInfoConfigTableRow } from "@/types/maintain/mro-manage/mro-info"
import { typeNumberHandle } from "@/utils/inspectStandard"

type IStandardType = 1 | 2
type IQuantitativeMode = "lower" | "upper" | "range"
type IVerifyType = "count" | "day"

interface IDepartmentPositionOption {
  label: string
  value: string
  children?: IDepartmentPositionOption[]
}

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    data?: IMroInfoConfigTableRow | null
    defaultExecuteDepartmentId?: string
    defaultExecuteDepartmentName?: string
    defaultExecutePositionId?: string
    defaultExecutePositionName?: string
    existingItemNos?: string[]
  }>(),
  {
    data: null,
    defaultExecuteDepartmentId: "",
    defaultExecuteDepartmentName: "",
    defaultExecutePositionId: "",
    defaultExecutePositionName: "",
    existingItemNos: () => []
  }
)

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
  (e: "success", value: IMroInfoConfigTableRow): void
}>()

const formRef = ref<FormInstance>()
const unitOptions = ref<{ label: string; value: string }[]>([])
const departmentPositionOptions = ref<IDepartmentPositionOption[]>([])
const departmentPositionCascaderProps = { emitPath: true, checkStrictly: false }
const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit("update:modelValue", value)
})
const dialogTitle = computed(() => (props.data?.id ? "编辑校验项" : "新增校验项"))
const currentUnitName = computed(() => unitOptions.value.find((item) => item.value === formData.unitId)?.label || "")
const frequencySuffix = computed(() => (formData.verifyType === "count" ? "次" : "天"))

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
  verifyType: "day" as IVerifyType,
  configFrequency: 1,
  verifyOrg: "",
  departmentPositionValue: [] as string[],
  imageList: [] as IUploadPhoto[]
})

const formRules = computed<FormRules>(() => ({
  configItemNo: [{
    validator: (_rule, value, callback) => {
      const nextValue = String(value || "").trim()
      if (!nextValue) return callback()
      const currentNo = String(props.data?.configItemNo || "").trim()
      const usedNos = props.existingItemNos.map((item) => String(item || "").trim()).filter(Boolean).filter((item) => item !== currentNo)
      if (usedNos.includes(nextValue)) return callback(new Error("校验项编号不能重复"))
      callback()
    }, trigger: "blur"
  }],
  configItemName: [{ required: true, message: "请输入校验项名称", trigger: "blur" }],
  standardType: [{ required: true, message: "请选择标准类型", trigger: "change" }],
  verifyType: [{ required: true, message: "请选择校验类型", trigger: "change" }],
  configFrequency: [{ required: true, message: "请输入校验周期", trigger: "change" }],
  departmentPositionValue: [{ type: "array", required: true, message: "请选择校验执行职位", trigger: "change" }]
}))

const selectedDepartmentPosition = computed(() => {
  const [departmentId = "", positionId = ""] = formData.departmentPositionValue
  const department = departmentPositionOptions.value.find((item) => item.value === departmentId)
  const position = department?.children?.find((item) => item.value === positionId)
  return { departmentId, departmentName: department?.label || "", positionId, positionName: position?.label || "" }
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

const onQuantitativeModeChange = (value: IQuantitativeMode) => {
  if (value === "range") {
    clearSingleQuantitativeFields()
    formData.quantitativeMode = "range"
    return
  }
  applySingleIntervalMode(
    value,
    value === "upper" ? Number(formData.standardMaxInclusive ?? 1) : Number(formData.standardMinInclusive ?? 1)
  )
}

const singleIntervalOperator = computed({
  get: () => formData.quantitativeMode === "upper" ? (Number(formData.standardMaxInclusive ?? 1) === 1 ? "<=" : "<") : (Number(formData.standardMinInclusive ?? 1) === 1 ? ">=" : ">"),
  set: (value: string) => {
    if (value === "<" || value === "<=") {
      applySingleIntervalMode("upper", value === "<=" ? 1 : 0)
      return
    }
    applySingleIntervalMode("lower", value === ">=" ? 1 : 0)
  }
})

const singleIntervalValue = computed<number | undefined>({
  get: () => formData.quantitativeMode === "upper" ? formData.standardMax : formData.standardMin,
  set: (value) => {
    if (formData.quantitativeMode === "upper") {
      formData.standardMax = value
      return
    }
    formData.standardMin = value
  }
})

const standardPreview = computed(() => typeNumberHandle({
  standardType: formData.standardType,
  standardDesc: formData.standardDesc.trim(),
  standardMax: formData.quantitativeMode === "upper" ? formData.standardMax ?? null : null,
  standardMaxInclusive: formData.standardMaxInclusive,
  standardMin: formData.quantitativeMode === "lower" ? formData.standardMin ?? null : null,
  standardMinInclusive: formData.standardMinInclusive,
  quantitativeMode: formData.quantitativeMode,
  standardValue: formData.quantitativeMode === "range" ? formData.standardValue ?? null : null,
  upperTolerance: formData.quantitativeMode === "range" ? formData.upperTolerance ?? null : null,
  lowerTolerance: formData.quantitativeMode === "range" ? formData.lowerTolerance ?? null : null,
  upperToleranceSign: formData.upperToleranceSign,
  lowerToleranceSign: formData.lowerToleranceSign,
  unitName: currentUnitName.value
}, true) || "")

watch(() => props.modelValue, async (value) => {
  if (!value) {
    resetForm()
    return
  }
  await Promise.all([loadUnitOptions(), loadDepartmentPositionOptions()])
  initForm()
})

watch(() => formData.standardType, (value) => {
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
})

const resetForm = () => {
  Object.assign(formData, {
    configItemName: "",
    configItemNo: "",
    detectMethod: "",
    standardType: 2,
    quantitativeMode: "lower",
    standardDesc: "",
    standardMax: undefined,
    standardMaxInclusive: 1,
    standardMin: undefined,
    standardMinInclusive: 1,
    standardValue: undefined,
    upperTolerance: undefined,
    lowerTolerance: undefined,
    upperToleranceSign: "+",
    lowerToleranceSign: "-",
    unitId: "",
    verifyType: "day",
    configFrequency: 1,
    verifyOrg: "",
    departmentPositionValue: [],
    imageList: []
  })
  nextTick(() => formRef.value?.clearValidate())
}

const loadUnitOptions = async () => {
  const data = await getUnit()
  unitOptions.value = (data || []).map((item) => ({ label: item.unitName, value: String(item.id) }))
}

const buildDepartmentPositionOptions = (departments: IDepartmentWorkItem[]) => departments.filter((department) => (department.positionList || []).length).map((department) => ({
  label: department.depName,
  value: department.id,
  children: (department.positionList || []).map((position) => ({ label: position.name, value: position.id }))
}))

const ensureCurrentDepartmentPositionOption = (depId = "", depName = "", positionId = "", positionName = "") => {
  if (!depId || !positionId) return
  let departmentNode = departmentPositionOptions.value.find((item) => item.value === depId)
  if (!departmentNode) {
    departmentNode = { label: depName || depId, value: depId, children: [] }
    departmentPositionOptions.value.unshift(departmentNode)
  }
  departmentNode.children ||= []
  if (!departmentNode.children.some((item) => item.value === positionId)) {
    departmentNode.children.unshift({ label: positionName.replace(`${departmentNode.label}-`, "") || positionId, value: positionId })
  }
}

const loadDepartmentPositionOptions = async () => {
  const result = await queryDepartmentWorkItemPageList({ pageNum: 1, pageSize: 999 })
  departmentPositionOptions.value = buildDepartmentPositionOptions(result.records || [])
  ensureCurrentDepartmentPositionOption(props.data?.executeDepartmentId || props.defaultExecuteDepartmentId, props.data?.executeDepartmentName || props.defaultExecuteDepartmentName, props.data?.executePositionId || props.defaultExecutePositionId, props.data?.executePositionName || props.defaultExecutePositionName)
}

const findDepartmentPositionPath = (departmentId?: string, positionId?: string) => {
  if (departmentId && positionId) {
    const department = departmentPositionOptions.value.find((item) => item.value === departmentId)
    if (department?.children?.some((item) => item.value === positionId)) return [departmentId, positionId]
  }
  if (!positionId) return []
  for (const department of departmentPositionOptions.value) {
    if (department.children?.some((item) => item.value === positionId)) return [department.value, positionId]
  }
  return []
}

const normalizeUploadPhotos = (files: Array<Partial<IUploadPhoto> & { id?: string; path?: string }> = []) => (Array.isArray(files) ? files : []).filter((item) => item && (item.fileId || item.id || item.fileUrl || item.path)).map((item, index) => ({
  fileId: String(item.fileId || item.id || `verify-file-${index}`),
  fileName: item.fileName || `图片说明${index + 1}.png`,
  fileUrl: item.fileUrl || item.path || "",
  selected: Boolean(item.selected)
}))

const toPhotoList = (files: IUploadPhoto[] = []): IPhoto[] => files.map((item, index) => ({
  fileId: String(item.fileId || `verify-file-${index}`),
  fileName: item.fileName || `图片说明${index + 1}.png`,
  fileUrl: item.fileUrl || ""
}))

const getNextConfigItemNo = () => {
  const maxNo = props.existingItemNos.reduce((max, item) => {
    const matched = String(item || "").trim().match(/(\d+)/g)
    if (!matched?.length) return max
    return Math.max(max, Number(matched[matched.length - 1]))
  }, 0)
  return `VERIFY-${String(maxNo + 1).padStart(3, "0")}`
}

const initForm = () => {
  resetForm()
  if (!props.data) {
    formData.departmentPositionValue = findDepartmentPositionPath(props.defaultExecuteDepartmentId, props.defaultExecutePositionId)
    return
  }
  const standard = props.data.checkStandardValue || {}
  formData.configItemName = props.data.configItemName || ""
  formData.configItemNo = props.data.configItemNo || ""
  formData.detectMethod = props.data.detectMethod || props.data.methodRequire || ""
  formData.standardType = Number(standard.standardType || 2) as IStandardType
  formData.standardDesc = standard.standardDesc || ""
  formData.standardMax = standard.standardMax !== null && standard.standardMax !== undefined && standard.standardMax !== "" ? Number(standard.standardMax) : undefined
  formData.standardMaxInclusive = Number(standard.standardMaxInclusive ?? 1)
  formData.standardMin = standard.standardMin !== null && standard.standardMin !== undefined && standard.standardMin !== "" ? Number(standard.standardMin) : undefined
  formData.standardMinInclusive = Number(standard.standardMinInclusive ?? 1)
  formData.standardValue = standard.standardValue !== null && standard.standardValue !== undefined && standard.standardValue !== "" ? Number(standard.standardValue) : undefined
  formData.upperTolerance = standard.upperTolerance !== null && standard.upperTolerance !== undefined && standard.upperTolerance !== "" ? Number(standard.upperTolerance) : undefined
  formData.lowerTolerance = standard.lowerTolerance !== null && standard.lowerTolerance !== undefined && standard.lowerTolerance !== "" ? Number(standard.lowerTolerance) : undefined
  formData.upperToleranceSign = standard.upperToleranceSign || "+"
  formData.lowerToleranceSign = standard.lowerToleranceSign || "-"
  formData.quantitativeMode = standard.quantitativeMode || (formData.standardValue !== undefined ? "range" : formData.standardMax !== undefined ? "upper" : "lower")
  formData.unitId = standard.unitId || ""
  formData.verifyType = props.data.verifyType || "day"
  formData.configFrequency = Number(props.data.configFrequency || 1)
  formData.verifyOrg = props.data.verifyOrg || ""
  formData.departmentPositionValue = findDepartmentPositionPath(props.data.executeDepartmentId || props.defaultExecuteDepartmentId, props.data.executePositionId || props.defaultExecutePositionId)
  formData.imageList = normalizeUploadPhotos(cloneDeep(props.data.files || []))
}

const validateQuantitative = () => {
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
  if (formData.standardType === 1) {
    const error = validateQuantitative()
    if (error) return ElMessage.warning(error)
  }
  const upperDeviation = formData.quantitativeMode === "range" ? (formData.upperToleranceSign === "-" ? -1 : 1) * Number(formData.upperTolerance || 0) : 0
  const lowerDeviation = formData.quantitativeMode === "range" ? (formData.lowerToleranceSign === "-" ? -1 : 1) * Number(formData.lowerTolerance || 0) : 0
  emit("success", {
    id: props.data?.id,
    configItemName: formData.configItemName.trim(),
    configItemNo: formData.configItemNo.trim() || getNextConfigItemNo(),
    detectMethod: formData.detectMethod.trim(),
    methodRequire: formData.detectMethod.trim(),
    verifyType: formData.verifyType,
    verifyOrg: formData.verifyOrg.trim(),
    configFrequency: Number(formData.configFrequency),
    executeDepartmentId: selectedDepartmentPosition.value.departmentId,
    executeDepartmentName: selectedDepartmentPosition.value.departmentName,
    executePositionId: selectedDepartmentPosition.value.positionId,
    executePositionName: selectedDepartmentPosition.value.positionName ? `${selectedDepartmentPosition.value.departmentName}-${selectedDepartmentPosition.value.positionName}` : "",
    checkStandardValue: formData.standardType === 2 ? {
      standardType: 2,
      standardDesc: formData.standardDesc.trim(),
      standardMax: null,
      standardMaxInclusive: 1,
      standardMin: null,
      standardMinInclusive: 1,
      unitId: "",
      unitName: ""
    } : {
      standardType: 1,
      standardDesc: standardPreview.value,
      standardMax: formData.quantitativeMode === "upper" ? formData.standardMax ?? null : formData.quantitativeMode === "range" ? Number(formData.standardValue) + Math.max(upperDeviation, lowerDeviation) : null,
      standardMaxInclusive: formData.quantitativeMode === "upper" ? formData.standardMaxInclusive : 1,
      standardMin: formData.quantitativeMode === "lower" ? formData.standardMin ?? null : formData.quantitativeMode === "range" ? Number(formData.standardValue) + Math.min(upperDeviation, lowerDeviation) : null,
      standardMinInclusive: formData.quantitativeMode === "lower" ? formData.standardMinInclusive : 1,
      quantitativeMode: formData.quantitativeMode,
      standardValue: formData.quantitativeMode === "range" ? formData.standardValue ?? null : null,
      upperTolerance: formData.quantitativeMode === "range" ? formData.upperTolerance ?? null : null,
      lowerTolerance: formData.quantitativeMode === "range" ? formData.lowerTolerance ?? null : null,
      upperToleranceSign: formData.quantitativeMode === "range" ? formData.upperToleranceSign : "+",
      lowerToleranceSign: formData.quantitativeMode === "range" ? formData.lowerToleranceSign : "-",
      unitId: formData.unitId,
      unitName: currentUnitName.value
    },
    files: toPhotoList(cloneDeep(formData.imageList))
  })
  visible.value = false
}
</script>

<style scoped lang="scss">
.section-title { margin: 0 0 16px; font-size: 15px; font-weight: 600; color: #303133; }
.section-title:not(:first-child) { margin-top: 8px; }
.w-full { width: 100%; }
.mode-group { margin-bottom: 12px; }
.inline-grid { display: grid; grid-template-columns: 96px minmax(0, 1fr); gap: 10px; }
.range-grid { display: grid; gap: 10px; }
.range-pair { display: grid; grid-template-columns: 76px minmax(0, 1fr); gap: 8px; }
.preview-box { min-height: 32px; padding: 6px 11px; line-height: 20px; color: #606266; background: #f5f7fa; border: 1px solid #dcdfe6; border-radius: 4px; }
.suffix-field { display: flex; align-items: center; gap: 8px; }
.narrow-select { max-width: 180px; }
@media (max-width: 960px) {
  .inline-grid,
  .range-pair { grid-template-columns: 1fr; }
}
</style>
