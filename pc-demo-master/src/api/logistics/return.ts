import axios from "axios"

import type { IListPageResult, IResponse } from "@/types/common"
import type {
  IReturnOrderCreateByNotSaleOrderParams,
  IReturnOrderCreateBySaleOrderParams,
  IReturnOrderDetail,
  IReturnOrderPageListItem,
  IReturnOrderPageListParams,
  IReturnOrderProductInfo,
  ISaleOrderBySaleListItem,
  ISaleOrderBySaleParams
} from "@/types/logistics/return"

// 退货查询
export const queryReturnOrderPageList = async (params: IReturnOrderPageListParams) => {
  const res = await axios.get<IResponse<IListPageResult<IReturnOrderPageListItem>>>(
    "/logistics/return/search",
    {
      params
    }
  )
  return res.data.data
}

// 创建退货订单-不按销售订单退货
export const requestCreateReturnOrderByNotSaleOrder = async (
  params: IReturnOrderCreateByNotSaleOrderParams[]
) => {
  const res = await axios.post<IResponse>("/logistics/return/notToSale", params)
  return res.data.data
}

// 创建退货订单-按销售订单退货
export const requestCreateReturnOrderBySaleOrder = async (
  params: IReturnOrderCreateBySaleOrderParams[]
) => {
  const res = await axios.post<IResponse>("/logistics/return/toSale", params)
  return res.data.data
}

// 获取退货订单明细
export const queryReturnOrderDetail = async (id: string) => {
  const res = await axios.get<IResponse<IReturnOrderDetail[]>>(`/logistics/return/${id}/detail`)
  return res.data.data
}

// 退货订单结案
export const requestSettleReturnOrder = async (id: string) => {
  const res = await axios.post<IResponse>(`/logistics/return/${id}/complete`)
  return res.data.data
}

// 拆分标签码
export const requestSplitLabelReturnOrder = async (id: string, params: { splitList: number[] }) => {
  const res = await axios.post<IResponse>(`/logistics/return/${id}/split`, params)
  return res.data.data
}

// 获取已发货产品
export const requestProductListBySaleOrder = async (params: { saleId: string }) => {
  const res = await axios.get<IResponse<IReturnOrderProductInfo[]>>(
    "/logistics/return/saleProductList",
    {
      params
    }
  )
  return res.data.data
}

// 存在已发货产品的销售订单列表
export const requestSaleOrderByDelivery = async (params: ISaleOrderBySaleParams) => {
  const res = await axios.get<IResponse<IListPageResult<ISaleOrderBySaleListItem>>>(
    "/logistics/return/deliveredSale",
    {
      params
    }
  )
  return res.data.data
}
