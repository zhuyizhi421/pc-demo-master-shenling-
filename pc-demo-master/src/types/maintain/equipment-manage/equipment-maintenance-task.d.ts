import type { IFileInfo } from "@/types/base-info/file"
import type { IRequestPageParams } from "@/types/common"

export type IEquipmentMaintenanceTaskPageParams = IRequestPageParams<
  Partial<{
    barCode: string
    curDep: number
    endDate: string
    equipmentId: string
    equipmentNo: string
    maintenanceEndTime: string
    maintenanceResult: number
    maintenanceResultList: number[]
    maintenanceStartTime: string
    planId: string
    sourceType: number
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
      maintenanceNo: string
      maintenanceResult: number
      maintenanceResultList: number[]
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

export interface IEquipmentMaintenanceTaskItemUser {
  id: string
  empNo: string
  name: string
}

export interface IEquipmentMaintenanceTaskItemStandard {
  standardDesc: string
  standardMax: number
  standardMaxInclusive: boolean | number
  standardMin: number
  standardMinInclusive: boolean | number
  standardType: number
  unitId?: string
  unitName?: string
}

export interface IEquipmentMaintenanceTaskItem {
  id: string
  equipmentConfigId?: string
  equipmentConfigName?: string
  exceptionTaskId?: string
  exceptionTaskNo?: string
  files: IFileInfo[]
  maintenanceMethod: string
  methodRequire?: string
  maintenanceName: string
  maintenanceNo: string
  maintenanceResult: number
  maintenanceStandard: IEquipmentMaintenanceTaskItemStandard
  maintenanceTaskId: string
  maintenanceTime: string
  maintenanceTypeId?: string
  maintenanceTypeName?: string
  maintenanceUserName?: string
  maintenanceUsers: IEquipmentMaintenanceTaskItemUser[]
  practicalValue: string
  remarkFiles: IFileInfo[]
  remarks: string
}

export interface IEquipmentMaintenanceTaskPageItem {
  areaId?: string
  areaName: string
  barCode?: string
  barCodeId?: string
  checkByName?: string
  checkTime?: string
  createBy: string
  createTime: string
  departments?: string[] | string
  equipmentId: string
  equipmentModelId?: string
  equipmentName: string
  equipmentNo: string
  equipmentTypeName?: string
  equipmentTypeNo?: string
  executeDepartmentName?: string
  executePosition?: string
  executePositionName?: string
  facilityId?: string
  facilityName?: string
  id: string
  inspectionResult?: number
  itemList?: IEquipmentMaintenanceTaskItem[]
  items: IEquipmentMaintenanceTaskItem[]
  maintenanceComplete: string
  maintenanceCostSeconds: number
  maintenanceEmployeeName?: string
  maintenanceEmployeeNo?: string
  maintenanceResult: number
  maintenanceStart: string
  maintenanceStatus?: number
  maintenanceTime?: string
  maintenanceTypeId?: string
  maintenanceTypeName?: string
  planDate?: string
  planEndTime?: string
  planId?: string
  planName?: string
  planStartTime?: string
  remarks: string
  schedulingRotations?: {
    beforeMinute: number
    belongDay: number
    createBy: string
    createTime: string
    endTime: string
    id: string
    remark: string
    rotationCode: string
    rotationName: string
    rotationStatus: number
    rotationTime: string
    updateBy: string
    updateTime: string
  }[]
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

export interface IEquipmentMaintenanceTaskCreateParams {
  equipmentId: string
  maintenanceConfigIds?: string[]
  planDate?: string
  workShiftIds?: string[]
  equipmentNo?: string
  equipmentName?: string
  equipmentModelId?: string
  equipmentTypeNo?: string
  equipmentTypeName?: string
  areaName?: string
  taskSource?: string
  executePosition?: string
  planStartTime?: string
  planEndTime?: string
  remarks?: string
  items?: Array<{
    id?: string
    equipmentConfigId?: string
    maintenanceName: string
    maintenanceNo: string
    practicalValue?: string
    maintenanceResult?: number
    remarks?: string
    remarkFileIds?: string[]
  }>
  maintenanceTypeId?: string
  maintenanceTypeName?: string
}

export interface IEquipmentMaintenanceTaskUpdateParams
  extends IEquipmentMaintenanceTaskCreateParams {
  id: string
}
