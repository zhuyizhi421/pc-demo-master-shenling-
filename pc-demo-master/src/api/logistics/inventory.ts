import axios from "axios"

import type { IListPageResult, IResponse } from "@/types/common"
import type {
  FmStorageFacilityTree,
  LogInventorySearchInter,
  LogInventorySearchReturn,
  LogProductPositionSearchDetailInter,
  LogProductPositionSearchInter,
  LogProductPositionSearchReturn,
  PositionDetailRecord
} from "@/types/logistics/inventory"

// 产品库存查询
export async function getLogInventorySearch(params: LogInventorySearchInter) {
  const res = await axios.get<IResponse<IListPageResult<LogInventorySearchReturn>>>(
    "/logistics/inventory/search/byFacility",
    {
      params
    }
  )
  return res.data.data
}

// 存放库位查询
export async function getLogProductPositionSearch(params: LogProductPositionSearchInter) {
  const res = await axios.get<IResponse<IListPageResult<LogProductPositionSearchReturn>>>(
    "/logistics/inventory/search/byFacility/byProduct",
    {
      params
    }
  )
  return res.data.data
}

// 库位明细查询
export async function getLogProductPositionDetailSearch(
  params: LogProductPositionSearchDetailInter
) {
  const res = await axios.get<IResponse<IListPageResult<PositionDetailRecord>>>(
    "/logistics/inventory/search/byLocation",
    {
      params
    }
  )
  return res.data.data
}

// 获取所有仓库和库位
export async function getLoglistWarehouseTree() {
  const res = await axios.get<IResponse<FmStorageFacilityTree[]>>(
    "/logistics/inventory/listWarehouse"
  )
  return res.data.data
}
