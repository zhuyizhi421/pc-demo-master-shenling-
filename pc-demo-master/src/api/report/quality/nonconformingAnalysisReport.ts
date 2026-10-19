import axios from "axios"

import type { IListPageResult, IResponse } from "@/types/common"
import type {
  INonconformingAnalysisReportChart,
  INonconformingAnalysisReportPageItem,
  INonconformingAnalysisReportPageParams
} from "@/types/report/quality/nonconformingAnalysisReport"

/** 不合格品统计-列表分页 */
export const queryNonconformingAnalysisReportPageList = async (
  params: INonconformingAnalysisReportPageParams
) => {
  const res = await axios.post<IResponse<IListPageResult<INonconformingAnalysisReportPageItem>>>(
    `/quality/report/unqualifiedProduct/total`,
    params
  )
  return res.data.data
}

/** 不合格品统计-图表数据 */
export const requestNonconformingAnalysisReportChart = async (
  params: INonconformingAnalysisReportPageParams
) => {
  const res = await axios.post<IResponse<INonconformingAnalysisReportChart>>(
    `/quality/report/unqualifiedProduct/detail`,
    params
  )
  return res.data.data
}
