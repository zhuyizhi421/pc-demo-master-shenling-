import axios from "axios"

import type { ICodeItem } from "@/types/base-info/code"

import type { IRes } from "./interceptor"

/** 列表可能是 T[]，或包在 { records: T[] } 中 */
function asList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data
  if (data && typeof data === "object" && Array.isArray((data as { records?: T[] }).records)) {
    return (data as { records: T[] }).records
  }
  return []
}

export interface ICodeModelItem {
  id: number
  codeName: string
  value: string
  length: number
  createBy: number
  createTime: string
  updateBy: number
  updateTime: string
}

// 1固定码2分隔符3年月日周4时分秒5顺序码6随机码
export enum CodeType {
  Fixed = 1,
  Separator = 2,
  YearMonthDayWeek = 3,
  HourMinuteSecond = 4,
  SerialNumber = 5,
  Random = 6
}

export const CodeTypeToNameMap: Record<string, string> = {
  [CodeType.Fixed]: "固定码",
  [CodeType.Separator]: "分隔符",
  [CodeType.YearMonthDayWeek]: "年月日周",
  [CodeType.HourMinuteSecond]: "时分秒",
  [CodeType.SerialNumber]: "顺序码",
  [CodeType.Random]: "随机码"
} as const

export interface ICodeModelItemValue {
  codeItemList: {
    codeItemType: number
    length: number
    otherRule: string
    value: string
  }[]
  id: string
  modelCode: string
  modelName: string
}

export async function createCodeModel(params: Partial<ICodeModelItemValue>) {
  const res = await axios.post<IRes>("/code/createCodeModel", params)
  return res.data.data
}

export async function getCodeItemInfo(id: string) {
  const res = await axios.get<
    IRes<{
      modelName: string
      modelCode: string
      id: string
      items: {
        otherRule: string
        codeName: string
        codeModelId: string
        codeItemType: number
        value: string
        sort: number
        length: number
        id: string
      }[]
    }>
  >(`/code/${id}`)
  return res.data.data
}

export async function deleteCodeModel(id: string) {
  const res = await axios.delete<IRes>("/code/deleteCodeModel", { params: { id } })
  return res.data.data
}

export async function getAll() {
  const res = await axios.get<IRes<ICodeItem[]>>("/code/getAll")
  return asList<ICodeItem>(res.data.data)
}

export async function updateCodeModel(params: Partial<ICodeModelItemValue>) {
  const res = await axios.put<IRes>("/code/updateCodeModel", params)
  return res.data.data
}

export async function getAllCodeItem() {
  const res = await axios.get<IRes<ICodeModelItem[]>>("/code/getAllCodeItem")
  return asList<ICodeModelItem>(res.data.data)
}

export interface ICodeModule {
  id: number
  moduleName: string
  createBy: number
  createTime: string
  updateBy: number
  updateTime: string
}

export async function getAllCodeModule() {
  const res = await axios.get<IRes<ICodeModule[]>>("/code/getAllCodeModule")
  return asList<ICodeModule>(res.data.data)
}

export interface ICodeType extends ICodeModule {
  modelCode?: string
  typeCode: string
  typeName: string
}

export async function getCodeTypeByModule(moduleName: string) {
  const res = await axios.get<IRes<ICodeType[]>>("/code/getCodeTypeByModule", {
    params: { moduleName }
  })
  return asList<ICodeType>(res.data.data)
}

export async function bindCodeModel(
  params: Partial<{
    id: number
    modelCode: string
    moduleName: string
    typeCode: string
    typeName: string
  }>[]
) {
  const res = await axios.put<IRes>("/code/bindCodeModel", params)
  return res.data.data
}
