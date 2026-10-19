import axios from "axios"

import type { IListPageResult } from "@/types/common"
import type { IFlawListItem, IFlawListParams } from "@/types/quality-manage/flaw"

import type { IRes } from "../interceptor"

interface FlawCreateInter {
  flawGradeId?: string
  flawName?: string
  remarks?: string
}

// 新建缺陷
export async function createFlaw(params: FlawCreateInter) {
  const res = await axios.post<IRes>("/qa/flaw/create", params)
  return res.data.data
}

// 删除缺陷
export async function deleteFlaw(id: string) {
  const res = await axios.delete<IRes>(`/qa/flaw/delete`, { params: { id } })
  return res.data.data
}

// (分页)查询缺陷列表
export async function getFlawListPaged(params: IFlawListParams) {
  const res = await axios.get<IRes<IListPageResult<IFlawListItem>>>(`/qa/flaw/listPaged`, {
    params
  })
  return res.data.data
}

// 修改缺陷
export async function updateFlaw(params: FlawCreateInter & { id: string }) {
  const res = await axios.put<IRes<null>>("/qa/flaw/update", params)
  return res.data.data
}

// 更新缺陷启用状态
export async function updateEnabledStatusFlaw(params: {
  flawId: string
  newEnabledStatus?: boolean
}) {
  const res = await axios.put<IRes<null>>("/qa/flaw/updateEnabledStatus", null, { params })
  return res.data.data
}
