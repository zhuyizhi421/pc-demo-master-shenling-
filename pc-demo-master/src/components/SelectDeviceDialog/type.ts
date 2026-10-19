import type { IEquipmentPageItem } from "@/types/maintain/equipment-manage/equipment-info"

export type IDeviceDialogProps = {
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

  /**
   * 是否启用
   */
  enable?: boolean
}

export type IDeviceDialogEmits = {
  (e: "update:modelValue", value: boolean): void
  (e: "success", data: IEquipmentPageItem[]): void
}

export type IDeviceDialogEvents = {
  "update:modelValue": (value: boolean) => void
  success?: (data: IEquipmentPageItem[]) => void
}
