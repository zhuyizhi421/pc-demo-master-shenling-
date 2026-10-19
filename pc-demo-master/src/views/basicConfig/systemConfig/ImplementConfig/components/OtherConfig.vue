<!-- 自定义组件相关，暂不修改及删除 -->
<template>
  <el-form class="form-wrap" ref="formRef" :rules="rules" :model="formData" label-width="130px">
    <el-table :data="formData.tableData" border style="width: 100%">
      <el-table-column type="index" label="序号" width="65" align="center" />
      <el-table-column label="字段信息" align="center" min-width="820">
        <template #default="{ row, $index }">
          <div class="field-info">
            <el-form-item
              label="表单"
              :prop="`tableData.${$index}.formType`"
              :rules="rules.formType"
            >
              <el-select v-model="row.formType" placeholder="请选择">
                <el-option
                  v-for="item in formTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item
              label="字段名称"
              :prop="`tableData.${$index}.fieldName`"
              :rules="rules.fieldName"
            >
              <el-input v-model="row.fieldName" placeholder="请输入" maxlength="50" clearable />
            </el-form-item>
            <el-form-item
              label="字段样式"
              :prop="`tableData.${$index}.fieldType`"
              :rules="rules.fieldType"
            >
              <el-select
                v-model="row.fieldType"
                @change="onFieldTypeChange(row, $index)"
                placeholder="请选择"
              >
                <el-option
                  v-for="(value, key) in EnumCustomFormComponentTypeMap"
                  :key="key"
                  :label="value"
                  :value="+key"
                />
              </el-select>
            </el-form-item>

            <!-- 日期选择器显示 -->
            <el-form-item
              label="类型"
              v-if="showDate(row.fieldType)"
              :prop="`tableData.${$index}.dateType`"
              :rules="rules.dateType"
            >
              <el-select v-model="row.dateType" placeholder="请选择">
                <template v-if="row.fieldType === EnumCustomFormComponentType.DATE_PICKER">
                  <el-option label="单个日期" :value="1" />
                  <el-option label="日期范围" :value="2" />
                </template>
                <template v-if="row.fieldType === EnumCustomFormComponentType.TIME_PICKER">
                  <el-option label="单个时间点" :value="1" />
                  <el-option label="时间范围" :value="2" />
                </template>
              </el-select>
            </el-form-item>

            <!-- 选人组件显示 -->
            <template v-if="showSelectUser(row.fieldType)">
              <el-form-item
                label="选人方式"
                :prop="`tableData.${$index}.selectUserTypes`"
                :rules="rules.selectUserTypes"
              >
                <el-select
                  v-model="row.selectUserTypes"
                  placeholder="请选择（可多选）"
                  multiple
                  collapse-tags
                  collapse-tags-tooltip
                >
                  <el-option
                    v-for="item in EnumSelectUserTypes"
                    :key="item.type"
                    :label="item.label"
                    :value="item.type"
                  />
                </el-select>
              </el-form-item>
              <el-form-item
                label="允许多选"
                :prop="`tableData.${$index}.isMultiple`"
                :rules="rules.isMultiple"
              >
                <el-select v-model="row.isMultiple" placeholder="请选择">
                  <el-option label="是" :value="true" />
                  <el-option label="否" :value="false" />
                </el-select>
              </el-form-item>
            </template>

            <el-form-item
              label="是否必填"
              :prop="`tableData.${$index}.isRequired`"
              :rules="rules.isRequired"
            >
              <el-select v-model="row.isRequired" placeholder="请选择">
                <el-option label="是" :value="true" />
                <el-option label="否" :value="false" />
              </el-select>
            </el-form-item>

            <!-- 下拉选择器显示 -->
            <el-form-item label="可选项" v-if="showSelect(row.fieldType)">
              <el-button type="primary" @click="onEditSelectOptions(row, $index)" link
                >编辑选项</el-button
              >
            </el-form-item>

            <!-- 单行输入框、多行输入框显示 -->
            <el-form-item
              label="字符长度限制"
              v-if="showInput(row.fieldType)"
              :prop="`tableData.${$index}.maxLength`"
              :rules="rules.maxLength"
            >
              <el-input-number
                :controls="false"
                type="number"
                :min="1"
                step-strictly
                v-model="row.maxLength"
                @mousewheel.prevent
                oninput="value = value.replace(/-+/g, '')"
                placeholder="请输入（正整数）"
                clearable
              />
            </el-form-item>

            <!-- 数字进步器显示 -->
            <template v-if="showNumberLimit(row.fieldType)">
              <el-form-item label="数值上限">
                <el-input-number
                  v-model="row.max"
                  controls-position="right"
                  @change="onNumberLimitChange(row, 'max')"
                />
              </el-form-item>
              <el-form-item label="数值下限">
                <el-input-number
                  v-model="row.min"
                  controls-position="right"
                  @change="onNumberLimitChange(row, 'min')"
                />
              </el-form-item>
            </template>

            <!-- 日期、时间选择器显示 -->
            <template v-if="showDate(row.fieldType)">
              <el-form-item
                :label="
                  row.fieldType === EnumCustomFormComponentType.DATE_PICKER
                    ? '可选最早日期'
                    : '可选最早时间'
                "
              >
                当日
                <el-select
                  class="date-select"
                  v-model="row.startTimeOperation"
                  placeholder="请选择"
                  clearable
                >
                  <el-option
                    v-for="(value, key) in EnumCustomFormOperationTypeMap"
                    :key="key"
                    :label="value"
                    :value="+key"
                  />
                </el-select>
                <el-input-number
                  class="date-number"
                  v-model="row.startTime"
                  :min="0"
                  :step="1"
                  step-strictly
                  controls-position="right"
                />
                日
              </el-form-item>
              <el-form-item
                :label="
                  row.fieldType === EnumCustomFormComponentType.DATE_PICKER
                    ? '可选最晚日期'
                    : '可选最晚时间'
                "
              >
                当日
                <el-select
                  class="date-select"
                  v-model="row.endTimeOperation"
                  placeholder="请选择"
                  clearable
                >
                  <el-option
                    v-for="(value, key) in EnumCustomFormOperationTypeMap"
                    :key="key"
                    :label="value"
                    :value="+key"
                  />
                </el-select>
                <el-input-number
                  class="date-number"
                  v-model="row.endTime"
                  :min="0"
                  :step="1"
                  step-strictly
                  controls-position="right"
                />
                日
              </el-form-item>
            </template>

            <!-- 文件上传显示 -->
            <template v-if="showFileUpload(row.fieldType)">
              <el-form-item
                label="支持格式"
                :prop="`tableData.${$index}.supportTypes`"
                :rules="rules.supportTypes"
              >
                <el-select
                  v-model="row.supportTypes"
                  placeholder="请选择（可多选）"
                  multiple
                  collapse-tags
                  collapse-tags-tooltip
                >
                  <el-option v-for="item in MIMETypeList" :key="item" :label="item" :value="item" />
                </el-select>
              </el-form-item>
              <el-form-item label="文件数量上限">
                <el-input-number v-model="row.maxNum" :step="1" step-strictly :min="1" />
              </el-form-item>
              <el-form-item
                label="单个文件大小上限"
                :prop="`tableData.${$index}.maxSize`"
                :rules="rules.maxSize"
              >
                <el-input
                  type="number"
                  v-model.number="row.maxSize"
                  @mousewheel.prevent
                  placeholder="请输入"
                  clearable
                >
                  <template #append>{{ EnumFileSize.MB }}</template>
                </el-input>
              </el-form-item></template
            >

            <!-- 默认值 -->
            <el-form-item label="默认值" v-if="showDefaultValue(row.fieldType)" prop="defaultValue">
              <!-- 显示单选下拉框默认值 -->
              <el-select
                v-if="row.fieldType === EnumCustomFormComponentType.SELECT"
                v-model="row.defaultValue"
                placeholder="请选择"
                clearable
              >
                <template v-for="item in row.selectOptions" :key="item.value">
                  <el-option v-if="item.isActive" :label="item.label" :value="item.value" />
                </template>
              </el-select>

              <!-- 显示多选下拉框默认值 -->
              <el-select
                v-else-if="row.fieldType === EnumCustomFormComponentType.MULTIPLE_SELECT"
                v-model="row.defaultValue"
                :multiple="true"
                placeholder="请选择（可多选）"
                clearable
                collapse-tags
                collapse-tags-tooltip
              >
                <template v-for="item in row.selectOptions" :key="item.value">
                  <el-option v-if="item.isActive" :label="item.label" :value="item.value" />
                </template>
              </el-select>

              <!-- 显示日期、时间选择器默认值 -->
              <template v-else-if="showDate(row.fieldType)">
                当日
                <el-select
                  class="date-select"
                  v-model="row.defaultTimeOperation"
                  placeholder="请选择"
                  clearable
                >
                  <el-option
                    v-for="(value, key) in EnumCustomFormOperationTypeMap"
                    :key="key"
                    :label="value"
                    :value="+key"
                  />
                </el-select>
                <el-input-number
                  class="date-number"
                  v-model="row.defaultValue"
                  :min="0"
                  :step="1"
                  step-strictly
                  controls-position="right"
                />
                日
              </template>

              <!-- 显示开关默认值 -->
              <template v-else-if="showSwitch(row.fieldType)">
                <el-select v-model="row.defaultValue" placeholder="请选择">
                  <el-option label="是" :value="true" />
                  <el-option label="否" :value="false" />
                </el-select>
              </template>

              <!-- 显示其他默认值 -->
              <template v-else>
                <el-input
                  v-model="row.defaultValue"
                  placeholder="请输入"
                  maxlength="50"
                  clearable
                />
              </template>
            </el-form-item>

            <!-- 单位，作为后面一项 -->
            <el-form-item label="单位" v-if="showUnit(row.fieldType)" prop="unit">
              <el-input v-model="row.unit" placeholder="请输入" maxlength="50" clearable />
            </el-form-item>
          </div>
        </template>
      </el-table-column>

      <!-- 样式预览 -->
      <el-table-column label="样式预览" align="center" width="350">
        <template #default="{ row: { previewData, id } }">
          <div v-if="id && previewData">
            <el-form-item
              :label="previewData.fieldName + '：'"
              :required="previewData.isRequired"
              :label-width="120"
              class="preview-wrap"
            >
              <CustomOption :data="previewData" :key="globalKey"></CustomOption>
            </el-form-item>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="启用状态" align="center" width="120">
        <template #default="{ row }">
          <el-switch v-model="row.isActive" />
        </template>
      </el-table-column>
      <el-table-column v-if="!!buttonAuth" label="操作" fixed="right" width="160">
        <template #default="{ row, $index }">
          <el-button type="primary" link @click="onSaveReviewClick(row, $index)"
            >保存并预览</el-button
          >
          <el-button type="danger" link @click="onRemoveRowClick(row, $index)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-form>

  <!-- 编辑“选择器”的选项弹窗 -->
  <OptionsConfigDialog
    v-if="dialogVisible"
    :data="curEditOptionData"
    @success="onEditOptionSubmit"
    @close="dialogVisible = false"
  ></OptionsConfigDialog>
</template>

<script setup lang="ts">
import dayjs from "dayjs"
import type { FormInstance, FormRules } from "element-plus"
import { ElMessage, ElMessageBox } from "element-plus"

import {
  requestDeleteCustomField,
  requestUpdateDatePickerSetting,
  requestUpdateEmployeeSelectSetting,
  requestUpdateFileUploadSetting,
  requestUpdateMultiSelectSetting,
  requestUpdateNumberStepperSetting,
  requestUpdateSingleInputSetting,
  requestUpdateSingleSelectSetting,
  requestUpdateSwitchSetting,
  requestUpdateTextareaInputSetting,
  requestUpdateTimePickerSetting
} from "@/api/implementConfig"
import CustomOption from "@/components/CustomOption/index.vue"
import {
  EnumCustomFormComponentType,
  EnumCustomFormComponentTypeMap,
  EnumCustomFormOperationType,
  EnumCustomFormOperationTypeMap,
  EnumCustomFormType,
  EnumFileSize,
  EnumSelectUserTypes
} from "@/constant/enums"
import useButtonAuth from "@/hooks/useButtonAuth"
import type { ICustomConfigRow, ICustomSelectOption } from "@/types/base-info/implement-config"
import { validatePositiveInteger } from "@/utils/validate"

import OptionsConfigDialog from "./OptionsConfigDialog.vue"

interface IProps {
  // 表格数据
  data: ICustomConfigRow[]
  // 字段“表单”下拉选项
  formOptions?: { label: string; value: string | number }[]
}

const props = withDefaults(defineProps<IProps>(), {})
const emit = defineEmits<{
  (e: "on-success"): void
}>()

const buttonAuth = useButtonAuth("ImplementConfig_update", "ImplementConfig_query")

const formTypeOptions = [
  {
    label: "产品信息",
    value: EnumCustomFormType.PRODUCT_INFO
  },
  {
    label: "销售订单",
    value: EnumCustomFormType.SALES_ORDER
  },
  {
    label: "生产订单",
    value: EnumCustomFormType.PRODUCTION_ORDER
  },
  {
    label: "采购收货单",
    value: EnumCustomFormType.PURCHASE_ARRIVAL_ORDER
  }
]

const MIMETypeList = [
  ".jpg",
  ".jpeg",
  ".png",
  ".svg",
  ".pdf",
  ".xls",
  ".xlsx",
  ".doc",
  ".docx",
  ".txt",
  ".rar",
  ".zip"
]

const globalKey = ref(0) // 全局key,每次点击预览进行更新
const formRef = ref<FormInstance | null>(null)
const formData = computed(() => ({
  tableData: props.data
}))

const rules = reactive<FormRules<ICustomConfigRow>>({
  formType: [
    {
      required: true,
      message: "请选择表单",
      trigger: "change"
    }
  ],
  fieldName: [
    {
      required: true,
      message: "请输入字段名称",
      trigger: "blur"
    }
  ],
  fieldType: [
    {
      required: true,
      message: "请选择字段样式",
      trigger: "change"
    }
  ],
  isRequired: [
    {
      required: true,
      message: "请选择是否必填",
      trigger: "change"
    }
  ],
  maxLength: [
    {
      validator: (rule, value, callback) => {
        if (!value || (value && validatePositiveInteger(value))) {
          callback()
        } else {
          callback("请输入正整数")
        }
      },
      trigger: "blur"
    }
  ],
  dateType: [
    {
      required: true,
      message: "请选择类型",
      trigger: "change"
    }
  ],
  supportTypes: [
    {
      required: true,
      message: "请选择支持格式",
      trigger: "change"
    }
  ],
  maxSize: [
    {
      validator: (rule, value, callback) => {
        if (value && +value <= 0) {
          callback("请输入正数")
        }
        callback()
      },
      trigger: "blur"
    }
  ],
  selectUserTypes: [
    {
      required: true,
      message: "请选择选人方式",
      trigger: "change"
    }
  ],
  isMultiple: [
    {
      required: true,
      message: "请选择是否允许多选",
      trigger: "change"
    }
  ]
})

const dialogVisible = ref(false) // 编辑“选择器”的选项弹窗是否显示
const curEditRowIndex = ref(-1) // 当前编辑“选择器”对应的行索引
const curEditOptionData = ref<ICustomSelectOption[]>([]) // 当前编辑行的“选择器”的选项数据

/** 是否显示输入框才有的“字符长度限制”字段 */
const showInput = (fieldType: EnumCustomFormComponentType) => {
  // 只有单行输入框和文本域需要显示
  return [EnumCustomFormComponentType.INPUT, EnumCustomFormComponentType.TEXTAREA].includes(
    fieldType
  )
}

/** 是否显示“默认值”字段 */
const showDefaultValue = (fieldType: EnumCustomFormComponentType) => {
  // 除“数字步进器”、“文件上传”、“选人组件”外都需要默认值
  return ![
    EnumCustomFormComponentType.NUMBER_STEPPER,
    EnumCustomFormComponentType.FILE_UPLOAD,
    EnumCustomFormComponentType.SELECT_USER
  ].includes(fieldType)
}

/** 是否显示开关 */
const showSwitch = (fieldType: EnumCustomFormComponentType) => {
  return fieldType === EnumCustomFormComponentType.SWITCH
}

/** 默认值是否显示“选择器”*/
const showSelect = (fieldType: EnumCustomFormComponentType) => {
  // 只有“下拉框”时默认值显示“选择器”
  return [EnumCustomFormComponentType.SELECT, EnumCustomFormComponentType.MULTIPLE_SELECT].includes(
    fieldType
  )
}

/** 是否显示“数值上限”和“数值下限”字段 */
const showNumberLimit = (fieldType: EnumCustomFormComponentType) => {
  // 只有“数字输入框”需要上限下限
  return fieldType === EnumCustomFormComponentType.NUMBER_STEPPER
}

/** 是否为日期选择器或时间选择器 */
const showDate = (fieldType: EnumCustomFormComponentType) => {
  // 只有“日期选择器”、“日期选择器”需要显示
  return [
    EnumCustomFormComponentType.DATE_PICKER,
    EnumCustomFormComponentType.TIME_PICKER
  ].includes(fieldType)
}

/** 是否显示文件上传 */
const showFileUpload = (fieldType: EnumCustomFormComponentType) => {
  // 只有“文件上传”需要显示
  return fieldType === EnumCustomFormComponentType.FILE_UPLOAD
}

/** 是否显示选人组件 */
const showSelectUser = (fieldType: EnumCustomFormComponentType) => {
  // 只有“选人组件”需要显示
  return fieldType === EnumCustomFormComponentType.SELECT_USER
}

/** 是否显示单位 */
const showUnit = (fieldType: EnumCustomFormComponentType) => {
  // 除“日期选择器”,“时间选择器”,“开关”、“文件上传”、“选人组件”外都需要单位
  return ![
    EnumCustomFormComponentType.DATE_PICKER,
    EnumCustomFormComponentType.TIME_PICKER,
    EnumCustomFormComponentType.SWITCH,
    EnumCustomFormComponentType.FILE_UPLOAD,
    EnumCustomFormComponentType.SELECT_USER
  ].includes(fieldType)
}

/** “字段样式”改变时触发 */
const onFieldTypeChange = (row: ICustomConfigRow, rowIndex: number) => {
  // 切换字段样式时，只保留必填项，其他项清空
  const { formType, fieldName, fieldType, isRequired } = row
  let rowData: {
    id?: string
    isActive: boolean
    formType: EnumCustomFormType
    fieldName: string
    fieldType: EnumCustomFormComponentType
    isRequired: boolean
    defaultValue?: any
  } = {
    id: row.id,
    isActive: true,
    formType,
    fieldName,
    fieldType,
    isRequired,
    defaultValue: ""
  }
  if (row.fieldType === EnumCustomFormComponentType.MULTIPLE_SELECT) {
    rowData.defaultValue = []
  } else if (row.fieldType === EnumCustomFormComponentType.SWITCH) {
    rowData.defaultValue = true
  } else {
    rowData.defaultValue = ""
  }
  formData.value.tableData[rowIndex] = rowData
}

/** 编辑“选择器”的选项 */
const onEditSelectOptions = (row: ICustomConfigRow, rowIndex: number) => {
  dialogVisible.value = true
  curEditRowIndex.value = rowIndex
  curEditOptionData.value = row.selectOptions || []
}

/** 编辑“选择器”弹窗成功回调 */
const onEditOptionSubmit = (data: ICustomSelectOption[]) => {
  formData.value.tableData[curEditRowIndex.value].selectOptions = data

  // 根据当前默认值是否在“选择器”的选项中，判断是否需要清空默认值
  const defaultValue = formData.value.tableData[curEditRowIndex.value].defaultValue
  const isExist = data.filter((item) => item.isActive).some((item) => item.label === defaultValue)
  if (!isExist) {
    formData.value.tableData[curEditRowIndex.value].defaultValue = Array.isArray(defaultValue)
      ? []
      : ""
  }

  curEditRowIndex.value = -1
  curEditOptionData.value = []
}

/** “数值上限”和“数值下限”改变时触发 */
const onNumberLimitChange = (row: ICustomConfigRow, type: "min" | "max") => {
  if (row.min && row.max && row.min > row.max) {
    if (type === "min") {
      row.min = undefined
    } else {
      row.max = undefined
    }
    ElMessage.warning("数值上限不能小于数值下限")
  }
}

/** 删除表格行 */
const onRemoveRowClick = async (row: ICustomConfigRow, rowIndex: number) => {
  const confirm = await ElMessageBox.confirm("确定删除?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    closeOnClickModal: false,
    closeOnPressEscape: false,
    autofocus: false,
    type: "warning"
  })
  if (confirm === "confirm") {
    if (row.id) {
      await requestDeleteCustomField(row.id)
    }
    formData.value.tableData.splice(rowIndex, 1)
    ElMessage.success("删除成功")
  }
}

/** 保存并预览 */
const onSaveReviewClick = async (row: ICustomConfigRow, rowIndex: number) => {
  // 保存预览时，进行必填项校验
  const { fieldName, fieldType, dateType } = row
  if (!fieldName) {
    ElMessage.warning("请填写字段名称")
    return
  }

  if (!fieldType && fieldType !== 0) {
    ElMessage.warning("请选择字段样式")
    return
  }

  // 日期、时间选择器
  if (showDate(row.fieldType)) {
    // 预览必须填写类型
    if (!dateType) {
      ElMessage.warning("请选择类型")
      return
    }

    let defaultValue = getDays(row.defaultValue as number, row.defaultTimeOperation)
    let lowerLimit = getDays(row.startTime, row.startTimeOperation)
    let upperLimit = getDays(row.endTime, row.endTimeOperation)

    if (
      typeof lowerLimit === "number" &&
      typeof upperLimit === "number" &&
      lowerLimit > upperLimit
    ) {
      ElMessage.warning(
        row.fieldType === EnumCustomFormComponentType.DATE_PICKER
          ? "可选最早日期不能晚于可选最晚日期"
          : "可选最早时间不能晚于可选最晚时间"
      )
      return
    }

    if (typeof defaultValue === "number") {
      if (
        (typeof lowerLimit === "number" && defaultValue < lowerLimit) ||
        (typeof upperLimit === "number" && defaultValue > upperLimit)
      ) {
        ElMessage.warning("默认值不在可选范围内")
        return
      }
    }
  }

  // 文件上传预览必须填写支持格式
  if (showFileUpload(row.fieldType) && !row.supportTypes?.length) {
    ElMessage.warning("请选择支持格式")
    return
  }

  // 选人组件预览必须选择是否允许多选
  if (showSelectUser(row.fieldType)) {
    if (!row.selectUserTypes?.length) {
      ElMessage.warning("请选择选人方式")
      return
    }
    if (typeof row.isMultiple !== "boolean") {
      ElMessage.warning("请选择是否允许多选")
      return
    }
  }

  if (
    showInput(row.fieldType) &&
    row.maxLength &&
    (row.defaultValue as string)?.length > row.maxLength
  ) {
    ElMessage.warning("默认值不能大于长度限制")
    return
  }

  globalKey.value++

  // 每次保存预览时，同步“字段信息” 中的数据到当前行的previewData中
  const { previewData, ...rest } = row
  const data = formData.value.tableData[rowIndex]
  data.previewData = cloneDeep(rest)

  if (showDate(data.fieldType) && data.defaultTimeOperation && data.defaultValue) {
    // 对日期、时间选择器的默认值进行处理
    const time =
      data.defaultTimeOperation === EnumCustomFormOperationType.PLUS
        ? dayjs(new Date()).add((row.defaultValue as number) || 0, "day")
        : dayjs(new Date()).subtract((row.defaultValue as number) || 0, "day")

    const formatTime = time.format(
      data.fieldType === EnumCustomFormComponentType.DATE_PICKER
        ? "YYYY-MM-DD"
        : "YYYY-MM-DD HH:mm:ss"
    )
    data.previewData!.defaultValue = data.dateType === 1 ? formatTime : [formatTime, formatTime]
  } else if (showFileUpload(data.fieldType)) {
    // 文件上传MIME类型处理
    data.previewData!.accept = data.supportTypes?.join(",")
  } else if (showSelectUser(data.fieldType)) {
    // 选人组件默认设置选中“选人方式”第一项
    data.previewData!.curSelectUserType = data?.selectUserTypes?.[0]
  }

  await saveConfigItem(row)

  ElMessage.success("保存成功")
  emit("on-success")
}

/** 保存配置项 */
const saveConfigItem = async (row: ICustomConfigRow) => {
  if (row.fieldType === EnumCustomFormComponentType.INPUT) {
    // 单行输入框
    let params = {
      id: row.id,
      formType: row.formType,
      fieldName: row.fieldName,
      fieldType: row.fieldType,
      isRequired: row.isRequired,
      maxLength: row.maxLength,
      defaultValue: row.defaultValue as string,
      unit: row.unit,
      isActive: row.isActive
    }
    await requestUpdateSingleInputSetting(params)
  } else if (row.fieldType === EnumCustomFormComponentType.TEXTAREA) {
    // 文本域
    let params = {
      id: row.id,
      formType: row.formType,
      fieldName: row.fieldName,
      fieldType: row.fieldType,
      isRequired: row.isRequired,
      maxLength: row.maxLength,
      defaultValue: row.defaultValue as string,
      unit: row.unit,
      isActive: row.isActive
    }
    await requestUpdateTextareaInputSetting(params)
  } else if (row.fieldType === EnumCustomFormComponentType.SWITCH) {
    // 开关
    let params = {
      id: row.id,
      formType: row.formType,
      fieldName: row.fieldName,
      fieldType: row.fieldType,
      isRequired: row.isRequired,
      defaultValue: (row.defaultValue as boolean) || false,
      isActive: row.isActive
    }
    await requestUpdateSwitchSetting(params)
  } else if (row.fieldType === EnumCustomFormComponentType.SELECT) {
    // 单选下拉框
    let params = {
      id: row.id,
      formType: row.formType,
      fieldName: row.fieldName,
      fieldType: row.fieldType,
      isRequired: row.isRequired,
      defaultValue: row.defaultValue as string,
      unit: row.unit,
      isActive: row.isActive,
      options: row.selectOptions || []
    }
    await requestUpdateSingleSelectSetting(params)
  } else if (row.fieldType === EnumCustomFormComponentType.MULTIPLE_SELECT) {
    // 多选下拉框
    let params = {
      id: row.id,
      formType: row.formType,
      fieldName: row.fieldName,
      fieldType: row.fieldType,
      isRequired: row.isRequired,
      defaultValue: row.defaultValue as string[],
      unit: row.unit,
      isActive: row.isActive,
      options: row.selectOptions || []
    }
    await requestUpdateMultiSelectSetting(params)
  } else if (row.fieldType === EnumCustomFormComponentType.NUMBER_STEPPER) {
    // 数字步进器
    let params = {
      id: row.id,
      formType: row.formType,
      fieldName: row.fieldName,
      fieldType: row.fieldType,
      isRequired: row.isRequired,
      lowerLimit: row.min,
      upperLimit: row.max,
      unit: row.unit,
      isActive: row.isActive
    }
    await requestUpdateNumberStepperSetting(params)
  } else if (row.fieldType === EnumCustomFormComponentType.DATE_PICKER) {
    // 日期选择器
    let params = {
      id: row.id,
      formType: row.formType,
      fieldName: row.fieldName,
      fieldType: row.fieldType,
      isRequired: row.isRequired,
      isPoint: row.dateType === 1,
      isActive: row.isActive,
      defaultValue: getDays(row.defaultValue as number, row.defaultTimeOperation),
      lowerLimit: getDays(row.startTime, row.startTimeOperation),
      upperLimit: getDays(row.endTime, row.endTimeOperation)
    }

    await requestUpdateDatePickerSetting(params)
  } else if (row.fieldType === EnumCustomFormComponentType.TIME_PICKER) {
    // 时间选择器
    let params = {
      id: row.id,
      formType: row.formType,
      fieldName: row.fieldName,
      fieldType: row.fieldType,
      isRequired: row.isRequired,
      isPoint: row.dateType === 1,
      isActive: row.isActive,
      defaultValue: getDays(row.defaultValue as number, row.defaultTimeOperation),
      lowerLimit: getDays(row.startTime, row.startTimeOperation),
      upperLimit: getDays(row.endTime, row.endTimeOperation)
    }

    await requestUpdateTimePickerSetting(params)
  } else if (row.fieldType === EnumCustomFormComponentType.FILE_UPLOAD) {
    // 文件上传
    let params = {
      id: row.id,
      formType: row.formType,
      fieldName: row.fieldName,
      fieldType: row.fieldType,
      isRequired: row.isRequired,
      supportTypes: row.supportTypes as string[],
      maxNum: row.maxNum,
      maxSize: row.maxSize,
      isActive: row.isActive
    }
    await requestUpdateFileUploadSetting(params)
  } else if (row.fieldType === EnumCustomFormComponentType.SELECT_USER) {
    // 选人组件
    let params = {
      id: row.id,
      formType: row.formType,
      fieldName: row.fieldName,
      fieldType: row.fieldType,
      isRequired: row.isRequired,
      isMultiple: row.isMultiple as boolean,
      isActive: row.isActive,
      selectTypes: row.selectUserTypes as number[]
    }
    await requestUpdateEmployeeSelectSetting(params)
  }
}

/** 获取时间上下加减的天数（包括正负号） */
const getDays = (num: number | undefined = undefined, operation?: EnumCustomFormOperationType) => {
  if ((!num && num !== 0) || !operation) {
    return
  }
  return operation === EnumCustomFormOperationType.PLUS ? num : -num
}
</script>

<style lang="scss" scoped>
.form-wrap {
  display: flex;
  flex-direction: column;

  &:deep(.el-table) {
    flex: 1;
  }
}

.field-info {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 18px;

  &:deep(.el-form-item) {
    width: 50%;

    input[type="number"]::-webkit-inner-spin-button,
    input[type="number"]::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    .date-select {
      width: 90px;
      margin: 0 8px;
    }

    .date-number {
      width: 90px;
      margin-right: 8px;
    }
  }
}

.preview-wrap {
  align-items: flex-start;

  &:deep(.el-form-item__content) {
    flex-wrap: nowrap;

    > div {
      flex: 1;
    }
  }
}
</style>
