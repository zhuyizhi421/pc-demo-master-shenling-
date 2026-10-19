import axios from "axios"

import type { IListPageResult } from "@/types/common"
import type { IResponse } from "@/types/common"
import type {
  IMroRepairAssignResponsibleParams,
  IMroRepairCreateParams,
  IMroRepairFeedBackParams,
  IMroRepairPageListItem,
  IMroRepairPageListParams,
  IMroRepairReviewParams,
  IMroRepairUpdateParams
} from "@/types/maintain/mro-manage/mro-repair"

// MRO维修分页列表
export const queryMroRepairPageList = async (params: IMroRepairPageListParams) => {
  const res = await axios.post<IResponse<IListPageResult<IMroRepairPageListItem>>>(
    "/mroRepair/page",
    params
  )
  return res.data.data
}

// MRO维修详情
export const queryMroRepairDetail = async (id: string) => {
  const res = await axios.post<IResponse<IMroRepairPageListItem>>("/mroRepair/id", { id })
  return res.data.data
}

// 新建MRO维修
export const requestCreateMroRepair = async (params: IMroRepairCreateParams) => {
  const res = await axios.post<IResponse>("/mroRepair/save", params)
  return res.data.data
}

// MRO维修结果登记
export const requestMroRepairFeedback = async (params: IMroRepairFeedBackParams) => {
  const res = await axios.post<IResponse>("/mroRepair/feedback", params)
  return res.data.data
}

// 编辑维修单（仅未复核且手动创建）
export const requestUpdateMroRepair = async (params: IMroRepairUpdateParams) => {
  const res = await axios.post<IResponse>("/mroRepair/update", params)
  return res.data.data
}

// 删除维修单（仅未复核且手动创建）
export const requestDeleteMroRepair = async (params: { id: string }) => {
  const res = await axios.post<IResponse>("/mroRepair/delete", params)
  return res.data.data
}

// 维修单复核（未复核 -> 待维修）
export const requestReviewMroRepair = async (params: IMroRepairReviewParams) => {
  const res = await axios.post<IResponse>("/mroRepair/review", params)
  return res.data.data
}

// 指派责任人（待维修）
export const requestAssignResponsibleMroRepair = async (
  params: IMroRepairAssignResponsibleParams
) => {
  const res = await axios.post<IResponse>("/mroRepair/assignResponsible", params)
  return res.data.data
}
