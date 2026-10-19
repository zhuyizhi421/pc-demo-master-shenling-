<template>
  <el-input
    v-if="showInput(formData.fieldType)"
    :type="formData.fieldType === EnumCustomFormComponentType.INPUT ? 'text' : 'textarea'"
    v-model="formData.defaultValue"
    placeholder="请输入"
    :maxlength="formData.maxLength"
    show-word-limit
    clearable
  />

  <!-- 开关 -->
  <el-switch v-else-if="showSwitch(formData.fieldType)" v-model="formData.defaultValue" />

  <!-- 单选、多选选择器 -->
  <el-select
    v-else-if="showSelect(formData.fieldType)"
    v-model="formData.defaultValue"
    :multiple="formData.fieldType === EnumCustomFormComponentType.MULTIPLE_SELECT"
    :placeholder="`请选择${formData.fieldType === EnumCustomFormComponentType.MULTIPLE_SELECT ? '（可多选）' : ''}`"
    collapse-tags
    collapse-tags-tooltip
    clearable
  >
    <template v-for="item in formData.selectOptions" :key="item.value">
      <el-option v-if="item.isActive" :label="item.label" :value="item.value" />
    </template>
  </el-select>

  <!-- 数字步进器 -->
  <el-input-number
    v-else-if="showNumberLimit(formData.fieldType)"
    v-model="formData.defaultValue"
    :min="typeof formData.min === 'number' ? formData.min : -Infinity"
    :max="typeof formData.max === 'number' ? formData.max : +Infinity"
    controls-position="right"
  />

  <!-- 日期、时间选择器 -->
  <template v-else-if="showDate(formData.fieldType)">
    <el-date-picker
      v-model="formData.defaultValue"
      :type="getPickerType(formData.fieldType, formData.dateType)"
      placeholder="请选择"
      start-placeholder="请选择"
      end-placeholder="请选择"
      :format="
        formData.fieldType === EnumCustomFormComponentType.DATE_PICKER
          ? 'YYYY-MM-DD'
          : 'YYYY-MM-DD HH:mm:ss'
      "
      :value-format="
        formData.fieldType === EnumCustomFormComponentType.DATE_PICKER
          ? 'YYYY-MM-DD'
          : 'YYYY-MM-DD HH:mm:ss'
      "
      :disabled-date="($event: Date) => isDisabledDate($event, formData)"
    />
  </template>

  <!-- 上传组件 -->
  <template v-else-if="showFileUpload(formData.fieldType)">
    <UploadFile
      v-model="formData.defaultValue as any"
      :accept="formData.accept as string"
      :size="formData.maxSize"
      :limit="formData.maxNum"
      :multiple="(formData.maxNum || 1) > 1"
    />
  </template>

  <!-- 单位 -->
  <span v-if="formData.unit" style="margin-left: 8px">{{ formData.unit }}</span>
</template>

<script setup lang="ts">
import dayjs from "dayjs"
import isBetween from "dayjs/plugin/isBetween"

import UploadFile from "@/components/UploadFile/index.vue"
import { EnumCustomFormComponentType, EnumCustomFormOperationType } from "@/constant/enums"
import type { ICustomConfigPreviewData, ICustomConfigRow } from "@/types/base-info/implement-config"

defineOptions({
  name: "CustomOption"
})

dayjs.extend(isBetween)

interface IProps {
  data: ICustomConfigPreviewData
}

const props = withDefaults(defineProps<IProps>(), {})

const formData = computed(() => props.data)

/** 是否显示输入框才有的“字符长度限制”字段 */
const showInput = (fieldType: EnumCustomFormComponentType) => {
  // 只有单行输入框和文本域需要显示
  return [EnumCustomFormComponentType.INPUT, EnumCustomFormComponentType.TEXTAREA].includes(
    fieldType
  )
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

/** 获取日期、时间选择器类型 */
const getPickerType = (fieldType: EnumCustomFormComponentType, dateType: number | undefined) => {
  if (fieldType === EnumCustomFormComponentType.DATE_PICKER) {
    return dateType === 1 ? "date" : "daterange"
  } else {
    return dateType === 1 ? "datetime" : "datetimerange"
  }
}

/** 判断日期是否被禁用 */
const isDisabledDate = (date: Date, row: ICustomConfigRow) => {
  if (!row.startTimeOperation && !row.endTimeOperation) {
    return false
  }
  if (typeof row.startTime === "number" && typeof row.endTime === "number") {
    const startTime =
      row.startTimeOperation === EnumCustomFormOperationType.PLUS
        ? dayjs(new Date()).add(row.startTime - 1, "day")
        : dayjs(new Date()).subtract(row.startTime + 1, "day")
    const endTime =
      row.endTimeOperation === EnumCustomFormOperationType.PLUS
        ? dayjs(new Date()).add(row.endTime, "day")
        : dayjs(new Date()).subtract(row.endTime, "day")
    return !dayjs(new Date(date)).isBetween(startTime, endTime)
  } else if (typeof row.startTime === "number") {
    const startTime =
      row.startTimeOperation === EnumCustomFormOperationType.PLUS
        ? dayjs(new Date()).add(row.startTime - 1, "day")
        : dayjs(new Date()).subtract(row.startTime + 1, "day")
    return !dayjs(new Date(date)).isAfter(startTime)
  } else if (typeof row.endTime === "number") {
    const endTime =
      row.endTimeOperation === EnumCustomFormOperationType.PLUS
        ? dayjs(new Date()).add(row.endTime, "day")
        : dayjs(new Date()).subtract(row.endTime, "day")
    return !dayjs(new Date(date)).isBefore(endTime)
  }
  return false
}
</script>

<style lang="scss" scoped></style>
