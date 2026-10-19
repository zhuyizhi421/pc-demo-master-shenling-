import type { IEquipmentConfigPageListItem } from "@/types/maintain/equipment-manage/equipment-config"

export interface IDeviceMaintainDialogProps {
  /**
   * 弹窗是否显示
   */
  modelValue: boolean

  /**
   * 已选中行rowKey
   */
  selectedRowKeys: string[]

  /**
   * 设备id
   */
  equipmentId: string

  /**
   * 配置项类型（1点检 2巡检 3保养 4设备参数 5文件）
   */
  configType: number

  /**
   * 表格是否多选，默认为单选
   */
  multiple?: boolean

  /**
   * 表格行唯一标识，默认为id
   */
  rowKey?: string
}

export interface IDeviceMaintainDialogEmits {
  (e: "update:modelValue", show: boolean): void
  (e: "success", data: IEquipmentConfigPageListItem[]): void
}

export interface IDeviceMaintainDialogEvents {
  "update:modelValue": (show: boolean) => void
  success?: (data: IEquipmentConfigPageListItem[]) => void
}
