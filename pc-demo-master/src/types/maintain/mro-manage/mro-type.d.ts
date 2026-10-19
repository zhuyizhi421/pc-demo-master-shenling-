import type { IRequestPageParams } from "@/types/common"

export interface IMroTypePageListParams
  extends IRequestPageParams<
    Partial<{
      mroTypeNo: string
      mroTypeName: string
    }>
  > {}

export interface IMroTypeExceptionHandlePosition {
  depId: string
  depName: string
  positionId: string
  positionName: string
}

export interface IMroTypePageListItem {
  id: string
  mroTypeNo: string
  mroTypeName: string
  verifyAdvanceDays: number
  maintenanceAdvanceDays: number
  repairProcessId: string
  repairProcessName: string
  scrapProcessId: string
  scrapProcessName: string
  remark: string
  exceptionHandlePositionList: IMroTypeExceptionHandlePosition[]
  repairPositionList: IMroTypeExceptionHandlePosition[]
  createBy: string
  createTime: string
  updateBy: string
  updateTime: string
}

export interface IMroTypeCreateParams {
  mroTypeNo?: string
  mroTypeName: string
  verifyAdvanceDays: number
  maintenanceAdvanceDays: number
  repairProcessId?: string
  repairProcessName?: string
  scrapProcessId?: string
  scrapProcessName?: string
  remark?: string
  exceptionHandlePositionList: Array<{
    depId: string
    positionId: string
  }>
  repairPositionList: Array<{
    depId: string
    positionId: string
  }>
}

export interface IMroTypeUpdateParams extends IMroTypeCreateParams {
  id: string
}
