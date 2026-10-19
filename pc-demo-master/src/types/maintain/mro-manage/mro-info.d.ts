import type { IDepartmentItem } from "@/types/base-info/department"
import type { IOption, IPhoto, IRequestPageParams } from "@/types/common"

export type IMroInfoPageListParams = IRequestPageParams<{
  barcode?: string
  curLocation?: number
  curLocationList?: number[]
  identityManage?: number
  ledgerStatus?: string
  mroCategoryId?: string
  mroCategoryName?: string
  mroModelId?: string
  mroModelName?: string
  mroNo?: string
  registerRecordId?: string
  runningStatus?: number
  status?: number
}>

export interface IMroInfoPageListItem {
  archiveFromStatus?: string
  archiveReason: string
  archiveRemark: string
  archiveTime: string
  archiveToStatus?: string
  archiveUserId: string
  archiveUserName: string
  barcode: string
  barcodeId: string
  createBy: string
  createTime: string
  curLocation: string
  decimalNumber: number
  displayLedgerStatus?: string
  displayRunningStatus?: string
  displayStatus: string
  extendedLife: number
  entityName: string
  id: string
  inspectionStatus: number
  ledgerStatus: string
  lifeSpan: number
  maintenanceStatus: number
  mroModelId: string
  mroModelVo: {
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
  mroNo: string
  mroStatus: number
  pendingUnarchiveMethod?: string
  pendingUnarchiveReason?: string
  pendingUnarchiveTaskId?: string
  pendingUnarchiveTaskNo?: string
  pendingUnarchiveTaskType?: string
  pendingUnarchiveTime?: string
  productionAreaDisplayName: string
  registerRecordId: string
  registerRecordNo: string
  remainingLife: number
  remarks: string
  repairStatus: number
  runningAlerts: string[]
  runningStatus: string
  runningStatusCode?: number
  stocks: number
  totalLife: number
  unarchiveFromStatus?: string
  unarchiveMethod?: string
  unarchiveReason?: string
  unarchiveRemark: string
  unarchiveTime: string
  unarchiveToStatus?: string
  unarchiveUserId: string
  unarchiveUserName: string
  updateBy: string
  usedLife: number
  updateTime: string
  warehouseId: string
  warehouseLocationId: string
  warehouseLocationName: string
  warehouseName: string
}

export interface IMroInfoBindBarcodeParams {
  id: string
  barcode: string
  autoGenerateCode: boolean
}

export interface IMroInfoLedgerActionParams {
  id: string
  method?: "offline_verify" | "maintenance" | "inspection"
  reason?: string
  remark?: string
}

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

export interface IMroInfoConfigSubmitParams {
  id: string
  mroItemType?: number
  data: Partial<{
    checkStandardValue: IInspectionStandard
    configDepartmentIds: string[]
    configFrequency: number
    configItemName: string
    configItemNo: string
    configType: number
    detectMethod: string
    executeDepartmentId: string
    executeDepartmentName: string
    executePositionId: string
    executePositionName: string
    fileDesc: string
    fileIds: string[]
    id: string
    methodRequire: string
    mroId: string
    mroItemType: number
    mroModelConfId: string
    ngDepartmentIds: string[]
    remarks: string
    verifyOrg: string
    verifyType: "count" | "day"
  }>[]
}

export interface IMroInfoConfigPageListParams
  extends IRequestPageParams<
    Partial<{
      configItemName: string
      mroId: string
      mroItemType: number
      mroModelConfId: string
    }>
  > {}

export interface IMroInfoConfigPageListItem {
  checkStandardValue: IInspectionStandard
  configDepartments: IDepartmentItem[]
  configFrequency: number
  configItemName: string
  configItemNo: string
  createBy: string
  createTime: string
  detectMethod?: string
  executeDepartmentId?: string
  executeDepartmentName?: string
  executePositionId?: string
  executePositionName?: string
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
    fileDesc?: string
    updateBy: string
    updateTime: string
    uploadTime?: string
    version: string
  }[]
  id: string
  methodRequire: string
  mroId: string
  mroItemType: number
  mroModelConfId: string
  maintenanceType?: "count" | "week"
  lastMaintenanceTime?: string
  lastMaintenanceCount?: number | null
  nextMaintenanceTime?: string
  nextMaintenanceCount?: number | null
  lastVerifyTime?: string
  lastVerifyCount?: number | null
  nextVerifyTime?: string
  nextVerifyCount?: number | null
  ngDepartments: IDepartmentItem[]
  remarks: string
  updateBy: string
  updateTime: string
  verifyOrg?: string
  verifyType?: "count" | "day"
}

export interface IMroInfoConfigTableRow {
  checkStandardValue: IInspectionStandard
  configFrequency: number
  configItemName: string
  configItemNo: string
  departmentPositionValue?: string[]
  detectMethod?: string
  executeDepartmentId?: string
  executeDepartmentName?: string
  executePositionId?: string
  executePositionName?: string
  fileDesc?: string
  id?: string
  lastMaintenanceTime?: string
  lastMaintenanceCount?: number | null
  nextMaintenanceTime?: string
  nextMaintenanceCount?: number | null
  lastVerifyTime?: string
  lastVerifyCount?: number | null
  nextVerifyTime?: string
  nextVerifyCount?: number | null
  maintenanceType?: "count" | "week"
  methodRequire?: string
  configDepartments?: IOption[]
  ngDepartments?: IOption[]
  files: IPhoto[]
  verifyOrg?: string
  verifyType?: "count" | "day"
}
