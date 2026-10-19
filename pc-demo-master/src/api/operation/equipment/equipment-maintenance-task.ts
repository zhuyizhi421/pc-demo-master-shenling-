import axios from "axios"

import type { IListPageResult, IResponse } from "@/types/common"
import type {
  IEquipmentMaintenanceTaskCreateParams,
  IEquipmentMaintenanceTaskPageItem,
  IEquipmentMaintenanceTaskPageParams,
  IEquipmentMaintenanceTaskUpdateParams
} from "@/types/maintain/equipment-manage/equipment-maintenance-task"

export interface IEquipmentMaintenanceTaskSaveItem {
  id?: string
  equipmentConfigId?: string
  maintenanceName: string
  maintenanceNo: string
  practicalValue?: string
  maintenanceResult?: number
  remarks?: string
  remarkFileIds?: string[]
}

export interface IEquipmentMaintenanceTaskSaveParams {
  id?: string
  equipmentId: string
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
  items?: IEquipmentMaintenanceTaskSaveItem[]
  maintenanceConfigIds?: string[]
  maintenanceTypeId?: string
  maintenanceTypeName?: string
}

export interface IEquipmentMaintenanceTaskCheckParams {
  id: string
  checkByName?: string
}

export interface IEquipmentMaintenanceTaskVoidParams {
  id: string
  reason?: string
  voidReason?: string
  voidByName?: string
}

// 设备保养任务单分页列表
export const queryEquipmentMaintenanceTaskPageList = async (
  params: IEquipmentMaintenanceTaskPageParams
) => {
  const res = await axios.post<IResponse<IListPageResult<IEquipmentMaintenanceTaskPageItem>>>(
    "/equipmentMaintenanceTask/page",
    params
  )
  return res.data.data
}

// 设备保养任务单详情
export const queryEquipmentMaintenanceTaskDetail = async (id: string) => {
  const res = await axios.post<IResponse<IEquipmentMaintenanceTaskPageItem>>(
    "/equipmentMaintenanceTask/id",
    { id }
  )
  return res.data.data
}

// 设备保养任务单新建
export const requestCreateEquipmentMaintenanceTask = async (
  params: IEquipmentMaintenanceTaskCreateParams
) => {
  const res = await axios.post<IResponse<{ id: string }>>("/equipmentMaintenanceTask/create", params)
  return res.data.data
}

// 设备保养任务单更新
export const requestUpdateEquipmentMaintenanceTask = async (
  params: IEquipmentMaintenanceTaskUpdateParams
) => {
  const res = await axios.post<IResponse<{ id: string }>>("/equipmentMaintenanceTask/update", params)
  return res.data.data
}

// 删除设备保养任务单
export const requestDeleteEquipmentMaintenanceTask = async (id: string) => {
  const res = await axios.post<IResponse>("/equipmentMaintenanceTask/delete", { id })
  return res.data.data
}

// 复核设备保养任务单
export const requestCheckEquipmentMaintenanceTask = async (
  params: IEquipmentMaintenanceTaskCheckParams
) => {
  const res = await axios.post<IResponse>("/equipmentMaintenanceTask/check", params)
  return res.data.data
}

// 作废设备保养任务单
export const requestVoidEquipmentMaintenanceTask = async (
  params: IEquipmentMaintenanceTaskVoidParams
) => {
  const res = await axios.post<IResponse>("/equipmentMaintenanceTask/void", params)
  return res.data.data
}
