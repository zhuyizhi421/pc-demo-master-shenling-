import axios from "axios"

import type { IListPageResult, IResponse } from "@/types/common"
import type {
  IMroInfoBindBarcodeParams,
  IMroInfoConfigPageListItem,
  IMroInfoConfigPageListParams,
  IMroInfoConfigSubmitParams,
  IMroInfoLedgerActionParams,
  IMroInfoPageListItem,
  IMroInfoPageListParams
} from "@/types/maintain/mro-manage/mro-info"

// mro信息分页列表
export const queryMroInfoPageList = async (params: IMroInfoPageListParams) => {
  const res = await axios.post<IResponse<IListPageResult<IMroInfoPageListItem>>>(
    "/mro/page",
    params
  )
  return res.data.data
}

// 获取mroId列表对应的mro信息列表
export const queryMroInfoListByMroIdList = async (params: { idList: string[] }) => {
  const res = await axios.post<IResponse<IMroInfoPageListItem[]>>("/mro/listByIds", params)
  return res.data.data
}

// MRO信息详细
export const queryMroInfoDetail = async (params: { id?: string }) => {
  const res = await axios.get<IResponse<IMroInfoPageListItem>>("/mro/getById", { params })
  return res.data.data
}

// mro信息绑定标签码
export const requestMroBandBarcode = async (params: IMroInfoBindBarcodeParams) => {
  const res = await axios.post<IResponse>("/mro/bindBarcode", params)
  return res.data.data
}

// 保存MRO配置
export const requestArchiveMroInfo = async (params: IMroInfoLedgerActionParams) => {
  const res = await axios.post<IResponse>("/mro/archive", params)
  return res.data.data
}

export const requestUnarchiveMroInfo = async (params: IMroInfoLedgerActionParams) => {
  const res = await axios.post<IResponse>("/mro/unarchive", params)
  return res.data.data
}

export const requestScrapMroInfo = async (params: IMroInfoLedgerActionParams) => {
  const res = await axios.post<IResponse>("/mro/scrap", params)
  return res.data.data
}

export const requestSaveMroInfoConfig = async (params: IMroInfoConfigSubmitParams) => {
  const res = await axios.post<IResponse>("/mroInformationConfig/save", params)
  return res.data.data
}

// MRO信息配置分页列表
export async function queryMroInfoConfigPageList(params: IMroInfoConfigPageListParams) {
  const res = await axios.post<IResponse<IListPageResult<IMroInfoConfigPageListItem>>>(
    "/mroInformationConfig/page",
    params
  )
  return res.data.data
}
