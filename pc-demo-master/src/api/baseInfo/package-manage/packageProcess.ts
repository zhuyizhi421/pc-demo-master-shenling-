import axios from "axios"

import type {
  IPackageProcessCreateParams,
  IPackageProcessPackageSpecAddParams,
  IPackageProcessPackageSpecDeleteParams,
  IPackageProcessPackageSpecSortParams,
  IPackageProcessPageListItem,
  IPackageProcessPageListParams,
  IPackageProcessProductAddParams,
  IPackageProcessProductDeleteParams,
  IPackageProcessProductSaveParams,
  IPackageProcessProductUpdateParams,
  IPackageProcessUpdateParams,
  IPackageSpecConfigList
} from "@/types/base-info/package-process"
import type { IListPageResult, IResponse } from "@/types/common"

/** 包装工序分页列表 */
export const queryPackageProcessPageList = async (params: IPackageProcessPageListParams) => {
  const res = await axios.post<IResponse<IListPageResult<IPackageProcessPageListItem>>>(
    `/packTechSerial/page`,
    params
  )
  return res.data.data
}

/** 包装工序详情 */
export const queryPackageProcessDetail = async (id: string) => {
  const res = await axios.post<IResponse<IPackageProcessPageListItem>>(`/packTechSerial/getById`, {
    id
  })
  return res.data.data
}

/** 多个包装工序详情 */
export const queryPackageProcessDetails = async (idList: string[]) => {
  const res = await axios.post<IResponse<IPackageProcessPageListItem[]>>(
    `/packTechSerial/listByIds`,
    { idList }
  )
  return res.data.data
}

/** 包装工序删除 */
export const requestDeletePackageProcess = async (id: string) => {
  const res = await axios.post<IResponse>(`/packTechSerial/delete`, { id })
  return res.data.data
}

/** 包装工序创建 */
export const requestCreatePackageProcess = async (params: IPackageProcessCreateParams) => {
  const res = await axios.post<IResponse<IPackageProcessPageListItem>>(
    `/packTechSerial/create`,
    params
  )
  return res.data.data
}

/** 包装工序编辑 */
export const requestUpdatePackageProcess = async (params: IPackageProcessUpdateParams) => {
  const res = await axios.post<IResponse<IPackageProcessPageListItem>>(
    `/packTechSerial/update`,
    params
  )
  return res.data.data
}

/** 启用包装规范 */
export const requestEnablePackageProcess = async (id: string) => {
  const res = await axios.post<IResponse>(`/packTechSerial/enable`, { id })
  return res.data.data
}

/** 停用包装规范 */
export const requestDisablePackageProcess = async (id: string) => {
  const res = await axios.post<IResponse>(`/packTechSerial/disable`, { id })
  return res.data.data
}

/** 包装工序配置-批量添加工艺版本物料 */
export const requestAddPackageProcessProduct = async (params: IPackageProcessProductAddParams) => {
  const res = await axios.post<IResponse>(
    `/techVersion/techStandard/addTechStandardMaterial`,
    params
  )
  return res.data.data
}

/** 包装工序配置-更新工艺版本物料 */
export const requestUpdatePackageProcessProduct = async (
  params: IPackageProcessProductUpdateParams
) => {
  const res = await axios.post<IResponse>(
    `/techVersion/techStandard/updateTechStandardMaterial`,
    params
  )
  return res.data.data
}

/** 包装工序配置-删除工艺版本物料 */
export const requestDeletePackageProcessProduct = async (
  params: IPackageProcessProductDeleteParams
) => {
  const res = await axios.post<IResponse>(
    `/techVersion/techStandard/deleteTechStandardMaterial`,
    params
  )
  return res.data.data
}

/** 包装工序配置-获取包装规范列表 */
export const queryPackageProcessSpecList = async (id: string) => {
  const res = await axios.post<IResponse<IPackageSpecConfigList[]>>(
    `/techVersion/techStandard/getPackStandard`,
    {
      id
    }
  )
  return res.data.data
}

/** 包装工序配置-添加包装规范列表 */
export const requestAddPackageProcessSpec = async (params: IPackageProcessPackageSpecAddParams) => {
  const res = await axios.post<IResponse>(`/techVersion/techStandard/savePackStandard`, params)
  return res.data.data
}

/** 包装工序配置-删除包装规范列表 */
export const requestDeletePackageProcessSpec = async (
  params: IPackageProcessPackageSpecDeleteParams
) => {
  const res = await axios.post<IResponse>(`/techVersion/techStandard/deletePackStandard`, params)
  return res.data.data
}

/** 包装工序配置-包装规范排序 */
export const requestSortPackageProcessSpec = async (
  params: IPackageProcessPackageSpecSortParams
) => {
  const res = await axios.post<IResponse>(`/techVersion/techStandard/swapPackSpecSort`, params)
  return res.data.data
}

/** 包装工序配置-保存产品列表 */
export const requestSavePackageProcessProduct = async (
  params: IPackageProcessProductSaveParams
) => {
  const res = await axios.post<IResponse>(`/packSpec/saveSpecProduct`, params)
  return res.data.data
}
