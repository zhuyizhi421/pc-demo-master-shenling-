import axios from "axios"

import type {
  IPackageSpecCreateParams,
  IPackageSpecPageListItem,
  IPackageSpecPageListParams
} from "@/types/base-info/package-spec"
import type { IListPageResult, IOption, IResponse } from "@/types/common"

/** 包装规范分页列表 */
export const queryPackageSpecPageList = async (params: IPackageSpecPageListParams) => {
  const res = await axios.post<IResponse<IListPageResult<IPackageSpecPageListItem>>>(
    "/packSpec/page",
    params
  )
  return res.data.data
}

/** 删除包装规范 */
export const requestDeletePackageSpec = async (id: string) => {
  const res = await axios.post<IResponse>(`/packSpec/delete`, { id })
  return res.data.data
}

/** 启用包装规范 */
export const requestEnablePackageSpec = async (id: string) => {
  const res = await axios.post<IResponse>(`/packSpec/enable`, { id })
  return res.data.data
}

/** 停用包装规范 */
export const requestDisablePackageSpec = async (id: string) => {
  const res = await axios.post<IResponse>(`/packSpec/disable`, { id })
  return res.data.data
}

/** 获取多个包装规范详情 */
export const queryPackageSpecDetails = async (ids: string[]) => {
  const res = await axios.post<IResponse<IPackageSpecPageListItem[]>>(`/packSpec/list`, { ids })
  return res.data.data
}

/** 新建包装规范 */
export const requestCreatePackageSpec = async (data: IPackageSpecCreateParams) => {
  const res = await axios.post<IResponse>(`/packSpec/create`, data)
  return res.data.data
}

/** 编辑包装规范 */
export const requestUpdatePackageSpec = async (data: IPackageSpecCreateParams) => {
  const res = await axios.post<IResponse>(`/packSpec/edit`, data)
  return res.data.data
}

/** 包装容器类型 */
export const requestPackageSpecType = async () => {
  const res = await axios.get<IResponse<IOption[]>>(`/packSpec/containerTypes`)
  return res.data.data
}

/** 包装规范运输方式 */
export const requestPackageSpecTransportType = async () => {
  const res = await axios.get<IResponse<IOption[]>>(`/packSpec/transportTypes`)
  return res.data.data
}
