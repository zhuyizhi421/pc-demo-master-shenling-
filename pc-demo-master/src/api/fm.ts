// 工厂建模
import axios from "axios"

import type {
  IFactoryCreateParams,
  IFactoryItemInfo,
  IFactoryListItem,
  IFactoryModelListItem,
  IFactoryModelTreeNode,
  IFactoryPageParams,
  IFactoryUnderClasses,
  IFactoryUpdateParams,
  IStorageCreateParams,
  IStorageUpdateParams
} from "@/types/base-info/factory-model"
import type { IListPageResult, IResponse } from "@/types/common"

/** 新-工厂建模相关 */

/** 获取工厂建模树 */
export const queryFactoryModelTree = async (params?: {
  isEnable?: boolean
  containLastLevel?: boolean
}) => {
  const res = await axios.get<IResponse<IFactoryModelTreeNode[]>>("/fm/getModelTree", { params })
  return res.data.data
}

/** 获取工厂建模列表分页 */
export const queryFactoryModelPageList = async (params: IFactoryPageParams) => {
  const res = await axios.post<IResponse<IListPageResult<IFactoryListItem>>>(`/fm/page`, params)
  return res.data.data
}

/** 工厂建模新增 */
export const requestCreateFactoryModel = async (params: Partial<IFactoryCreateParams>) => {
  const res = await axios.post<IResponse<any>>("/fm/create", params)
  return res.data.data
}

/** 工厂建模更新 */
export const requestUpdateFactoryModel = async (params: Partial<IFactoryUpdateParams>) => {
  const res = await axios.post<IResponse>(`/fm/update`, params)
  return res.data.data
}

/** 工厂建模删除 */
export const requestDeleteFactoryModel = async (id: string) => {
  const res = await axios.delete<IResponse>(`/fm/${id}`)
  return res.data.data
}

/** 工厂建模启用 */
export const requestEnableFactoryModel = async (id: string) => {
  const res = await axios.put<IResponse>(`/fm/enable/${id}`)
  return res.data.data
}

/** 工厂建模禁用 */
export const requestDisableFactoryModel = async (id: string) => {
  const res = await axios.put<IResponse>(`/fm/disable/${id}`)
  return res.data.data
}

/** 工厂建模详情 */
export const queryFactoryModelDetail = async (id: string) => {
  const res = await axios.get<IResponse<IFactoryItemInfo>>(`/fm/${id}`)
  return res.data.data
}

/** 工厂建模-创建库位实体 */
export const requestCreateStorage = async (params: IStorageCreateParams) => {
  const res = await axios.post<IResponse>("/fm/location/create", params)
  return res.data.data
}

/** 工厂建模-更新库位实体 */
export const requestUpdateStorage = async (params: IStorageUpdateParams) => {
  const res = await axios.post<IResponse>(`/fm/location/update`, params)
  return res.data.data
}

/** 根据树状父级节点id获取当前节点下可创建的区域类型列表 */
export const requestFactoryModelChildAuth = async (parentId: string) => {
  const res = await axios.get<IResponse<IFactoryUnderClasses[]>>(`/fm/levelTag/next`, {
    params: { parentId }
  })
  return res.data.data
}

/** 查询工厂建模列表 */
export const queryFactoryModelList = async (
  params: Partial<{
    code: string
    isEnable: boolean
    isInspection: boolean
    isProduction: boolean
    isStorage: boolean
    isStorageLocation: boolean
    name: string
    parentId: string
    levelTag?: string
  }>
) => {
  const res = await axios.get<IResponse<IFactoryModelListItem[]>>("/fm/getModelList", {
    params
  })
  return res.data.data
}

/** 根据叶子节点类型获取工厂建模树 1=生产2=仓库3=检验4=库位 */
export const queryModelTreeByLeafType = async (params: {
  leafType: 1 | 2 | 3 | 4
  isEnable?: boolean
  containLastLevel?: boolean
}) => {
  const { leafType, isEnable, containLastLevel } = params
  const res = await axios.get<IResponse<IFactoryModelTreeNode[]>>(
    `/fm/getModelTreeByLeafType/${leafType}`,
    { params: { isEnable, containLastLevel } }
  )
  return res.data.data
}

/** 获取模型绑定的设备 */
export const queryModelDevices = async (id: string) => {
  const res = await axios.get<
    IResponse<
      {
        name: string
        code: string
        equipmentNo: string
        id: string
      }[]
    >
  >(`/fm/getEquipment/${id}`)
  return res.data.data
}

/** 修改工厂建模绑定设备 */
export const requestUpdateModelDevices = async (data: { equipmentIds: string[]; id: string }) => {
  const res = await axios.post<IResponse>(`/fm/updateEquipment`, data)
  return res.data.data
}
