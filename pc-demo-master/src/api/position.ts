import axios from "axios"

import type {
  IPositionCreateParams,
  IPositionListItem,
  IPositionListParams,
  IPositionUpdateParams
} from "@/types/base-info/employee"
import type { IListPageResult, IResponse } from "@/types/common"

// 查询职位下拉框选项
export async function queryPositionList() {
  const res = await axios.get<IResponse<IPositionListItem[]>>("/emp/position/getSelectOptions")
  return res.data.data
}

// 查询职位列表(分页)
export async function queryPositionPageList(params: IPositionListParams) {
  const res = await axios.get<IResponse<IListPageResult<IPositionListItem>>>(
    "/emp/position/getPaged",
    {
      params
    }
  )
  return res.data.data
}

// 删除职位
export async function requestDeletePosition(params: { id: number }) {
  const res = await axios.delete<IResponse>("/emp/position/deleteById", { params })
  return res.data.data
}

// 新增职位
export async function requestCreatePosition(params: IPositionCreateParams) {
  const res = await axios.post<IResponse>("/emp/position/create", params)
  return res.data.data
}

// 更新职位
export async function requestUpdatePosition(params: IPositionUpdateParams) {
  const res = await axios.post<IResponse>("/emp/position/update", params)
  return res.data.data
}
