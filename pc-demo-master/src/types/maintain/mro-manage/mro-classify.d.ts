import type { IRequestPageParams } from "@/types/common"

export interface IMroClassifyPageListParams
  extends IRequestPageParams<
    Partial<{
      parentId: string
      mroCategoryNo: string
      mroCategoryName: string
      mroTypeId: string
    }>
  > {}

export interface IMroClassifyItem {
  id: string
  level?: number
  nodeType?: "type" | "classify"
  mroCategoryNo: string
  mroCategoryName: string
  mroTypeId: string
  mroTypeNo: string
  mroTypeName: string
  parentId: string
  parentName: string
  remark: string
  verifyAdvanceDays?: number
  maintenanceAdvanceDays?: number
  repairProcessId?: string
  repairProcessName?: string
  scrapProcessId?: string
  scrapProcessName?: string
  exceptionHandlePositionList?: Array<{
    depId: string
    depName: string
    positionId: string
    positionName: string
  }>
  repairPositionList?: Array<{
    depId: string
    depName: string
    positionId: string
    positionName: string
  }>
  createBy: string
  createTime: string
  updateBy: string
  updateTime: string
}

export interface IMroClassifyTreeItem extends IMroClassifyItem {
  children: IMroClassifyTreeItem[]
}

export interface IMroClassifyCreateParams {
  mroCategoryNo?: string
  mroCategoryName: string
  mroTypeId: string
  parentId?: string
  remark?: string
}

export interface IMroClassifyUpdateParams extends IMroClassifyCreateParams {
  id: string
}
