import axios from "axios"

import type {
  IInspectOptionTemplateCreateReq,
  IInspectOptionTemplateDetail,
  IInspectOptionTemplateListItem,
  IInspectOptionTemplatePageListReq,
  IInspectOptionTemplateReq,
  IInspectOptionTemplateUpdateReq
} from "@/types/base-info/inspect-option-template"
import type { IListPageResult, IResponse } from "@/types/common"

/** 检验项模板列表分页 */
export const queryInspectOptionTemplatePageList = async (
  params: IInspectOptionTemplatePageListReq
) => {
  const res = await axios.post<IResponse<IListPageResult<IInspectOptionTemplateListItem>>>(
    `/pc/qa/inspectItemTemplate/page`,
    params
  )
  return res.data.data
}

/** 检验项模板列表 */
export const queryInspectOptionTemplateList = async (
  params: Partial<IInspectOptionTemplateReq>
) => {
  const res = await axios.post<IResponse<IInspectOptionTemplateListItem[]>>(
    `/pc/qa/inspectItemTemplate/list`,
    params
  )
  return res.data.data
}

/** 检验项模板新增 */
export const requestCreateInspectOptionTemplate = async (
  params: IInspectOptionTemplateCreateReq
) => {
  const res = await axios.post<IResponse>("/pc/qa/inspectItemTemplate/create", params)
  return res.data.data
}

/** 检验项模板更新 */
export const requestUpdateInspectOptionTemplate = async (
  params: IInspectOptionTemplateUpdateReq
) => {
  const res = await axios.post<IResponse>("/pc/qa/inspectItemTemplate/update", params)
  return res.data.data
}

/** 检验项模板删除 */
export const requestDeleteInspectOptionTemplate = async (id: string) => {
  const res = await axios.delete<IResponse>(`/pc/qa/inspectItemTemplate/${id}`)
  return res.data.data
}

/** 检验项模板详情 */
export const queryInspectOptionTemplateDetail = async (id: string) => {
  const res = await axios.get<IResponse<IInspectOptionTemplateDetail>>(
    `/pc/qa/inspectItemTemplate/${id}`
  )
  return res.data.data
}

/** 检验项模板停用 */
export const requestDisableInspectOptionTemplate = async (id: string) => {
  const res = await axios.put<IResponse>(`/pc/qa/inspectItemTemplate/disable/${id}`)
  return res.data.data
}

/** 检验项模板启用 */
export const requestEnableInspectOptionTemplate = async (id: string) => {
  const res = await axios.put<IResponse>(`/pc/qa/inspectItemTemplate/enable/${id}`)
  return res.data.data
}
