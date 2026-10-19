import axios from "axios"

import type { IListPageResult, IResponse } from "@/types/common"
import type {
  IEquipmentConfigListParams,
  IEquipmentConfigPageListItem,
  IEquipmentConfigPageListParams,
  IEquipmentConfigUpdateParams
} from "@/types/maintain/equipment-manage/equipment-config"

// 设备配置分页
export const queryEquipmentConfigPageList = async (params: IEquipmentConfigPageListParams) => {
  const res = await axios.post<IResponse<IListPageResult<IEquipmentConfigPageListItem>>>(
    "/equipmentConfig/page",
    params
  )
  return res.data.data
}

// 设备配置列表所有数据
export const requestEquipmentConfigList = async (params: IEquipmentConfigListParams) => {
  const res = await axios.post<IResponse<IEquipmentConfigPageListItem[]>>(
    "/equipmentConfig/list",
    params
  )
  return res.data.data
}

// 指定设备保养项id列表对应数据
export const queryEquipmentConfigListByIds = async (params: { idList: string[] }) => {
  const res = await axios.post<IResponse<IEquipmentConfigPageListItem[]>>(
    `/equipmentConfig/listByIds`,
    params
  )
  return res.data.data
}

// 设备配置更新
export const requestUpdateEquipmentConfig = async (params: IEquipmentConfigUpdateParams) => {
  const res = await axios.post<IResponse>("/equipmentConfig/update", params)
  return res.data.data
}

// 设备配置删除
export const requestDeleteEquipmentConfig = async (id: string) => {
  const res = await axios.post<IResponse>(`/equipmentConfig/delete`, { idList: [id] })
  return res.data.data
}
