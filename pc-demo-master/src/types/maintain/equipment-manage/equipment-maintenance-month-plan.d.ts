import type { IRequestPageParams } from "@/types/common"

export interface IEquipmentMaintenanceMonthPlanDetailItem {
  equipmentId: string
  equipmentNo: string
  equipmentName: string
  equipmentTypeNo: string
  equipmentTypeName: string
}

export interface IEquipmentMaintenanceMonthPlanWeekSplitStateItem {
  naturalWeekLabel: string
  planStartDate: string
  planEndDate: string
  processStatus: string
  weekPlanId: string
  weekPlanNo: string
}

export interface IEquipmentMaintenanceMonthPlanPageItem {
  id: string
  planNo: string
  planMonth: string
  planName: string
  areaName: string
  sourceType: string
  sourceYearPlanId: string
  sourceYearPlanNo: string
  sourceYearPlanName: string
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
  details: IEquipmentMaintenanceMonthPlanDetailItem[]
  weekSplitStates?: IEquipmentMaintenanceMonthPlanWeekSplitStateItem[]
}

export type IEquipmentMaintenanceMonthPlanPageParams = IRequestPageParams<
  Partial<{
    planMonth: string
    areaName: string
    planName: string
    status: number
    sourceYearPlanNo: string
  }>
>

export interface IEquipmentMaintenanceMonthPlanSaveParams {
  id: string
  remarks: string
  details: IEquipmentMaintenanceMonthPlanDetailItem[]
}

export interface IEquipmentMaintenanceMonthPlanReviewParams {
  id: string
}

export interface IEquipmentMaintenanceMonthPlanVoidParams {
  id: string
  voidReason: string
}

export interface IEquipmentMaintenanceMonthPlanSplitPreviewParams {
  yearPlanId: string
  planMonth: string
}

export interface IEquipmentMaintenanceMonthPlanSplitPreviewItem {
  areaName: string
  equipmentCount: number
  planName: string
}

export interface IEquipmentMaintenanceMonthPlanSplitParams {
  yearPlanId: string
  planMonth: string
}
