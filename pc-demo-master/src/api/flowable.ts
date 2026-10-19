import axios from "axios"

import type { IListPageResult, IResponse } from "@/types/common"
import type {
  IFlowableDefinitionItem,
  IFlowableDefinitionParams,
  IFlowableInstItem,
  IFlowableInstParams,
  IFlowAuditParams,
  IFlowAuditRejectParams,
  IFlowListParams,
  IFlowListResult
} from "@/types/personal/flow"

// 查询我的待办
export const queryFlowTodoList = async (params: IFlowListParams) => {
  const res = await axios.post<IResponse<IListPageResult<IFlowListResult>>>(
    "/flowable/task/todoList",
    params
  )
  return res.data.data
}

// 查询我的发起
export const queryFlowMyList = async (params: IFlowListParams) => {
  const res = await axios.post<IResponse<IListPageResult<IFlowListResult>>>(
    "/flowable/task/myProcess",
    params
  )
  return res.data.data
}

// 查询我的已办
export const queryFlowFinishedList = async (params: IFlowListParams) => {
  const res = await axios.post<IResponse<IListPageResult<IFlowListResult>>>(
    "/flowable/task/finishedList",
    params
  )
  return res.data.data
}

// 流程审批通过
export const queryFlowAuditPass = async (params: IFlowAuditParams) => {
  const res = await axios.post<IResponse>("/flowable/task/complete", params)
  return res.data.data
}

// 流程审批驳回
export const queryFlowAuditReject = async (params: IFlowAuditRejectParams) => {
  const res = await axios.post<IResponse>("/flowable/instance/stopProcess", params)
  return res.data.data
}

// 所有流程定义列表
export const requestFlowDefinitionList = async () => {
  const res = await axios.get<IResponse<IFlowableDefinitionItem[]>>("/flowable/definition/list")
  return res.data.data
}

export async function getFlowableDefinitionPaged(params: IFlowableDefinitionParams) {
  const res = await axios.get<IResponse<IListPageResult<IFlowableDefinitionItem>>>(
    "/flowable/definition/page",
    {
      params
    }
  )
  return res.data.data
}

export async function getFlowableDefinitionList() {
  const res = await axios.post<
    IResponse<{ processDefinitionName: string; processDefinitionId: string }[]>
  >("/flowable/definition/listProcDefName", {})
  return res.data.data
}

export async function getFlowableInstList(params: IFlowableInstParams) {
  const res = await axios.post<IResponse<IListPageResult<IFlowableInstItem>>>(
    "/flowable/instance/page",
    params
  )
  return res.data.data
}

export async function getFlowableInstById(id: string) {
  const res = await axios.get<IResponse<IFlowableInstItem>>(
    `/flowable/instance/${id}`
  )
  return res.data.data
}

interface ICreateFlowableDefineParams {
  category: string
  documentation: string
  key: string
  name: string
  processNodes: {
    assignee: {
      completionCondition?: string
      completionConditionType?: string
      data: string[]
      handlerList?: {
        id: string
        name: string
      }[]
      isMultiInstance: string
      userType: string
    }
    conditionExpression: string
    exclusive: {
      condition: string
      id: string
      userType: number
    }[]
    id: string
    name: string
    nextId: string[]
    skipExpression: string
    type: number
  }[]
  startNodeId: string
}

export type ICreateFlowableDefineProcessNodes = ICreateFlowableDefineParams["processNodes"][number]

export async function createFlowableDefine(params: Partial<ICreateFlowableDefineParams>) {
  const res = await axios.post<IResponse>("/flowable/definition/saveJson", params)
  return res.data.data
}
// /api/flowable/definition/getProcessJson
export async function getFlowableDefineInfo(params: { prcDefId?: string; procInstId?: string }) {
  const res = await axios.get<IResponse<any>>(`/flowable/definition/getProcessJson`, {
    params
  })
  return res.data.data
}

export async function deleteFlowableDefine(id: string) {
  const res = await axios.delete<IResponse>(`/flowable/definition/${id}`)
  return res.data.data
}

// 查询当前用户对当前流程是否有审批权限
// /api/flowable/task/{procInstId}/available
export async function getTaskAvailableExamByUser(procInstId: string) {
  const res = await axios.get<IResponse<string>>(
    `/flowable/task/${procInstId}/available`,
    {
    params: { procInstId }
    }
  )
  return res.data.data
}
