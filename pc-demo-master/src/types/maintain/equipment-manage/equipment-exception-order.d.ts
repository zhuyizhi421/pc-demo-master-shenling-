import type { IEmployeeListItem } from "@/types/base-info/employee"
import type { IFileInfo } from "@/types/base-info/file"
import type { ISystemFaultInfo } from "@/types/base-info/system-fault"

export type IEquipmentExceptionOrderPageParams = IRequestPageParams<{
  areaName?: string
  equipmentId?: string
  equipmentName?: string
  equipmentNo?: string
  equipmentTypeName?: string
  sourceType: number
  taskNo?: string
  taskStatus?: number
}>

export interface IEquipmentExceptionHandlePosition {
  depId?: string
  depName?: string
  positionId?: string
  positionName?: string
}

export interface IEquipmentExceptionOrderPageListItem {
  analysis: string
  areaName: string
  assignableResponsibleUsers?: Array<
    Pick<IEmployeeListItem, "id" | "empNo" | "name" | "depId" | "depName">
  >
  attachmentFileList?: IFileInfo[]
  completeTime: string
  createBy: string
  createTime: string
  deactive: number
  equipmentId: string
  equipmentMaintenanceId?: string
  equipmentMaintenanceNo?: string
  equipmentName: string
  equipmentNo: string
  equipmentRepairId?: string
  equipmentRepairNo?: string
  equipmentTypeName?: string
  equipmentTypeNo?: string
  exceptionHandlePositionList?: IEquipmentExceptionHandlePosition[]
  exceptionHandlePositionName?: string
  faultDescription?: string
  faults: ISystemFaultInfo[]
  handleUsers: Array<Pick<IEmployeeListItem, "id" | "empNo" | "name">>
  id: string
  remarks: string
  reportUsers: Array<Pick<IEmployeeListItem, "id" | "empNo" | "name">>
  responsibleUsers: Array<Pick<IEmployeeListItem, "id" | "empNo" | "name">>
  solution: number | ""
  solutionMeasures?: string
  sourceId: string
  sourceItemIds?: string[]
  sourceName: string
  sourceNo: string
  sourceTaskId?: string
  sourceTaskNo?: string
  sourceType: number
  taskNo: string
  taskStatus: number
  updateBy: string
  updateTime: string
}

export interface IEquipmentExceptionOrderFeedbackParams {
  analysis?: string
  faultDescription?: string
  faultIds?: string[]
  handleUserIds?: string[]
  id: string
  remarks?: string
  repairRemark?: string
  responsibleUserIds?: string[]
  scrapFileIds?: string[]
  solution?: number
  solutionMeasures?: string
  workShiftId?: string[]
  equipmentMaintenanceConfigIds?: string[]
}

export interface IEquipmentExceptionOrderAssignResponsibleParams {
  id: string
  responsibleUserId: string
}
