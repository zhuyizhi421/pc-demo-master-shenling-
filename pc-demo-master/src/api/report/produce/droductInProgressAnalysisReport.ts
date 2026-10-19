import axios from "axios"

import type { IListPageResult, IResponse } from "@/types/common"
import type {
  IProductInProcessAnalysisTopChartItem,
  IProductInProgressAnalysisReportPageItem,
  IProductInProgressAnalysisReportParams
} from "@/types/report/produce/productInProgressAnalysisReport"

/** 生产在制分析报表分页查询 */
export const queryProduceProgressAnalysisReportPageList = async (
  params: IProductInProgressAnalysisReportParams
) => {
  const res = await axios.post<
    IResponse<IListPageResult<IProductInProgressAnalysisReportPageItem>>
  >(`/production/report/productionInProcessAnalysisReport`, params)
  return res.data.data
}

/** 生产在制分析-TOP7分析图 */
export const requestProduceProgressAnalysisTopChart = async () => {
  const res = await axios.get<IResponse<IProductInProcessAnalysisTopChartItem[]>>(
    `/production/report/topSevenAnalysisReport`
  )
  return res.data.data
}
