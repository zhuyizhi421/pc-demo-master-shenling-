import axios from "axios"

import type {
  ISearchSupplierParams,
  ISupplierCopyData,
  ISupplierCreateParams,
  ISupplierItem,
  ISupplierUpdateParams
} from "@/types/base-info/supplier"
import type { IListPageResult, IResponse } from "@/types/common"

// 新建供应商
export const requestCreateSupplier = async (params: ISupplierCreateParams) => {
  const res = await axios.post<IResponse<ISupplierItem>>("/foreign/supplier", params)
  return res.data.data
}

// 供应商分页
export const querySupplierPageList = async (params: ISearchSupplierParams) => {
  const res = await axios.post<IResponse<IListPageResult<ISupplierItem>>>(
    "/foreign/supplier/search",
    params
  )
  return res.data.data
}

// 编辑供应商
export const requestUpdateSupplier = async (params: ISupplierUpdateParams) => {
  const { id, ...rest } = params
  const res = await axios.put<IResponse>(`/foreign/supplier/${id}`, { ...rest })
  return res.data.data
}

// 删除供应商
export const requestDeleteSupplier = async (params: { id: string }) => {
  const res = await axios.delete<IResponse>(`/foreign/supplier/${params.id}`)
  return res.data.data
}

// 切换供应商状态
export const requestSwitchSupplierStatus = async (params: { id: string; state: number }) => {
  const res = await axios.put<IResponse>(`/foreign/supplier/state`, params)
  return res.data.data
}

/** 供应商列表 */
export const queryAllSupplierList = async () => {
  const res = await axios.get<IResponse<ISupplierItem[]>>("/foreign/supplier/list")
  return res.data.data
}

/** 供应商详情 */
export const querySupplierDetail = async (id: string) => {
  const res = await axios.get<IResponse<ISupplierItem>>(`/foreign/supplier/${id}`)
  return res.data.data
}

/** 供应商平台密码重置 */
export const requestResetSupplierPlatformPassword = async (id: string) => {
  const res = await axios.put<IResponse>(`/foreign/supplier/password/reset/${id}`)
  return res.data.data
}

/** 供应商复制分享 */
export const requestCopyShareSupplier = async (id: string) => {
  const res = await axios.get<IResponse<ISupplierCopyData>>(`/foreign/supplier/copy/share/${id}`)
  return res.data.data
}
