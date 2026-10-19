import axios from "axios"

import type { IListPageResult, IResponse } from "@/types/common"
import type {
  IProductBatchDetail,
  IProductBatchPageListItem,
  IProductBatchPageListParams
} from "@/types/logistics/batch"

// 产品批次分页查询
export const queryProductBatchPageList = async (params: IProductBatchPageListParams) => {
  const res = await axios.get<IResponse<IListPageResult<IProductBatchPageListItem>>>(
    "/logistics/batch/search",
    {
      params
    }
  )
  return res.data.data
}

// 产品批次 - 查看详情
export const queryProductBatchDetail = async (id?: string) => {
  const res = await axios.get<IResponse<IProductBatchDetail>>(`/logistics/batch/${id}`)
  return res.data.data
}
