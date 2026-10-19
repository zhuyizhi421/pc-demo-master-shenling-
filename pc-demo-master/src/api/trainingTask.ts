import axios from "axios"

import type {
  TsesEmpLicenseTrainingTaskQueryDTO,
  TsesEmpLicenseTrainingTaskVO
} from "@/types/base-info/trainingTask"
import type { IListPageResult, IResponse } from "@/types/common"

// 上岗证培训任务列表
export async function queryTrainingTaskPageList(data: TsesEmpLicenseTrainingTaskQueryDTO) {
  const res = await axios.post<IResponse<IListPageResult<TsesEmpLicenseTrainingTaskVO>>>(
    "/emp/license/getLicenseApplyRecordsPaged",
    data
  )
  return res.data.data
}

// 新增上岗证培训任务
export async function createTrainingTask(data: {
  empLicenseId: string
  id?: string
  trainingNo: string
}) {
  const res = await axios.post<IResponse>("/emp/license/trainingTask/create", data)
  return res.data.data
}

// 上岗证培训任务详情
export async function queryTrainingTaskDetail(id: string) {
  const res = await axios.get<IResponse<TsesEmpLicenseTrainingTaskVO>>(
    `/emp/license/trainingTask/${id}`
  )
  return res.data.data
}
