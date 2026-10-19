import axios from "axios"

import type { IListPageResult, IResponse } from "@/types/common"
import type {
  IMroOutboundOrderCreateParams,
  IMroOutboundOrderPageListItem,
  IMroOutboundOrderPageListParams,
  IMroOutboundOrderReviewParams,
  IMroOutboundOrderUpdateParams
} from "@/types/maintain/mro-manage/mro-outbound-order"

export const queryMroOutboundOrderPageList = async (params: IMroOutboundOrderPageListParams) => {
  const res = await axios.post<IResponse<IListPageResult<IMroOutboundOrderPageListItem>>>(
    "/mroOutboundOrder/page",
    params
  )
  return res.data.data
}

export const requestCreateMroOutboundOrder = async (params: IMroOutboundOrderCreateParams) => {
  const res = await axios.post<IResponse>("/mroOutboundOrder/create", params)
  return res.data.data
}

export const requestUpdateMroOutboundOrder = async (params: IMroOutboundOrderUpdateParams) => {
  const res = await axios.post<IResponse>("/mroOutboundOrder/update", params)
  return res.data.data
}

export const requestDeleteMroOutboundOrder = async (id: string) => {
  const res = await axios.post<IResponse>("/mroOutboundOrder/delete", { id })
  return res.data.data
}

export const requestReviewMroOutboundOrder = async (params: IMroOutboundOrderReviewParams) => {
  const res = await axios.post<IResponse>("/mroOutboundOrder/check", params)
  return res.data.data
}
