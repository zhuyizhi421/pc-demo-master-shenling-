import type { IRequestPageParams } from "@/types/common"

export type IEquipmentMaintenanceYearPlanMonthField =
  | "month1"
  | "month2"
  | "month3"
  | "month4"
  | "month5"
  | "month6"
  | "month7"
  | "month8"
  | "month9"
  | "month10"
  | "month11"
  | "month12"

export interface IEquipmentMaintenanceYearPlanDetailItem {
  equipmentId: string
  areaName: string
  equipmentNo: string
  equipmentName: string
  equipmentTypeNo: string
  equipmentTypeName: string
  month1: boolean
  month2: boolean
  month3: boolean
  month4: boolean
  month5: boolean
  month6: boolean
  month7: boolean
  month8: boolean
  month9: boolean
  month10: boolean
  month11: boolean
  month12: boolean
}

export type IEquipmentMaintenanceYearPlanPageParams = IRequestPageParams<
  Partial<{
    planName: string
    planYear: string
    status: number
  }>
>

export interface IEquipmentMaintenanceYearPlanPageItem {
  id: string
  planNo: string
  planYear: string
  planName: string
  status: number
  totalCount: number
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
  details: IEquipmentMaintenanceYearPlanDetailItem[]
}

export interface IEquipmentMaintenanceYearPlanSaveParams {
  id?: string
  planYear: string
  planName: string
  remarks: string
  details: IEquipmentMaintenanceYearPlanDetailItem[]
}

export interface IEquipmentMaintenanceYearPlanReviewParams {
  id: string
}

export interface IEquipmentMaintenanceYearPlanVoidParams {
  id: string
  voidReason: string
}
