import type { IRequestPageParams } from "@/types/common"

export type TEquipmentRepairBaseConfigType = "faultCategory" | "faultLevel" | "faultReason"

export interface IEquipmentRepairBaseConfigPageParams
  extends IRequestPageParams<
    Partial<{
      configType: TEquipmentRepairBaseConfigType
      configCode: string
      configName: string
    }>
  > {}

export interface IEquipmentRepairBaseConfigItem {
  id: string
  configType: TEquipmentRepairBaseConfigType
  configCode: string
  configName: string
  remarks: string
  createBy: string
  createTime: string
  updateBy: string
  updateTime: string
}

export interface IEquipmentRepairBaseConfigSaveParams {
  id?: string
  configType: TEquipmentRepairBaseConfigType
  configCode: string
  configName: string
  remarks: string
}
