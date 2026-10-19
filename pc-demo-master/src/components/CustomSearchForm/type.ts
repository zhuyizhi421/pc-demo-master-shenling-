import type { Ref } from "vue"

import { SelectType } from "@/components/SelectFactoryModel/types"

export type IDateType =
  | "year"
  | "years"
  | "month"
  | "months"
  | "date"
  | "dates"
  | "week"
  | "weeks"
  | "datetime"
  | "datetimerange"
  | "daterange"
  | "monthrange"
  | "yearrange"

export type ISearchDialogType =
  | "product"
  | "craftRouteProduct"
  | "device"
  | "deviceModel"
  | "person"

type IValue = string | number | boolean

type IOption = {
  [key: string]: any
}

type ITreeOption = IOption & {
  children?: ITreeOption[]
}

export interface ISearchItemCommon {
  key: string
  label: string
  clearable?: boolean
  disabled?: boolean
  hidden?: boolean
  style?: {
    width?: number
  }
  linkProps?: {
    linkKey: string
    // 条件符号，不传或false为不等于，true为等于
    conditionSign?: boolean
    showByLinkKeyCondition: unknown
  }
}

export interface ISearchInput extends ISearchItemCommon {
  type: EnumComponentType.Input
  value: string
  placeholder?: string
  maxLength?: number // 最大输入长度
  prefixIcon?: string // 前缀图标
  suffixIcon?: string // 后缀图标
  slots?: {
    prepend: string
    append: string
  } // 自定义输入框插槽
}

export interface ISearchInputNumber extends ISearchItemCommon {
  type: EnumComponentType.InputNumber
  value: number
  placeholder?: string
  min?: number // 最小值
  max?: number // 最大值
  step?: number // 步长
  stepStrictly?: boolean // 是否只能输入 step 的倍数
  precision?: number // 精度
}

export interface ISearchSelect extends ISearchItemCommon {
  type: EnumComponentType.Select
  value: IValue | IValue[]
  options: IOption[] | Ref<IOption[]>
  optionProps?: {
    // el-option中props属性配置
    label: string
    value: string
  }
  slots?: {
    option: string // 自定义选项插槽
  }
  placeholder?: string
  multiple?: boolean // 是否多选
  filterable?: boolean // 是否可搜索
  maxTag?: number // 最多显示标签数量
  filterMethod?: (filterValue: string) => void // 自定义搜索方法
  dialogType?: ISearchDialogType //弹框选择类型，设置该属性后，选择将会弹出弹框选择选项
  dialogProps?: Record<string, any> //弹框属性
}

export interface ISearchDate extends ISearchItemCommon {
  type: EnumComponentType.Date
  dateType: IDateType
  value: string | string[]
  placeholder?: string | [string, string]
  format?: string
  valueFormat?: string
  shortcuts?: Array<{
    text: string
    type: "day" | "week" | "month" | "year"
    value: number | [number, number]
  }>
  defaultTime?: Date | [Date, Date]
  keyword?: [string, string]
  disabledDateParams?: {
    // 开始日期（传入日期可选）
    startDate?: Date
    // 结束日期（传入日期可选）
    endDate?: Date
    // 最大范围（根据dateType动态变化，仅range类型生效）
    // 如：传入6，daterange类型时，开始日期和结束日期最大相差6天；monthrange类型时，开始日期和结束日期最大相差6个月等
    maxRange?: number
  }
}

export interface ISearchCascader extends ISearchItemCommon {
  type: EnumComponentType.Cascader
  value: Exclude<IValue, boolean> | Exclude<IValue, boolean>[]
  options: ITreeOption[] | Ref<ITreeOption[]>
  placeholder?: string
  showAllLevels?: boolean // 是否展示层级的完整路径
  maxTag?: number // 最多显示标签数量
  props?: {
    label?: string
    value?: string
    emitPath?: boolean
    children?: string
    multiple?: boolean // 是否多选
    checkStrictly?: boolean // 是否严格的遵循父子节点不互相关联
  }
}

export interface ISearchArea extends ISearchItemCommon {
  type: EnumComponentType.Area
  value: string | string[]
  placeholder?: string
  showAllLevels?: boolean // 是否展示层级的完整路径
  props?: {
    areaType: SelectType // 区域类型
    isEnable?: boolean // 查询条件，是否启用
    containLastLevel?: boolean
    multiple?: boolean
    initSelectAll?: boolean
    labelAttr?: string
    valueAttr?: string
    checkStrictly?: boolean // 是否每一级可选
    disabledNonPeer?: boolean // 是否禁用非同级，multiple为true且checkStrictly为true时有效
  }
}

export enum EnumComponentType {
  Input,
  InputNumber,
  Select,
  Date,
  Cascader,
  Area
}

export type ISearchItem =
  | ISearchInput
  | ISearchInputNumber
  | ISearchSelect
  | ISearchDate
  | ISearchCascader
  | ISearchArea

export interface ISearchFormProps {
  formList: ISearchItem[]
  labelWidth?: number
}

export interface ISearchFormEmits {
  (e: "reset"): void
  (e: "search"): void
  (e: "update-dialog", curKey: string, values: string[], data: any[]): void
}
