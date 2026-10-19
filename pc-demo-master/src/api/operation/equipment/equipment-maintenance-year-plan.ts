import axios from "axios"

import type { IListPageResult, IResponse } from "@/types/common"
import type {
  IEquipmentMaintenanceYearPlanPageItem,
  IEquipmentMaintenanceYearPlanPageParams,
  IEquipmentMaintenanceYearPlanReviewParams,
  IEquipmentMaintenanceYearPlanSaveParams,
  IEquipmentMaintenanceYearPlanVoidParams
} from "@/types/maintain/equipment-manage/equipment-maintenance-year-plan"

// 设备保养年计划分页列表
export const queryEquipmentMaintenanceYearPlanPageList = async (
  params: IEquipmentMaintenanceYearPlanPageParams
) => {
  const res = await axios.post<IResponse<IListPageResult<IEquipmentMaintenanceYearPlanPageItem>>>(
    "/equipmentMaintenanceYearPlan/page",
    params
  )
  return res.data.data
}

// 设备保养年计划详情
export const queryEquipmentMaintenanceYearPlanDetail = async (id: string) => {
  const res = await axios.post<IResponse<IEquipmentMaintenanceYearPlanPageItem>>(
    "/equipmentMaintenanceYearPlan/id",
    { id }
  )
  return res.data.data
}

// 设备保养年计划新建
export const requestCreateEquipmentMaintenanceYearPlan = async (
  params: IEquipmentMaintenanceYearPlanSaveParams
) => {
  const res = await axios.post<IResponse<{ id: string }>>(
    "/equipmentMaintenanceYearPlan/save",
    params
  )
  return res.data.data
}

// 设备保养年计划更新
export const requestUpdateEquipmentMaintenanceYearPlan = async (
  params: IEquipmentMaintenanceYearPlanSaveParams
) => {
  const res = await axios.post<IResponse<{ id: string }>>(
    "/equipmentMaintenanceYearPlan/update",
    params
  )
  return res.data.data
}

// 设备保养年计划删除
export const requestDeleteEquipmentMaintenanceYearPlan = async (id: string) => {
  const res = await axios.post<IResponse>("/equipmentMaintenanceYearPlan/delete", { id })
  return res.data.data
}

// 设备保养年计划复核
export const requestReviewEquipmentMaintenanceYearPlan = async (
  params: IEquipmentMaintenanceYearPlanReviewParams
) => {
  const res = await axios.post<IResponse>("/equipmentMaintenanceYearPlan/review", params)
  return res.data.data
}

// 设备保养年计划作废
export const requestVoidEquipmentMaintenanceYearPlan = async (
  params: IEquipmentMaintenanceYearPlanVoidParams
) => {
  const res = await axios.post<IResponse>("/equipmentMaintenanceYearPlan/void", params)
  return res.data.data
}
