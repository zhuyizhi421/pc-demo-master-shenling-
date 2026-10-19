import axios from "axios"

import type { IListPageResult, IResponse } from "@/types/common"
import type {
  IMroMaintenanceTaskItem,
  IMroMaintenanceTaskItemPageListParams,
  IMroMaintenanceTaskPageListItem,
  IMroMaintenanceTaskPageListParams
} from "@/types/maintain/mro-manage/mro-maintenance-task"

export interface IMroMaintenanceTaskSaveItem {
  id?: string
  mroItemConfigId?: string
  maintenanceName: string
  maintenanceNo: string
  practicalValue?: string
  maintenanceResult?: number
  remarks?: string
  remarkFileIds?: string[]
}

export interface IMroMaintenanceTaskSaveParams {
  id?: string
  mroInformationId: string
  mroModelId: string
  mroNo: string
  taskSource: string
  executePosition: string
  planStartTime: string
  remarks?: string
  items: IMroMaintenanceTaskSaveItem[]
}

// MRO保养任务单分页列表
export const queryMroMaintenanceTaskPageList = async (
  params: IMroMaintenanceTaskPageListParams
) => {
  const res = await axios.post<IResponse<IListPageResult<IMroMaintenanceTaskPageListItem>>>(
    "/mroMaintenanceTask/page",
    params
  )
  return res.data.data
}

// MRO保养任务单详情
export const queryMroMaintenanceTaskDetail = async (id: string) => {
  const res = await axios.post<IResponse<IMroMaintenanceTaskPageListItem>>(
    "/mroMaintenanceTask/id",
    { id }
  )
  return res.data.data
}

// MRO保养任务单下保养项分页列表
export const queryMroMaintenanceTaskItemPageList = async (
  params: IMroMaintenanceTaskItemPageListParams
) => {
  const res = await axios.post<IResponse<IListPageResult<IMroMaintenanceTaskItem>>>(
    "/mroMaintenanceTaskItem/page",
    params
  )
  return res.data.data
}

// MRO保养任务单下保养项详情
export const queryMroMaintenanceTaskItemDetail = async (id: string) => {
  const res = await axios.post<IResponse<IMroMaintenanceTaskItem>>("/mroMaintenanceTaskItem/id", {
    id
  })
  return res.data.data
}

// 新增保养任务单
export const requestCreateMroMaintenanceTask = async (params: IMroMaintenanceTaskSaveParams) => {
  const res = await axios.post<IResponse<{ id: string }>>("/mroMaintenanceTask/create", params)
  return res.data.data
}

// 编辑保养任务单
export const requestUpdateMroMaintenanceTask = async (params: IMroMaintenanceTaskSaveParams) => {
  const res = await axios.post<IResponse<{ id: string }>>("/mroMaintenanceTask/update", params)
  return res.data.data
}

// 删除保养任务单
export const requestDeleteMroMaintenanceTask = async (id: string) => {
  const res = await axios.post<IResponse>("/mroMaintenanceTask/delete", { id })
  return res.data.data
}

export interface IMroMaintenanceTaskCheckParams {
  id: string
  checkByName?: string
}

// 复核保养任务单
export const requestCheckMroMaintenanceTask = async (
  params: IMroMaintenanceTaskCheckParams
) => {
  const res = await axios.post<IResponse>("/mroMaintenanceTask/check", params)
  return res.data.data
}

export interface IMroMaintenanceTaskVoidParams {
  id: string
  reason?: string
  voidReason?: string
  voidByName?: string
}

export interface IMroMaintenanceTaskStartParams {
  id: string
  startByName?: string
}

export interface IMroMaintenanceTaskCompleteParams {
  id: string
  completeByName?: string
}

// 作废保养任务单
export const requestVoidMroMaintenanceTask = async (params: IMroMaintenanceTaskVoidParams) => {
  const res = await axios.post<IResponse>("/mroMaintenanceTask/void", params)
  return res.data.data
}

// 保养任务单开始执行
export const requestStartMroMaintenanceTask = async (params: IMroMaintenanceTaskStartParams) => {
  const res = await axios.post<IResponse>("/mroMaintenanceTask/start", params)
  return res.data.data
}

// 保养任务单完成
export const requestCompleteMroMaintenanceTask = async (
  params: IMroMaintenanceTaskCompleteParams
) => {
  const res = await axios.post<IResponse>("/mroMaintenanceTask/complete", params)
  return res.data.data
}
