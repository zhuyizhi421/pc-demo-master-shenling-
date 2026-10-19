import axios from "axios"

import type { IRes } from "./interceptor"

export interface EmployeeNodes {
  depId: string
  empId: string
  empName: string
  empNo: string
}
export interface DeEmployTreeNodeRes {
  childDepartmentNodes: DeEmployTreeNodeRes[]
  depId: string
  depName: string
  empId: string
  empName: string
  empNo: string
  employeeNodes: EmployeeNodes[]
  parentDepId: string
}

export async function listDepartmentAndEmployeeTrees() {
  const res = await axios.get<IRes<DeEmployTreeNodeRes[]>>(
    "/emp/component/selectEmployee/listDepartmentAndEmployeeTrees"
  )
  return res.data.data
}

export async function queryEmployees(name?: string) {
  const res = await axios.get<IRes<EmployeeNodes[]>>(
    "/emp/component/selectEmployee/queryEmployees",
    {
      params: {
        empName: name
      }
    }
  )
  return res.data.data
}

export async function listDepartmentTrees(params?: { departmentName?: string }) {
  const res = await axios.get<IRes<DeEmployTreeNodeRes[]>>(
    "/emp/component/selectDepartment/listDepartmentTrees",
    {
      params
    }
  )
  return res.data.data
}

export async function queryDepartments(name?: string) {
  const res = await axios.get<IRes<DeEmployTreeNodeRes[]>>(
    "/emp/component/selectDepartment/queryDepartments",
    {
      params: {
        departmentName: name
      }
    }
  )
  return res.data.data
}

export async function queryPositions(name?: string) {
  const res = await axios.get<
    IRes<
      {
        positionCode: string
        positionId: string
        positionName: string
      }[]
    >
  >("/emp/component/selectPosition/queryPositions", { params: { positionName: name } })
  return res.data.data
}
