import axios from "axios"

import type { IListPageResult, IResponse } from "@/types/common"
import type {
  IEquipmentPatrolTaskCreateParams,
  IEquipmentPatrolTaskPageItem,
  IEquipmentPatrolTaskPageParams,
  IEquipmentPatrolTaskUpdateParams
} from "@/types/maintain/equipment-manage/equipment-patrol-task"

export interface IEquipmentPatrolTaskCheckParams {
  id: string
  checkByName?: string
}

export interface IEquipmentPatrolTaskVoidParams {
  id: string
  reason?: string
  voidReason?: string
  voidByName?: string
}

// 设备巡检任务分页
export const queryEquipmentPatrolTaskPageList = async (params: IEquipmentPatrolTaskPageParams) => {
  const res = await axios.post<IResponse<IListPageResult<IEquipmentPatrolTaskPageItem>>>(
    "/equipmentPatrolTask/page",
    params
  )
  return res.data.data
}

// 设备巡检任务详情
export const queryEquipmentPatrolTaskDetail = async (id: string) => {
  const res = await axios.post<IResponse<IEquipmentPatrolTaskPageItem>>("/equipmentPatrolTask/id", {
    id
  })
  return res.data.data
}

// 设备巡检任务新增
export const requestCreateEquipmentPatrolTask = async (
  params: IEquipmentPatrolTaskCreateParams
) => {
  const res = await axios.post<IResponse<{ id: string }>>("/equipmentPatrolTask/create", params)
  return res.data.data
}

// 设备巡检任务更新
export const requestUpdateEquipmentPatrolTask = async (
  params: IEquipmentPatrolTaskUpdateParams
) => {
  const res = await axios.post<IResponse<{ id: string }>>("/equipmentPatrolTask/update", params)
  return res.data.data
}

// 删除设备巡检任务
export const requestDeleteEquipmentPatrolTask = async (id: string) => {
  const res = await axios.post<IResponse>("/equipmentPatrolTask/delete", { id })
  return res.data.data
}

// 复核设备巡检任务
export const requestCheckEquipmentPatrolTask = async (params: IEquipmentPatrolTaskCheckParams) => {
  const res = await axios.post<IResponse>("/equipmentPatrolTask/check", params)
  return res.data.data
}

// 作废设备巡检任务
export const requestVoidEquipmentPatrolTask = async (params: IEquipmentPatrolTaskVoidParams) => {
  const res = await axios.post<IResponse>("/equipmentPatrolTask/void", params)
  return res.data.data
}
