import type { ISystemFaultInfo } from "@/types/base-info/system-fault"

export interface IAndonFaultDialogProps {
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

export interface IAndonFaultDialogEmits {
  (e: "update:modelValue", val: boolean): void
  (e: "success", data: ISystemFaultInfo[]): void
}

export interface IAndonFaultDialogEvents {
  "update:modelValue": (val: boolean) => void
  success?: (data: ISystemFaultInfo[]) => void
}
