<!-- 表格查询组件
    支持查询组件：输入框、下拉框（单、多选）、日期选择器（单、范围）、时间选择器（单、范围）、级联选择器、
-->
<template>
  <div class="search-form">
    <div
      class="search-form-items"
      :class="isCollapse ? 'search-form-items-collapse' : ''"
      ref="searchFormItemsRef"
    >
      <div class="search-form-item" v-for="item in props.formList" :key="item.key">
        <template v-if="isShow(item)">
          <div class="search-form-item-label" :style="{ width: props.labelWidth + 'px' }">
            {{ item.label }}
          </div>
          <div class="search-form-item-content">
            <template v-if="isArea(item)">
              <Component
                :is="getComponent(item.type)"
                v-model="item.value"
                :style="{ width: (item.style?.width || getDefaultWidth(item)) + 'px' }"
                :class="['area-component', item.props?.multiple ? 'area-component-multiple' : '']"
                :placeholder="typeof item.placeholder === 'string' ? item.placeholder || '' : ''"
                :clearable="item.clearable ?? true"
                :disabled="item.disabled"
                :show-all-levels="item.showAllLevels"
                v-bind="isArea(item) ? AreaProps(item) : undefined"
              ></Component>
            </template>
            <template v-else-if="isCascader(item)">
              <Component
                :is="getComponent(item.type)"
                v-model="item.value"
                :style="{ width: (item.style?.width || getDefaultWidth(item)) + 'px' }"
                :placeholder="typeof item.placeholder === 'string' ? item.placeholder || '' : ''"
                :clearable="item.clearable ?? true"
                :disabled="item.disabled"
                :collapse-tags="isCascaderMultiple(item)"
                :collapse-tags-tooltip="isCascaderMultiple(item)"
                :max-collapse-tags="
                  isCascader(item) && item.props?.multiple ? item.maxTag || COLLAPSE_TAG : undefined
                "
                :options="
                  isCascader(item) ? (isRef(item.options) ? item.options.value : item.options) : []
                "
                :props="isCascader(item) ? item.props : {}"
                :show-all-levels="isCascader(item) ? item.showAllLevels : false"
              >
                <!-- 级联选择器的options -->
                <template v-if="item.type === EnumComponentType.Cascader" #default="{ data }">
                  <span>{{ data[item.props?.label || "label"] }}</span>
                </template>
              </Component>
            </template>
            <template v-else>
              <Component
                :is="getComponent(item.type)"
                v-model="item.value"
                :style="{ width: (item.style?.width || getDefaultWidth(item)) + 'px' }"
                :placeholder="typeof item.placeholder === 'string' ? item.placeholder || '' : ''"
                :prefix-icon="item.type === EnumComponentType.Input ? item.prefixIcon : undefined"
                :suffix-icon="item.type === EnumComponentType.Input ? item.suffixIcon : undefined"
                :maxlength="
                  item.type === EnumComponentType.Input
                    ? item.maxLength || INPUT_MAX_LENGTH
                    : undefined
                "
                :clearable="item.clearable ?? true"
                :disabled="item.disabled"
                :multiple="isSelectMultiple(item)"
                :filterable="item.type === EnumComponentType.Select && item.filterable"
                :filter-method="isSelect(item) ? item.filterMethod : undefined"
                :collapse-tags="isSelectMultiple(item)"
                :collapse-tags-tooltip="isSelectMultiple(item)"
                :max-collapse-tags="
                  isSelect(item) && item.multiple ? item.maxTag || COLLAPSE_TAG : undefined
                "
                :type="isDatePicker(item) ? item.dateType : undefined"
                :format="isDatePicker(item) ? item.format : undefined"
                :value-format="isDatePicker(item) ? item.valueFormat : undefined"
                :default-time="isDatePicker(item) ? item.defaultTime : undefined"
                :shortcuts="
                  isDatePicker(item) && item.shortcuts?.length
                    ? calcShortcuts(item.shortcuts)
                    : undefined
                "
                :disabled-date="
                  isDatePicker(item) ? (data: Date) => bindDisabledDate(data, item) : undefined
                "
                :start-placeholder="isDatePicker(item) ? item.placeholder?.[0] : ''"
                :end-placeholder="isDatePicker(item) ? item.placeholder?.[1] : ''"
                :min="isInputNumber(item) ? item.min : ''"
                :step-strictly="isInputNumber(item) ? item.stepStrictly : false"
                :precision="isInputNumber(item) ? item.precision : undefined"
                :controls="false"
                @visible-change="($event: any) => handleVisibleChange($event, item)"
                @calendar-change="
                  isDatePicker(item) ? onCalendarChange($event as [Date, null | Date], item) : null
                "
              >
                <!-- input输入框插槽 -->
                <template
                  #prepend
                  v-if="item.type === EnumComponentType.Input && item.slots?.prepend"
                >
                  <slot :name="item.slots.prepend" v-bind:item></slot>
                </template>
                <template
                  #append
                  v-if="item.type === EnumComponentType.Input && item.slots?.append"
                >
                  <slot :name="item.slots.append" v-bind:item></slot>
                </template>

                <!-- select选择器的options -->
                <template v-if="item.type === EnumComponentType.Select">
                  <!-- el-option组件props.label、props.value默认使用label、value属性，可以通过optionProps设置 -->
                  <el-option
                    v-for="option in item.options"
                    :key="option[item.optionProps?.value || 'value']"
                    :label="option[item.optionProps?.label || 'label']"
                    :value="option[item.optionProps?.value || 'value']"
                  >
                    <slot
                      v-if="item.slots?.option"
                      :name="item.slots.option"
                      :option="option as any"
                    ></slot>
                  </el-option>
                </template>
              </Component>
            </template>
          </div>
        </template>
      </div>
      <template v-if="!isCollapse || hiddenCollapse">
        <div class="search-operation">
          <div class="collapse-btn" @click="isCollapse = !isCollapse" v-if="!hiddenCollapse">
            <template v-if="isCollapse">
              <el-icon><DArrowRight /></el-icon>
            </template>
            <template v-else>
              <el-icon><DArrowLeft /></el-icon>
            </template>
            <span>{{ isCollapse ? "展开" : "收起" }}</span>
          </div>
          <el-button type="primary" icon="Search" @click="emit('search')">查询</el-button>
          <el-button class="reset-btn" icon="RefreshRight" @click="emit('reset')">重置</el-button>
        </div>
      </template>
    </div>
    <template v-if="isCollapse && !hiddenCollapse">
      <div class="search-operation search-operation-collapse">
        <div class="collapse-btn" @click="isCollapse = !isCollapse">
          <template v-if="isCollapse">
            <el-icon><DArrowRight /></el-icon>
          </template>
          <template v-else>
            <el-icon><DArrowLeft /></el-icon>
          </template>
          <span>{{ isCollapse ? "展开" : "收起" }}</span>
        </div>
        <el-button type="primary" icon="Search" @click="emit('search')">查询</el-button>
        <el-button class="reset-btn" icon="RefreshRight" @click="emit('reset')">重置</el-button>
      </div>
    </template>

    <!-- 选择产品弹窗 -->
    <SelectProductDialog
      v-model="productVisible"
      v-bind="curDialogProps"
      :selected-row-keys="selectedKeys"
      @success="onSelectProductSuccess"
    />

    <!-- 选择有工艺路线产品弹窗 -->
    <SelectCraftRouteProductDialog
      v-model="craftRouteProductVisible"
      v-bind="curDialogProps"
      :selected-row-keys="selectedKeys"
      @success="onSelectCraftRouteProductSuccess"
    />

    <!-- 选择设备实例弹窗 -->
    <SelectDeviceDialog
      v-model="deviceVisible"
      v-bind="curDialogProps"
      :selected-row-keys="selectedKeys"
      @success="onSelectDeviceSuccess"
    />

    <!-- 选择设备型号模型弹窗 -->
    <SelectDeviceModelDialog
      v-model="deviceModelVisible"
      v-bind="curDialogProps"
      :selected-row-keys="selectedKeys"
      @success="onSelectDeviceModelSuccess"
    />

    <!-- 选择人员、部门、职位弹窗 -->
    <SelectPersonDialog
      v-model="personVisible"
      :type="curDialogProps.type"
      :selected-ids="selectedKeys"
      v-bind="curDialogProps"
      @success="onSelectPersonSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ElCascader, ElDatePicker, ElInput, ElInputNumber, ElSelect } from "element-plus"
import { debounce as lodashDebounce } from "lodash-es"
import { isRef } from "vue"

import type { IProductModelListItem } from "@/api/product"
import SelectCraftRouteProductDialog from "@/components/SelectCraftRouteProductDialog/index.vue"
import SelectDeviceDialog from "@/components/SelectDeviceDialog/index.vue"
import SelectDeviceModelDialog from "@/components/SelectDeviceModelDialog/index.vue"
import SelectFactoryModel from "@/components/SelectFactoryModel/index.vue"
import SelectPersonDialog from "@/components/SelectPersonDialog/index.vue"
import SelectProductDialog from "@/components/SelectProductDialog/index.vue"
import type { IEquipmentPageItem } from "@/types/maintain/equipment-manage/equipment-info"
import type { IEquipmentModelPageItem } from "@/types/maintain/equipment-manage/equipment-model"
import { calculateDate } from "@/utils/common"

import type { ITree } from "../SelectPersonDialog/type"
import {
  EnumComponentType,
  type ISearchArea,
  type ISearchCascader,
  type ISearchDate,
  type ISearchFormEmits,
  type ISearchFormProps,
  type ISearchInputNumber,
  type ISearchItem,
  type ISearchSelect
} from "./type"

defineOptions({
  name: "CustomSearchForm"
})

const props = withDefaults(defineProps<ISearchFormProps>(), {
  labelWidth: 100
})
const emit = defineEmits<ISearchFormEmits>()

const searchFormItemsRef = ref<HTMLDivElement>()
const isFirstRender = ref(true)

const INPUT_MAX_LENGTH = 20 // 输入框默认最大输入长度
const COLLAPSE_TAG = 1 // 多选默认折叠标签数量
const COMMON_WIDTH = 240 // 组件通用默认宽度
const DATE_RANGE_WIDTH = 360 // 日期范围选择器默认宽度

const isCollapse = ref(false)
const hiddenCollapse = ref(false)

let curKey = "" // 当前弹窗对应查询项中的key
let curOptionProps = {
  label: "",
  value: ""
}
const curDialogProps = ref<Record<string, any>>({}) // 当前弹窗对应查询项是否为多选
const selectedKeys = ref<string[]>([])
const productVisible = ref(false)
const craftRouteProductVisible = ref(false)
const deviceVisible = ref(false)
const deviceModelVisible = ref(false)
const personVisible = ref(false)
const selectedRangeStart = ref<Date | null>(null)

/**
 * 根据组件类型获取组件
 */
const getComponent = (type: EnumComponentType) => {
  const map = {
    [EnumComponentType.Input]: ElInput,
    [EnumComponentType.InputNumber]: ElInputNumber,
    [EnumComponentType.Select]: ElSelect,
    [EnumComponentType.Date]: ElDatePicker,
    [EnumComponentType.Cascader]: ElCascader,
    [EnumComponentType.Area]: SelectFactoryModel
  }
  return map[type]
}

/**
 * 是否展示组件
 */
const isShow = (item: ISearchItem): boolean => {
  if (item.hidden) return false
  if (item.linkProps) {
    const findValue = props.formList.find((val) => val.key === item.linkProps!.linkKey)?.value
    if (findValue) {
      if (item.linkProps.conditionSign) {
        return findValue === item.linkProps!.showByLinkKeyCondition
      } else {
        return findValue !== item.linkProps!.showByLinkKeyCondition
      }
    } else {
      return false
    }
  }
  return true
}

/**
 * 是否为数字输入框
 */
const isInputNumber = (item: ISearchItem): item is ISearchInputNumber => {
  return item.type === EnumComponentType.InputNumber
}

/**
 * 是否为下拉框
 */
const isSelect = (item: ISearchItem): item is ISearchSelect => {
  return item.type === EnumComponentType.Select
}

/**
 * 是否为多选下拉框
 */
const isSelectMultiple = (item: ISearchItem) => {
  return isSelect(item) && item.multiple
}

/**
 * 是否为日期选择器
 */
const isDatePicker = (item: ISearchItem): item is ISearchDate => {
  return item.type === EnumComponentType.Date
}

/**
 * 是否为级联选择器
 */
const isCascader = (item: ISearchItem): item is ISearchCascader => {
  return item.type === EnumComponentType.Cascader
}

/**
 * 是否为多选级联选择器
 */
const isCascaderMultiple = (item: ISearchItem) => {
  return item.type === EnumComponentType.Cascader && item.props?.multiple
}

/**
 * 是否为区域自定义组件
 */
const isArea = (item: ISearchItem): item is ISearchArea => {
  return item.type === EnumComponentType.Area
}

/**
 * 计算快捷方式
 */
const calcShortcuts = (shortcuts: ISearchDate["shortcuts"]) => {
  return shortcuts!.map((item) => {
    return { text: item.text, value: calculateDate(item.type, item.value) }
  })
}

/**
 * 时间范围选择面板日期选中事件
 */
const onCalendarChange = (date: [Date, null | Date], item: ISearchDate) => {
  // 只处理范围选择类型
  const rangeTypes = ["daterange", "datetimerange", "monthrange", "yearrange"]
  if (!rangeTypes.includes(item.dateType)) return

  // 记录第一个选中的日期
  if (item.disabledDateParams?.maxRange && date[0]) {
    selectedRangeStart.value = new Date(date[0])
  } else {
    selectedRangeStart.value = null
  }
}

/**
 * 绑定日期选择器禁用日期
 */
const bindDisabledDate = (data: Date, item: ISearchDate): boolean => {
  const { disabledDateParams, dateType } = item

  // 不存在禁用日期参数
  if (!disabledDateParams) return false

  // 1. startDate：必须大于，startDate按00:00:00算
  if (disabledDateParams.startDate) {
    const start = new Date(disabledDateParams.startDate)
    start.setHours(0, 0, 0, 0)
    const dataCopy = new Date(data)
    dataCopy.setHours(0, 0, 0, 0)
    if (dataCopy < start) return true
  }
  // 2. endDate：必须小于，endDate按23:59:59算
  if (disabledDateParams.endDate) {
    const end = new Date(disabledDateParams.endDate)
    end.setHours(23, 59, 59, 999)
    if (data > end) return true
  }
  // 3. maxRange：仅在range类型时生效
  if (
    disabledDateParams.maxRange &&
    selectedRangeStart.value &&
    ["daterange", "datetimerange", "monthrange", "yearrange"].includes(dateType)
  ) {
    let diff = 0
    if (dateType === "daterange" || dateType === "datetimerange") {
      // 按天，需加1，含首尾
      const start = new Date(selectedRangeStart.value)
      start.setHours(0, 0, 0, 0)
      const end = new Date(data)
      end.setHours(0, 0, 0, 0)
      diff = Math.abs((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    } else if (dateType === "monthrange") {
      // 按月，需加1，含首尾
      const startMonth =
        selectedRangeStart.value.getFullYear() * 12 + selectedRangeStart.value.getMonth()
      const endMonth = data.getFullYear() * 12 + data.getMonth()
      diff = Math.abs(endMonth - startMonth) + 1
    } else if (dateType === "yearrange") {
      // 按年，需加1，含首尾
      diff = Math.abs(data.getFullYear() - selectedRangeStart.value.getFullYear()) + 1
    }
    if (diff > disabledDateParams.maxRange) {
      return true
    }
  }
  return false
}

/**
 * 区域自定义组件的props
 */
const AreaProps = (item: ISearchArea) => {
  return {
    type: item.props?.areaType,
    isEnable: item.props?.isEnable,
    containLastLevel: item.props?.containLastLevel,
    multiple: item.props?.multiple,
    initSelectAll: item.props?.initSelectAll,
    labelAttr: item.props?.labelAttr,
    valueAttr: item.props?.valueAttr,
    checkStrictly: item.props?.checkStrictly,
    disabledNonPeer: item.props?.disabledNonPeer
  }
}

/**
 * 获取组件的默认宽度
 */
const getDefaultWidth = (item: ISearchItem) => {
  const type = item.type
  const map = {
    [EnumComponentType.Input]: COMMON_WIDTH,
    [EnumComponentType.InputNumber]: COMMON_WIDTH,
    [EnumComponentType.Select]: COMMON_WIDTH,
    [EnumComponentType.Date]: COMMON_WIDTH,
    [EnumComponentType.Cascader]: COMMON_WIDTH,
    [EnumComponentType.Area]: COMMON_WIDTH
  }

  // 日期范围选择器默认长度为360px
  if (isDatePicker(item)) {
    const rangeList = ["datetimerange", "daterange", "monthrange", "yearrange"]
    if (rangeList.includes(item.dateType)) {
      return DATE_RANGE_WIDTH
    }
  }
  return map[type]
}

/**
 * 处理是否展示折叠按钮
 */
const dealCollapse = () => {
  if (!isCollapse.value) {
    nextTick(() => {
      const height = searchFormItemsRef.value?.offsetHeight
      if (height === 56) {
        hiddenCollapse.value = true
        isCollapse.value = false
      } else {
        let isChange = false
        if (hiddenCollapse.value) {
          isChange = true
        }
        hiddenCollapse.value = false
        if (isChange || isFirstRender.value) {
          isFirstRender.value = false
          nextTick(() => {
            isCollapse.value = true
          })
        }
      }
    })
  } else {
    isCollapse.value = false
    nextTick(() => {
      const height = searchFormItemsRef.value?.offsetHeight
      if (height === 56) {
        hiddenCollapse.value = true
        isCollapse.value = false
      } else {
        hiddenCollapse.value = false
        nextTick(() => {
          isCollapse.value = true
        })
      }
    })
  }
}

/** 下拉选择visibleChange事件 */
const handleVisibleChange = (visible: boolean, data: ISearchItem) => {
  if (!isSelect(data) || !data.dialogType) {
    return
  }

  if (visible && isSelect(data)) {
    const { dialogType, key, optionProps } = data
    curKey = key
    curOptionProps = optionProps || { label: "label", value: "value" }
    curDialogProps.value = data.dialogProps || {}
    const target = props.formList.find((val) => val.key === key) as ISearchSelect
    selectedKeys.value = (target.value as string[]) || []

    switch (dialogType) {
      case "product":
        productVisible.value = true
        break
      case "craftRouteProduct":
        craftRouteProductVisible.value = true
        break
      case "device":
        deviceVisible.value = true
        break
      case "deviceModel":
        deviceModelVisible.value = true
        break
      case "person":
        personVisible.value = true
        break
    }
  }
}

/** 选择产品弹窗成功回调 */
const onSelectProductSuccess = (data: IProductModelListItem[]) => {
  const target = props.formList.find((val) => val.key === curKey) as ISearchSelect
  if (target) {
    target.options = data.map((item) => ({
      [curOptionProps.label]: item.name,
      [curOptionProps.value]: item.id
    }))
    target.value = data.map((item) => item.id)
  }

  curKey = ""
}

/** 选择有工艺路线产品弹窗成功回调 */
const onSelectCraftRouteProductSuccess = (data: IProductModelListItem[]) => {
  const target = props.formList.find((val) => val.key === curKey) as ISearchSelect
  if (target) {
    target.options = data.map((item) => ({
      [curOptionProps.label]: item.name,
      [curOptionProps.value]: item.id
    }))
    target.value = data.map((item) => item.id)
  }

  curKey = ""
}

/** 选择设备实例弹窗成功回调 */
const onSelectDeviceSuccess = (data: IEquipmentPageItem[]) => {
  const target = props.formList.find((val) => val.key === curKey) as ISearchSelect
  if (target) {
    target.options = data.map((item) => ({
      [curOptionProps.label]: item.equipmentName,
      [curOptionProps.value]: item.id
    }))
    target.value = data.map((item) => item.id)
  }

  curKey = ""
}

/** 选择设备型号弹窗成功回调 */
const onSelectDeviceModelSuccess = (data: IEquipmentModelPageItem[]) => {
  const target = props.formList.find((val) => val.key === curKey) as ISearchSelect
  if (target) {
    target.options = data.map((item) => ({
      [curOptionProps.label]: item.modelName,
      [curOptionProps.value]: item.id
    }))
    target.value = data.map((item) => item.id)
  }

  curKey = ""
}

/** 选择人员、部门、职位弹窗成功回调 */
const onSelectPersonSuccess = (data: ITree[]) => {
  const target = props.formList.find((val) => val.key === curKey) as ISearchSelect
  if (target) {
    target.options = data.map((item) => ({
      [curOptionProps.label]: item.label,
      [curOptionProps.value]: item.id
    }))
    target.value = data.map((item) => item.id)
  }

  curKey = ""
}

const dealCollapseDebounce = lodashDebounce(dealCollapse, 300)

onMounted(() => {
  dealCollapse()
  window.addEventListener("resize", dealCollapseDebounce)
})
onUnmounted(() => {
  window.removeEventListener("resize", dealCollapseDebounce)
})
</script>

<style lang="scss" scoped>
.search-form {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  padding: 24px 20px 0 0;

  .search-form-items {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    flex: 1;

    &.search-form-items-collapse {
      overflow: hidden;
      height: 56px;
      padding-bottom: 24px;
    }
  }
  .search-form-item {
    display: flex;
    align-items: center;
    margin-bottom: 24px;

    .search-form-item-label {
      text-align: right;
      margin-right: 12px;
      font-size: 14px;
      color: #606266;
    }
    :deep(.area-component-multiple) {
      .el-cascader__tags {
        overflow: hidden;
        flex-wrap: nowrap;
        width: calc(100% - 30px);

        .el-tag {
          &:first-child {
            flex: 1;
            overflow: hidden;
          }
        }
        .el-cascader__search-input {
          display: none;
        }
      }
    }
  }

  .search-operation {
    padding-left: 16px;
    display: flex;
    justify-content: flex-end;
    flex: 1;

    &.search-operation-collapse {
      flex: none;
    }
    &:deep(.el-button) {
      width: 112px;
      margin-bottom: 24px;

      + .el-button {
        margin-left: 16px;
      }

      span {
        margin-left: 16px;
      }
    }

    .reset-btn {
      background: #f0f2f5;
      border-color: #f0f2f5;
    }

    .collapse-btn {
      width: 100px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      margin-bottom: 24px;

      .el-icon {
        font-size: 14px;
        color: #606266;
        transform: rotate(90deg);
      }
      span {
        color: #606266;
        font-size: 14px;
        margin-left: 4px;
        line-height: 24px;
      }
    }
  }

  &:deep(.el-input-number) {
    .el-input__inner {
      text-align: left;
    }
  }
}
</style>
