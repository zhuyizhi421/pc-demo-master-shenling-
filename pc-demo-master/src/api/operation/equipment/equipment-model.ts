import axios from "axios"

import type { ISystemFaultInfo } from "@/types/base-info/system-fault"
import type { IListPageResult, IResponse } from "@/types/common"
import type {
  IEquipmentModelCreateParams,
  IEquipmentModelPageItem,
  IEquipmentModelPageListParams,
  IEquipmentModelUpdateParams
} from "@/types/maintain/equipment-manage/equipment-model"

//  设备型号分页
export const queryEquipmentModelPageList = async (params: IEquipmentModelPageListParams) => {
  const res = await axios.post<IResponse<IListPageResult<IEquipmentModelPageItem>>>(
    "/equipmentModel/page",
    params
  )
  return res.data.data
}

// 设备型号删除
export const requestDeleteEquipmentModel = async (id: string) => {
  const res = await axios.post<IResponse>(`/equipmentModel/delete`, { idList: [id] })
  return res.data.data
}

// 设备型号启用
export const requestEnableEquipmentModel = async (id: string) => {
  const res = await axios.post<IResponse>(`/equipmentModel/activate`, { id })
  return res.data.data
}

// 设备型号停用
export const requestDisableEquipmentModel = async (id: string) => {
  const res = await axios.post<IResponse>(`/equipmentModel/deactivate`, { id })
  return res.data.data
}

// 设备型号创建
export const requestCreateEquipmentModel = async (params: IEquipmentModelCreateParams) => {
  const res = await axios.post<IResponse>(`/equipmentModel/save`, params)
  return res.data.data
}

// 设备型号更新
export const requestUpdateEquipmentModel = async (params: IEquipmentModelUpdateParams) => {
  const res = await axios.post<IResponse>(`/equipmentModel/update`, params)
  return res.data.data
}

// 设备型号全查列表
export const requestAllEquipmentModel = async () => {
  const res = await axios.post<IResponse<IEquipmentModelPageItem[]>>(`/equipmentModel/list`, {})
  return res.data.data
}

// 设备对应故障列表
export const requestEquipmentFaults = async (id: string) => {
  const res = await axios.post<IResponse<ISystemFaultInfo[]>>(
    `/equipmentModel/getFaultsByEquipmentId`,
    {
      id
    }
  )
  return res.data.data
}
