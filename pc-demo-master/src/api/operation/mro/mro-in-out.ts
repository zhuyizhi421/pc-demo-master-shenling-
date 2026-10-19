import axios from "axios"

import type { IListPageResult } from "@/types/common"
import type { IResponse } from "@/types/common"
import type {
  IMroInRecordPageListItem,
  IMroInRecordPageListParams,
  IMroOutRecordPageListItem,
  IMroOutRecordPageListParams
} from "@/types/maintain/mro-manage/mro-in-out"

// MRO入库记录
export const queryMroInRecordPageList = async (params: IMroInRecordPageListParams) => {
  const res = await axios.get<IResponse<IListPageResult<IMroInRecordPageListItem>>>(
    "/logistics/inOutRecord/mro/inbound",
    {
      params
    }
  )
  return res.data.data
}

// MRO出库记录
export const queryMroOutRecordPageList = async (params: IMroOutRecordPageListParams) => {
  const res = await axios.get<IResponse<IListPageResult<IMroOutRecordPageListItem>>>(
    "/logistics/inOutRecord/mro/outbound",
    {
      params
    }
  )
  return res.data.data
}
