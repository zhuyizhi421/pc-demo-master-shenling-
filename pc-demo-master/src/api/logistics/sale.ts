import axios from "axios"

import type { IListPageResult, IResponse } from "@/types/common"
import type {
  IDynamicSaleOrderPageListParams,
  ISaleOrderCreateParams,
  ISaleOrderDetail,
  ISaleOrderPageListItem,
  ISaleOrderPageListParams
} from "@/types/logistics/saleOrder"
import type { ISettleDeliveryPlan } from "@/types/logistics/saleOrder"

// 销售订单查询
export const querySaleOrderPageList = async (params: ISaleOrderPageListParams) => {
  const res = await axios.post<IResponse<IListPageResult<ISaleOrderPageListItem>>>(
    "/logistics/sale/search",
    params
  )
  return res.data.data
}

// 销售订单查询（动态列配置）
export const queryDynamicSaleOrderPageList = async (params: IDynamicSaleOrderPageListParams) => {
  const res = await axios.post<IResponse<IListPageResult<ISaleOrderPageListItem>>>(
    "/logistics/sale/dynamicSearch",
    params
  )
  return res.data.data
}

// 新建销售订单
export const requestCreateSaleOrder = async (params: ISaleOrderCreateParams) => {
  const res = await axios.post<IResponse>("/logistics/sale", params)
  return res.data.data
}

// 编辑销售订单
export const requestUpdateSaleOrder = async (id: string, params: ISaleOrderCreateParams) => {
  const res = await axios.put<IResponse>(`/logistics/sale/${id}`, params)
  return res.data.data
}

// 销售订单 -- 查看详情
export const querySaleOrderDetail = async (params: { id: string }) => {
  const res = await axios.get<IResponse<ISaleOrderDetail>>(`/logistics/sale/${params.id}`, {
    params
  })
  return res.data.data
}

// 删除销售订单
export const requestDeleteSaleOrder = async (id: string) => {
  const res = await axios.delete<IResponse>(`/logistics/sale/${id}`)
  return res.data.data
}

// 销售订单结案
export const requestSettleSaleOrder = async (id: string) => {
  const res = await axios.post<IResponse>(`/logistics/sale/${id}/complete`)
  return res.data.data
}

/** 获取销售订单未结案发货计划 */
export const requestSaleOrderUnSettleDeliveryPlan = async (saleId: string) => {
  const res = await axios.get<IResponse<ISettleDeliveryPlan[]>>(
    `/logistics/delivery/unfinished/${saleId}`
  )
  return res.data.data
}

/** 销售订单结案检查 */
export const requestSaleOrderCheckFinish = async (saleId: string) => {
  const res = await axios.get<IResponse<ISettleDeliveryPlan[]>>(
    `/logistics/sale/checkFinish/${saleId}`
  )
  return res.data.data
}

/** 销售订单复核 */
export const requestReviewSaleOrder = async (id: string) => {
  const res = await axios.post<IResponse>(`/logistics/sale/check`, { id })
  return res.data.data
}

/** 销售订单解复核 */
export const requestUnReviewSaleOrder = async (id: string) => {
  const res = await axios.post<IResponse>(`/logistics/sale/unCheck`, { id })
  return res.data.data
}
