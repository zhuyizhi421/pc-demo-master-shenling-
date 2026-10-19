import type { IUserInfo } from "@/types/base-info/user"

export interface IUserDialogProps {
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

export interface IUserDialogEmits {
  (e: "update:modelValue", val: boolean): void
  (e: "success", data: IUserInfo[]): void
}

export interface IUserDialogEvents {
  "update:modelValue": (val: boolean) => void
  success?: (data: IUserInfo[]) => void
}
