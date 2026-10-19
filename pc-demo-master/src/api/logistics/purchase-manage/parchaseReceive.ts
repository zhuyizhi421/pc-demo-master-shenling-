/**
 * 采购管理-采购收货
 */

import axios from "axios"

import type { IListPageResult, IResponse } from "@/types/common"
import type {
  IPurchaseReceivePageListItem,
  IPurchaseReceivePageParams,
  IPurchaseReceiveReceiveDetail,
  LogisticsPurchaseReceiveAttachment
} from "@/types/logistics/purchaseReceive"

// 查询采购收货单分页列表
export const queryPurchaseReceivePageList = async (params: IPurchaseReceivePageParams) => {
  const res = await axios.get<IResponse<IListPageResult<IPurchaseReceivePageListItem>>>(
    `/logistics/purchase/receipt/page`,
    {
      params
    }
  )
  return res.data.data
}

// 根据ID查询单个收货单信息
export const queryPurchaseReceiveDetail = async (params: { id: string }) => {
  const res = await axios.get<IResponse<IPurchaseReceiveReceiveDetail>>(
    `/logistics/purchase/receipt/${params.id}`
  )
  return res.data.data
}

//  查询收货单附件列表
export const requestPurchaseReceiveAttachment = async (params: { id: string }) => {
  const res = await axios.get<IResponse<LogisticsPurchaseReceiveAttachment[]>>(
    `/logistics/purchase/receipt/attachment/${params.id}`,
    {
      params
    }
  )
  return res.data.data
}

/** 采购收货上传附件 */
export const requestProcurementReceiveAttachment = async (taskId: string, fileId: string) => {
  const res = await axios.put<IResponse>(
    `/logistics/purchase/receipt/attachment/${taskId}/${fileId}`
  )
  return res.data.data
}
