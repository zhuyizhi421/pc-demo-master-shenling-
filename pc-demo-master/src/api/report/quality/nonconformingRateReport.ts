import axios from "axios"

import type { IListPageResult, IResponse } from "@/types/common"
import type {
  INonconformingRateReportDetailPageItem,
  INonconformingRateReportPageItem,
  INonconformingRateReportPageParams
} from "@/types/report/quality/nonconformingRateReport"

/** 不合格率-汇总 */
export const queryNonconformingRateReportPageList = async (
  params: INonconformingRateReportPageParams
) => {
  const res = await axios.post<IResponse<IListPageResult<INonconformingRateReportPageItem>>>(
    `/quality/report/unqualifiedRate/total`,
    params
  )
  return res.data.data
}

/** 不合格率-详情 */
export const queryNonconformingRateReportDetail = async (
  params: INonconformingRateReportPageParams
) => {
  const res = await axios.post<IResponse<IListPageResult<INonconformingRateReportDetailPageItem>>>(
    `/quality/report/unqualifiedRate/detail`,
    params
  )
  return res.data.data
}
