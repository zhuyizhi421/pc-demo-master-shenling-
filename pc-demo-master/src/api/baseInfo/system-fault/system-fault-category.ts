import axios from "axios"

import type {
  ISystemFaultCategoryAllListParams,
  ISystemFaultCategoryCreateParams,
  ISystemFaultCategoryInfo,
  ISystemFaultCategoryUpdateParams,
  ISystemFaultTypePageListParams
} from "@/types/base-info/system-fault-category"
import type { IListPageResult, IResponse } from "@/types/common"

// 系统故障类型创建
export const requestCreateSystemFaultCategory = async (
  params: ISystemFaultCategoryCreateParams
) => {
  const res = await axios.post<IResponse>("/sysFaultCategory/create", params)
  return res.data.data
}

// 系统故障类型删除
export const requestDeleteSystemFaultCategory = async (id: string) => {
  const res = await axios.delete<IResponse>(`/sysFaultCategory/delete/`, { params: { id } })
  return res.data.data
}

// 系统故障类型列表
export const requestAllSystemFaultCategory = async (params: ISystemFaultCategoryAllListParams) => {
  const res = await axios.get<IResponse<ISystemFaultCategoryInfo[]>>("/sysFaultCategory/listAll", {
    params
  })
  return res.data.data
}

// 系统故障类型分页列表
export const requestSystemFaultCategoryPageList = async (
  params: ISystemFaultTypePageListParams
) => {
  const res = await axios.get<IResponse<IListPageResult<ISystemFaultCategoryInfo>>>(
    "/sysFaultCategory/listPaged",
    { params }
  )
  return res.data.data
}

/** 系统故障类型指定id列表数据 */
export const requestSystemFaultCategoryByIds = async (params: { idList: string[] }) => {
  const res = await axios.post<IResponse<ISystemFaultCategoryInfo[]>>(
    `/sysFaultCategory/listByIds`,
    params
  )
  return res.data.data
}

// 系统故障类型更新
export const requestUpdateSystemFaultCategory = async (
  params: ISystemFaultCategoryUpdateParams
) => {
  const res = await axios.put<IResponse>("/sysFaultCategory/update", params)
  return res.data.data
}
