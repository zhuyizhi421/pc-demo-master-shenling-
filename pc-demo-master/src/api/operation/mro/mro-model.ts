import axios from "axios"

import type { IListPageResult, IResponse } from "@/types/common"
import type {
  IMorModelCreateParams,
  IMorModelUpdateParams,
  IMroItemConfigListItem,
  IMroItemConfigListParams,
  IMroItemConfigUpdateParams,
  IMroModelPageListItem,
  IMroModelPageListParams
} from "@/types/maintain/mro-manage/mro-model"

// 查询所有MRO型号数据
export const queryMroModelPageList = async (params: IMroModelPageListParams) => {
  const res = await axios.post<IResponse<IListPageResult<IMroModelPageListItem>>>(
    "/mroModel/page",
    params
  )
  return res.data.data
}

// 创建MRO型号
export const requestCreateMroModel = async (params: IMorModelCreateParams) => {
  const res = await axios.post<IResponse>("/mroModel/createModel", params)
  return res.data.data
}

// 更新MRO型号
export const requestUpdateMroModel = async (params: IMorModelUpdateParams) => {
  const res = await axios.post<IResponse>("/mroModel/updateMroModel", params)
  return res.data.data
}

// 删除MRO型号
export const requestDeleteMroModel = async (params: { id: string }) => {
  const res = await axios.delete<IResponse>("/mroModel/deleteModelById", { params })
  return res.data.data
}

// MRO型号详情
export const queryMroModelDetail = async (id: string) => {
  const res = await axios.get<IResponse<IMroModelPageListItem>>(`/mroModel/getOne`, {
    params: { id }
  })
  return res.data.data
}

// 查询mro配置分页列表
export const queryMroItemConfigPageList = async (params: IMroItemConfigListParams) => {
  const res = await axios.post<IResponse<IListPageResult<IMroItemConfigListItem>>>(
    "/mroModelItemConfig/page",
    params
  )
  return res.data.data
}

// 更新、新增、删除mro配置表项
export const requestUpdateMroConfig = async (params: IMroItemConfigUpdateParams) => {
  const res = await axios.post<IResponse>("/mroModelItemConfig/update", params)
  return res.data.data
}
