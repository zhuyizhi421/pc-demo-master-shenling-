import axios from "axios"

import type {
  IDepartmentWorkItem,
  IDepartmentWorkItemCreateParams,
  IDepartmentWorkItemPageParams,
  IDepartmentWorkItemUpdateParams
} from "@/types/base-info/department-work-item"
import type { IListPageResult, IResponse } from "@/types/common"

export async function queryDepartmentWorkItemPageList(params: IDepartmentWorkItemPageParams) {
  const res = await axios.get<IResponse<IListPageResult<IDepartmentWorkItem>>>(
    "/emp/getDepartmentPaged",
    {
      params
    }
  )
  return res.data.data
}

export async function queryDepartmentWorkItemDetail(params: { id: string }) {
  const res = await axios.get<IResponse<IDepartmentWorkItem>>("/emp/getDepartmentById", {
    params
  })
  return res.data.data
}

export async function requestCreateDepartmentWorkItem(params: IDepartmentWorkItemCreateParams) {
  const res = await axios.post<IResponse>("/emp/createDepartment", params)
  return res.data.data
}

export async function requestUpdateDepartmentWorkItem(params: IDepartmentWorkItemUpdateParams) {
  const res = await axios.put<IResponse>("/emp/updateDepartment", params)
  return res.data.data
}

export async function requestDeleteDepartmentWorkItem(id: string) {
  const res = await axios.delete<IResponse>("/emp/deleteDepartment", { params: { id } })
  return res.data.data
}
