import axios from "axios"

import type { IFlawGradeListItem, IFlawGradeListParams } from "@/types/quality-manage/flaw"

import type { IRes } from "../interceptor"

interface FlawGradeCreateInter {
  gradeName?: string
  remarks?: string
}

// 新建缺陷类型
export async function createFlawGrade(params: FlawGradeCreateInter) {
  const res = await axios.post<IRes>("/qa/flawGrade/create", params)
  return res.data.data
}

// 删除缺陷类型
export async function deleteFlawGrade(id: string) {
  const res = await axios.delete<IRes>(`/qa/flawGrade/delete`, { params: { id } })
  return res.data.data
}

// 查询缺陷类型列表
export async function getFlawGradeList(params: IFlawGradeListParams) {
  const res = await axios.get<IRes<IFlawGradeListItem[]>>(`/qa/flawGrade/list`, {
    params
  })
  return res.data.data
}

// 修改缺陷类型
export async function updateFlawGrade(params: FlawGradeCreateInter & { id: string }) {
  const res = await axios.put<IRes<null>>("/qa/flawGrade/update", params)
  return res.data.data
}

// 缺陷等级相关

export interface FlawLevelItem {
  createBy: string
  createTime: string
  id: string
  levelName: string
  levelNo: string
  remarks: string
  updateBy: string
  updateTime: string
}

//  新建缺陷等级
export async function requestCreateFlawLevel(params: {
  levelName: string
  remarks: string
  levelNo?: string
}) {
  const res = await axios.post<IRes>("/qa/flawLevel/create", params)
  return res.data.data
}

//  删除缺陷等级
export async function requestDeleteFlawLevel(id: string) {
  const res = await axios.delete<IRes>("/qa/flawLevel/delete", { params: { id } })
  return res.data.data
}

// 查询所有缺陷等级
export async function queryFlawLevelList(params?: { levelName?: string }) {
  const res = await axios.get<IRes<FlawLevelItem[]>>("/qa/flawLevel/list", { params })
  return res.data.data
}

//  修改缺陷等级
export async function requestUpdateFlawLevel(params: {
  id: string
  levelName: string
  remarks: string
}) {
  const res = await axios.put<IRes>("/qa/flawLevel/update", params)
  return res.data.data
}
