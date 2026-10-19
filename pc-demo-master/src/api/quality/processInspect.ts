import axios from "axios"

import type { IListPageResult } from "@/types/common"
import type {
  AttachmentModel,
  IInspectionObjectTableRow,
  IProcessInspectListItem,
  IProcessInspectSample,
  IProcessInspectSearchParams,
  UploadAttachmentModel
} from "@/types/quality-manage/inspection-task"

import type { IRes } from "../interceptor"

/** 查询【过程检-样本结果页】面板详情 */
export async function queryProcessInspectSampleResultPanelDetail(params: { taskId: string }) {
  const res = await axios.get<IRes<IProcessInspectSample[]>>(
    `/pc/qa/inspectTask/process/getPCProcessInspectSampleResultPanelNeedInfo`,
    {
      params
    }
  )
  return res.data.data
}

/** 查询【过程检】检验任务详情*/
export const queryProcessInspectTaskDetail = async (params: { taskId: string }) => {
  const res = await axios.get<IRes<IProcessInspectListItem>>(
    `/pc/qa/inspectTask/process/getInspectTaskDetailById`,
    {
      params
    }
  )
  return res.data.data
}

/** 查询【过程检】检验任务记录(分页) */
export const queryProcessInspectTaskList = async (params: IProcessInspectSearchParams) => {
  const res = await axios.post<IRes<IListPageResult<IProcessInspectListItem>>>(
    `/pc/qa/inspectTask/process/getInspectTaskListPaged`,
    params
  )
  return res.data.data
}

/** 查询【附件】详情 */
export async function queryProcessInspectAttachmentList(params: { taskId: string }) {
  const res = await axios.get<IRes<AttachmentModel[]>>(`/pc/qa/inspectTask/attachment/list`, {
    params
  })
  return res.data.data
}

export async function uploadAttachmentFile(params: UploadAttachmentModel) {
  const res = await axios.post<IRes>(`/pc/qa/inspectTask/attachment/upload`, params)
  return res.data.data
}

// 获取检验对象
export async function getInspectInstancesById(id: string) {
  const res = await axios.get<IRes<IInspectionObjectTableRow[]>>(
    `/pc/qa/inspectTask/getInspectInstancesById/${id}`
  )
  return res.data.data
}
