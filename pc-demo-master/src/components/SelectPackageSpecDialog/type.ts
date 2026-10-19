import type { IPackageSpecPageListItem } from "@/types/base-info/package-spec"

export interface IPackageSpecDialogProps {
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
   * 是否只展示启用状态的包装规格
   */
  enable?: boolean
}

export interface IPackageSpecDialogEmits {
  (e: "update:modelValue", value: boolean): void
  (e: "success", value: IPackageSpecPageListItem[]): void
}

export interface IPackageSpecDialogEvents {
  "update:modelValue": (val: boolean) => void
  success?: (data: IPackageSpecPageListItem[]) => void
}
