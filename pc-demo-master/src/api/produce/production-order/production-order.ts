import axios from "axios"

import type { IResponse } from "@/types/common"
import type {
  IDeliveryPlanMaterialOutRecordItem,
  IDeliveryPlanPackageRecordItem
} from "@/types/logistics/delivery"

// 生产订单-领料出库记录
export const queryPrepareOutboundRecords = async (id: string) => {
  const res = await axios.get<IResponse<IDeliveryPlanMaterialOutRecordItem[]>>(
    `/productionOrder/${id}/outbound`
  )
  return res.data.data
}

// 生产订单-包装记录
export const queryPackingRecords = async (id: string) => {
  const res = await axios.get<IResponse<IDeliveryPlanPackageRecordItem[]>>(
    `/productionOrder/${id}/pack`
  )
  return res.data.data
}
