import axios from "axios"

import type { IListPageResult, IResponse } from "@/types/common"
import type {
  IMroClassifyCreateParams,
  IMroClassifyItem,
  IMroClassifyPageListParams,
  IMroClassifyTreeItem,
  IMroClassifyUpdateParams
} from "@/types/maintain/mro-manage/mro-classify"

export async function queryMroClassifyTree() {
  const res = await axios.get<IResponse<IMroClassifyTreeItem[]>>("/mroClassify/tree")
  const payload = res.data.data as unknown as
    | IMroClassifyTreeItem[]
    | { records?: IMroClassifyTreeItem[]; list?: IMroClassifyTreeItem[] }
    | null
    | undefined
  if (Array.isArray(payload)) {
    return payload
  }
  if (Array.isArray(payload?.records)) {
    return payload.records
  }
  if (Array.isArray(payload?.list)) {
    return payload.list
  }
  return []
}

export async function queryMroClassifyPageList(params: IMroClassifyPageListParams) {
  const res = await axios.post<IResponse<IListPageResult<IMroClassifyItem>>>("/mroClassify/page", params)
  return res.data.data
}

export async function queryMroClassifyDetail(id: string) {
  const res = await axios.get<IResponse<IMroClassifyItem>>("/mroClassify/getOne", {
    params: { id }
  })
  return res.data.data
}

export async function requestCreateMroClassify(params: IMroClassifyCreateParams) {
  const res = await axios.post<IResponse>("/mroClassify/create", params)
  return res.data.data
}

export async function requestUpdateMroClassify(params: IMroClassifyUpdateParams) {
  const res = await axios.post<IResponse>("/mroClassify/update", params)
  return res.data.data
}

export async function requestDeleteMroClassify(params: { id: string }) {
  const res = await axios.delete<IResponse>("/mroClassify/deleteById", { params })
  return res.data.data
}
