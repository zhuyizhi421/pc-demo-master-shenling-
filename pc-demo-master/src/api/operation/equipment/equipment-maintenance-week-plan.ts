import axios from "axios"

import type { IListPageResult, IResponse } from "@/types/common"
import type {
  IEquipmentMaintenanceWeekPlanPageItem,
  IEquipmentMaintenanceWeekPlanPageParams,
  IEquipmentMaintenanceWeekPlanReviewParams,
  IEquipmentMaintenanceWeekPlanSaveParams,
  IEquipmentMaintenanceWeekPlanSplitParams,
  IEquipmentMaintenanceWeekPlanSplitPreviewItem,
  IEquipmentMaintenanceWeekPlanSplitPreviewParams,
  IEquipmentMaintenanceWeekPlanVoidParams
} from "@/types/maintain/equipment-manage/equipment-maintenance-week-plan"

export const queryEquipmentMaintenanceWeekPlanPageList = async (
  params: IEquipmentMaintenanceWeekPlanPageParams
) => {
  const res = await axios.post<IResponse<IListPageResult<IEquipmentMaintenanceWeekPlanPageItem>>>(
    "/equipmentMaintenanceWeekPlan/page",
    params
  )
  return res.data.data
}

export const queryEquipmentMaintenanceWeekPlanDetail = async (id: string) => {
  const res = await axios.post<IResponse<IEquipmentMaintenanceWeekPlanPageItem>>(
    "/equipmentMaintenanceWeekPlan/id",
    { id }
  )
  return res.data.data
}

export const previewEquipmentMaintenanceWeekPlanSplit = async (
  params: IEquipmentMaintenanceWeekPlanSplitPreviewParams
) => {
  const res = await axios.post<IResponse<IEquipmentMaintenanceWeekPlanSplitPreviewItem[]>>(
    "/equipmentMaintenanceWeekPlan/previewSplitFromMonthPlan",
    params
  )
  return res.data.data
}

export const requestSplitEquipmentMaintenanceWeekPlan = async (
  params: IEquipmentMaintenanceWeekPlanSplitParams
) => {
  const res = await axios.post<IResponse>("/equipmentMaintenanceWeekPlan/splitFromMonthPlan", params)
  return res.data.data
}

export const requestUpdateEquipmentMaintenanceWeekPlan = async (
  params: IEquipmentMaintenanceWeekPlanSaveParams
) => {
  const res = await axios.post<IResponse>("/equipmentMaintenanceWeekPlan/update", params)
  return res.data.data
}

export const requestDeleteEquipmentMaintenanceWeekPlan = async (id: string) => {
  const res = await axios.post<IResponse>("/equipmentMaintenanceWeekPlan/delete", { id })
  return res.data.data
}

export const requestReviewEquipmentMaintenanceWeekPlan = async (
  params: IEquipmentMaintenanceWeekPlanReviewParams
) => {
  const res = await axios.post<IResponse>("/equipmentMaintenanceWeekPlan/review", params)
  return res.data.data
}

export const requestVoidEquipmentMaintenanceWeekPlan = async (
  params: IEquipmentMaintenanceWeekPlanVoidParams
) => {
  const res = await axios.post<IResponse>("/equipmentMaintenanceWeekPlan/void", params)
  return res.data.data
}
