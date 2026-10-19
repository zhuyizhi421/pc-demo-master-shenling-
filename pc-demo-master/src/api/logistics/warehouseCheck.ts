import axios from "axios"

import type { IListPageResult, IResponse } from "@/types/common"
import type {
  IWarehouseCheckCreateParams,
  IWarehouseCheckDetail,
  IWarehouseCheckPageListItem,
  IWarehouseCheckPageListParams,
  IWarehouseCheckProductListItem,
  IWarehouseCheckProductListParams,
  IWarehouseCheckProductModelListByIdsParams,
  IWarehouseCheckRecordItem,
  IWarehouseCheckUpdateParams
} from "@/types/logistics/warehouse-check"

/** 仓库盘点单分页列表 */
export const queryWarehouseCheckPageList = async (params: IWarehouseCheckPageListParams) => {
  const res = await axios.post<IResponse<IListPageResult<IWarehouseCheckPageListItem>>>(
    "/logistics/check/search",
    params
  )
  return res.data.data
}

/** 创建仓库盘点单 */
export const requestCreateWarehouseCheck = async (params: IWarehouseCheckCreateParams) => {
  const res = await axios.post<IResponse>(`/logistics/check`, params)
  return res.data.data
}

/** 更新仓库盘点单 */
export const requestUpdateWarehouseCheck = async ({
  id,
  ...params
}: IWarehouseCheckUpdateParams) => {
  const res = await axios.put<IResponse>(`/logistics/check/${id}`, params)
  return res.data.data
}

/** 删除仓库盘点单 */
export const requestDeleteWarehouseCheck = async (id: string) => {
  const res = await axios.delete<IResponse>(`/logistics/check/${id}`)
  return res.data.data
}

/** 仓库盘点单详情 */
export const queryWarehouseCheckDetail = async (id: string) => {
  const res = await axios.get<IResponse<IWarehouseCheckDetail[]>>(`/logistics/check/${id}/detail`)
  return res.data.data
}

/** 仓库盘点单发布 */
export const requestPublishWarehouseCheck = async (id: string) => {
  const res = await axios.post<IResponse>(`/logistics/check/${id}/publish`)
  return res.data.data
}

/** 仓库盘点单结案 */
export const requestSettleWarehouseCheck = async ({
  id,
  ...params
}: {
  id: string
  accept: boolean
}) => {
  const res = await axios.post<IResponse>(`/logistics/check/${id}/close`, params)
  return res.data.data
}

/** 获取盘点记录 */
export const requestWarehouseCheckRecords = async (params: {
  id: string
  productModelId?: string
}) => {
  const res = await axios.get<IResponse<IWarehouseCheckRecordItem[]>>(
    `/logistics/check/${params.id}/record`,
    {
      params
    }
  )
  return res.data.data
}

/** 获取仓库盘点单的产品模型 */
export const requestProductModelByWarehouseCheck = async (
  params: IWarehouseCheckProductListParams
) => {
  const res = await axios.get<IResponse<IListPageResult<IWarehouseCheckProductListItem>>>(
    "/logistics/check/productModel",
    { params }
  )
  return res.data.data
}

/** 获取仓库盘点单中指定id列表对应的产品模型 */
export const requestProductModelByWarehouseCheckIds = async (
  params: IWarehouseCheckProductModelListByIdsParams
) => {
  const res = await axios.post<IResponse<IWarehouseCheckProductListItem[]>>(
    `/logistics/check/listByIds`,
    params
  )
  return res.data.data
}
