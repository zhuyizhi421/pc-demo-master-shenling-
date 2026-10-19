import type { IDepartmentItem } from "@/types/base-info/department"
import type { IOption, IPhoto, IRequestPageParams } from "@/types/common"

export interface IMroModelPageListParams
  extends IRequestPageParams<
    Partial<{
      identityManage: number
      mroCategoryId: string
      mroClassifyId: string
      mroModelName: string
      mroModelNo: string
      mroSpec: string
    }>
  > {}

interface IInspectionStandard {
  standardDesc: string
  standardMax: number | string | null
  standardMaxInclusive: number
  standardMin: number | string | null
  standardMinInclusive: number
  standardType: number
  quantitativeMode?: "lower" | "upper" | "range"
  standardValue?: number | string | null
  upperTolerance?: number | string | null
  lowerTolerance?: number | string | null
  upperToleranceSign?: "+" | "-"
  lowerToleranceSign?: "+" | "-"
  unitId: string
  unitName: string
}

export interface IMroModelPageListItem {
  alarmDepartments: IDepartmentItem[]
  alarmLine: number
  archiveManage: number
  archivePeriod: number
  checkExecuteDepartmentId: string
  checkExecuteDepartmentName: string
  checkExecutePositionId: string
  checkExecutePositionName: string
  checkManage: number
  createBy: string
  createTime: string
  decimalNumber: number
  id: string
  identityManage: number
  lifeManage: number
  maintenanceExecuteDepartmentId: string
  maintenanceExecuteDepartmentName: string
  maintenanceExecutePositionId: string
  maintenanceExecutePositionName: string
  maintenanceManage: number
  mroCategoryId: string
  mroCategoryName: string
  mroClassifyId: string
  mroClassifyName: string
  mroModelName: string
  mroModelNo: string
  mroSpec: string
  mroTypeName: string
  mroScrapProcessId: string
  mroScrapProcessName: string
  remarks: string
  repairDepartments: IDepartmentItem[]
  safeDepartments: IDepartmentItem[]
  safeStock: number
  safeStockManage: number
  sparePartsProcessId: string
  sparePartsProcessName: string
  stocks: number
  stopProAndonId: string
  stopProAndonName: string
  stopProLine: number
  totalLife: number
  unitModelId: string
  unitModelName: string
  updateBy: string
  updateTime: string
}

export interface IMorModelCreateParams
  extends Partial<{
    alarmDepartmentIds: string[]
    alarmLine: number
    archiveManage: number
    archivePeriod: number
    checkExecuteDepartmentId: string
    checkExecuteDepartmentName: string
    checkExecutePositionId: string
    checkExecutePositionName: string
    checkManage: number
    identityManage: number
    lifeManage: number
    maintenanceExecuteDepartmentId: string
    maintenanceExecuteDepartmentName: string
    maintenanceExecutePositionId: string
    maintenanceExecutePositionName: string
    maintenanceManage: number
    mroCategoryId: string
    mroClassifyId: string
    mroModelName: string
    mroModelNo: string
    mroSpec: string
    mroScrapProcessId: string
    remarks: string
    repairDepartmentIds: string[]
    safeDepartmentIds: string[]
    safeStock: number
    safeStockManage: number
    sparePartsProcessId: string
    stopProAndonId: string
    stopProLine: number
    totalLife: number
    unitModelId: string
  }> {}

export interface IMorModelUpdateParams extends IMorModelCreateParams {
  id: string
}

export interface IMroItemConfigListParams
  extends IRequestPageParams<
    Partial<{
      configItemName: string
      mroItemType: number
      mroModelId: string
    }>
  > {}

export interface IMroItemConfigListItem {
  checkStandardValue: IInspectionStandard
  configDepartments: IDepartmentItem[]
  configFrequency: number
  configItemId?: string
  configItemName: string
  configItemNo: string
  createBy: string
  createTime: string
  detectMethod?: string
  executeDepartmentId?: string
  executeDepartmentName?: string
  executePositionId?: string
  executePositionName?: string
  maintenanceType?: "count" | "week"
  fileDesc: string
  files: {
    createBy: string
    createTime: string
    deploymentId: string
    documentSourceType?: 1 | 2
    directoryName: string
    extension: string
    fileName: string
    fileSize: string
    fileStatus: number
    hash: string
    id: string
    path: string
    size: string
    sourceName: string
    updateBy: string
    updateTime: string
    uploadTime?: string
    version: string
  }[]
  id: string
  methodRequire: string
  mroItemType: number
  mroModelId: string
  mroModelName: string
  verifyOrg?: string
  verifyType?: "count" | "day" | "shift"
  spotShiftTiming?: "beforeShift" | "duringShift" | "afterShift"
  ngDepartments: IDepartmentItem[]
  remarks: string
  updateBy: string
  updateTime: string
}

export interface IMroItemConfigUpdateParams {
  id: string
  mroItemType?: number
  data: Partial<{
    checkStandardValue: IInspectionStandard
    configDepartmentIds: string[]
    configFrequency: number
    configItemName: string
    configItemNo: string
    detectMethod: string
    executeDepartmentId: string
    executeDepartmentName: string
    executePositionId: string
    executePositionName: string
    maintenanceType: "count" | "week"
    fileDesc: string
    fileIds: string[]
    id: string
    methodRequire: string
    mroItemType: number
    mroModelId: string
    ngDepartmentIds: string[]
    remarks: string
    verifyOrg: string
    verifyType: "count" | "day" | "shift"
    spotShiftTiming: "beforeShift" | "duringShift" | "afterShift"
  }>[]
}

export interface IMroModelConfigTableRow {
  checkStandardValue: IInspectionStandard
  configFrequency: number
  configItemId?: string
  configItemName: string
  configItemNo: string
  departmentPositionValue?: string[]
  detectMethod?: string
  executeDepartmentId?: string
  executeDepartmentName?: string
  executePositionId?: string
  executePositionName?: string
  id?: string
  maintenanceType?: "count" | "week"
  methodRequire?: string
  configDepartments?: IOption[]
  ngDepartments?: IOption[]
  files: IPhoto[]
  verifyOrg?: string
  verifyType?: "count" | "day" | "shift"
  spotShiftTiming?: "beforeShift" | "duringShift" | "afterShift"
}
