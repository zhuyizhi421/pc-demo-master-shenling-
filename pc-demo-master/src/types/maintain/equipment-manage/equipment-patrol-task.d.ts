import type { IFileInfo } from "@/types/base-info/file"
import type { IRequestPageParams } from "@/types/common"

export type IEquipmentPatrolTaskPageParams = IRequestPageParams<
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

export interface IEquipmentPatrolTaskItemUser {
  id: string
  empNo: string
  name: string
}

export interface IEquipmentPatrolTaskItemStandard {
  standardDesc: string
  standardMax: number
  standardMaxInclusive: boolean | number
  standardMin: number
  standardMinInclusive: boolean | number
  standardType: number
  unitId?: string
  unitName?: string
}

export interface IEquipmentPatrolTaskItem {
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
  inspectionStandard: IEquipmentPatrolTaskItemStandard
  inspectionTime: string
  inspectionUsers: IEquipmentPatrolTaskItemUser[]
  practicalValue: string | number
  remarkFiles: IFileInfo[]
  remarks: string
  patrolTaskId: string
}

export interface IEquipmentPatrolTaskPageItem {
  areaId?: string
  areaName: string
  barCode?: string
  barCodeId?: string
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
  facilityId?: string
  facilityName?: string
  id: string
  inspectionComplete: string
  inspectionCostSeconds: number
  inspectionEmployeeName?: string
  inspectionEmployeeNo?: string
  inspectionResult: number
  inspectionStart: string
  itemList?: IEquipmentPatrolTaskItem[]
  items: IEquipmentPatrolTaskItem[]
  planEndTime?: string
  planStartTime?: string
  remarks: string
  sourceId?: string
  sourceNo?: string
  sourceType?: number
  submitterName?: string
  taskNo: string
  taskSource?: string
  taskSourceName?: string
  taskStatus: number
  updateBy: string
  updateTime: string
  voidByName?: string
  voidReason?: string
  voidTime?: string
  workstationId?: string
  workstationName?: string
}

export interface IEquipmentPatrolTaskCreateParams {
  areaName?: string
  equipmentId: string
  equipmentModelId?: string
  equipmentName?: string
  equipmentNo?: string
  equipmentTypeName?: string
  equipmentTypeNo?: string
  executeDepartmentId?: string
  executeDepartmentName?: string
  executePosition?: string
  executePositionId?: string
  executePositionName?: string
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
  patrolConfigIds?: string[]
  planEndTime?: string
  planStartTime?: string
  remarks?: string
  taskSource?: string
}

export interface IEquipmentPatrolTaskUpdateParams extends IEquipmentPatrolTaskCreateParams {
  id: string
}
