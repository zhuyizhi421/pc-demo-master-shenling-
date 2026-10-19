import axios from "axios"

import type { IListPageResult, IPaginationSearch } from "@/types/common"
import type {
  GradientDetailModel,
  GradientModel,
  GradientSearchedModel,
  ISaveGradientParams
} from "@/types/quality-manage/inspection-task"

import type { IRes } from "../interceptor"

/** 分页查询梯度模型 */
export const queryGradientModelList = async (params: GradientSearchedModel & IPaginationSearch) => {
  const res = await axios.get<IRes<IListPageResult<GradientModel>>>(
    `/qa/gradientModel/getListPaged`,
    {
      params
    }
  )
  return res.data.data
}

// 删除模型
export async function deleteModel(id: string) {
  const res = await axios.delete<IRes>(`qa/gradientModel/delete`, { data: { id } })
  return res.data.data
}

export async function activateModel(id: string) {
  const res = await axios.post<IRes>(`qa/gradientModel/activate`, { id: id })
  return res.data.data
}

export async function deactivateModel(id: string) {
  const res = await axios.post<IRes>(`qa/gradientModel/deactivate`, { id: id })
  return res.data.data
}

export async function gradientModelCreateOrUpdate(params: ISaveGradientParams) {
  const res = await axios.post<IRes<GradientDetailModel>>(
    "/qa/gradientModel/createOrUpdate",
    params
  )
  return res.data.data
}

export const queryGradientDetail = async (params: { modelId: string }) => {
  const res = await axios.get<IRes<GradientDetailModel>>(`/qa/gradientModel/getById`, {
    params
  })
  return res.data.data
}

/** 获取所有梯度模型列表 */
export const queryGradientList = async () => {
  const res = await axios.get<IRes<GradientModel[]>>(`/qa/gradientModel/getAvailableList`)
  return res.data.data
}
