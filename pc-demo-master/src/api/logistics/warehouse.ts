import axios from "axios"

import type { IListPageResult, IResponse } from "@/types/common"
import type {
  IWarehouseEditParams,
  IWarehousePageListItem,
  IWarehousePageListParams,
  IWarehousePageParams
} from "@/types/logistics/warehouse"

// 查询仓库分页
export async function queryWarehousePageList(params: IWarehousePageParams) {
  const res = await axios.get<IResponse<IListPageResult<IWarehousePageListItem>>>(
    "/logistics/warehouse/search",
    {
      params
    }
  )
  return res.data.data
}

// 查询仓库分页
export async function queryWarehousePage(params: IWarehousePageListParams) {
  const res = await axios.post<IResponse<IListPageResult<IWarehousePageListItem>>>(
    "logistics/warehouse/page",
    params
  )
  return res.data.data
}

// 编辑仓库
export async function requestUpdateWarehouse(data: { id: string }, params: IWarehouseEditParams) {
  const res = await axios.put<IResponse>(`/logistics/warehouse/${data.id}`, params)
  return res.data.data
}

// 停用仓库
export async function requestDisableWarehouse(data: { id: string }) {
  const res = await axios.put<IResponse>(`/logistics/warehouse/${data.id}/disable`, data)
  return res.data.data
}

// 启用仓库
export async function requestEnableWarehouse(data: { id: string }) {
  const res = await axios.put<IResponse>(`/logistics/warehouse/${data.id}/enable`, data)
  return res.data.data
}
