import axios from "axios"

import type { IListPageResult, IResponse } from "@/types/common"
import type {
  IMroInspectionTaskItem,
  IMroInspectionTaskItemPageListParams,
  IMroInspectionTaskPageListItem,
  IMroInspectionTaskPageListParams,
  IMroInspectionTaskSubmitParams,
  IMroInspectionTaskVoidParams,
  IMroVerifyTaskAttachment,
  IMroVerifyTaskAttachmentInfo
} from "@/types/maintain/mro-manage/mro-verify-task"

// MRO校验任务单分页列表
export const queryMroInspectionTaskPageList = async (params: IMroInspectionTaskPageListParams) => {
  const res = await axios.post<IResponse<IListPageResult<IMroInspectionTaskPageListItem>>>(
    "/mroInspectionTask/page",
    params
  )
  return res.data.data
}

// MRO校验任务单详情
export const queryMroInspectionTaskDetail = async (id: string) => {
  const res = await axios.post<IResponse<IMroInspectionTaskPageListItem>>("/mroInspectionTask/id", {
    id
  })
  return res.data.data
}

// MRO校验任务单新增
export const requestCreateMroInspectionTask = async (params: IMroInspectionTaskSubmitParams) => {
  const res = await axios.post<IResponse<{ id: string }>>("/mroInspectionTask/create", params)
  return res.data.data
}

// MRO校验任务单编辑
export const requestUpdateMroInspectionTask = async (params: IMroInspectionTaskSubmitParams) => {
  const res = await axios.post<IResponse<{ id: string }>>("/mroInspectionTask/update", params)
  return res.data.data
}

// MRO校验任务单删除
export const requestDeleteMroInspectionTask = async (id: string) => {
  const res = await axios.post<IResponse<null>>("/mroInspectionTask/delete", { id })
  return res.data.data
}

// MRO校验任务单复核
export const requestCheckMroInspectionTask = async (params: { id: string; checkByName?: string }) => {
  const res = await axios.post<IResponse<null>>("/mroInspectionTask/check", params)
  return res.data.data
}

// MRO校验任务单作废
export const requestVoidMroInspectionTask = async (params: IMroInspectionTaskVoidParams) => {
  const res = await axios.post<IResponse<null>>("/mroInspectionTask/void", params)
  return res.data.data
}

// MRO校验任务下任务项分页列表
export const queryMroInspectionTaskItemPageList = async (
  params: IMroInspectionTaskItemPageListParams
) => {
  const res = await axios.post<IResponse<IListPageResult<IMroInspectionTaskItem>>>(
    "/mroInspectionTaskItem/page",
    params
  )
  return res.data.data
}

// MRO校验任务单中任务项详情
export const queryMroInspectionTaskItemDetail = async (id: string) => {
  const res = await axios.post<IResponse<IMroInspectionTaskItem>>("/mroInspectionTaskItem/id", {
    id
  })
  return res.data.data
}

// mro校验任务上传附件
export const requestUploadMroInspectionTaskAttachment = async (
  params: IMroVerifyTaskAttachment
) => {
  const res = await axios.put<IResponse>("/mroInspectionTask/attachment", params)
  return res.data.data
}

// mro校验任务附件查询
export const queryMroInspectionTaskAttachmentList = async (id: string) => {
  const res = await axios.get<IResponse<IMroVerifyTaskAttachmentInfo[]>>(
    `/mroInspectionTask/attachment/${id}`
  )
  const list = res.data.data
  return Array.isArray(list) ? list : []
}
