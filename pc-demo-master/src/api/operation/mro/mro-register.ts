import axios from "axios"

import type { IListPageResult, IResponse } from "@/types/common"
import type {
  IMroRegisterCreateParams,
  IMroRegisterItemUpdateParams,
  IMroRegisterPageListItem,
  IMroRegisterPageListParams,
  IMroRegisterReviewParams,
  IMroRegisterReviewResult
} from "@/types/maintain/mro-manage/mro-register"

// MRO注册分页列表
export const queryMroRegisterPageList = async (params: IMroRegisterPageListParams) => {
  const res = await axios.post<IResponse<IListPageResult<IMroRegisterPageListItem>>>(
    "/mroRegister/page",
    params
  )
  return res.data.data
}

// 更新MRO注册项数据
export const requestUpdateMroRegister = async (params: IMroRegisterItemUpdateParams) => {
  const res = await axios.post<IResponse>("/mroRegister/updateRegisterItem", params)
  return res.data.data
}

// 创建MRO注册
export const requestCreateMroRegister = async (params: IMroRegisterCreateParams) => {
  const res = await axios.post<IResponse>("/mroRegister/createRegister", params)
  return res.data.data
}

// 删除MRO注册
export const requestDeleteMroRegister = async (id: string) => {
  const res = await axios.post<IResponse>("/mroRegister/deleteRegisterById", { id })
  return res.data.data
}

// 复核MRO注册
export const requestReviewMroRegister = async (params: IMroRegisterReviewParams) => {
  const res = await axios.post<IResponse<IMroRegisterReviewResult>>("/mroRegister/checkRegister", params)
  return res.data.data
}
