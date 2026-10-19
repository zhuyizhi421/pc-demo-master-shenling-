import type { IRequestPageParams } from "@/types/common"

export interface IEquipmentMaintenanceWeekPlanSourceItem {
  sourceMonthPlanId: string
  sourceMonthPlanNo: string
  sourceMonthPlanName: string
  sourcePlanMonth: string
}

export interface IEquipmentMaintenanceWeekPlanDetailItem {
  equipmentId: string
  equipmentNo: string
  equipmentName: string
  equipmentTypeNo: string
  equipmentTypeName: string
  maintenanceTypeId: string
  maintenanceTypeName: string
  executionDate: string
  remarks: string
}

export interface IEquipmentMaintenanceWeekPlanPageItem {
  id: string
  planNo: string
  naturalWeekLabel: string
  planStartDate: string
  planEndDate: string
  planName: string
  areaName: string
  sourceType: string
  defaultMaintenanceTypeId: string
  defaultMaintenanceTypeName: string
  totalCount: number
  status: number
  remarks: string
  createBy: string
  createTime: string
  updateBy: string
  updateTime: string
  reviewBy?: string
  reviewTime?: string
  voidBy?: string
  voidTime?: string
  voidReason?: string
  sourceMonthPlanNos?: string
  sourcePlans: IEquipmentMaintenanceWeekPlanSourceItem[]
  details: IEquipmentMaintenanceWeekPlanDetailItem[]
}

export type IEquipmentMaintenanceWeekPlanPageParams = IRequestPageParams<
  Partial<{
    naturalWeekLabel: string
    planStartDateFrom: string
    planStartDateTo: string
    areaName: string
    planName: string
    status: number
    sourceMonthPlanNo: string
  }>
>

export interface IEquipmentMaintenanceWeekPlanSaveParams {
  id: string
  defaultMaintenanceTypeId: string
  defaultMaintenanceTypeName?: string
  remarks: string
  details: IEquipmentMaintenanceWeekPlanDetailItem[]
}

export interface IEquipmentMaintenanceWeekPlanReviewParams {
  id: string
}

export interface IEquipmentMaintenanceWeekPlanVoidParams {
  id: string
  voidReason: string
}

export interface IEquipmentMaintenanceWeekPlanSplitPreviewParams {
  monthPlanId: string
}

export interface IEquipmentMaintenanceWeekPlanSplitPreviewItem {
  naturalWeekLabel: string
  planStartDate: string
  planEndDate: string
  planName: string
  equipmentCount: number
  actionType: string
  processStatus: string
  processStatusLabel: string
  submitAction: string
  canSelectAction: boolean
  weekPlanId?: string
  weekPlanNo?: string
}

export interface IEquipmentMaintenanceWeekPlanSplitActionItem {
  planStartDate: string
  planEndDate: string
  action: string
}

export interface IEquipmentMaintenanceWeekPlanSplitParams {
  monthPlanId: string
  weekActions: IEquipmentMaintenanceWeekPlanSplitActionItem[]
}
