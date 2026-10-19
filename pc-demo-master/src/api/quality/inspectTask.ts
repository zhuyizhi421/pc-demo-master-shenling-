import axios from "axios"

import type { IListPageResult, IResponse } from "@/types/common"
import type {
  INonProcessInspectItem,
  INonProcessInspectSearchParams,
  IProcessInspectSample,
  ITaskProductItem
} from "@/types/quality-manage/inspection-task"

import type { IRes } from "../interceptor"

// 非过程检

// 回显【样本结果页】面板所需信息
export async function getPCInspectSampleResultPanelNeedInfo(params: { taskId: string }) {
  const res = await axios.get<IRes<IProcessInspectSample[]>>(
    `/pc/qa/inspectTask/listTaskSampleAndSampleItemByTaskId`,
    {
      params
    }
  )
  return res.data.data
}

// 通过任务ID查看【非过程检】任务详情
export async function getPCInspectTaskDetailById(params: { taskId: string }) {
  const res = await axios.get<IRes<INonProcessInspectItem>>(
    `/pc/qa/inspectTask/getInspectTaskDetailById`,
    {
      params
    }
  )
  return res.data.data
}

// 根据任务ID回显检验对象(即关联的产品实例)
export async function getTaskProductByTaskId(params: { taskId: string }) {
  const res = await axios.get<IRes<ITaskProductItem[]>>(
    `/pc/qa/inspectTask/getTaskProductByTaskId`,
    {
      params
    }
  )
  return res.data.data
}

export interface PCInspectTaskListInter {
  pageNum?: number
  pageSize?: number
  createTimeEnd?: string
  createTimeStart?: string
  dispatcherTaskCode?: string
  id?: string
  inspectTaskNo?: string
  inspectType?: string // 1-首检、2-巡检、3-末检、4-采购入库检、5-生产入库检、6-发货出库检、7-退货入库检、8-EPC全检
  bizCode?: string
  taskResult?: string // 0-结果未出 1-通过 2-不通过
  taskStatus?: string // 1-未开始 2-进行中 3-已完结
  workstationIdList?: string
}

// 查询【非过程检】检验任务记录(分页)
export async function queryNoNInspectTaskList(params: INonProcessInspectSearchParams) {
  const res = await axios.post<IRes<IListPageResult<INonProcessInspectItem>>>(
    `/pc/qa/inspectTask/getPCInspectTaskListPaged`,
    params
  )
  return res.data.data
}

export const closeInspectTask = async (params: { taskId: string }) => {
  const res = await axios.post<IResponse>("/pc/qa/inspectTask/process/close", params)
  return res.data.data
}

export const resumeInspectTask = async (params: { taskId: string }) => {
  const res = await axios.post<IResponse>("/pc/qa/inspectTask/process/resume", params)
  return res.data.data
}
