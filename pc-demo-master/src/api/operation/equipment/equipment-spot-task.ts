import axios from "axios"

import type { IListPageResult, IResponse } from "@/types/common"
import type {
  IEquipmentSpotTaskCreateParams,
  IEquipmentSpotTaskPageItem,
  IEquipmentSpotTaskPageParams,
  IEquipmentSpotTaskUpdateParams
} from "@/types/maintain/equipment-manage/equipment-spot-task"

export interface IEquipmentSpotTaskCheckParams {
  id: string
  checkByName?: string
}

export interface IEquipmentSpotTaskVoidParams {
  id: string
  reason?: string
  voidReason?: string
  voidByName?: string
}

// 设备点检任务分页
export const queryEquipmentSpotTaskPageList = async (params: IEquipmentSpotTaskPageParams) => {
  const res = await axios.post<IResponse<IListPageResult<IEquipmentSpotTaskPageItem>>>(
    "/equipmentSpotTask/page",
    params
  )
  return res.data.data
}

// 设备点检任务详情
export const queryEquipmentSpotTaskDetail = async (id: string) => {
  const res = await axios.post<IResponse<IEquipmentSpotTaskPageItem>>("/equipmentSpotTask/id", {
    id
  })
  return res.data.data
}

// 设备点检任务新增
export const requestCreateEquipmentSpotTask = async (params: IEquipmentSpotTaskCreateParams) => {
  const res = await axios.post<IResponse<{ id: string }>>("/equipmentSpotTask/create", params)
  return res.data.data
}

// 设备点检任务更新
export const requestUpdateEquipmentSpotTask = async (params: IEquipmentSpotTaskUpdateParams) => {
  const res = await axios.post<IResponse<{ id: string }>>("/equipmentSpotTask/update", params)
  return res.data.data
}

// 删除设备点检任务
export const requestDeleteEquipmentSpotTask = async (id: string) => {
  const res = await axios.post<IResponse>("/equipmentSpotTask/delete", { id })
  return res.data.data
}

// 复核设备点检任务
export const requestCheckEquipmentSpotTask = async (params: IEquipmentSpotTaskCheckParams) => {
  const res = await axios.post<IResponse>("/equipmentSpotTask/check", params)
  return res.data.data
}

// 作废设备点检任务
export const requestVoidEquipmentSpotTask = async (params: IEquipmentSpotTaskVoidParams) => {
  const res = await axios.post<IResponse>("/equipmentSpotTask/void", params)
  return res.data.data
}
