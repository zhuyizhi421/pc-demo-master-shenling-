import axios from "axios"

import type { IListPageResult } from "@/types/common"
import type { IAndonModelItem, IAndonModelParams } from "@/types/maintain/andon"

import type { IRes } from "../../interceptor"

export enum BindType {
  FaultType = 1,
  Fault = 2
}

interface andonModelCreateInter {
  alarmModelId?: string
  andonName?: string
  andonNo?: string
  bindFaultVOList?: {
    bindType?: BindType
    faultCategoryId?: number
    faultCategoryName?: string
    faultId?: string
    faultName?: string
    faultNo?: string
  }[]
  categoryId?: string
  handlerIds?: string[]
  handlerType?: number
  isAutoConfirm?: boolean
  needAlarmModel?: boolean
  needFeedback?: boolean
  remarks?: string
}

// 新建Andon模型
export async function createAndonModel(params: andonModelCreateInter) {
  const res = await axios.post<IRes>("/andon/model/create", params, {
    headers: { "Content-Type": "application/json" }
  })
  return res.data.data
}

// 删除Andon模型
export async function deleteAndonModel(id: string) {
  const res = await axios.delete<IRes>(`/andon/model/delete`, { params: { id } })
  return res.data.data
}

// 通过ID查询单个Andon模型详细信息(包含关联故障)
export async function queryAndonModelDetail(id: string) {
  const res = await axios.get<IRes>(`/andon/model/getAndonById`, {
    params: { id }
  })
  return res.data.data
}

// (分页)查询Andon模型列表
export async function getAndonModelListPaged(params: IAndonModelParams) {
  const res = await axios.get<IRes<IListPageResult<IAndonModelItem>>>(`/andon/model/listPaged`, {
    params
  })
  return res.data.data
}

// 修改Andon模型
export async function updateAndonModel(params: andonModelCreateInter & { id: string }) {
  const res = await axios.put<IRes<null>>("/andon/model/update", params)
  return res.data.data
}

// 修改Andon模型启用状态
export async function updateEnabledStatusAndonModel(params: {
  id: string
  newEnabledStatus?: boolean
}) {
  const res = await axios.put<IRes<null>>("/andon/model/updateEnabledStatus", null, { params })
  return res.data.data
}

function asCascadeTree(data: unknown): any[] {
  if (Array.isArray(data)) return data
  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>
    if (Array.isArray(o.list)) return o.list as any[]
    if (Array.isArray(o.records)) return o.records as any[]
    if (Array.isArray(o.tree)) return o.tree as any[]
    if (Array.isArray(o.andonTreeNodeList)) return o.andonTreeNodeList as any[]
  }
  return []
}

// 【级联选择器】获取Andon模型级联树形结构
export async function getAndonCascadeTree() {
  const res = await axios.get<IRes<any>>(`/andon/model/getAndonCascadeTree`)
  return asCascadeTree(res.data.data)
}
