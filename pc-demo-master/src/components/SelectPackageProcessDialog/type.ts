import type { IPackageProcessPageListItem } from "@/types/base-info/package-process"

export interface IPackageProcessDialogProps {
  /**
   * 是否显示弹窗
   */
  modelValue: boolean

  /**
   * 已选中行rowKey
   */
  selectedRowKeys: string[]

  /**
   * 是否开启多选
   */
  multiple?: boolean

  /**
   * 表格行唯一标识，默认为id
   */
  rowKey?: string

  /**
   * 是否只显示启用状态数据
   */
  enable?: boolean
}

export interface IPackageProcessDialogEmits {
  (e: "update:modelValue", value: boolean): void
  (e: "success", value: IPackageProcessPageListItem[]): void
}

export interface IPackageProcessDialogEvents {
  "update:modelValue": (val: boolean) => void
  success?: (data: IPackageProcessPageListItem[]) => void
}
