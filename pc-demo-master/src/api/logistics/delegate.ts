import axios from "axios"

import type { IListPageResult, IRequestPageParams } from "@/types/common"
import type {
  DelegateOrder,
  DelegateOrderAddInter,
  IDelegateMaterialReturnAddItem,
  IDelegateOrderinboundItem,
  IDelegateOrderMaterialItem,
  IDelegateOrderoutboundItem,
  IDelegateOrderPageParams,
  IDelegateReturnAddInter,
  IDelegateReturnInpsectionRecordVo,
  IDelegateReturnMaterialVo,
  IDelegateReturnPageListParams,
  IDelegateReturnReceiveRecordVo,
  IDelegateReturnStorageVo,
  IDelegateReturnVo,
  IOutOrderProductItem,
  ISerialLinkParams,
  LogisticsDelegateInspectionRecordVo,
  TsesDelegateOrderMaterialVo,
  TsesDelegateOrderVo
} from "@/types/logistics/delegate"

import type { IRes } from "../interceptor"

// 分页查询委外订单
export async function queryOutsourcingOrderPageList(params: IDelegateOrderPageParams) {
  const res = await axios.post<IRes<IListPageResult<DelegateOrder>>>(
    `/delegate/productionOrder/page`,
    params
  )
  return res.data.data
}

// 获取指定id列表对应委外订单列表
export const requestOutsourcingOrderListByIds = async (params: { idList: string[] }) => {
  const res = await axios.post<IRes<DelegateOrder[]>>(`/delegate/productionOrder/listByIds`, params)
  return res.data.data
}

// 查询委外订单详情
export async function getProductionOrderById(params: { id: string | number }) {
  const res = await axios.get<IRes<TsesDelegateOrderVo>>(`/delegate/productionOrder/${params.id}`)
  return res.data.data
}

//  新建委外订单
export async function saveDelegateOrder(params: DelegateOrderAddInter) {
  const res = await axios.post<IRes>(`/delegate/productionOrder/saveDelegateOrder`, params)
  return res.data.data
}
// 更新委外订单
export async function updateDelegateOrder(params: DelegateOrderAddInter) {
  const res = await axios.post<IRes>(`/delegate/productionOrder/update`, params)
  return res.data.data
}

// 删除委外订单
export async function deleteProductionOrder(params: { id: string }) {
  const res = await axios.delete<IRes>(`/delegate/productionOrder/delete`, { params })
  return res.data.data
}
// 复核委外订单
export async function checkProductionOrder(params: { id: string }) {
  const res = await axios.put<IRes>(`/delegate/productionOrder/check`, params)
  return res.data.data
}
// 解复核委外订单
export async function unCheckProductionOrder(params: { id: string }) {
  const res = await axios.put<IRes>(`/delegate/productionOrder/unCheck`, params)
  return res.data.data
}
// 结案委外订单
export async function archiveProductionOrder(params: { id: string }) {
  const res = await axios.post<IRes>(`delegate/productionOrder/archive`, params)
  return res.data.data
}
//  查询物料清单，订单委外用
export async function inferOrderMaterials(
  params: Partial<{
    orderProcessId: string
    quantity: number
  }>
) {
  const res = await axios.post<IRes<TsesDelegateOrderMaterialVo[]>>(
    `/delegate/productionOrder/inferOrderMaterials`,
    params
  )
  return res.data.data
}
// 查询产出清单，订单委外用
export async function inferOrderOutputs(
  params: Partial<{
    orderProcessId: string
    quantity: number
  }>
) {
  const res = await axios.post<IRes<IOutOrderProductItem[]>>(
    `/delegate/productionOrder/inferOrderOutputs`,
    params
  )
  return res.data.data
}

// 获取委外订单-物料清单
export async function getOutsourcinglMaterialList(params: { id?: string }) {
  const res = await axios.post<IRes<IDelegateReturnMaterialVo[]>>(
    `delegate/productionOrder/material/list`,
    params
  )
  return res.data.data
}

// 查询物料清单，工序委外用
export async function inferSerialMaterials(
  params: Partial<{
    delegateOrderId: string
    items: {
      id: string
      orderAmount: number
    }[]
  }>
) {
  const res = await axios.post<IRes<TsesDelegateOrderMaterialVo[]>>(
    `/delegate/productionOrder/inferSerialMaterials`,
    params
  )
  return res.data.data
}

// 查询产出清单，工序委外用
export async function inferSerialOutputs(
  params: Partial<{
    delegateOrderId: string
    items: {
      id: string
      orderAmount: number
    }[]
  }>
) {
  const res = await axios.post<IRes<IOutOrderProductItem[]>>(
    `/delegate/productionOrder/inferSerialOutputs`,
    params
  )
  return res.data.data
}

// 收货详情列表
export async function productDeliveryInfo(
  params: IRequestPageParams<{
    id: string
  }>
) {
  const res = await axios.post<IRes<IListPageResult<IOutOrderProductItem>>>(
    `/delegate/productionOrder/productDeliveryInfo`,
    params
  )
  return res.data.data
}

// 委外订单-物料清单分页
export async function getProductMaterialList(
  params: IRequestPageParams<{
    id: string
  }>
) {
  const res = await axios.post<IRes<IListPageResult<IDelegateOrderMaterialItem>>>(
    `/delegate/productionOrder/materials`,
    params
  )
  return res.data.data
}

// 委外订单-产品清单分页
export async function queryOutOrderProductPageList(
  params: IRequestPageParams<{
    id: string
  }>
) {
  const res = await axios.post<IRes<IListPageResult<IOutOrderProductItem>>>(
    `/delegate/productionOrder/products`,
    params
  )
  return res.data.data
}

// 委外订单-出库记录分页
export async function getProductOutboundList(
  params: IRequestPageParams<{
    id: string
    productModelId?: string //筛选物料ID
  }>
) {
  const res = await axios.post<IRes<IListPageResult<IDelegateOrderoutboundItem>>>(
    `/delegate/productionOrder/outboundRecords`,
    params
  )
  return res.data.data
}

// 委外订单-退料记录分页
export async function getProductReturnMaterailList(
  params: IRequestPageParams<{
    id: string
    productModelId?: string //筛选物料ID
  }>
) {
  const res = await axios.post<IRes<IListPageResult<IDelegateMaterialReturnAddItem>>>(
    `/delegate/productionOrder/returnMaterialRecords`,
    params
  )
  return res.data.data
}

// 委外订单-入库记录分页
export async function getProductInboundList(
  params: IRequestPageParams<{
    id: string
  }>
) {
  const res = await axios.post<IRes<IListPageResult<IDelegateOrderinboundItem>>>(
    `/delegate/productionOrder/inboundRecords`,
    params
  )
  return res.data.data
}

export async function requestInspectionRecordInfo(
  params: IRequestPageParams<{
    id: string
  }>
) {
  const res = await axios.post<IRes<IListPageResult<LogisticsDelegateInspectionRecordVo>>>(
    `/delegate/productionOrder/inspectionRecordInfo`,
    params
  )
  return res.data.data
}

// 分页查询委外退料订单
export async function queryOutsourcingReturnPageList(params: IDelegateReturnPageListParams) {
  const res = await axios.post<IRes<IListPageResult<IDelegateReturnVo>>>(
    `/delegate/materialReturn/page`,
    params
  )
  return res.data.data
}

// 查询委外退料订单详情
export async function getOutsourcingReturnOrderById(params: { id: string | number }) {
  const res = await axios.get<IRes<IDelegateReturnVo>>(`/delegate/materialReturn/${params.id}`)
  return res.data.data
}

//  新建委外退料订单-保存和编辑
export async function outsourcingReturnSave(params: Partial<IDelegateReturnAddInter>) {
  const res = await axios.post<IRes>(`/delegate/materialReturn/saveOrUpdate`, params)
  return res.data.data
}

// 委外订单退料删除
export async function oustSourcingReturnDelete(params: { id: string }) {
  const res = await axios.delete<IRes>(`/delegate/materialReturn/delete`, { params })
  return res.data.data
}

// 委外退料订单结案
export async function oustSourcingReturnArchive(params: { id: string }) {
  const res = await axios.post<IRes>(`/delegate/materialReturn/archive/`, params)
  return res.data.data
}

// 委外退料订单复核
export async function outsourcingReturnCheck(params: { id: string }) {
  const res = await axios.put<IRes>(`/delegate/materialReturn/check/`, params)
  return res.data.data
}

// 委外退料订单解复核
export async function outsourcingReturnUnCheck(params: { id: string }) {
  const res = await axios.put<IRes>(`/delegate/materialReturn/unCheck/`, params)
  return res.data.data
}

// 获委外退料订单-检验记录
export async function getOutsourcingReturnInspectionRecord(
  params: IRequestPageParams<
    Partial<{
      id: string
    }>
  >
) {
  const res = await axios.post<IRes<IListPageResult<IDelegateReturnInpsectionRecordVo>>>(
    `/delegate/materialReturn/inspect/record`,
    params
  )
  return res.data.data
}

// 获委退料外订单-入库记录
export async function getOutsourcinglReturnStorageRecord(
  params: IRequestPageParams<
    Partial<{
      id: string
    }>
  >
) {
  const res = await axios.post<IRes<IListPageResult<IDelegateReturnStorageVo>>>(
    `/delegate/materialReturn/inbound/record`,
    params
  )
  return res.data.data
}

// 获委退料外订单-收货记录
export async function getOutsourcinglReturnRecieveRecord(
  params: IRequestPageParams<
    Partial<{
      id: string
    }>
  >
) {
  const res = await axios.post<IRes<IListPageResult<IDelegateReturnReceiveRecordVo>>>(
    `/delegate/materialReturn/receive/record`,
    params
  )
  return res.data.data
}

// 获委退料外订单-物料清单记录
export async function getOutsourcinglReturnMaterialRecord(
  params: IRequestPageParams<
    Partial<{
      id: string
    }>
  >
) {
  const res = await axios.post<IRes<IListPageResult<IDelegateMaterialReturnAddItem>>>(
    `/delegate/materialReturn/return/material`,
    params
  )
  return res.data.data
}

/** 判断工艺路线下工序是否连续 */
export const requestIsLinkSerial = async (data: ISerialLinkParams) => {
  const res = await axios.post<IRes<boolean>>(`/delegate/productionOrder/isLinked`, data)
  return res.data.data
}
