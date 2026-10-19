import axios from "axios"

import type { IListPageResult, IResponse } from "@/types/common"
import type {
  IMroPickupOrderCreateParams,
  IMroPickupOrderPageListItem,
  IMroPickupOrderPageListParams,
  IMroPickupOrderReviewParams,
  IMroPickupOrderUpdateParams
} from "@/types/maintain/mro-manage/mro-pickup-order"

export const queryMroPickupOrderPageList = async (params: IMroPickupOrderPageListParams) => {
  const res = await axios.post<IResponse<IListPageResult<IMroPickupOrderPageListItem>>>(
    "/mroPickupOrder/page",
    params
  )
  return res.data.data
}

export const requestMroPickupOrderById = async (id: string) => {
  const res = await axios.post<IResponse<IMroPickupOrderPageListItem>>("/mroPickupOrder/id", { id })
  return res.data.data
}

export const requestCreateMroPickupOrder = async (params: IMroPickupOrderCreateParams) => {
  const res = await axios.post<IResponse>("/mroPickupOrder/create", params)
  return res.data.data
}

export const requestUpdateMroPickupOrder = async (params: IMroPickupOrderUpdateParams) => {
  const res = await axios.post<IResponse>("/mroPickupOrder/update", params)
  return res.data.data
}

export const requestDeleteMroPickupOrder = async (id: string) => {
  const res = await axios.post<IResponse>("/mroPickupOrder/delete", { id })
  return res.data.data
}

export const requestReviewMroPickupOrder = async (params: IMroPickupOrderReviewParams) => {
  const res = await axios.post<IResponse<{ linkedMroOutboundNo: string }>>("/mroPickupOrder/check", params)
  return res.data.data
}

export const requestTerminalSubmitMroPickupOrder = async (params: IMroPickupOrderCreateParams) => {
  const res = await axios.post<IResponse<{ id: string; linkedMroOutboundNo: string }>>(
    "/mroPickupOrder/terminalSubmit",
    params
  )
  return res.data.data
}
