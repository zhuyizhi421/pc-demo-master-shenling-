/** 表格选中行相关 hooks */

import { ElTable } from "element-plus"

interface IRow {
  [prop: string]: any
}

export default function useTableSelect<T extends IRow>({
  rowKey = "id",
  multiple
}: {
  rowKey?: string
  multiple: boolean
}) {
  const tableRef = ref<InstanceType<typeof ElTable>>()
  const selectedRow = ref<T[]>([]) as Ref<T[]> // 已选中的行
  let oldSelection: T[] = [] // 上一次的选中行数据

  /**
   * 表格行多选变化时触发
   * @param selection 选中行数据
   */
  const handleSelectionChange = (selection: T[]) => {
    if (multiple) {
      // 表格行多选情况

      //  查找每次选中行变化与上一次选中行变化的差异，并更新已选中行
      selection.forEach((item) => {
        if (
          !oldSelection.find((oldItem) => oldItem[rowKey] === item[rowKey]) &&
          !selectedRow.value.find((row) => row[rowKey] === item[rowKey])
        ) {
          selectedRow.value.push(item)
        }
      })
      oldSelection.forEach((oldItem) => {
        if (!selection.find((item) => item[rowKey] === oldItem[rowKey])) {
          const index = selectedRow.value.findIndex((item) => item[rowKey] === oldItem[rowKey])
          selectedRow.value.splice(index, 1)
        }
      })

      // 更新完已选中行后，更新旧的选中行数据便于下次比较
      oldSelection = cloneDeep(selection)
    } else {
      // 单选
      if (selection.length > 1) {
        tableRef.value?.toggleRowSelection(selection.shift(), false)
      }
      selectedRow.value = selection
    }
  }

  /**
   * 组件初始渲染时获取已选中行id对应的数据
   * @param selectedId 已选中行id
   * @param data 表格数据
   */
  const initSelectedRowData = async <K = string>(selectedId: K[], data: T[]) => {
    // 从表格所有数据中筛选出已选中的行id对应的数据
    tableRef.value?.clearSelection()
    selectedRow.value = data.filter((item) => selectedId.includes(item[rowKey]))
  }

  /**
   * 表格每次请求成功数据刷新之后，回显已选中的行
   * @param tableData 表格数据
   * @returns
   */
  const setSelectedRow = (tableData: T[]) => {
    if (!selectedRow.value.length) {
      return
    }
    const ids = selectedRow.value.map((item) => item[rowKey])
    const selectedRowIds = tableRef.value?.getSelectionRows()?.map((item: T) => item[rowKey])
    const targetRows = tableData.filter((item) => ids.includes(item[rowKey]))
    targetRows.forEach((row) => {
      if (!selectedRowIds.includes(row[rowKey])) {
        tableRef.value?.toggleRowSelection(row, true)
      }
    })
  }

  /** 多选时设置行是否允许勾选 */
  const selectable = (row: T, selectedIds: (string | number)[]) => {
    if (multiple) {
      return !selectedIds.find((item) => item === row[rowKey])
    } else {
      return !selectedRow.value.find((item) => item[rowKey] === row[rowKey])
    }
  }

  return {
    tableRef,
    selectedRow,
    handleSelectionChange,
    initSelectedRowData,
    setSelectedRow,
    selectable
  }
}
