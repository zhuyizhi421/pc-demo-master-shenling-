import type { IEmployeeListItem } from "@/types/base-info/employee"
import type { IFileInfo } from "@/types/base-info/file"
import type { IRequestPageParams } from "@/types/common"

export interface IEquipmentRepairPageParams
  extends IRequestPageParams<
    Partial<{
      equipmentId: string
      equipmentNo: string
      equipmentName: string
      repairNo: string
      repairStatus: number
      repairResult: number
      sourceType: number
      reportUnit: string
      reportUserName: string
    }>
  > {}

export interface IEquipmentRepairReplacementPartItem {
  id: string
  mroId: string
  mroNo: string
  mroName: string
  mroSpec: string
  mroClassifyName: string
  mroCategoryName: string
  quantity: number
  remarks: string
}

export interface IEquipmentRepairOperationLogItem {
  id: string
  actionType: string
  actionDesc: string
  operatorId: string
  operatorName: string
  operateTime: string
}

export interface IEquipmentRepairPageItem {
  id: string
  repairNo: string
  repairStatus: number
  repairResult: number | ""
  sourceType: number
  sourceId: string
  sourceNo: string
  reportUnit: string
  reportUser: IEmployeeListItem
  reportUsers?: IEmployeeListItem[]
  contactPhone: string
  equipmentId: string
  equipmentNo: string
  equipmentName: string
  equipmentModelId: string
  equipmentModelNo: string
  equipmentModelName: string
  faultCategoryId: string
  faultCategoryName: string
  faultLevel: string
  faultLevelName: string
  reportTime: string
  faultDescription: string
  areaName: string
  productionUnitName: string
  workstationName: string
  locationName: string
  responsibleUser: IEmployeeListItem
  assignUser: IEmployeeListItem
  assignTime: string
  repairUser: IEmployeeListItem
  handleUsers?: IEmployeeListItem[]
  receiveTime: string
  repairTime: string
  repairMethod: string
  repairMode: number
  entrustUnit: string
  nextRoundReason: string
  handoverContent: string
  faultReasonId: string
  faultReasonName: string
  faultReasonAnalysis: string
  handoverTime: string
  handoverUser: IEmployeeListItem
  prepareDuration: number
  waitPartsDuration: number
  actualRepairDuration: number
  downDuration: number
  preventiveMeasures: string
  improvementMeasures: string
  replacementParts: IEquipmentRepairReplacementPartItem[]
  attachments: IFileInfo[]
  executeUser: IEmployeeListItem
  confirmUser: IEmployeeListItem
  isImplemented: number | ""
  acceptanceOpinion: string
  executionSituation: string
  confirmTime: string
  closeTime: string
  remarks: string
  createBy: string
  createByName: string
  createTime: string
  updateBy: string
  updateTime: string
  operationLogs: IEquipmentRepairOperationLogItem[]
}

export interface IEquipmentRepairCreateParams {
  equipmentId: string
  reportUnit: string
  reportUserId: string
  contactPhone: string
  reportTime: string
  faultDescription: string
  faultCategoryId: string
  faultCategoryName?: string
  faultLevel: string
  faultLevelName?: string
  sourceType?: number
  sourceId?: string
  sourceNo?: string
  remarks?: string
}

export interface IEquipmentRepairUpdateParams extends Partial<IEquipmentRepairCreateParams> {
  id: string
}

export interface IEquipmentRepairAssignResponsibleParams {
  id: string
  responsibleUserId: string
}

export interface IEquipmentRepairFeedbackParams {
  id: string
  repairUserId: string
  repairMode: number
  entrustUnit?: string
  receiveTime: string
  repairTime: string
  repairMethod: string
  repairResult: number
  nextRoundReason?: string
  handoverContent?: string
  faultReasonId?: string
  faultReasonName?: string
  faultReasonAnalysis?: string
  handoverTime?: string
  handoverUserId?: string
  prepareDuration?: number
  waitPartsDuration?: number
  actualRepairDuration?: number
  downDuration?: number
  preventiveMeasures?: string
  improvementMeasures?: string
  replacementParts?: IEquipmentRepairReplacementPartItem[]
  fileIds?: string[]
  remarks?: string
}

export interface IEquipmentRepairConfirmParams {
  id: string
  executeUserId: string
  confirmUserId: string
  isImplemented: number
  acceptanceOpinion: string
  executionSituation?: string
}
