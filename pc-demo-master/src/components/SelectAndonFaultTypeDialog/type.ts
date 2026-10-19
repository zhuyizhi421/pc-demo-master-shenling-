import type { ISystemFaultCategoryInfo as ITableRow } from "@/types/base-info/system-fault-category"

export interface IAndonFaultTypeDialogProps {
  /**
   * 弹窗是否显示
   */
  modelValue: boolean

  /**
   * 已选中行rowKey
   */
  selectedRowKeys: string[]

  /**
   * 表格是否多选，默认为单选
   */
  multiple?: boolean

  /**
   * 表格行唯一标识，默认为id
   */
  rowKey?: string
}

export interface IAndonFaultTypeDialogEmits {
  (e: "update:modelValue", show: boolean): void
  (e: "success", data: ITableRow[]): void
}

export interface IAndonFaultTypeDialogEvents {
  "update:modelValue": (show: boolean) => void
  success?: (data: ITableRow[]) => void
}
