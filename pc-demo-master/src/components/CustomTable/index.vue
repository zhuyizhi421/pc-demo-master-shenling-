<template>
  <div class="custom-table" v-loading="loading">
    <div class="table-toolbar" v-if="isShowToolbar">
      <div
        class="table-toolbar-item"
        @click="openColumnConfigDialog"
        v-if="props.config.isOpenColumnConfig"
      >
        <el-icon size="14"><Setting /></el-icon>
        <span>字段配置</span>
      </div>
    </div>

    <el-table
      ref="tableRef"
      :row-key="rowKey"
      :data="tableList"
      :height="tableHeight"
      :max-height="tableMaxHeight"
      :stripe="props.config.stripe"
      :row-class-name="props.config.rowClassName"
      :cell-class-name="props.config.cellClassName"
      :header-cell-class-name="props.config.headerCellClassName"
      :header-row-class-name="props.config.headerRowClassName"
      :highlight-current-row="props.config.highlightCurrentRow"
      :show-summary="props.config.showSummary"
      :summary-method="props.config.summaryMethod"
      :span-method="props.config.spanMethod"
      border
      @current-change="onCurrentChange"
      @selection-change="onSelectionChange"
      @header-dragend="onHeaderDragend"
    >
      <template v-for="column in columnList" :key="column.prop">
        <el-table-column
          v-if="
            (typeof column.hidden === 'function' ? !column.hidden() : !column.hidden) &&
            column.isShow
          "
          :prop="column.prop"
          :label="column.label"
          :width="column.width"
          :min-width="column.minWidth"
          :fixed="column.fixed"
          :align="column.align"
          :show-overflow-tooltip="column.showOverflowTooltip ?? true"
          :class-name="column.className"
          :label-class-name="column.labelClassName"
          :type="column.type !== 'selection' ? column.type : 'default'"
          :formatter="column.formatter"
        >
          <!-- 普通模式，表格表头单元格插槽 -->
          <template v-if="column.slots?.header" #header="data">
            <slot :name="column.slots.header" v-bind="data"></slot>

            <!-- 开启排序设置时，显示排序图标 -->
            <span
              v-if="column.sortable"
              class="sort-wrapper"
              @click.stop="sortChange($event, column)"
            >
              <i
                class="sort-icon ascending"
                :class="{
                  sortable: getColumnSortConfig(column.prop)?.order === 'asc'
                }"
              ></i>
              <i
                class="sort-icon descending"
                :class="{
                  sortable: getColumnSortConfig(column.prop)?.order === 'desc'
                }"
              ></i>
            </span>

            <!-- 开启筛选设置时，显示筛选图标 -->
            <span
              v-if="column.filterable"
              class="filter-wrapper"
              @click.stop="onOpenFilterDialog(column)"
            >
              <el-icon
                class="filter-icon"
                :class="{ filter: hasColumnFilterConfig(column) }"
                size="18"
                ><Filter
              /></el-icon>
            </span>
          </template>

          <template v-else-if="column.type !== 'selection'" #header="data">
            <slot>{{ data.column.label }}</slot>

            <!-- 开启排序设置时，显示排序图标 -->
            <span
              v-if="column.sortable"
              class="sort-wrapper"
              @click.stop="sortChange($event, column)"
            >
              <i
                class="sort-icon ascending"
                :class="{
                  sortable: getColumnSortConfig(column.prop)?.order === 'asc'
                }"
              ></i>
              <i
                class="sort-icon descending"
                :class="{
                  sortable: getColumnSortConfig(column.prop)?.order === 'desc'
                }"
              ></i>
            </span>

            <!-- 开启筛选设置时，显示筛选图标 -->
            <span
              v-if="column.filterable"
              class="filter-wrapper"
              @click.stop="onOpenFilterDialog(column)"
            >
              <el-icon
                class="filter-icon"
                :class="{ filter: hasColumnFilterConfig(column) }"
                size="18"
                ><Filter
              /></el-icon>
            </span>
          </template>

          <!-- 表格多选模式，表头单元格插槽 -->
          <template v-else-if="column.type === 'selection' && column.multiple" #header>
            <el-checkbox
              class="table-checkbox"
              :model-value="checkAll"
              :indeterminate="isIndeterminate"
              :disabled="isAllDisabled(column)"
              @change="onAllSelectChange($event, column)"
            />
          </template>

          <!-- 普通模式，表格行单元格插槽 -->
          <template v-if="column.slots?.default" #default="data">
            <slot :name="column.slots?.default" v-bind="data"></slot>
          </template>

          <!-- 表格单选模式，行单元格插槽 -->
          <template
            v-else-if="column.type === 'selection' && !column.multiple"
            #default="{ row, $index }"
          >
            <el-radio
              class="table-radio"
              :model-value="selectRowId"
              :value="row[rowKey]"
              :disabled="column.selectable ? !column.selectable?.(row, $index) : false"
              @change="onSingleChange(row, column)"
            ></el-radio>
          </template>

          <!-- 表格多选模式，行单元格插槽 -->
          <template
            v-else-if="column.type === 'selection' && column.multiple"
            #default="{ row, $index }"
          >
            <el-checkbox
              class="table-checkbox"
              :model-value="multipleKeys.includes(row[rowKey])"
              @change="onSelectChange($event, row)"
              :disabled="column.selectable ? !column.selectable?.(row, $index) : false"
            />
          </template>
        </el-table-column>
      </template>
    </el-table>

    <!-- 字段过滤弹窗 -->
    <ColumnFilterDialog
      v-model="filterDialogVisible"
      :column="filterColumnInfo"
      @success="onFilterDialogSuccess"
    />

    <!-- 字段配置弹窗 -->
    <ColumnConfigDialog
      v-model="columnConfigDialogVisible"
      v-model:columns="columnConfigDialogLabelList"
      @success="onColumnConfigDialogSuccess"
    />
  </div>
</template>

<script setup lang="ts" generic="Q extends any[], T, P extends boolean">
import type { UnwrapRef } from "vue"

import ColumnConfigDialog from "@/components/CustomTable/ColumnConfigDialog.vue"
import ColumnFilterDialog from "@/components/CustomTable/ColumnFilterDialog.vue"
import useCustomTable from "@/components/CustomTable/use-custom-table"
import type { IOption } from "@/types/common"
import { getLocalKeyByProjectName, isEffectiveValue } from "@/utils/common"

import {
  EnumFilterType,
  type IColumnConfig,
  type IColumnConfigItem,
  type IColumnRenderItem,
  type IColumnSortInfo,
  type ICustomTableEmits,
  type ICustomTableProps
} from "./type"

defineOptions({
  name: "CustomTable"
})

const props = withDefaults(defineProps<ICustomTableProps<Q, T, P>>(), {})
const emit = defineEmits<ICustomTableEmits<T>>()

const filterDialogVisible = ref(false)
const filterColumnInfo = ref<{
  field: string
  label: string
  value: string | (string | number)[]
  type: EnumFilterType
  options?: IOption[]
}>({
  field: "",
  label: "",
  value: "",
  type: EnumFilterType.Enum,
  options: []
})

// 字段配置弹窗
const columnConfigDialogVisible = ref(false)
const columnConfigDialogLabelList = ref<IColumnConfigItem[]>([])

const isShowToolbar = computed(() => {
  return !!(props.config.localTableKey && props.config.isOpenColumnConfig)
})

const tableHeight = computed(() => {
  return props.config.height
    ? isShowToolbar.value
      ? typeof props.config.height === "number"
        ? `calc(${props.config.height}px - 40px)`
        : `calc(${props.config.height} - 40px)`
      : props.config.height
    : undefined
})

const tableMaxHeight = computed(() => {
  return props.config.maxHeight
    ? isShowToolbar.value
      ? typeof props.config.maxHeight === "number"
        ? `calc(${props.config.maxHeight}px - 40px)`
        : `calc(${props.config.maxHeight} - 40px)`
      : props.config.maxHeight
    : undefined
})

const {
  tableRef,
  loading,
  tableList,
  highLightRow,
  singleRow,
  multipleRows,
  isIndeterminate,
  paginationTotal,
  sortList,
  filterList,
  renderColumns,
  requestData,
  currentChange,
  setSelectedRow,
  setSelectedRows,
  clearSelectedRow,
  singleRowChange,
  checkAllChange,
  checkRowChange,
  setHighLightRow,
  deleteRowAfter,
  resetSortList,
  resetFilterList
} = useCustomTable<Q, T, P>(props.config, props.queryConfig)

const checkAll = computed(
  () =>
    tableList.value.length &&
    tableList.value.every((row: any) => multipleKeys.value.includes(row[rowKey.value]))
)
const rowKey = computed(() => props.config.rowKey || "id")
const selectRowId = computed(() => singleRow.value?.[rowKey.value])
const multipleKeys = computed(() => multipleRows.value?.map((row: any) => row[rowKey.value]) || [])

const columnList = ref<IColumnRenderItem[]>([])

/**
 * 全选模式下，切换全选
 */
const onAllSelectChange = (checked: boolean, column: IColumnConfig) => {
  checkAllChange?.(checked, column)
  emit("select-all", checked, cloneDeep(multipleRows.value))
  // 同时发出 selectionChange 事件，传递完整的选中数组
  emit("selectionChange", multipleRows.value)
}

/**
 * 多选状态下，切换选中行
 */
const onSelectChange = (checked: boolean, row: T) => {
  checkRowChange?.(checked, row)
  emit("select-change", checked, row)
  // 同时发出 selectionChange 事件，传递完整的选中数组
  emit("selectionChange", multipleRows.value)
}

/**
 * 单选模式下，切换选中状态
 */
const onSingleChange = (row: T, column: IColumnConfig) => {
  singleRowChange?.(row, column)
  emit("single-change", row)
}

/**
 * 设置loading状态
 */
const setLoading = (status: boolean) => (loading.value = status)

/**
 * 获取当前高亮行
 */
const getCurrentHighLightRow = (): T => highLightRow.value

/**
 * 获取单选模式下当前选中行
 */
const getCurrentSingleRow = (): T => singleRow.value

/**
 * 获取多选模式下选中行
 */
const getCurrentMultipleRows = (): UnwrapRef<T[]> => multipleRows.value

/**
 * 当前行改变
 */
const onCurrentChange = (row: T) => {
  currentChange(row)
  emit("currentChange", row)
}

/**
 * 选择改变
 */
const onSelectionChange = (selection: T[]) => {
  emit("selectionChange", selection)
}

/** 判断全选按钮是否禁用 */
const isAllDisabled = (column: IColumnConfig) => {
  if (!column.selectable) {
    return false
  }

  return tableList.value.every((row: any, rowIndex: number) => !column.selectable?.(row, rowIndex))
}

/**
 * 行列宽调整
 */
const onHeaderDragend = (
  newWidth: number,
  _: number,
  column: {
    property: string
  }
) => {
  if (!props.config.isSaveColumnWidth || !props.config.localTableKey) return
  const key = `${getLocalKeyByProjectName()}-${props.config.localTableKey}`
  const localColumnList: IColumnConfigItem[] = JSON.parse(localStorage.getItem(key)!)

  const value = localColumnList.map((item) => {
    const col: IColumnConfigItem = {
      ...item,
      width: item.prop === column.property ? newWidth : item.width
    }
    return col
  })
  localStorage.setItem(key, JSON.stringify(value))
}

/**
 * 打开字段配置弹窗
 */
const openColumnConfigDialog = () => {
  columnConfigDialogVisible.value = true
}

/**
 * 字段配置弹窗成功
 */
const onColumnConfigDialogSuccess = (val: IColumnConfigItem[]) => {
  const localColumnList: IColumnRenderItem[] = []
  val.forEach((item) => {
    const columnData = columnList.value.find((col) => col.prop === item.prop)
    if (columnData) {
      localColumnList.push({
        ...columnData,
        fixed: item.isFreezed === "default" ? undefined : item.isFreezed,
        isShow: item.isShow
      })
    }
  })
  const key = `${getLocalKeyByProjectName()}-${props.config.localTableKey}`
  const value = localColumnList.map((item) => ({
    prop: item.prop,
    label: item.label,
    isShow: item.isShow,
    isFreezed: item.fixed || "default",
    isSHowDisabled: isEffectiveValue(item.configConfig?.disabledDefaultShow) || false,
    width: item.width
  }))
  localStorage.setItem(key, JSON.stringify(value))
  // 刷新表格
  columnList.value = localColumnList
  columnConfigDialogVisible.value = false
}

/**
 * 判断两个数组是否相等
 */
const areArraysEqual = (arr1: string[], arr2: string[]): boolean => {
  // 长度不同直接返回 false
  if (arr1.length !== arr2.length) {
    return false
  }

  // 使用 Map 记录每个元素的出现次数
  const countMap = new Map<string, number>()

  // 统计 arr1 的元素
  for (const item of arr1) {
    countMap.set(item, (countMap.get(item) || 0) + 1)
  }

  // 验证 arr2 的元素
  for (const item of arr2) {
    const count = countMap.get(item)

    // 元素不存在或计数为 0
    if (!count) return false

    countMap.set(item, count - 1)
  }

  return true
}

/**
 * 处理本地字段配置
 */
const dealDefaultConfigByLocal = () => {
  const key = `${getLocalKeyByProjectName()}-${props.config.localTableKey}`
  const localColumnListValue = localStorage.getItem(key)
  if (!localColumnListValue) {
    columnList.value = renderColumns.value.map((item) => ({
      ...cloneDeep(item),
      isShow: true
    }))
    columnConfigDialogLabelList.value = renderColumns.value.map((item) => ({
      prop: item.prop,
      label: item.label,
      isFreezed: item.fixed || "default",
      isShow: true,
      isShowDisabled: isEffectiveValue(item.configConfig?.disabledDefaultShow) || false,
      width: item.width || "",
      minWidth: item.minWidth || ""
    }))

    localStorage.setItem(key, JSON.stringify(columnConfigDialogLabelList.value))
  } else {
    const localColumnList: IColumnConfigItem[] = JSON.parse(localColumnListValue)
    // 监听本地字段配置及比对
    const localPropsList = localColumnList.map((item) => item.prop)
    const propsList = renderColumns.value.map((item) => item.prop)
    let isArraysEqual = areArraysEqual(localPropsList, propsList)
    if (isArraysEqual) {
      columnList.value = renderColumns.value.map((item) => {
        const columnData = localColumnList.find((col) => col.prop === item.prop)
        if (!columnData) {
          return
        }
        return {
          ...cloneDeep(item),
          width: columnData.width,
          isShow: columnData.isShow
        }
      })
      columnConfigDialogLabelList.value = cloneDeep(localColumnList)
    } else {
      columnList.value = renderColumns.value.map((item) => ({
        ...cloneDeep(item),
        isShow: true
      }))
      columnConfigDialogLabelList.value = renderColumns.value.map((item) => ({
        prop: item.prop,
        label: item.label!,
        isFreezed: item.fixed || "default",
        isShow: true,
        isShowDisabled: isEffectiveValue(item.configConfig?.disabledDefaultShow) || false,
        width: item.width || "",
        minWidth: item.minWidth || ""
      }))
      localStorage.removeItem(key)
    }
  }
}

/**
 *  获取指定列的排序配置
 */
const getColumnSortConfig = (prop: string): IColumnSortInfo | undefined => {
  return sortList.value.find((item) => item.filedName === prop)
}

/**
 * 点击排序操作
 * @param e : 鼠标事件对象
 * @param prop : 排序对应列字段
 */
const sortChange = (e: MouseEvent, column: IColumnConfig) => {
  const target = e.target as HTMLElement
  if (!target || !target.classList.contains("sort-icon")) {
    return
  }

  const sortOrder = getColumnSortConfig(column.prop)?.order
  const targetSortInfo = sortList.value.find((item) => item.filedName === column.prop)!
  const isAsc = target.classList.contains("ascending")
  const isDesc = target.classList.contains("descending")

  if (!sortOrder) {
    targetSortInfo.order = isAsc ? "asc" : "desc"
  } else {
    if (sortOrder === "asc" && isAsc) {
      targetSortInfo.order = undefined
    } else if (sortOrder === "desc" && isDesc) {
      targetSortInfo.order = undefined
    } else {
      targetSortInfo.order = isAsc ? "asc" : "desc"
    }
  }

  requestData()
}

/**
 * 打开过滤弹窗
 */
const onOpenFilterDialog = (column: IColumnConfig) => {
  const target = filterList.value.find((item) => item.field === column.prop)
  filterDialogVisible.value = true
  filterColumnInfo.value = {
    label: column.label,
    value: target?.value || "",
    ...column.filterProps!
  }
}

/**
 * 字段过滤弹窗成功回调
 */
const onFilterDialogSuccess = (val: string | (string | number)[]) => {
  const target = filterList.value.find((item) => item.field === filterColumnInfo.value.field)
  if (!target) {
    return
  }

  target.value = val
  requestData()
}

/**
 * 判断列是否存在过滤配置
 */
const hasColumnFilterConfig = (column: IColumnConfig): boolean => {
  const { field, type } = column.filterProps!
  const target = filterList.value.find((item) => item.field === field)

  if (!target) {
    return false
  }

  if ([EnumFilterType.Exact, EnumFilterType.Fuzzy, EnumFilterType.Enum].includes(type)) {
    return target.value.length > 0
  } else {
    return target.value.length > 0 && (target.value[0]?.length > 0 || target.value[1]?.length > 0)
  }
}

watch(
  () => tableList.value,
  (val) => {
    emit("update:tableData", val)
  },
  {
    deep: true
  }
)
watch(
  () => props.tableData,
  (val) => {
    tableList.value = val
  },
  {
    deep: true,
    immediate: true
  }
)
// 监听表格配置动态变化，刷新表格
watch(
  () => renderColumns.value,
  () => {
    if (props.config.localTableKey) {
      if (!renderColumns.value.length) {
        return
      }

      // 处理本地字段配置
      dealDefaultConfigByLocal()
    } else {
      columnList.value = renderColumns.value.map((item) => ({
        ...cloneDeep(item),
        isShow: true
      }))
    }
  },
  {
    deep: true,
    immediate: true
  }
)
watch(
  () => paginationTotal.value,
  (val) => {
    emit("update:total", val)
  }
)

defineExpose({
  setLoading,
  requestData,
  getCurrentHighLightRow,
  getCurrentSingleRow,
  getCurrentMultipleRows,
  setSelectedRow,
  setSelectedRows,
  clearSelectedRow,
  setHighLightRow,
  deleteRowAfter,
  resetSortList,
  resetFilterList
})
</script>

<style lang="scss" scoped>
.custom-table {
  .table-toolbar {
    display: flex;
    align-items: center;
    height: 40px;
    background-color: #f1f3f9;
    border: 1px solid #ebeef5;
    border-bottom: none;
    padding: 0 12px;
    gap: 12px;

    .table-toolbar-item {
      display: flex;
      align-items: center;
      padding: 0 6px;
      cursor: pointer;
      height: 24px;
      border-radius: 4px;
      background-color: #fcfcfc;

      span {
        color: #606266;
        font-size: 14px;
      }
      .el-icon {
        color: #606266;
        margin-right: 4px;
      }
      &.active-table-toolbar-item {
        border: 1px solid #409eff;

        span {
          color: #409eff;
        }
        .el-icon {
          color: #409eff;
        }
      }
      &:hover {
        background-color: #409eff;

        span {
          color: #fff;
        }
        .el-icon {
          color: #fff;
        }
      }
    }
  }
}
.table-radio {
  &:deep(.el-radio__label) {
    padding: 0;
  }

  &:deep(.el-radio__inner) {
    width: 18px;
    height: 18px;

    &::after {
      width: 6px;
      height: 6px;
    }
  }
}

.table-checkbox {
  &:deep(.el-checkbox__label) {
    padding: 0;
  }

  &:deep(.el-checkbox__inner) {
    width: 18px;
    height: 18px;

    &::before {
      width: 17px;
      top: 7px;
    }

    &::after {
      width: 4px;
      height: 10px;
      left: 6px;
      top: 1px;
    }
  }
}

.sort-wrapper {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  height: 20px;
  width: 26px;
  vertical-align: middle;

  .sort-icon {
    width: 0;
    height: 0;
    border: solid 7px transparent;
    position: absolute;
    left: 7px;
    cursor: pointer;

    &.ascending {
      border-bottom-color: var(--el-text-color-placeholder);
      top: -5px;

      &.sortable {
        border-bottom-color: var(--el-color-primary);
      }
    }

    &.descending {
      border-top-color: var(--el-text-color-placeholder);
      bottom: -5px;

      &.sortable {
        border-top-color: var(--el-color-primary);
      }
    }
  }
}

.filter-wrapper {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  height: 16px;
  width: 26px;
  cursor: pointer;

  .filter-icon {
    position: absolute;
    top: 3px;

    &.filter {
      color: var(--el-color-primary);
    }
  }
}
</style>
