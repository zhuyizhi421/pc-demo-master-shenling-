import axios from "axios"

import type { IListPageResult, IResponse } from "@/types/common"
import type {
  IMroInboundOrderCreateParams,
  IMroInboundOrderPageListItem,
  IMroInboundOrderPageListParams,
  IMroInboundOrderReviewParams,
  IMroInboundOrderUpdateParams
} from "@/types/maintain/mro-manage/mro-inbound-order"

export const queryMroInboundOrderPageList = async (params: IMroInboundOrderPageListParams) => {
  const res = await axios.post<IResponse<IListPageResult<IMroInboundOrderPageListItem>>>(
    "/mroInboundOrder/page",
    params
  )
  return res.data.data
}

export const requestCreateMroInboundOrder = async (params: IMroInboundOrderCreateParams) => {
  const res = await axios.post<IResponse>("/mroInboundOrder/create", params)
  return res.data.data
}

export const requestUpdateMroInboundOrder = async (params: IMroInboundOrderUpdateParams) => {
  const res = await axios.post<IResponse>("/mroInboundOrder/update", params)
  return res.data.data
}

export const requestDeleteMroInboundOrder = async (id: string) => {
  const res = await axios.post<IResponse>("/mroInboundOrder/delete", { id })
  return res.data.data
}

export const requestReviewMroInboundOrder = async (params: IMroInboundOrderReviewParams) => {
  const res = await axios.post<IResponse>("/mroInboundOrder/check", params)
  return res.data.data
}
