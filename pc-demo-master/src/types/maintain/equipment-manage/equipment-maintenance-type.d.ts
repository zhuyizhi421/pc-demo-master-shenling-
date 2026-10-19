import type { IRequestPageParams } from "@/types/common"

export interface IEquipmentMaintenanceTypePageParams
  extends IRequestPageParams<
    Partial<{
      maintenanceTypeCode: string
      maintenanceTypeName: string
    }>
  > {}

export interface IEquipmentMaintenanceTypeItem {
  id: string
  maintenanceTypeCode: string
  maintenanceTypeName: string
  remarks: string
  createBy: string
  createTime: string
  updateBy: string
  updateTime: string
}

export interface IEquipmentMaintenanceTypeSaveParams {
  id?: string
  maintenanceTypeCode: string
  maintenanceTypeName: string
  remarks: string
}
