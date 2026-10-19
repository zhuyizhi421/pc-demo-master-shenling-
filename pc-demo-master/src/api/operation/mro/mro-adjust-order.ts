import axios from "axios"

import type { IListPageResult, IResponse } from "@/types/common"
import type {
  IMroAdjustOrderDetailItem,
  IMroAdjustOrderPageListItem,
  IMroAdjustOrderPageListParams
} from "@/types/maintain/mro-manage/mro-adjust-order"

export const queryMroAdjustOrderPageList = async (params: IMroAdjustOrderPageListParams) => {
  const res = await axios.post<IResponse<IListPageResult<IMroAdjustOrderPageListItem>>>(
    "/mroAdjustOrder/page",
    params
  )
  return res.data.data
}

export const queryMroAdjustOrderDetail = async (id: string) => {
  const res = await axios.post<IResponse<IMroAdjustOrderDetailItem[]>>("/mroAdjustOrder/detail", { id })
  return res.data.data
}

export const requestUpdateMroAdjustOrder = async (id: string) => {
  const res = await axios.post<IResponse>("/mroAdjustOrder/update", { id })
  return res.data.data
}

export const requestReviewMroAdjustOrder = async (id: string) => {
  const res = await axios.post<IResponse>("/mroAdjustOrder/review", { id })
  return res.data.data
}
