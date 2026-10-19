import axios from "axios"

import type {
  IInspectOptionCategoryCreateReq,
  IInspectOptionCategoryListItem,
  IInspectOptionCategoryListReq,
  IInspectOptionCategoryPageListReq,
  IInspectOptionCategoryTree
} from "@/types/base-info/inspect-option-category"
import type { IListPageResult, IResponse } from "@/types/common"

/** 检验项类别列表分页 */
export const queryInspectOptionCategoryPageList = async (
  params: IInspectOptionCategoryPageListReq
) => {
  const res = await axios.post<IResponse<IListPageResult<IInspectOptionCategoryListItem>>>(
    "/pc/qa/inspectItemCategory/page",
    params
  )
  return res.data.data
}

/** 所有检验性类别列表 */
export const queryInspectOptionCategoryListAll = async () => {
  const res = await axios.post<IResponse<IInspectOptionCategoryListItem[]>>(
    "/pc/qa/inspectItemCategory/listAll"
  )
  return res.data.data
}

/** 检验项类别创建 */
export const requestCreateInspectOptionCategory = async (
  params: IInspectOptionCategoryCreateReq
) => {
  const res = await axios.post<IResponse<null>>("/pc/qa/inspectItemCategory/create", params)
  return res.data.data
}

/** 检验项类别更新 */
export const requestUpdateInspectOptionCategory = async (
  params: IInspectOptionCategoryCreateReq
) => {
  const res = await axios.post<IResponse<null>>("/pc/qa/inspectItemCategory/update", params)
  return res.data.data
}

/** 检验项类别删除 */
export const requestDeleteInspectOptionCategory = async (id: string) => {
  const res = await axios.delete<IResponse<null>>(`/pc/qa/inspectItemCategory/${id}`)
  return res.data.data
}

/** 检验项类别详情 */
export const queryInspectOptionCategoryDetail = async (id: string) => {
  const res = await axios.get<IResponse<IInspectOptionCategoryListItem>>(
    `/pc/qa/inspectItemCategory/${id}`
  )
  return res.data.data
}

/** 检验项类别停用 */
export const requestDisableInspectOptionCategory = async (id: string) => {
  const res = await axios.put<IResponse<null>>(`/pc/qa/inspectItemCategory/disable/${id}`)
  return res.data.data
}

/** 检验项类别启用 */
export const requestEnableInspectOptionCategory = async (id: string) => {
  const res = await axios.put<IResponse<null>>(`/pc/qa/inspectItemCategory/enable/${id}`)
  return res.data.data
}

/** 检验项类别树 */
export const requeryInspectOptionCategoryTree = async () => {
  const res = await axios.get<IResponse<IInspectOptionCategoryTree[]>>(
    "/pc/qa/inspectItemCategory/getCategoryTree"
  )
  return res.data.data
}
