import axios from "axios"

import type { IListPageResult, IResponse } from "@/types/common"
import type {
  IMroTypeCreateParams,
  IMroTypePageListItem,
  IMroTypePageListParams,
  IMroTypeUpdateParams
} from "@/types/maintain/mro-manage/mro-type"

export async function queryMroTypePageList(params: IMroTypePageListParams) {
  const res = await axios.post<IResponse<IListPageResult<IMroTypePageListItem>>>("/mroType/page", params)
  return res.data.data
}

export async function queryMroTypeDetail(id: string) {
  const res = await axios.get<IResponse<IMroTypePageListItem>>("/mroType/getOne", {
    params: { id }
  })
  return res.data.data
}

export async function requestCreateMroType(params: IMroTypeCreateParams) {
  const res = await axios.post<IResponse>("/mroType/createType", params)
  return res.data.data
}

export async function requestUpdateMroType(params: IMroTypeUpdateParams) {
  const res = await axios.post<IResponse>("/mroType/updateMroType", params)
  return res.data.data
}

export async function requestDeleteMroType(params: { id: string }) {
  const res = await axios.delete<IResponse>("/mroType/deleteTypeById", { params })
  return res.data.data
}
