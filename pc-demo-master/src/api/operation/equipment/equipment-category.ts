import axios from "axios"

import type { IResponse } from "@/types/common"
import type {
  IDeviceCategoryCreateParams,
  IDeviceCategoryUpdateParams,
  IDeviceCateHierarchyTreeRes
} from "@/types/maintain/equipment-manage/equipment-category"

// 设备类型所有数据层级树，某一层级传ID，不传返回全部层级
export const requestDeviceCategoryTree = async (id?: string) => {
  const res = await axios.post<IResponse<IDeviceCateHierarchyTreeRes>>(
    "/equipmentCategory/Hierarchy",
    {
      id
    }
  )
  return res.data.data
}

// 设备类型删除
export const requestDeleteDeviceCategory = async (id: string) => {
  const res = await axios.post<IResponse>("/equipmentCategory/delete", {
    idList: [id]
  })
  return res.data.data
}

// 设备类型新增
export const requestCreateDeviceCategory = async (params: IDeviceCategoryCreateParams) => {
  const res = await axios.post<IResponse>("/equipmentCategory/save", params)
  return res.data.data
}

// 设备类型编辑
export const requestUpdateDeviceCategory = async (params: IDeviceCategoryUpdateParams) => {
  const res = await axios.post<IResponse>("/equipmentCategory/update", params)
  return res.data.data
}

// 设备型号详情
export const queryDeviceModelDetail = async (id: string) => {
  const res = await axios.post<IResponse<any>>(`/equipmentCategory/id`, { id })
  return res.data.data
}
