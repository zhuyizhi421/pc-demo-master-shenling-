import axios from "axios"

import type { IListPageResult, IResponse } from "@/types/common"
import type {
  IProduceTaskCompleteRateReportDetailPageItem,
  IProduceTaskCompleteRateReportPageParams,
  IProduceTaskCompleteRateReportSummaryPageItem
} from "@/types/report/plan/produceTaskCompleteRateReport"

/** 生产任务完成率-明细 */
export const queryProduceTaskCompleteRateReportPageList = async (
  params: IProduceTaskCompleteRateReportPageParams
) => {
  const res = await axios.post<
    IResponse<IListPageResult<IProduceTaskCompleteRateReportDetailPageItem>>
  >(`/plan/report/productionRate/detail`, params)
  return res.data.data
}

/** 生产任务完成率-汇总 */
export const queryProduceTaskCompleteRateReportSummaryPageList = async (
  params: IProduceTaskCompleteRateReportPageParams
) => {
  const res = await axios.post<
    IResponse<IListPageResult<IProduceTaskCompleteRateReportSummaryPageItem>>
  >(`/plan/report/productionRate/totalPage`, params)
  return res.data.data
}
