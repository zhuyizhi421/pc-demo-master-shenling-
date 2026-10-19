import axios from "axios"

import type { IListPageResult, IResponse } from "@/types/common"
import type { IScrapRecordItem, IScrapRecordPageListReq } from "@/types/logistics/scrapRecord"

/** 报废记录分页 */
export const queryScrapRecordPageList = async (params: IScrapRecordPageListReq) => {
  const res = await axios.post<IResponse<IListPageResult<IScrapRecordItem>>>(
    "/product/scrap/page",
    params
  )
  return res.data.data
}

/** 报废记录详情 */
export const queryScrapRecordDetail = async (id: string) => {
  const res = await axios.get<IResponse<IScrapRecordItem>>("/product/scrap/detail", {
    params: { id }
  })
  return res.data.data
}
