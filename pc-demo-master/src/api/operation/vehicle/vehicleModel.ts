import axios from "axios"

import { EnumVehicleType } from "@/constant/enums"
import type { IListPageResult } from "@/types/common"
import type { IVehicleModelPageItem, IVehicleModelPageParams } from "@/types/maintain/vehicle"

import type { IRes } from "../../interceptor"

interface vehicleModelSaveOrUpdateInter {
  id?: string
  modelImg?: string
  modelName?: string
  modelNo?: string
  modelStatus?: string
  remarks?: string
  repairProcdefId?: string
  scrapProcdefId?: string
  type?: EnumVehicleType
  vehicleCategoryId?: string
}

// 保存或更新接口 更新传id
export async function getVehicleModelSaveOrUpdate(params: vehicleModelSaveOrUpdateInter) {
  const res = await axios.post<IRes>("/vehicleModel/saveOrUpdate", params, {
    headers: { "Content-Type": "application/json" }
  })
  return res.data.data
}

// 分页查询
export async function getVehicleModelPage(params: IVehicleModelPageParams) {
  const res = await axios.post<IRes<IListPageResult<IVehicleModelPageItem>>>(
    "/vehicleModel/page",
    params
  )
  return res.data.data
}

// 删除数据
export async function deleteVehicleModel(id: string) {
  const res = await axios.delete<IRes>(`/vehicleModel/delete/${id}`, { params: { id } })
  return res.data.data
}
