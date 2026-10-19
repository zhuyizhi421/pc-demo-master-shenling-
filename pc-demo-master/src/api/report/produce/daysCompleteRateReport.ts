import axios from "axios"

import type { IListPageResult, IResponse } from "@/types/common"
import type {
  IDaysCompleteRateDetailItem,
  IDaysCompleteRateDetailParams,
  IDaysCompleteRateReportPageItem,
  IDaysCompleteRateReportPageParams
} from "@/types/report/produce/daysCompleteRateReport"

/** 每日完成率统计分页 */
export const queryDaysCompleteRateReportPage = async (
  params: IDaysCompleteRateReportPageParams
) => {
  const res = await axios.post<IResponse<IListPageResult<IDaysCompleteRateReportPageItem>>>(
    `/production/report/dailyCompletionRateReport`,
    params
  )
  return res.data.data
}

/** 生产-完成详情 */
export const requestDaysCompleteRateDetail = async (params: IDaysCompleteRateDetailParams) => {
  const res = await axios.post<IResponse<IDaysCompleteRateDetailItem[]>>(
    `/production/report/dailyCompletionRateReport/detail`,
    params
  )
  return res.data.data
}
