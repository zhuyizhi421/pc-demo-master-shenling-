import axios from "axios"

import type { IListPageResult, IResponse } from "@/types/common"
import type {
  IMroReturnOrderCreateParams,
  IMroReturnOrderPageListItem,
  IMroReturnOrderPageListParams,
  IMroReturnOrderReviewParams,
  IMroReturnOrderUpdateParams
} from "@/types/maintain/mro-manage/mro-return-order"

const MRO_RETURN_ORDER_TIMEOUT = 15000

export const queryMroReturnOrderPageList = async (params: IMroReturnOrderPageListParams) => {
  const res = await axios.post<IResponse<IListPageResult<IMroReturnOrderPageListItem>>>(
    "/mroReturnOrder/page",
    params,
    { timeout: MRO_RETURN_ORDER_TIMEOUT }
  )
  return res.data.data
}

export const requestMroReturnOrderById = async (id: string) => {
  const res = await axios.post<IResponse<IMroReturnOrderPageListItem>>(
    "/mroReturnOrder/id",
    { id },
    { timeout: MRO_RETURN_ORDER_TIMEOUT }
  )
  return res.data.data
}

export const requestCreateMroReturnOrder = async (params: IMroReturnOrderCreateParams) => {
  const res = await axios.post<IResponse>("/mroReturnOrder/create", params, {
    timeout: MRO_RETURN_ORDER_TIMEOUT
  })
  return res.data.data
}

export const requestUpdateMroReturnOrder = async (params: IMroReturnOrderUpdateParams) => {
  const res = await axios.post<IResponse>("/mroReturnOrder/update", params, {
    timeout: MRO_RETURN_ORDER_TIMEOUT
  })
  return res.data.data
}

export const requestDeleteMroReturnOrder = async (id: string) => {
  const res = await axios.post<IResponse>("/mroReturnOrder/delete", { id }, {
    timeout: MRO_RETURN_ORDER_TIMEOUT
  })
  return res.data.data
}

export const requestReviewMroReturnOrder = async (params: IMroReturnOrderReviewParams) => {
  const res = await axios.post<IResponse<{ linkedMroInboundNo: string }>>(
    "/mroReturnOrder/check",
    params,
    { timeout: MRO_RETURN_ORDER_TIMEOUT }
  )
  return res.data.data
}

export const requestTerminalSubmitMroReturnOrder = async (params: IMroReturnOrderCreateParams) => {
  const res = await axios.post<IResponse<{ id: string; linkedMroInboundNo: string }>>(
    "/mroReturnOrder/terminalSubmit",
    params,
    { timeout: MRO_RETURN_ORDER_TIMEOUT }
  )
  return res.data.data
}
