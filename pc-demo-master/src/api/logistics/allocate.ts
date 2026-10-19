import axios from "axios"

import type { IListPageResult, IResponse } from "@/types/common"
import type {
  IWarehouseAllotPageListParams,
  LogisticsAllocateDetail,
  LogisticsAllocateOutInventory,
  LogisticsAllocateRecord,
  LogisticsInventoryFacilityGroupRecord,
  LogProductInventoryInter,
  ProductModel
} from "@/types/logistics/allocate"

interface LogAllocateCreateInter {
  details: {
    id?: string
    productModelId?: string
    allocateQty?: number | string
    unitId?: string
  }[]
  outWarehouseId?: string
  inWarehouseId?: string
}

// 新建调拨单
export async function getLogAllocateCreate(params: LogAllocateCreateInter) {
  const res = await axios.post<IResponse>("/logistics/allocate", params)
  return res.data.data
}

// 产品库存查询
export async function getLogAllocateProductInventorySearch(params: LogProductInventoryInter) {
  const res = await axios.get<IResponse<IListPageResult<LogisticsInventoryFacilityGroupRecord>>>(
    "/logistics/allocate/productInventory",
    {
      params
    }
  )
  return res.data.data
}

// 调拨单查询
export async function queryWarehouseAllotPageList(params: IWarehouseAllotPageListParams) {
  const res = await axios.post<IResponse<IListPageResult<LogisticsAllocateRecord>>>(
    "/logistics/allocate/search",
    params
  )
  return res.data.data
}

// 编辑调拨单
export async function getLogAllocateUpdate(id: string, params: LogAllocateCreateInter) {
  const res = await axios.put<IResponse>(`/logistics/allocate/${id}`, params)
  return res.data.data
}

// 删除调拨单
export async function deleteLogAllocateOrder(id: string) {
  const res = await axios.delete<IResponse>(`/logistics/allocate/${id}`)
  return res.data.data
}

// 获取调拨明细
export async function getLogAllocateDetail(id: string) {
  const res = await axios.get<IResponse<LogisticsAllocateDetail[]>>(
    `/logistics/allocate/${id}/detail`
  )
  return res.data.data
}

// 获取出入库记录
export async function getLogAllocateDetailInOutRecord(params: {
  productModelId?: string
  id?: string
}) {
  const res = await axios.get<IResponse<LogisticsAllocateOutInventory[]>>(
    `/logistics/allocate/${params.id}/inOutRecord`,
    {
      params
    }
  )
  return res.data.data
}

// 获取产品模型列表
export async function getLogAllocateProductList(id: string | number) {
  const res = await axios.get<IResponse<ProductModel[]>>(`/logistics/allocate/${id}/product`)
  return res.data.data
}

// 调拨单结案
export async function getLogAllocateComplete(params: { id: string }) {
  const res = await axios.post<IResponse>(`/logistics/allocate/${params.id}/complete`, params)
  return res.data.data
}
