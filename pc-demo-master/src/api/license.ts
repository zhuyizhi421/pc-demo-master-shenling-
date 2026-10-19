import axios from "axios"

import type {
  ILicenseApplyFreezeParams,
  ILicenseApplyListItem,
  ILicenseApplyParams,
  ILicenseApplySearchParams,
  ILicenseCascade,
  ILicenseDetail,
  ILicenseEmployeeDetail,
  ILicenseItemDetail,
  ILicenseListItem,
  ILicensePageSearchParams,
  ILicenseUpdateParams
} from "@/types/base-info/employee"
import type { IListPageResult, IResponse } from "@/types/common"

// 查询员工上岗证详情
export async function queryLicenseListById(params: { empId: string }) {
  const res = await axios.get<IResponse<ILicenseItemDetail[]>>(
    "/emp/license/getLicenseDetailByEmpId",
    {
      params
    }
  )
  return res.data.data
}

// 解冻上岗证\申请新的上岗证
export async function queryLicenseApply(params: ILicenseApplyParams) {
  const res = await axios.post<IResponse>("/emp/license/submitLicenseApplyRecord", params)
  return res.data.data
}

// 冻结上岗证
export async function queryLicenseFreeze(params: ILicenseApplyFreezeParams) {
  const res = await axios.post<IResponse>("/emp/license/freezeLicense", params)
  return res.data.data
}

// 获取上岗证级联下拉框选项(岗位+上岗证)
export async function queryLicenseCascade(params: { empId?: string }) {
  const res = await axios.get<IResponse<ILicenseCascade>>("/emp/license/getCascadeSelectOptions", {
    params
  })
  return res.data.data
}

// 获取上岗证申请列表(分页)
export async function queryLicenseApplyPageList(params: ILicenseApplySearchParams) {
  const res = await axios.get<IResponse<IListPageResult<ILicenseApplyListItem>>>(
    "/emp/license/getLicenseApplyRecordsPaged",
    {
      params
    }
  )
  return res.data.data
}

// 上岗证申请配置修改
export const requestLicenseApplyConfig = async (enable: boolean) => {
  const res = await axios.put<IResponse>(`/emp/license/setFlowEnable/${enable}`)
  return res.data.data
}

// 上岗证申请流程配置详情
export const queryLicenseApplyConfigDetail = async () => {
  const res = await axios.get<IResponse<boolean>>(`/emp/license/flowEnable`)
  return res.data.data
}

// 新增上岗证
export async function requestCreateLicense(params: ILicenseUpdateParams) {
  const res = await axios.post<IResponse>("/emp/license/create", params)
  return res.data.data
}

// 修改上岗证
export async function requestUpdateLicense(params: ILicenseUpdateParams) {
  const res = await axios.put<IResponse>("/emp/license/update", params)
  return res.data.data
}

// 根据id查询单个上岗证详情
export async function queryLicenseDetail(params: { id: string }) {
  const res = await axios.get<IResponse<ILicenseDetail>>("/emp/license/getOneById", {
    params
  })
  return res.data.data
}

// 删除上岗证
export async function requestDeleteLicense(params: { id: number }) {
  const res = await axios.delete<IResponse>("/emp/license/deleteById", { params })
  return res.data.data
}

// 查询上岗证(分页)
export async function queryLicensePageList(params: ILicensePageSearchParams) {
  const res = await axios.get<IResponse<IListPageResult<ILicenseListItem>>>(
    "/emp/license/getPaged",
    {
      params
    }
  )
  return res.data.data
}

// 根据上岗证员工明细
export async function queryEmployeeDetail(params: { id: string }) {
  const res = await axios.get<IResponse<ILicenseEmployeeDetail[]>>(
    `/emp/license/employeeDetail/${params.id}`
  )
  return res.data.data
}
