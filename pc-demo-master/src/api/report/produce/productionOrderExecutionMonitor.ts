import axios from "axios"

import type { IListPageResult, IResponse } from "@/types/common"
import type {
  IEquipmentCollectionDetailItem,
  IProductionOrderExecutionMonitorPageItem,
  IProductionOrderExecutionMonitorPageParams
} from "@/types/report/produce/productionOrderExecutionMonitor"

/** 生产订单执行监控分页 */
export const queryProductionOrderExecutionMonitorPage = async (
  params: IProductionOrderExecutionMonitorPageParams
) => {
  const res = await axios.post<
    IResponse<IListPageResult<IProductionOrderExecutionMonitorPageItem>>
  >(`/production/report/productionOrderExecutionMonitor/page`, params)
  return res.data.data
}

/** 数采详情 */
export const queryEquipmentCollectionDetail = async (params: {
  equipmentNo: string
  productionTaskNo: string
  statDate: string
}) => {
  const res = await axios.post<IResponse<IEquipmentCollectionDetailItem[]>>(
    `/production/report/productionOrderExecutionMonitor/detail`,
    params
  )
  return res.data.data
}
