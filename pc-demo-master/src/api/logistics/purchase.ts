import axios from "axios"

import type { IListPageResult, IResponse } from "@/types/common"
import type {
  ICreateData,
  IDynamicPurchaseOrderPageListParams,
  IInventoryReturnPageListItem,
  IInventoryReturnPageListParams,
  IOutRecordInfo,
  IPurchaseOrderCreateParams,
  IPurchaseOrderDetail,
  IPurchaseOrderPageListItem,
  IPurchaseOrderPageListParams,
  IPurchaseReturnListItem,
  IPurchaseReturnTaskDetail,
  LogisticsPurchaseArrivalInstanceVO,
  LogisticsPurchaseArrivalRecord,
  LogisticsPurchaseInboundRecord,
  LogisticsPurchaseReturnInspectRecord,
  LogisticsPurchaseReturnOutboundRecord,
  LogisticsPurchaseTaskDetail
} from "@/types/logistics/purchase"

// 采购订单分页查询
export const queryPurchaseOrderPageList = async (params: IPurchaseOrderPageListParams) => {
  const res = await axios.post<IResponse<IListPageResult<IPurchaseOrderPageListItem>>>(
    "/logistics/purchase/search",
    params
  )
  return res.data.data
}

// 采购订单分页查询（动态列配置）
export const queryDynamicPurchaseOrderPageList = async (
  params: IDynamicPurchaseOrderPageListParams
) => {
  const res = await axios.post<IResponse<IListPageResult<IPurchaseOrderPageListItem>>>(
    "/logistics/purchase/dynamicSearch",
    params
  )
  return res.data.data
}

// 新建采购订单
export const requestCreatePurchaseOrder = async (params: IPurchaseOrderCreateParams) => {
  const res = await axios.post<IResponse>("/logistics/purchase", params)
  return res.data.data
}

// 编辑采购订单
export const requestUpdatePurchaseOrder = async (
  id: string,
  params: IPurchaseOrderCreateParams
) => {
  const res = await axios.put<IResponse>(`/logistics/purchase/${id}`, params)
  return res.data.data
}

// 删除采购订单
export const requestDeletePurchaseOrder = async (id: string) => {
  const res = await axios.delete<IResponse>(`/logistics/purchase/${id}`)
  return res.data.data
}

// 采购订单 -- 查看详情
export const queryPurchaseOrderDetail = async (params: { id: string }) => {
  const res = await axios.get<IResponse<IPurchaseOrderDetail>>(`/logistics/purchase/${params.id}`, {
    params
  })
  return res.data.data
}

// 采购订单结案
export const requestSettlePurchaseOrder = async (params: { id: string }) => {
  const res = await axios.post<IResponse>(`/logistics/purchase/${params.id}/complete`, params)
  return res.data.data
}

// 采购订单复核
export const requestReviewPurchaseOrder = async (params: { id: string }) => {
  const res = await axios.put<IResponse>(`/logistics/purchase/check/${params.id}`, params)
  return res.data.data
}

// 采购订单解复核
export const requestUnReviewPurchaseOrder = async (params: { id: string }) => {
  const res = await axios.put<IResponse>(`/logistics/purchase/unCheck/${params.id}`, params)
  return res.data.data
}

// 库存退货单分页查询
export const queryInventoryReturnPageList = async (params: IInventoryReturnPageListParams) => {
  const res = await axios.post<IResponse<IListPageResult<IInventoryReturnPageListItem>>>(
    `/logistics/purchase/return/pagePurchaseReturnTask`,
    params
  )
  return res.data.data
}

// 获取收货记录
export async function getLogPurchaseDetailArrival(
  purchaseId: string,
  params: { productModelId?: string }
) {
  const res = await axios.get<IResponse<LogisticsPurchaseArrivalRecord[]>>(
    `/logistics/purchase/${purchaseId}/arrival`,
    {
      params
    }
  )
  return res.data.data
}

// 获取收货记录详情
export async function getLogPurchaseDetailArrivalDetail(params: {
  receiptId: string
  productModelId: string
  unitId: string
}) {
  const res = await axios.post<IResponse<LogisticsPurchaseArrivalInstanceVO[]>>(
    "/logistics/purchase/receipt/instances",
    params
  )
  return res.data.data
}

// 获取入库记录
export async function getLogPurchaseDetailInbound(
  purchaseId: string,
  params: { productModelId?: string }
) {
  const res = await axios.get<IResponse<LogisticsPurchaseInboundRecord[]>>(
    `/logistics/purchase/${purchaseId}/inbound`,
    {
      params
    }
  )
  return res.data.data
}

// 获取入库详情
export const requestInboundDetail = async (params: {
  inboundId: string
  productModelId: string
}) => {
  const res = await axios.post<IResponse<LogisticsPurchaseInboundRecord>>(
    "/logistics/purchase/inbound/details",
    params
  )
  return res.data.data
}

// 获取退货出入库记录
export async function getLogPurchaseInOutRecord(
  purchaseId: string,
  params: { productModelId?: string }
) {
  const res = await axios.get<IResponse<LogisticsPurchaseReturnOutboundRecord[]>>(
    `/logistics/purchase/${purchaseId}/returnOutbound`,
    {
      params
    }
  )
  return res.data.data
}

// 获取采购清单明细
export async function getLogPurchaseItemDetail(params: { purchaseId: string | number }) {
  const res = await axios.get<IResponse<Required<LogisticsPurchaseTaskDetail>[]>>(
    `/logistics/purchase/${params.purchaseId}/detail`,
    {
      params
    }
  )
  return res.data.data
}

// 获取检验记录
export async function getLogPurchaseInspectionRecord(
  purchaseId: string,
  params: { productModelId?: string }
) {
  const res = await axios.get<IResponse<LogisticsPurchaseReturnInspectRecord[]>>(
    `/logistics/purchase/${purchaseId}/inspectionRecord`,
    {
      params
    }
  )
  return res.data.data
}

// 结案采购退货单
export async function closePurchaseReturnTask(returnTaskId: string | number) {
  const res = await axios.put<IResponse>(
    `/logistics/purchase/return/closePurchaseReturnTask/${returnTaskId}`
  )
  return res.data.data
}

// 删除采购退货单
export async function deletePurchaseReturnTask(returnTaskId: string | number) {
  const res = await axios.delete<IResponse>(
    `/logistics/purchase/return/deletePurchaseReturnTask/${returnTaskId}`
  )
  return res.data.data
}

// 新建采购退货单
export async function createPurchaseReturnTask(params: ICreateData) {
  const res = await axios.post<IResponse>(
    `/logistics/purchase/return/createPurchaseReturnTask`,
    params
  )
  return res.data.data
}

// 更新采购退货单
export async function updatePurchaseReturnTask(returnTaskId: string | number, params: ICreateData) {
  const res = await axios.put<IResponse>(
    `/logistics/purchase/return/updatePurchaseReturnTask/${returnTaskId}`,
    params
  )
  return res.data.data
}

// 获取采购退货单明细
export async function getPurchaseReturnTaskDetail(returnTaskId: string | number) {
  const res = await axios.get<IResponse<IPurchaseReturnListItem[]>>(
    `/logistics/purchase/return/getPurchaseReturnTaskDetail/${returnTaskId}`
  )
  return res.data.data
}

// 根据ID获取采购退货单详情
export async function getPurchaseReturnTaskById(returnTaskId: string | number) {
  const res = await axios.get<IResponse<IPurchaseReturnTaskDetail>>(
    `/logistics/purchase/return/getPurchaseReturnTaskById/${returnTaskId}`
  )
  return res.data.data
}

/** 采购退货-出货记录 */
export const requestPurchaseReturnOutboundRecord = async (params: {
  productModelId?: string
  returnTaskId: string
}) => {
  const res = await axios.get<IResponse<IOutRecordInfo[]>>(
    `/logistics/purchase/return/getPurchaseReturnOutboundRecord`,
    {
      params
    }
  )
  return res.data.data
}
