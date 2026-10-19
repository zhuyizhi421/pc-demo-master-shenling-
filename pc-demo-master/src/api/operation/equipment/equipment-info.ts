import axios from "axios"

import type { IListPageResult, IResponse } from "@/types/common"
import type {
  IEquipmentCreateParams,
  IEquipmentPageItem,
  IEquipmentPageParams,
  IEquipmentUpdateParams
} from "@/types/maintain/equipment-manage/equipment-info"

// 设备分页
export const queryEquipmentPageList = async (params: IEquipmentPageParams) => {
  const res = await axios.post<IResponse<IListPageResult<IEquipmentPageItem>>>(
    "/equipment/page",
    params
  )
  return res.data.data
}

// 获取指定设备id列表对应的设备信息
export const requestEquipmentListByIds = async (params: { idList: string[] }) => {
  const res = await axios.post<IResponse<IEquipmentPageItem[]>>(`/equipment/listByIds`, params)
  return res.data.data
}

// 设备详情
export const queryEquipmentDetail = async (id: string) => {
  const res = await axios.post<IResponse<IEquipmentPageItem>>("/equipment/id", { id })
  return res.data.data
}

// 设备新增
export const requestCreateEquipment = async (params: IEquipmentCreateParams) => {
  const res = await axios.post<IResponse>("/equipment/save", params)
  return res.data.data
}

// 设备更新
export const requestUpdateEquipment = async (params: IEquipmentUpdateParams) => {
  const res = await axios.post<IResponse>("/equipment/update", params)
  return res.data.data
}

// 设备启用
export const requestEnableEquipment = async (id: string) => {
  const res = await axios.post<IResponse>(`/equipment/activate`, { id })
  return res.data.data
}

// 设备停用
export const requestDisableEquipment = async (id: string) => {
  const res = await axios.post<IResponse>(`/equipment/deactivate`, { id })
  return res.data.data
}
