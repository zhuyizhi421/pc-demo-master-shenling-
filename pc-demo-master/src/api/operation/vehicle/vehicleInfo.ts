import axios from "axios"

import type { IListPageResult } from "@/types/common"
import type { IVehiclePageItem, IVehiclePageParams } from "@/types/maintain/vehicle"

import type { IRes } from "../../interceptor"
// 载具信息

// 分页查询
export async function getVehiclePage(params: IVehiclePageParams) {
  const res = await axios.post<IRes<IListPageResult<IVehiclePageItem>>>("/vehicle/page", params)
  return res.data.data
}

// 删除数据
export async function deleteVehicleItem(id: string) {
  const res = await axios.delete<IRes>(`/vehicle/delete/${id}`, { params: { id } })
  return res.data.data
}

interface vehicleSaveOrUpdateInter {
  id?: string
  name?: string
  no?: string
  vehicleModelId?: string
  remarks?: string
  status?: number
  barcode?: string
  autoGenerateCode?: boolean
}

// 保存或更新接口 更新传id
export async function getVehicleSaveOrUpdate(params: vehicleSaveOrUpdateInter) {
  const res = await axios.post<IRes>("/vehicle/saveOrUpdate", params)
  return res.data.data
}

// 卸载
export async function updateVehicleUnload(
  vehicleId: string,
  params: { productIds?: string[]; boxIds?: string[] }
) {
  const res = await axios.put<IRes<null>>(`/vehicle/unload/${vehicleId}`, params)
  return res.data.data
}

// 查询单条数据
export async function getVehicleItem(id: string) {
  const res = await axios.get<IRes>(`/vehicle/${id}`)
  return res.data.data
}
