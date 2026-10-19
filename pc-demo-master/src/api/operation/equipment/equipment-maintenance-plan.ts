import axios from "axios"

import type { IListPageResult, IResponse } from "@/types/common"
import type {
  IEquipmentMaintenanceMonthPlanPageItem,
  IEquipmentMaintenanceMonthPlanPageParams,
  IEquipmentMaintenanceMonthPlanReviewParams,
  IEquipmentMaintenanceMonthPlanSaveParams,
  IEquipmentMaintenanceMonthPlanSplitParams,
  IEquipmentMaintenanceMonthPlanSplitPreviewItem,
  IEquipmentMaintenanceMonthPlanSplitPreviewParams,
  IEquipmentMaintenanceMonthPlanVoidParams
} from "@/types/maintain/equipment-manage/equipment-maintenance-month-plan"

// 设备保养月计划分页列表
export const queryEquipmentMaintenancePlanPageList = async (
  params: IEquipmentMaintenanceMonthPlanPageParams
) => {
  const res = await axios.post<IResponse<IListPageResult<IEquipmentMaintenanceMonthPlanPageItem>>>(
    "/equipmentMaintenancePlan/page",
    params
  )
  return res.data.data
}

// 设备保养月计划详情
export const queryEquipmentMaintenancePlanDetail = async (id: string) => {
  const res = await axios.post<IResponse<IEquipmentMaintenanceMonthPlanPageItem>>(
    "/equipmentMaintenancePlan/id",
    { id }
  )
  return res.data.data
}

// 年计划拆分月计划预览
export const previewEquipmentMaintenancePlanSplit = async (
  params: IEquipmentMaintenanceMonthPlanSplitPreviewParams
) => {
  const res = await axios.post<IResponse<IEquipmentMaintenanceMonthPlanSplitPreviewItem[]>>(
    "/equipmentMaintenancePlan/previewSplit",
    params
  )
  return res.data.data
}

// 年计划手动拆分月计划
export const requestSplitEquipmentMaintenancePlan = async (
  params: IEquipmentMaintenanceMonthPlanSplitParams
) => {
  const res = await axios.post<IResponse>("/equipmentMaintenancePlan/splitFromYearPlan", params)
  return res.data.data
}

// 设备保养月计划更新
export const requestUpdateEquipmentMaintenancePlan = async (
  params: IEquipmentMaintenanceMonthPlanSaveParams
) => {
  const res = await axios.post<IResponse>("/equipmentMaintenancePlan/update", params)
  return res.data.data
}

// 设备保养月计划删除
export const requestDeleteEquipmentMaintenancePlan = async (id: string) => {
  const res = await axios.post<IResponse>("/equipmentMaintenancePlan/delete", { id })
  return res.data.data
}

// 设备保养月计划复核
export const requestReviewEquipmentMaintenancePlan = async (
  params: IEquipmentMaintenanceMonthPlanReviewParams
) => {
  const res = await axios.post<IResponse>("/equipmentMaintenancePlan/review", params)
  return res.data.data
}

// 设备保养月计划作废
export const requestVoidEquipmentMaintenancePlan = async (
  params: IEquipmentMaintenanceMonthPlanVoidParams
) => {
  const res = await axios.post<IResponse>("/equipmentMaintenancePlan/void", params)
  return res.data.data
}
