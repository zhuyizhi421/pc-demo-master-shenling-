import axios from "axios"

import type { IListPageResult, IResponse } from "@/types/common"
import type {
  IMroDifferenceOrderDetailItem,
  IMroDifferenceOrderPageListItem,
  IMroDifferenceOrderPageListParams
} from "@/types/maintain/mro-manage/mro-difference-order"

export const queryMroDifferenceOrderPageList = async (params: IMroDifferenceOrderPageListParams) => {
  const res = await axios.post<IResponse<IListPageResult<IMroDifferenceOrderPageListItem>>>(
    "/mroDifferenceOrder/page",
    params
  )
  return res.data.data
}

export const queryMroDifferenceOrderDetail = async (id: string) => {
  const res = await axios.post<IResponse<IMroDifferenceOrderDetailItem[]>>("/mroDifferenceOrder/detail", {
    id
  })
  return res.data.data
}

export const requestUpdateMroDifferenceOrderReason = async (params: {
  id: string
  detailList: { id: string; differenceReason: string }[]
}) => {
  const res = await axios.post<IResponse>("/mroDifferenceOrder/updateReason", params)
  return res.data.data
}

export const requestReviewMroDifferenceOrder = async (id: string) => {
  const res = await axios.post<IResponse>("/mroDifferenceOrder/review", { id })
  return res.data.data
}
