<template>
  <CustomDialog v-model="dialogVisible" title="字段筛选">
    <CustomForm ref="formRef" class="custom-form" v-model="filterData" :configs="formConfigs">
      <template #date-default>
        <el-form-item
          v-if="props.column.type === EnumFilterType.Time_Range"
          :label="props.column.label + '：'"
        >
          <el-date-picker
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="开始日期"
            v-model="filterData.startDate"
            @change="changeTime('start')"
          />
          <span class="separator">~</span>
          <el-date-picker
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="结束日期"
            v-model="filterData.endDate"
            @change="changeTime('end')"
          />
        </el-form-item>
      </template>
    </CustomForm>

    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="onConfirmClick()">确定</el-button>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus"

import CustomDialog from "@/components/CustomDialog/index.vue"
import CustomForm from "@/components/CustomForm/index.vue"
import useResetRef from "@/hooks/useResetRef"
import type { IOption } from "@/types/common"

import type { ICustomFormConfigItem } from "../CustomForm/type"
import { EnumFilterType } from "./type"

defineOptions({
  name: "ColumnFilterDialog"
})

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    column: {
      field: string
      label: string
      value: string | (string | number)[]
      type: EnumFilterType
      options?: IOption[]
    }
  }>(),
  {}
)
const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
  (e: "success", value: string | (string | number)[]): void
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val)
})

const [filterData, resetFilterData] = useResetRef<{
  inputVal: string
  checkedVal: (string | number)[]
  startDate: string
  endDate: string
}>({
  inputVal: "",
  checkedVal: [],
  startDate: "",
  endDate: ""
})
const formConfigs = computed<ICustomFormConfigItem[]>(() => [
  {
    componentType: "el-input",
    label: props.column.label + "：",
    field: "inputVal",
    hidden: ![EnumFilterType.Exact, EnumFilterType.Fuzzy].includes(props.column.type),
    props: {
      placeholder: "请输入",
      maxlength: 50
    }
  },
  {
    componentType: "el-checkbox-group",
    label: props.column.label + "：",
    field: "checkedVal",
    hidden: props.column.type !== EnumFilterType.Enum,
    props: {
      customChildren: props.column.options?.map((item) => ({
        componentType: "el-checkbox",
        props: {
          label: item.label,
          value: item.value
        }
      }))
    }
  },
  {
    componentType: "div",
    special: true,
    slots: {
      default: "date-default"
    },
    props: {
      class: "date-range-wrapper"
    }
  }
])

watch(
  () => props.modelValue,
  (val) => {
    if (!val) {
      resetFilterData()
    } else {
      switch (props.column.type) {
        case EnumFilterType.Exact:
        case EnumFilterType.Fuzzy:
          filterData.value.inputVal = (props.column.value as string) || ""
          break
        case EnumFilterType.Enum:
          filterData.value.checkedVal = (props.column.value as (string | number)[]) || []
          break
        case EnumFilterType.Time_Range:
          filterData.value.startDate = (props.column.value[0] as string) || ""
          filterData.value.endDate = (props.column.value[1] as string) || ""
          break
      }
    }
  }
)

/**
 * 时间变化
 */
const changeTime = (type: "start" | "end") => {
  const { startDate, endDate } = filterData.value
  if (startDate && endDate && new Date(startDate).getTime() > new Date(endDate).getTime()) {
    ElMessage.warning("结束日期不能早于开始日期")
    if (type === "start") {
      filterData.value.startDate = ""
    } else {
      filterData.value.endDate = ""
    }
  }
}

/**
 * 确定操作
 */
const onConfirmClick = () => {
  const { inputVal, checkedVal, startDate, endDate } = filterData.value
  let value
  switch (props.column.type) {
    case EnumFilterType.Exact:
    case EnumFilterType.Fuzzy:
      value = inputVal
      break
    case EnumFilterType.Enum:
      value = checkedVal
      break
    case EnumFilterType.Time_Range:
      value = [
        startDate ? startDate.slice(0, 10) + " 00:00:00" : "",
        endDate ? endDate.slice(0, 10) + " 23:59:59" : ""
      ]
      break
  }
  emit("success", value)
  dialogVisible.value = false
}
</script>

<style lang="scss" scoped>
.custom-form {
  &:deep(.date-range-wrapper) {
    .el-form-item__content {
      flex-wrap: nowrap;
    }

    .separator {
      margin: 0 6px;
    }
  }
}
</style>
