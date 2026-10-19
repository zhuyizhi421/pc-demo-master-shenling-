import axios from "axios"

import type {
  IDepartmentCreateParams,
  IDepartmentListItem,
  IDepartmentType,
  IDepartmentUpdateParams
} from "@/types/base-info/employee"
import type { IResponse } from "@/types/common"

interface findDepartInter {
  depName?: string
  id?: number
  parentDepId?: string
}

// 查询部门
export const queryDepartmentList = async (params: findDepartInter) => {
  const res = await axios.get<IResponse<IDepartmentListItem[]>>("/emp/getDepartment", {
    params
  })
  return res.data.data
}

// 删除部门
export const requestDeleteDePartment = async (id: string) => {
  const res = await axios.delete<IResponse>(`/emp/deleteDepartment`, { params: { id } })
  return res.data.data
}

// 修改部门
export const requestUpdateDepartment = async (params: IDepartmentUpdateParams) => {
  const res = await axios.put<IResponse>("/emp/updateDepartment", params)
  return res.data.data
}

// 创建部门
export const requestCreateDepartment = async (params: IDepartmentCreateParams) => {
  const res = await axios.post<IResponse>("/emp/createDepartment", params)
  return res.data.data
}

// 获取部门类型
export const queryDepartmentTypeList = async () => {
  const res = await axios.get<IResponse<IDepartmentType[]>>(
    "/emp/listSelectableDepartmentTypeOptions"
  )
  return res.data.data
}
