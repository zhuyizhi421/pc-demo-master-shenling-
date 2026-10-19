import axios from "axios"

import type { ISearchCustomerItem, ISearchCustomerParams } from "@/types/base-info/customer"
import type { IListPageResult } from "@/types/common"

import type { IRes } from "./interceptor"

interface AddCustomerInter {
  billingAddress?: string
  businessAddress?: string
  contactName?: string
  contactTitle?: string
  customerAbbr?: string
  customerName?: string
  email?: string
  phone?: string
  remarks?: string
  taxNo?: string
  website?: string
  customerCode?: string
}

// 新建客户
export async function getAddCustomer(params: AddCustomerInter) {
  const res = await axios.post<IRes>("/foreign/customer", params)
  return res.data.data
}

// 查询客户
export async function getSearchCustomer(params: ISearchCustomerParams) {
  const res = await axios.post<IRes<IListPageResult<ISearchCustomerItem>>>(
    "/foreign/customer/search",
    params
  )
  return res.data.data
}

// 编辑客户
export async function getEditCustomer(params: { id: number } & AddCustomerInter) {
  const { id, ...rest } = params

  const body = {
    ...rest
  }
  const res = await axios.put<IRes>(`/foreign/customer/${id}`, body)
  return res.data.data
}

// 删除客户
export async function getDeleteCustomer(params: { id: string }) {
  const res = await axios.delete<IRes>(`/foreign/customer/${params.id}`)
  return res.data.data
}

// 切换客户状态
export const requestSwitchCustomerStatus = async (params: { id: string; state: number }) => {
  const res = await axios.put<IRes>(`/foreign/customer/state`, params)
  return res.data.data
}
