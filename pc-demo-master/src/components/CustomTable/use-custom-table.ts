import { requestTableColumnConfig } from "@/components/CustomTable/tableConfig"
import {
  EnumFilterType,
  EnumSortType,
  type IColumnConfig,
  type IColumnSortInfo,
  type IId,
  type IRemoteTableColumn,
  isIListPageResult,
  type ISortOrder,
  type ITableConfig,
  type ITableRequestConfig
} from "@/components/CustomTable/type"
import { isEffectiveValue } from "@/utils/common"

/**
 * 泛型参数说明：
 * Q: 表格请求参数类型
 * T: 表格数据类型
 * P: 是否分页，true表示分页，false表示不分页
 * @param config 表格配置
 * @param requestConfig 表格数据请求相关配置
 * @returns
 */
const useCustomTable = <Q extends any[], T, P extends boolean>(
  config: ITableConfig,
  requestConfig?: ITableRequestConfig<Q, T, P>
) => {
  const { reserveSelection = true, rowKey = "id", columns } = config

  let inInit: Promise<boolean> | null

  const tableRef = ref()
  const loading = ref(false)
  const tableList = ref<T[]>([])
  const highLightRow = ref<T | null>(null) // 当前选中高亮行
  const singleRow = ref<T | null>(null) // 单选情况下，当前选中的行
  const multipleRows = ref<T[]>([]) // 多选情况下，当前选中的行
  const multipleRowKeys = computed(
    () => new Set(multipleRows.value.map((item: any) => item[rowKey]))
  )
  const isIndeterminate = ref(false)
  const paginationTotal = ref(0)

  const renderColumns = ref<IColumnConfig[]>([]) // 表格渲染列
  const remoteColumns = ref<IRemoteTableColumn[]>([]) // 动态获取的表格列配置
  const sortList = ref<IColumnSortInfo[]>([]) // 表格所有开启排序的列的排序信息列表
  const filterList = ref<
    {
      field: string
      value: any
      type: string
    }[]
  >([]) // 表格所有开启过滤的列的过滤条件列表

  /**
   * 动态获取表格列配置信息
   */
  const getRemoteColumns = async (queryKey: string): Promise<boolean> => {
    return new Promise((resolve) => {
      requestTableColumnConfig({ queryKey }).then((data) => {
        const cols = data?.columns ?? []
        remoteColumns.value = cols.filter((item) => !!item.visible)

        setSortList(remoteColumns.value, true)
        setFilterList(remoteColumns.value)
        buildRenderColumns(remoteColumns.value, columns)
        resolve(true)
      })
    })
  }

  /**
   *  结合动态列数据与表格配置的列，构建出完整的列配置
   */
  const buildRenderColumns = (
    dynamicColumns: IRemoteTableColumn[],
    optionColumns: IColumnConfig[]
  ) => {
    renderColumns.value = []

    // 添加序号列、多选列、展开列
    const resultColumns: IColumnConfig[] = optionColumns.filter(
      (item) => item.type === "index" || item.type === "selection" || item.type === "expand"
    )

    // 比较本地列配置与动态列数据，动态列数据优先级更高
    dynamicColumns.forEach((dynamic) => {
      const targetColumn = optionColumns.find((item) => item.prop === dynamic.fieldName)
      if (targetColumn) {
        resultColumns.push({
          ...targetColumn,
          label: dynamic.displayName,
          hidden: !dynamic.visible,
          sortable: !!dynamic.sortable,
          sortOrder: (dynamic.defaultStandardSort as ISortOrder) || undefined,
          filterable: !!dynamic.filterable,
          filterProps: {
            field: dynamic.fieldName,
            type: dynamic.filterType,
            options: dynamic.enumValues || []
          }
        })
      } else {
        console.warn(`本地表格列配置中找不到对应prop为"${dynamic.fieldName}"的列配置`)
      }
    })

    // 加入操作列，本地操作列使用固定字段名"custom-operation"
    const operationColumn = optionColumns.find((item) => item.prop === "custom-operation")
    if (operationColumn) {
      resultColumns.push(operationColumn)
    }

    renderColumns.value = resultColumns
  }

  /**
   * 获取表格数据
   */
  const requestData = async () => {
    loading.value = true

    if (!requestConfig) {
      loading.value = false
      return
    }

    const { api, getParams } = requestConfig

    if (!api) {
      loading.value = false
      return
    }

    if (inInit) {
      await inInit
      inInit = null
    }

    // 过滤掉排序条件不存在的列
    const sortData: IColumnSortInfo[] =
      sortList.value.filter((item) => item.sortField && item.order) || []

    // 过滤掉过滤条件不存在的列
    const filterData: Record<string, any> = {}
    filterList.value
      .filter((item) => item.field && isEffectiveValue(item.value))
      .forEach((item) => {
        // 依据filterType，转换成对应的类型结果
        if (item.type === EnumFilterType.Time_Range) {
          if (!item.value.length) {
            return
          }
          filterData[item.field] = {
            type: item.type,
            startTime: item.value[0] || null,
            endTime: item.value[1] || null
          }
        } else {
          filterData[item.field] = {
            type: item.type,
            value: item.value
          }
        }
      })

    try {
      const params = (getParams?.(sortData, filterData) || []) as Q
      const res = await api(...params)

      if (isIListPageResult(res)) {
        tableList.value = res.records
        paginationTotal.value = +res.total
      } else {
        tableList.value = res
      }

      // 每次刷新数据后，需要重新设置表头全选中间状态是否显示
      if (!reserveSelection) {
        singleRow.value = null
        multipleRows.value = []
      }
      setIndeterminate()

      loading.value = false
    } catch (error) {
      tableList.value = []
      loading.value = false
    }
  }

  /**
   * 表格单选模式，选中行切换
   */
  const singleRowChange = (row: any, column: any) => {
    const index = tableList.value.findIndex((_row) => _row === row)
    if (index !== -1 && (!column.selectable || column.selectable?.(row, index))) {
      singleRow.value = row
    }
  }

  /**
   * 表格高亮选中行改变时触发
   */
  const currentChange = (row: T) => {
    highLightRow.value = row
  }

  /**
   * 设置指定行高亮
   * @param id 行id
   */
  const setHighLightRow = (id: IId) => {
    const targetRow = tableList.value.find((row: any) => row[rowKey] === id)
    targetRow && tableRef.value?.setCurrentRow(targetRow)
  }

  /**
   * 单选模式下，设置当前选中行
   * @param id 行rowKey
   * @param request 数据请求函数，用于分页回显选中行
   */
  const setSelectedRow = async (id: IId, request?: () => Promise<T[]>) => {
    // 参数request不为空时，将request函数返回的数据设置为singleRow；
    // 否则认为表格数据不分页或直接设置当前表格数据选中行，即在当前tableData中设置选中行数据
    let targetRow: T | undefined = undefined
    if (request) {
      const data = await request()
      targetRow = data.find((row: any) => row[rowKey] === id)
    } else {
      targetRow = tableList.value.find((row: any) => row[rowKey] === id) as T
    }
    targetRow && (singleRow.value = targetRow)
  }

  /**
   * 多选模式下，表头全选状态切换时触发
   * @param checked 是否选中
   */
  const checkAllChange = (checked: boolean, column: any) => {
    if (checked) {
      tableList.value.forEach((row: any, index: number) => {
        if (
          multipleRowKeys.value.has(row[rowKey]) ||
          (column.selectable && !column.selectable?.(row, index))
        ) {
          return
        }
        multipleRows.value.push(row)
      })
    } else {
      tableList.value.forEach((row: any, index: number) => {
        if (
          multipleRowKeys.value.has(row[rowKey]) &&
          (!column.selectable || column.selectable?.(row, index))
        ) {
          multipleRows.value = multipleRows.value.filter(
            (item: any) => item[rowKey] !== row[rowKey]
          )
        }
      })
    }
    setIndeterminate()
  }

  /**
   * 多选模式下，表格行选中状态切换时触发
   * @param checked 是否选中
   * @param row 行数据
   */
  const checkRowChange = (checked: boolean, row: any) => {
    if (checked) {
      multipleRows.value.push(row)
    } else {
      multipleRows.value = multipleRows.value.filter((item: any) => item[rowKey] !== row[rowKey])
    }
    setIndeterminate()
  }

  /**
   * 表格多选模式下，设置表头全选中间状态是否显示
   */
  const setIndeterminate = () => {
    if (!multipleRowKeys.value.size) {
      isIndeterminate.value = false
    } else {
      const isAll = tableList.value.every((row: any) => multipleRowKeys.value.has(row[rowKey]))
      if (isAll) {
        isIndeterminate.value = false
      } else {
        isIndeterminate.value = tableList.value.length > 0
      }
    }
  }

  /**
   * 表格多选模式下，设置当前选中行
   * @param ids 行rowKey集合
   *  @param request 数据请求函数，用于分页回显选中行
   */
  const setSelectedRows = async (ids: IId[], request?: () => Promise<T[]>) => {
    // 参数request不为空时，将request函数返回的数据设置为 multipleRows；
    // 否则认为表格数据不分页或直接设置当前表格数据选中行，即在当前tableData中设置选中行数据

    multipleRows.value = []

    if (request) {
      const data = await request()
      data?.forEach((row: any) => {
        if (ids.includes(row[rowKey]) && !multipleRowKeys.value.has(row[rowKey])) {
          multipleRows.value.push(row)
        }
      })
    } else {
      tableList.value.forEach((row: any) => {
        if (ids.includes(row[rowKey]) && !multipleRowKeys.value.has(row[rowKey])) {
          multipleRows.value.push(row)
        }
      })
    }

    setIndeterminate()
  }

  /**
   * 删除表格行数据后使用，仅限于配置了column列中type为selection的单选、多选情况，
   * 用于更新内部的选中行数据
   * @param ids 删除行rowKey集合
   */
  const deleteRowAfter = (ids: IId[]) => {
    if (singleRow.value?.[rowKey] && ids.includes(singleRow.value[rowKey])) {
      singleRow.value = null
    }
    if (!multipleRows.value.length) {
      return
    }
    multipleRows.value = multipleRows.value.filter((row: any) => !ids.includes(row[rowKey]))

    setIndeterminate()
  }

  /**
   * 表格单选、多选模式下，清空选中行数据
   */
  const clearSelectedRow = () => {
    singleRow.value = null
    multipleRows.value = []
    setIndeterminate()
  }

  /**
   * 设置排序信息列表
   */
  const setSortList = (columns: (IRemoteTableColumn | IColumnConfig)[], isRemote = false) => {
    sortList.value = []
    if (isRemote) {
      // 从接口读取排序信息时
      const _columns = columns as IRemoteTableColumn[]
      _columns.forEach((item) => {
        if (item.sortable) {
          sortList.value.push({
            filedName: item.fieldName,
            sortField: item.sortField,
            sortType: item.sortType,
            order: (item.defaultStandardSort as ISortOrder) || undefined
          })
        }
      })
    } else {
      // 从本地配置读取排序信息时
      const _columns = columns as IColumnConfig[]
      _columns.forEach((item) => {
        if (item.sortable) {
          sortList.value.push({
            filedName: item.prop,
            sortField: item.sortField || item.prop,
            sortType: EnumSortType.Standard,
            order: item.sortOrder
          })
        }
      })
    }
  }

  /**
   * 重置表格排序信息
   */
  const resetSortList = () => {
    if (remoteColumns.value.length) {
      setSortList(remoteColumns.value, true)
    } else {
      setSortList(columns)
    }
  }

  /**
   * 设置过滤信息列表，
   * 过滤只需支持从接口从读取配置的情况
   */
  const setFilterList = (columns: IRemoteTableColumn[]) => {
    filterList.value = []
    columns.forEach((item) => {
      if (item.filterable) {
        filterList.value.push({
          field: item.fieldName,
          type: item.filterType,
          value: ""
        })
      }
    })
  }

  /**
   * 重置表格过滤信息
   */
  const resetFilterList = () => {
    setFilterList(remoteColumns.value)
  }

  /**
   * 初始化执行函数，根据是否有remoteQueryKey配置，决定是否从接口获取表格列配置
   * @param columns 本地列配置
   */
  const init = (columns: IColumnConfig[]) => {
    if (config.remoteQueryKey) {
      inInit = getRemoteColumns(config.remoteQueryKey)
    } else {
      setSortList(columns)
      renderColumns.value = columns
    }
  }

  watch(
    () => config.columns,
    (val) => {
      init(val)
    },
    {
      immediate: true,
      deep: true
    }
  )

  return {
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
    setHighLightRow,
    setSelectedRow,
    setSelectedRows,
    clearSelectedRow,
    singleRowChange,
    checkAllChange,
    checkRowChange,
    deleteRowAfter,
    resetSortList,
    resetFilterList
  }
}

export default useCustomTable
