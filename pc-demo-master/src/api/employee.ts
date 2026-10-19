import axios from "axios"

import type {
  IEmployeeCreateParams,
  IEmployeeListItem,
  IEmployeePageListParams
} from "@/types/base-info/employee"
import type { IUserInfoBase } from "@/types/base-info/user"
import type { IListPageResult, IResponse } from "@/types/common"

// 查询员工列表
export async function queryEmployeePageList(params: IEmployeePageListParams) {
  const res = await axios.post<IResponse<IListPageResult<IEmployeeListItem>>>(
    "/emp/getEmployeePaged",
    params
  )
  return res.data.data
}

// 批量开通系统账号
export async function queryBatchOpen(params: { empIds: string[] }) {
  const res = await axios.post<IResponse>("/emp/batchOpenUserAccount", params)
  return res.data.data
}

// 删除员工
export async function requestDeleteEmployee(id: string) {
  const res = await axios.delete<IResponse>("/emp/deleteEmployee", { params: { id } })
  return res.data.data
}

// 新增员工
export async function requestCreateEmployee(params: IEmployeeCreateParams) {
  const res = await axios.post<IResponse>("/emp/createEmployee", params)
  return res.data.data
}

// 更新员工
export async function requestUpdateEmployee(params: IEmployeeCreateParams) {
  const res = await axios.post<IResponse>("/emp/updateEmployee", params)
  return res.data.data
}

// 开通用户账号
export async function queryOpenEmployeeAccount(params: { empId: string }) {
  const res = await axios.post<IResponse<IUserInfoBase>>("/emp/openEmployeeUserAccount", params)
  return res.data.data
}

// 员工页-关联绑定用户账号
export async function queryBindExistUserAccount(params: { empId: string; userId: string }) {
  const res = await axios.post<IResponse>("/emp/bindExistUserAccount", params)
  return res.data.data
}

// 查询单个员工
export async function queryEmployeeDetail(params: { id: string }) {
  const res = await axios.get<IResponse<IEmployeeListItem>>("/emp/getEmployeeById", {
    params
  })
  return res.data.data
}

export async function getEmpList(params: { idList: string[] }) {
  const res = await axios.post<IResponse>("/emp/getEmployeeList", params)
  return res.data.data
}
