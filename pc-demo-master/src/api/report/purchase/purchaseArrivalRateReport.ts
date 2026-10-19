/**
 * 采购准时到货率
 */

import axios from "axios"

import type { IListPageResult, IResponse } from "@/types/common"
import type {
  IPurchaseArrivalRateReportPageItem,
  IPurchaseArrivalRateReportPageParams,
  IPurchaseArrivalRateReportSummary,
  IPurchaseArrivalRateReportSummaryParams
} from "@/types/report/purchase/purchaseArrivalRateReport"

/** 采购准时到货率分页查询 */
export const queryPurchaseArrivalRateReportPage = async (
  params: IPurchaseArrivalRateReportPageParams
) => {
  const res = await axios.post<IResponse<IListPageResult<IPurchaseArrivalRateReportPageItem>>>(
    `/purchase/report/page`,
    params
  )
  return res.data.data
}

/** 采购准时到货率-汇总 */
export const requestPurchaseArrivalRateReportSummary = async (
  params: IPurchaseArrivalRateReportSummaryParams
) => {
  const res = await axios.post<IResponse<IPurchaseArrivalRateReportSummary>>(
    `/purchase/report/total`,
    params
  )
  return res.data.data
}
