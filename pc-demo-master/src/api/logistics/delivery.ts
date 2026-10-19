import axios from "axios"

import type { IPackageProcessProductDeleteParams } from "@/types/base-info/package-process"
import type { IListPageResult, IResponse } from "@/types/common"
import type {
  IDeliveryDetailItem,
  IDeliveryPlanCopyPackageProcessParams,
  IDeliveryPlanDeliveryRecordItem,
  IDeliveryPlanMaterialOutRecordItem,
  IDeliveryPlanPackageProductItem,
  IDeliveryPlanPackageProductSaveParams,
  IDeliveryPlanPackageRecordItem,
  IDeliveryPlanPackageSpecItem,
  IDeliveryPlanPageListItem,
  IDeliveryPlanPageListParams,
  IDeliveryPlanProductRecordItem,
  IDeliveryPlanSaveParams,
  IProcessInfo,
  ISaleOrderListByNotPlanDeliveryParams,
  ISaleOrderListItemByNotPlanDelivery,
  ISaleOrderProductListItem,
  ISaleOrderProductPageListParams
} from "@/types/logistics/delivery"

// 发货计划分页查询
export const queryDeliveryPlanPageList = async (params: IDeliveryPlanPageListParams) => {
  const res = await axios.post<IResponse<IListPageResult<IDeliveryPlanPageListItem>>>(
    "/logistics/delivery/search",
    params
  )
  return res.data.data
}

// 发货计划复核
export const requestReviewDeliveryPlan = async (id: string) => {
  const res = await axios.post<IResponse>(`/logistics/delivery/check`, { id })
  return res.data.data
}

// 发货计划解复核
export const requestCancelReviewDeliveryPlan = async (id: string) => {
  const res = await axios.post<IResponse>(`/logistics/delivery/unCheck`, { id })
  return res.data.data
}

// 发货计划删除
export const requestDeleteDeliveryPlan = async (id: string) => {
  const res = await axios.post<IResponse>(`/logistics/delivery/delete`, { id })
  return res.data.data
}

// 发货计划结案
export const requestSettleDeliveryPlan = async (id: string) => {
  const res = await axios.post<IResponse>(`/logistics/delivery/${id}/complete`)
  return res.data.data
}

// 获取发货计划关联的包装规范列表
export const requestPackageSpecListByDeliveryPlan = async (id: string) => {
  const res = await axios.post<IResponse<IDeliveryPlanPackageSpecItem[]>>(
    `/logistics/delivery/getPackSpecVoListByDeliveryId`,
    { id }
  )
  return res.data.data
}

// 获取发货计划明细
export const queryDeliveryPlanDetail = async (id: string) => {
  const res = await axios.get<IResponse<IDeliveryDetailItem>>(`/logistics/delivery/${id}`)
  return res.data.data
}

// 获取存在未计划发货产品的销售订单列表
export const requestSaleOrderListByNotPlanDelivery = async (
  params: ISaleOrderListByNotPlanDeliveryParams
) => {
  const res = await axios.get<IResponse<IListPageResult<ISaleOrderListItemByNotPlanDelivery>>>(
    "/logistics/delivery/unplannedDeliverySale",
    {
      params
    }
  )
  return res.data.data
}

// 获取发货计划关联产品记录
export const requestProductRecordByDeliveryPlan = async (id: string) => {
  const res = await axios.get<IResponse<IDeliveryPlanProductRecordItem[]>>(
    `/logistics/delivery/${id}/detail`
  )
  return res.data.data
}

// 获取发货计划关联领料出库记录
export const requestMaterialOutRecordByDeliveryPlan = async (
  id: string,
  productModelId?: string
) => {
  const res = await axios.get<IResponse<IDeliveryPlanMaterialOutRecordItem[]>>(
    `/logistics/delivery/${id}/outbound`,
    { params: { productModelId } }
  )
  return res.data.data
}

// 获取发货计划关联包装记录
export const requestPackageRecordByDeliveryPlan = async (id: string) => {
  const res = await axios.get<IResponse<IDeliveryPlanPackageRecordItem[]>>(
    `/logistics/delivery/${id}/pack`
  )
  return res.data.data
}

// 获取发货计划关联发货记录
export const requestDeliveryRecordByDeliveryPlan = async (id: string) => {
  const res = await axios.get<IResponse<IDeliveryPlanDeliveryRecordItem[]>>(
    `/logistics/delivery/${id}/delivery`
  )
  return res.data.data
}

// 发货计划产品与包装规范-产品列表查询
export const queryDeliveryPlanPackageProductList = async (techVersionId: string) => {
  const res = await axios.get<IResponse<IDeliveryPlanPackageProductItem[]>>(
    `/logistics/delivery/getTechProductList`,
    {
      params: { techVersionId }
    }
  )
  return res.data.data
}

// 发货计划产品与包装规范-产品列表-保存
export const requestSaveDeliveryPlanPackageProductList = async (
  params: IDeliveryPlanPackageProductSaveParams
) => {
  const res = await axios.post<IResponse>(
    `/logistics/delivery/saveTechStandardMaterialList`,
    params
  )
  return res.data.data
}

// 发货计划复制包装工序
export const requestDeliveryPlanCopyPackageProcess = async (
  params: IDeliveryPlanCopyPackageProcessParams
) => {
  const res = await axios.post<IResponse<IProcessInfo>>(`/logistics/delivery/quoteTech`, params)
  return res.data.data
}

// 发货计划新建包装工序
export const requestDeliveryPlanCreatePackageProcess = async () => {
  const res = await axios.post<IResponse<IProcessInfo>>(`/logistics/delivery/createTech`)
  return res.data.data
}

// 发货计划通过销售订单获取产品列表分页
export const querySaleOrderProductPageList = async (params: ISaleOrderProductPageListParams) => {
  const res = await axios.post<IResponse<IListPageResult<ISaleOrderProductListItem>>>(
    `/logistics/delivery/getProductForDelivery`,
    params
  )
  return res.data.data
}

// 发货计划新增、编辑保存
export const requestSaveDeliveryPlan = async (params: IDeliveryPlanSaveParams) => {
  const res = await axios.post<IResponse>(`/logistics/delivery/saveOrUpdate`, params)
  return res.data.data
}

// 获取销售订单未计划发货产品
export const requestNotPlanSaleOrderProductList = async (saleId: string) => {
  const res = await axios.get<IResponse<IDeliveryPlanPackageProductItem[]>>(
    `/logistics/delivery/saleProductList`,
    {
      params: { saleId }
    }
  )
  return res.data.data
}

// 发货计划编辑时获取普通发货下的产品列表
export const requestDeliveryPlanUpdateProductList = async (id: string) => {
  const res = await axios.get<IResponse<IDeliveryPlanPackageProductItem[]>>(
    `/logistics/delivery/getProductListById/${id}`
  )
  return res.data.data
}

// 发货计划删除包装工序下产品
export const requestDeleteDeliveryPlanPackageProduct = async (
  params: IPackageProcessProductDeleteParams
) => {
  const res = await axios.post<IResponse>(`/logistics/delivery/deleteTechStandardMaterial`, params)
  return res.data.data
}
