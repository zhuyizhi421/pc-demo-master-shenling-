import axios from "axios"

import type { IListPageResult } from "@/types/common"

import type { IRes } from "../interceptor"

// 打印库位标签码
export async function getLogwarehouseLocationBarcode(params: { id: number }) {
  const res = await axios.post<IRes>(`/logistics/warehouse/location/${params.id}/barcode`, params, {
    headers: { "Content-Type": "application/json" }
  })
  return res.data.data
}

export interface LogWarehouseLocationSearchInter {
  facilityId: string // 必须字段：仓库ID
  isEnable?: boolean // 非必须字段：状态是否启用
  locationCode?: string // 非必须字段：库位编号
  locationName?: string // 非必须字段：库位名称
  pageNum: number // 必须字段：每页显示条数
  pageSize: number
}

// 查询库位
export async function getLogWarehouseLocationSearch(params: LogWarehouseLocationSearchInter) {
  const res = await axios.get<IRes<IListPageResult<any>>>("/logistics/warehouse/location/search", {
    params
  })
  return res.data.data
}

// 获取库位
export async function getLogWarehouseLocationItem(id: string) {
  const res = await axios.get<IRes>(`/logistics/warehouse/location/${id}`)
  return res.data.data
}

interface IEditLogwarehouseLocationItem {
  id?: string
  barcode?: string
  autoGenerateCode: boolean
  allowMro?: boolean // 非必须字段：是否允许存放MRO
  allowMroList?: number[] // 非必须字段：允许MRO列表，每个条目是一个整数的数组
  allowProduct?: boolean // 非必须字段：是否允许存放产品
  allowProductCategoryList?: number[] // 非必须字段：允许产品类别列表，每个条目是一个整数的数组
  allowProductList?: number[] // 非必须字段：允许产品列表，每个条目是一个整数的数组
  locationName?: string
  locationCode?: string
  facilityId?: string
  modelId?: string
}

// 新建库位
export async function createLogwarehouseLocationItem(params: IEditLogwarehouseLocationItem) {
  const res = await axios.post<IRes>(`/logistics/warehouse/location`, params)
  return res.data.data
}

// 编辑库位
export async function editLogwarehouseLocationItem({
  id,
  ...params
}: IEditLogwarehouseLocationItem) {
  const res = await axios.put<IRes>(`/logistics/warehouse/location/${id}`, params)
  return res.data.data
}

// 停用库位
export async function disableLogwarehouseLocationItem(data: { id: string }) {
  const res = await axios.put<IRes>(`/logistics/warehouse/location/${data.id}/disable`, data)
  return res.data.data
}

// 启用库位
export async function enableLogwarehouseLocationItem(data: { id: string }) {
  const res = await axios.put<IRes>(`/logistics/warehouse/location/${data.id}/enable`, data)
  return res.data.data
}
