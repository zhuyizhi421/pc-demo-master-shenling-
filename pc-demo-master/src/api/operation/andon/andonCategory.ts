import axios from "axios"

import type { IRes } from "../../interceptor"

function asArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[]
  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>
    if (Array.isArray(o.list)) return o.list as T[]
    if (Array.isArray(o.records)) return o.records as T[]
    if (Array.isArray(o.rows)) return o.rows as T[]
  }
  return []
}

// 查询所有Andon类型
export async function getAndonCategoryAll() {
  const res = await axios.get<IRes>(`/andon/category/listAll`)
  return asArray(res.data.data)
}

interface andonTypeInter {
  categoryName?: string
  remarks?: string
}

// 新建Andon类型
export async function createAndonType(params: andonTypeInter) {
  const res = await axios.post<IRes>("/andon/category/create", params, {
    headers: { "Content-Type": "application/json" }
  })
  return res.data.data
}

// 删除Andon类型
export async function deleteAndonType(id: string) {
  const res = await axios.delete<IRes>(`/andon/category/delete`, { params: { id } })
  return res.data.data
}

// 编辑Andon类型
export async function updateAndonType(params: andonTypeInter & { id: string }) {
  const res = await axios.put<IRes<null>>("/andon/category/update", params)
  return res.data.data
}
