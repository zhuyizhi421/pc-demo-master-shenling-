import axios from "axios"

import type { IListPageResult, IResponse } from "@/types/common"
import type {
  IMroVerifyExceptionTaskAssignResponsibleParams,
  IMroVerifyExceptionTaskFeedBackParams,
  IMroVerifyExceptionTaskPageListItem,
  IMroVerifyExceptionTaskPageListParams
} from "@/types/maintain/mro-manage/mro-verify-exception-task"

// Mro异常工单分页列表
export const queryMroVerifyExceptionTaskPageList = async (
  params: IMroVerifyExceptionTaskPageListParams
) => {
  const res = await axios.post<IResponse<IListPageResult<IMroVerifyExceptionTaskPageListItem>>>(
    "/mroExceptionTask/page",
    params
  )
  return res.data.data
}

// Mro异常处理单详情
export const queryMroVerifyExceptionTaskDetail = async (params: { id: string }) => {
  const res = await axios.post<IResponse<IMroVerifyExceptionTaskPageListItem>>(
    "/mroExceptionTask/id",
    params
  )
  return res.data.data
}

// Mro异常处理单反馈
export const requestFeedbackMroVerifyExceptionTask = async (
  params: IMroVerifyExceptionTaskFeedBackParams
) => {
  const res = await axios.post<IResponse>("/mroExceptionTask/feedback", params)
  return res.data.data
}

// Mro异常工单指派责任人
export const requestAssignResponsibleMroExceptionTask = async (
  params: IMroVerifyExceptionTaskAssignResponsibleParams
) => {
  const res = await axios.post<IResponse>("/mroExceptionTask/assignResponsible", params)
  return res.data.data
}
