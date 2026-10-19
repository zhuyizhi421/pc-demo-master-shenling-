import axios from "axios"

import type { IListPageResult, IResponse } from "@/types/common"
import type {
  IEquipmentMaintenanceTypeItem,
  IEquipmentMaintenanceTypePageParams,
  IEquipmentMaintenanceTypeSaveParams
} from "@/types/maintain/equipment-manage/equipment-maintenance-type"

export const queryEquipmentMaintenanceTypePageList = async (
  params: IEquipmentMaintenanceTypePageParams
) => {
  const res = await axios.post<IResponse<IListPageResult<IEquipmentMaintenanceTypeItem>>>(
    "/equipmentMaintenanceType/page",
    params
  )
  return res.data.data
}

export const requestEquipmentMaintenanceTypeList = async () => {
  const res = await axios.post<IResponse<IEquipmentMaintenanceTypeItem[]>>(
    "/equipmentMaintenanceType/list"
  )
  return res.data.data
}

export const queryEquipmentMaintenanceTypeDetail = async (id: string) => {
  const res = await axios.post<IResponse<IEquipmentMaintenanceTypeItem>>(
    "/equipmentMaintenanceType/id",
    { id }
  )
  return res.data.data
}

export const requestCreateEquipmentMaintenanceType = async (
  params: IEquipmentMaintenanceTypeSaveParams
) => {
  const res = await axios.post<IResponse>("/equipmentMaintenanceType/save", params)
  return res.data.data
}

export const requestUpdateEquipmentMaintenanceType = async (
  params: IEquipmentMaintenanceTypeSaveParams
) => {
  const res = await axios.post<IResponse>("/equipmentMaintenanceType/update", params)
  return res.data.data
}

export const requestDeleteEquipmentMaintenanceType = async (id: string) => {
  const res = await axios.post<IResponse>("/equipmentMaintenanceType/delete", { id })
  return res.data.data
}
