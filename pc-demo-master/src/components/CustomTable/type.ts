import type { VNode } from "vue"

import type { IListPageResult, IOption } from "@/types/common"

export type IId = string | number

export type ISortOrder = "asc" | "desc"

/**
 * 排序类型枚举
 */
export enum EnumSortType {
  Standard = "STANDARD",
  Enum = "ENUM"
}

/**
 * 筛选类型枚举
 */
export enum EnumFilterType {
  Enum = "ENUM", // 枚举值，用于下拉框、复选框等
  Exact = "EXACT", // 精确匹配，用于输入框
  Fuzzy = "FUZZY", // 模糊匹配，用于输入框
  Time_Range = "TIMERANGE" // 时间范围，用于日期选择器
}

/**
 * 表格列排序信息
 */
export type IColumnSortInfo = {
  /**
   * 排序列字段名
   */
  filedName: string

  /**
   * 排序字段
   */
  sortField: string

  /**
   * 排序类型
   */
  sortType: EnumSortType

  /**
   * 排序方向
   */
  order?: ISortOrder
}

/**
 * 表格配置项
 */
export type ITableConfig = {
  /**
   * 表格列配置项
   */
  columns: IColumnConfig[]

  /**
   * 行数据的 Key，用来优化 Table 的渲染；
   * 使用表格单选、多选功能时，该属性必传，默认为id字段
   */
  rowKey?: string

  /**
   * 表格高度
   */
  height?: number | string

  /**
   * 表格最大高度
   */
  maxHeight?: number | string

  /**
   * 是否显示斑马线
   */
  stripe?: boolean

  /**
   * 表头行的className
   */
  headerRowClassName?: (data: { row: any; rowIndex: number }) => string | string

  /**
   * 行的className
   */
  rowClassName?: (data: { row: any; rowIndex: number }) => string | string

  /**
   * 表头单元格的className
   */
  headerCellClassName?: (data: {
    row: any
    column: any
    rowIndex: number
    columnIndex: number
  }) => string | string

  /**
   * 单元格的className
   */
  cellClassName?: (data: {
    row: any
    column: any
    rowIndex: number
    columnIndex: number
  }) => string | string

  /**
   * 是否开启表格表格行高亮
   */
  highlightCurrentRow?: boolean

  /**
   * 表格数据刷新时，是否保留单选、多选模式下已选中项，需要指定row-key
   */
  reserveSelection?: boolean

  /**
   * localStorage里存储的表格配置对应的key值
   * 开启表格列宽调整存储及开启表格列相关功能都需先指定此key值
   * 开启此功能且本地存储对应内容后，改变配置项，需要先删除本地存储内容，否则不会生效（仅下述特殊情况会触发自动刷新）
   * 开启此功能且本地存储对应内容后，存储的列存在与本次配置的prop值中没有的prop时，会自动刷新所有的本地存储配置
   */
  localTableKey?: string

  /**
   * 是否开启表格列宽调整存储，默认不开启且localTableKey未指定时不生效
   */
  isSaveColumnWidth?: boolean

  /**
   * 是否开启表格列配置，默认不开启且localTableKey未指定时不生效
   */
  isOpenColumnConfig?: boolean

  /**
   * 是否开启表格底部汇总
   */
  showSummary?: boolean

  /**
   * 自定义表格汇总方法
   */
  summaryMethod?: (data: { columns: any[]; data: any[] }) => (VNode | string)[]

  /**
   * 合并行、列的计算方法
   */
  spanMethod?: (data: {
    row: any
    column: any
    rowIndex: number
    columnIndex: number
  }) => number[] | { rowspan: number; colspan: number } | void

  /**
   * 从后端动态获取列配置的queryKey参数，每个表格的列配置都应该有唯一的queryKey；
   * 配置该参数后，会自动从后端获取表格列配置
   */
  remoteQueryKey?: string
}

/**
 * 表格列配置项
 */
export type IColumnConfig = {
  /**
   * 列字段名
   */
  prop: string

  /**
   * 列标题
   */
  label: string

  /**
   *  列类名
   */
  className?: string

  /**
   * 列标题类名
   */
  labelClassName?: string

  /**
   * 列宽度
   */
  width?: number

  /**
   * 列最小宽度
   */
  minWidth?: number

  /**
   * 列是否固定在左侧或者右侧
   * 可用值：'left' | 'right'
   */
  fixed?: string

  /**
   * 列中表头、表体内容的对齐方式,
   * 可用值：'left' | 'center' | 'right'
   */
  align?: string

  /**
   * 内容过长时是否显示tooltip，默认为true
   */
  showOverflowTooltip?: boolean

  /**
   * 对应列的类型，根据不同的类型渲染不同的列内容
   * 可用值：'default' | 'selection' | 'index' | 'expand'
   * 注意：设置type='selection'时，默认为单选，若需要多选，请设下面的multiple属性
   */
  type?: string

  /**
   * 仅对type='selection'有效，是否允许多选
   */
  multiple?: boolean

  /**
   * 仅对type='selection'有效，选择框是否可以选择；为false，则表示禁止选择
   */
  selectable?: (row: any, rowIndex: number) => boolean

  /**
   * 是否开启列排序
   */
  sortable?: boolean

  /**
   * 默认排序顺序
   */
  sortOrder?: ISortOrder

  /**
   * 排序字段，用于请求传递给后端的字段名，不传时默认使用prop字段
   */
  sortField?: string

  /**
   * 是否开启列筛选
   */
  filterable?: boolean

  /**
   * 开启列筛选，筛选配置参数
   */
  filterProps?: {
    /**
     * 筛选字段，用于请求传递给后端的字段名
     */
    field: string

    /**
     * 筛选类型
     */
    type: EnumFilterType

    /**
     * 筛选类型为 EnumFilterType.Enum 时的选项列表
     */
    options?: IOption[]
  }

  /**
   * 是否隐藏
   */
  hidden?: boolean | (() => boolean)

  /**
   * 列字段配置
   */
  configConfig?: {
    /**
     * 是否禁用默认展示
     */
    disabledDefaultShow?: boolean
  }

  /**
   * 格式化列中表格主体单元格内容
   */
  formatter?: (row: any, column: any, cellValue: any, index: number) => VNode | string

  /**
   * 插槽
   */
  slots?: {
    /**
     * 自定义表格主体列的单元格内容
     */
    default?: string

    /**
     * 自定义表格主体列的表头单元格内容
     */
    header?: string
  }
}

export type IColumnRenderItem = IColumnConfig & {
  width?: number | "auto"
  isShow?: boolean
}

export type IColumnConfigItem = {
  prop: string
  label: string
  isShow: boolean
  isFreezed: string
  width: number | string
  minWidth: number | string
  isShowDisabled: boolean
}

/**
 * 表格数据请求相关配置项
 * Q: 表格请求参数类型
 * T: 表格数据类型
 * P: 是否分页，true表示分页，false表示不分页
 */
export type ITableRequestConfig<Q extends any[], T, P extends boolean> = {
  /**
   * 请求api方法
   */
  api?: P extends true
    ? (...params: Q) => Promise<IListPageResult<T>>
    : (...params: Q) => Promise<T[]>

  /**
   * 获取请求参数回调
   * @param sort 排序信息
   * @param filterData 筛选数据
   */
  getParams?: (sort: IColumnSortInfo[], filterData: Record<string, any>) => Q
}

export type ICustomTableProps<Q extends any[], T, P extends boolean> = {
  /**
   * 表格数据
   */
  tableData: T[]

  /**
   * 表格配置项
   */
  config: ITableConfig

  /**
   * 表格数据请求相关配置项
   */
  queryConfig?: ITableRequestConfig<Q, T, P>

  /**
   * 分页数据总数
   */
  total?: number
}

export type ICustomTableEmits<T> = {
  (e: "update:tableData", value: any): void
  (e: "update:total", value: number): void

  /**
   *  当前高亮行选中事件
   */
  (e: "currentChange", row: T): void

  /**
   * 多选模式下，全选事件
   */
  (e: "select-all", checked: boolean, selection: T[]): void

  /**
   * 多选模式下，行选中事件
   */
  (e: "select-change", checked: boolean, row: T): void

  /**
   * 单选模式下，行选中事件
   */
  (e: "single-change", row: T): void

  /**
   * 选择模式下的选择变化事件
   */
  (e: "selectionChange", selection: T[]): void
}

/**
 * 判断是否为 IListPageResult类型
 */
export const isIListPageResult = (obj: any): obj is IListPageResult<any> => {
  return "records" in obj
}

/**
 * 分页器配置项
 */
export type IPaginationConfig = {
  currentPage: number
  pageSize: number
  total: number
}

/**
 * 判断是不是一个类组件（普通的component），是类组件则返回实例类型，再判断是不是一个带expose的函数组件（类似setup函数组件），都不是返回默认值空对象，代码无任何抛出
 */
export type ComponentExposed<T> = T extends new (...args: any) => infer E
  ? E
  : T extends (props: any, ctx: any, expose: (exposed: infer E) => any, ...args: any) => any
    ? NonNullable<E>
    : {}

// 接口获取表格单列配置信息
export interface IRemoteTableColumn {
  displayName: string // 显示名
  enumValues: {
    label: string
    value: string | number
  }[]
  fieldName: string // 字段名
  filterType: EnumFilterType // 筛选类型
  filterable: number // 是否可筛选
  orderNum: number // 顺序
  sortField: string // 排序字段
  sortType: EnumSortType // 排序类型
  sortable: number // 是否可排序
  defaultStandardSort: string // 排序类型为 STANDARD 时,默认的 排序值 asc|desc
  visible: number // 是否可见
}

// 接口获取表格所有列配置信息
export interface ITableColumnConfig {
  columns: IRemoteTableColumn[]

  queryInfo: {
    description: string // 描述
    queryKey: string // 查询KEY
    queryName: string // 查询名称
  }
}
