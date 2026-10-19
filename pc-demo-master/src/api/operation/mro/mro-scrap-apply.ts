import axios from "axios"

import type { IListPageResult, IResponse } from "@/types/common"
import type {
  IMroScrapApplyCreateParams,
  IMroScrapApplyPageListItem,
  IMroScrapApplyPageListParams
} from "@/types/maintain/mro-manage/mro-scrap-apply"

// MRO报废申请分页列表
export const queryMroScrapApplyPageList = async (params: IMroScrapApplyPageListParams) => {
  const res = await axios.post<IResponse<IListPageResult<IMroScrapApplyPageListItem>>>(
    "/mroScrap/page",
    params
  )
  return res.data.data
}

// 新建MRO报废数据
export const requestCreateMroScrapApply = async (params: IMroScrapApplyCreateParams) => {
  const res = await axios.post<IResponse>("/mroScrap/save", params)
  return res.data.data
}
