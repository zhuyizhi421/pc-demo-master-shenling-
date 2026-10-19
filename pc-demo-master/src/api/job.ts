import axios from "axios"

import type { IJobListItem } from "@/types/base-info/employee"
import type { IResponse } from "@/types/common"

// 查询岗位下拉框选项
export async function queryJobList() {
  const res = await axios.get<IResponse<IJobListItem[]>>("/emp/job/getSelectOptions")
  return res.data.data
}

// 通过ID获取岗位信息
export async function queryJobDetail(params: { id: string }) {
  const res = await axios.get<IResponse<IJobListItem>>("/emp/job/getById", { params })
  return res.data.data
}

/** =====分割线===== **/

// 查询所有岗位
export async function getSelectedPosition() {
  const res = await axios.get<IResponse>("/emp/job/getAllJobs")
  return res.data.data
}

interface updateJobsInter {
  id: string
  jobName: string
  licenseApplyProcessId: string
  licenseUnfreezeProcessId: string
}

// 修改岗位
export async function getUpdateJobs(params: updateJobsInter) {
  const res = await axios.post<IResponse>("/emp/job/update", params)
  return res.data.data
}

// 删除岗位
export async function getDeleteJobs(params: { id: number }) {
  const res = await axios.delete<IResponse>("/emp/job/deleteById", { params })
  return res.data.data
}

// 新增岗位
export async function getCreateJobs(params: Omit<updateJobsInter, "id">) {
  const res = await axios.post<IResponse>("/emp/job/create", params)
  return res.data.data
}
