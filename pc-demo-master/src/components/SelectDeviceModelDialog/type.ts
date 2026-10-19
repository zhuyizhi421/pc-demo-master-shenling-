import type { IEquipmentModelPageItem } from "@/types/maintain/equipment-manage/equipment-model"

export type IDeviceModelDialogProps = {
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

export type IDeviceModelDialogEmits = {
  (e: "update:modelValue", value: boolean): void
  (e: "success", data: IEquipmentModelPageItem[]): void
}

export type IDeviceModelDialogEvents = {
  "update:modelValue": (value: boolean) => void
  success?: (data: IEquipmentModelPageItem[]) => void
}
