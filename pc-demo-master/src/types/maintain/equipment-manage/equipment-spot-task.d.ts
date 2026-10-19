import type { IFileInfo } from "@/types/base-info/file"
import type { IRequestPageParams } from "@/types/common"

export type IEquipmentSpotTaskPageParams = IRequestPageParams<
  Partial<{
    endDate: string
    equipmentId: string
    equipmentNo: string
    inspectionResult: number
    inspectionResultList: number[]
    startDate: string
    taskNo: string
    taskSource: string
    taskSourceList: string[]
    taskStatus: number
    taskStatusList: number[]
    taskType: number
    taskTypeList: number[]
  }>
> &
  Partial<{
    pageQuery: {
      pageNum: number
      pageSize: number
    }
    queryParam: Partial<{
      equipmentId: string
      equipmentNo: string
      inspectionResult: number
      inspectionResultList: number[]
      taskNo: string
      taskSource: string
      taskSourceList: string[]
      taskStatus: number
      taskStatusList: number[]
      taskType: number
      taskTypeList: number[]
    }>
    dateRange: Partial<{
      startDate: string
      endDate: string
    }>
    sort: Array<{
      field: string
      order: string
    }>
  }>

export interface IEquipmentSpotTaskItemUser {
  id: string
  empNo: string
  name: string
}

export interface IEquipmentSpotTaskItemStandard {
  standardDesc: string
  standardMax: number
  standardMaxInclusive: boolean | number
  standardMin: number
  standardMinInclusive: boolean | number
  standardType: number
  unitId?: string
  unitName?: string
}

export interface IEquipmentSpotTaskItem {
  id: string
  equipmentConfigId?: string
  equipmentConfigName?: string
  exceptionTaskId?: string
  exceptionTaskNo?: string
  files: IFileInfo[]
  inspectionMethod: string
  inspectionName: string
  inspectionNo: string
  inspectionResult: number
  inspectionStandard: IEquipmentSpotTaskItemStandard
  inspectionTime: string
  inspectionType?: number
  inspectionTypeName?: string
  inspectionUsers: IEquipmentSpotTaskItemUser[]
  practicalValue: string
  remarkFiles: IFileInfo[]
  remarks: string
  spotTaskId: string
}

export interface IEquipmentSpotTaskPageItem {
  areaId?: string
  areaName: string
  checkByName?: string
  checkTime?: string
  createBy: string
  createTime: string
  equipmentId: string
  equipmentModelId?: string
  equipmentName: string
  equipmentNo: string
  equipmentTypeName?: string
  equipmentTypeNo?: string
  executeDepartmentId?: string
  executeDepartmentName?: string
  executePosition?: string
  executePositionId?: string
  executePositionName?: string
  id: string
  inspectionComplete: string
  inspectionCostSeconds: number
  inspectionEmployeeName?: string
  inspectionEmployeeNo?: string
  inspectionResult: number
  inspectionStart: string
  itemList?: IEquipmentSpotTaskItem[]
  items: IEquipmentSpotTaskItem[]
  planEndTime?: string
  planStartTime?: string
  remarks: string
  rotationCode?: string
  rotationId?: string
  rotationName?: string
  sourceId?: string
  sourceNo?: string
  sourceType?: number
  submitterName?: string
  taskNo: string
  taskSource?: string
  taskSourceName?: string
  taskStatus: number
  taskType: number
  taskTypeName?: string
  updateBy: string
  updateTime: string
  voidByName?: string
  voidReason?: string
  voidTime?: string
}

export interface IEquipmentSpotTaskCreateParams {
  equipmentId: string
  equipmentNo?: string
  equipmentName?: string
  equipmentModelId?: string
  equipmentTypeNo?: string
  equipmentTypeName?: string
  areaName?: string
  executeDepartmentId?: string
  executeDepartmentName?: string
  executePosition?: string
  executePositionId?: string
  executePositionName?: string
  inspectionTypeName?: string
  items?: Array<{
    id?: string
    equipmentConfigId?: string
    inspectionName: string
    inspectionNo: string
    inspectionResult?: number
    practicalValue?: string
    remarks?: string
    remarkFileIds?: string[]
  }>
  spotConfigIds?: string[]
  planEndTime?: string
  planStartTime?: string
  remarks?: string
  rotationCode?: string
  rotationId?: string
  rotationName?: string
  taskSource?: string
  taskType?: number
  taskTypeName?: string
}

export interface IEquipmentSpotTaskUpdateParams extends IEquipmentSpotTaskCreateParams {
  id: string
}
