import { EnumDocumentStatus } from "@/constant/enums"
import type { IRequestPageParams } from "@/types/common"

export interface IFileLocationRelation {
  areaId: string
  areaName: string
  productionUnitId?: string
  productionUnitName?: string
  workstationId?: string
  workstationName?: string
  pathIds: string[]
  pathNames: string[]
}

export interface IFileProductRelation {
  productId: string
  productCode: string
  productName: string
  specification?: string
  drawingNumber?: string
  craftRouteId?: string
  techVersionId?: string
  techVersionNo?: string
  processIds?: string[]
  processNames?: string[]
  processSerials?: string[]
  processId?: string
  processName?: string
  processSerial?: string
}

export interface IFileInfo {
  changeReason?: string
  controlType?: number
  createBy: string
  createTime: string
  deploymentId: string
  directoryId?: string | number
  directoryName?: string
  effectiveTime?: string
  expireDate?: string
  extension: string
  fileId?: string
  fileName: string
  fileStatus?: EnumDocumentStatus
  hash: string
  id: string
  locationRelations?: IFileLocationRelation[]
  path: string
  productRelations?: IFileProductRelation[]
  size: string
  sourceName: string
  updateBy: string
  updateTime: string
  version: string
}

export interface IDocumentCreateParams {
  directoryId: number
  fileIds: string[]
  controlType: number
  effectiveTime?: string
  expireDate?: string
  changeReason?: string
  locationRelations?: IFileLocationRelation[]
  productRelations?: IFileProductRelation[]
}

export interface IDocumentUpdateNameParams {
  id: string
  newName: string
}

export type IFileResourceParams = IRequestPageParams<{
  extension?: string
  fileName?: string
  directoryId?: string
  directoryName?: string
  statusList?: EnumDocumentStatus[]
}>

export interface IFileResourcePageItem {
  changeReason?: string
  controlType?: number
  createBy: string
  createTime: string
  directoryId?: number | string
  directoryName?: string
  effectiveTime?: string
  expireDate?: string
  extension: string
  fileId: string
  fileName: string
  fileStatus: EnumDocumentStatus
  hash?: string
  id: string
  locationRelations?: IFileLocationRelation[]
  productRelations?: IFileProductRelation[]
  size: string
  sourceName: string
  uploadTime?: string
  updateTime: string
  documentSourceType: number
  version?: string
  processDefineId?: string
  reviseProcessDefineId?: string
  workflowStatus?: EnumDocumentStatus
}

export interface IFileFlowRecord {
  procDefId: string
  procDefKey: string
  procDefName: string
  procDefVersion: number
  procInsId: string
  procProgress: number
  startDeptName: string
  startTime: string
  startUserId: string
  startUserName: string
  terminateType: string
}
