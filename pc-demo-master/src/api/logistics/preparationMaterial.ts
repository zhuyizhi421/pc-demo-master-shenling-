/** 物流管理-领料计划-领料计划 */

import axios from "axios"

import type { IListPageResult, IResponse } from "@/types/common"
import type {
  IPreparationMaterialAuditItem,
  IPreparationMaterialCreateReq,
  IPreparationMaterialDetail,
  IPreparationMaterialItem,
  IPreparationMaterialPageReq,
  IPreparationMaterialTaskPageListParams,
  IPreparationTaskDetailProduct,
  IPreparationTaskItem,
  ISelectMaterialModel
} from "@/types/logistics/preparationMaterial"

/** 领料计划分页列表 */
export const queryPreparationMaterialPageList = async (params: IPreparationMaterialPageReq) => {
  const res = await axios.post<IResponse<IListPageResult<IPreparationMaterialItem>>>(
    `/logistics/production/preparation/list`,
    params
  )
  return res.data.data
}

/** 领料计划删除 */
export const requestDeletePreparationMaterialPlan = async (id: string) => {
  const res = await axios.delete<IResponse>(`/logistics/production/preparation/${id}`)
  return res.data.data
}

/** 领料计划复核 */
export const requestAuditPreparationMaterialPlan = async (
  id: string,
  data: { productModelId: string; storageId: string }[]
) => {
  const res = await axios.put<IResponse>(`/logistics/production/preparation/check/${id}`, data)
  return res.data.data
}

/** 领料计划解复核 */
export const requestUnAuditPreparationMaterialPlan = async (id: string) => {
  const res = await axios.put<IResponse>(`/logistics/production/preparation/unCheck/${id}`)
  return res.data.data
}

/** 领料计划结案 */
export const requestSettlePreparationMaterialPlan = async (id: string) => {
  const res = await axios.put<IResponse>(`/logistics/production/preparation/finish/${id}`)
  return res.data.data
}

/** 检查领料计划是否完成 */
export const requestCheckPreparationMaterialPlan = async (id: string) => {
  const res = await axios.get<IResponse<boolean>>(
    `/logistics/production/preparation/checkFinish/${id}`
  )
  return res.data.data
}

/** 领料计划创建 */
export const requestCreatePreparationMaterialPlan = async (
  params: IPreparationMaterialCreateReq
) => {
  const res = await axios.post<IResponse>(`/logistics/production/preparation/create`, params)
  return res.data.data
}

/** 领料计划更新 */
export const requestUpdatePreparationMaterialPlan = async (
  params: IPreparationMaterialCreateReq
) => {
  const res = await axios.post<IResponse>(`/logistics/production/preparation/update`, params)
  return res.data.data
}

/** 领料计划详情 */
export const queryPreparationMaterialPlanDetail = async (id: string) => {
  const res = await axios.get<IResponse<IPreparationMaterialDetail>>(
    `/logistics/production/preparation/${id}`
  )
  return res.data.data
}

/** 委外订单领料范围 */
export const requestDelegateCandidateProductModels = async (delegateOrderId: string) => {
  const res = await axios.post<IResponse<ISelectMaterialModel[]>>(
    `/logistics/production/preparation/delegateOrder/candidateProductModels`,
    {
      delegateOrderId
    }
  )
  return res.data.data
}

/** 生产订单领料范围 */
export const requestProductCandidateProductModels = async (productionTaskId: string) => {
  const res = await axios.post<IResponse<ISelectMaterialModel[]>>(
    `/logistics/production/preparation/productionTask/candidateProductModels`,
    {
      productionTaskId
    }
  )
  return res.data.data
}

/** 领料任务分页列表 */
export const requestPreparationMaterialTaskPageList = async (
  params: IPreparationMaterialTaskPageListParams
) => {
  const res = await axios.post<IResponse<IListPageResult<IPreparationTaskItem>>>(
    "/logistics/production/preparation/task/page",
    params
  )
  return res.data.data
}

/** 领料任务详情 */
export const queryPreparationMaterialTaskDetail = async (id: string) => {
  const res = await axios.get<IResponse<IPreparationTaskItem>>(
    `/logistics/production/preparation/task/${id}`
  )
  return res.data.data
}

/** 查询详情领料仓库 */
export const queryPreparationMaterialStorageList = async (id: string) => {
  const res = await axios.get<IResponse<IPreparationMaterialAuditItem[]>>(
    `/logistics/production/preparation/material/storage/${id}`
  )
  return res.data.data
}

/** 查询领料任务详情的具体备料产品 */
export const requestPreparationMaterialDetailProductList = async (id: string) => {
  const res = await axios.post<IResponse<IPreparationTaskDetailProduct>>(
    `/logistics/production/preparation/planDetail`,
    {
      id
    }
  )
  return res.data.data
}
