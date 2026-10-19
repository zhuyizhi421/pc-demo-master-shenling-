import axios from "axios"

import type { IRes } from "../../interceptor"

// 查询所有载具类别数据(树状结构)
export async function getVehicleCategoryTreeList(id?: string) {
  const res = await axios.get<IRes>(`/vehicleCategory/TreeList`, {
    params: { id }
  })
  return res.data.data
}

interface vehicleCategorySaveOrUpdateInter {
  id?: string
  categoryName?: string
  categoryNo?: string
  parentId?: string
  remarks?: string
}

// 添加或更新载具类别
export async function getVehicleCategorySaveOrUpdate(params: vehicleCategorySaveOrUpdateInter) {
  const res = await axios.post<IRes>("/vehicleCategory/saveOrUpdate", params)
  return res.data.data
}

// 删除数据
export async function deleteVehicleCategory(id: string) {
  const res = await axios.delete<IRes>(`/vehicleCategory/delete/${id}`, { params: { id } })
  return res.data.data
}
