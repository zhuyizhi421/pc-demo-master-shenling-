import axios from "axios"

import type { IUnitItem, IUnitParams, IUnitQueryParams } from "@/types/base-info/unit"
import type { IListPageResult } from "@/types/common"

import type { IRes } from "./interceptor"

export async function getUnits(params: IUnitQueryParams) {
  const res = await axios.get<IRes<IUnitItem[]>>("/unit/getUnit", { params })
  return res.data.data
}

export async function getUnit() {
  const res = await axios.get<IRes<IUnitItem[]>>("/unit/getUnit")
  return res.data.data
}

export async function getUnitItemPaged(params: IUnitParams) {
  params.pageSize = params.pageSize || 10
  params.pageNum = params.pageNum || 1
  const res = await axios.post<IRes<IListPageResult<IUnitItem>>>("/unit/getUnitItemPaged", params)
  return res.data.data
}

export async function updateUnit(params: IUnitQueryParams) {
  const res = await axios.put<IRes>("/unit/updateUnit", params)
  return res.data.data
}

export async function createUnit(params: IUnitQueryParams) {
  const res = await axios.post<IRes>("/unit/createUnit", params)
  return res.data.data
}

export async function deleteUnit(params: { id: number }) {
  const res = await axios.delete<IRes>("/unit/deleteUnit", { params })
  return res.data.data
}

// #endregion

export interface UnitConvertParams {
  id?: number
  originUnit?: string
  targetUnit?: string
  originUnitBase?: number
  targetUnitBase?: number
}

export interface IUnitConvertItem {
  id: number
  originUnit: string
  targetUnit: string
  originUnitBase: number
  originUnitCode: string
  targetUnitBase: number
  targetUnitCode: string
  createBy: number
  createTime: string
  updateBy: number
  updateTime: string
}

export async function updateUnitConvert(params: UnitConvertParams) {
  const res = await axios.put<IRes>("/unit/updateUnitConvert", params)
  return res.data.data
}

export async function getAllUnitConvert() {
  const res = await axios.get<IRes<IUnitConvertItem[]>>("/unit/getAllUnitConvert")
  return res.data.data
}

export async function deleteUnitConvert(params: { id: number }) {
  const res = await axios.delete<IRes>("/unit/deleteUnitConvert", { params })
  return res.data.data
}
