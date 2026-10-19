import axios from "axios"

import type { IListPageResult, IResponse } from "@/types/common"
import type {
  IProductInStoragePageListItem,
  IProductInStoragePageListParams,
  IProductOutStoragePageListItem,
  IProductOutStoragePageListParams
} from "@/types/logistics/product-in-out-storage"

/** 产品入库记录分页列表 */
export const queryProductInStoragePageList = async (params: IProductInStoragePageListParams) => {
  const res = await axios.post<IResponse<IListPageResult<IProductInStoragePageListItem>>>(
    "/logistics/inOutRecord/product/inbound",
    params
  )
  return res.data.data
}

/** 产品出库记录分页列表 */
export const queryProductOutStoragePageList = async (params: IProductOutStoragePageListParams) => {
  const res = await axios.post<IResponse<IListPageResult<IProductOutStoragePageListItem>>>(
    "/logistics/inOutRecord/product/outbound",
    params
  )
  return res.data.data
}
