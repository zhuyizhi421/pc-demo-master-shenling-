import axios from "axios"

import type { IRes } from "@/api/interceptor"
import type { IListPageResult } from "@/types/common"
import type {
  IDefectReviewTaskDefectItem,
  IDefectReviewTaskDivideItem,
  IDefectReviewTaskSearch,
  IDefectReviewTaskTargetItem
} from "@/types/quality-manage/unqualified"

export interface IDefectReviewTaskItem {
  completeBy: number
  completeByName: string
  createTime: string
  dispatcherTaskCode: string
  dispatcherTaskId: number
  id: number
  inspectTaskId: number
  inspectTaskNo: string
  originType: number
  productModelCode: string
  productModelId: number
  productModelName: string
  quantity: number
  reviewCompleteTime: string
  reviewResults: number[]
  reviewStatus: number
  reviewTaskNo: string
  techName: string
  unitId: number
  unitName: string
  workstationId: number
  workstationName: string
  decimalNumber?: number
}

export async function getDefectReviewTaskPaged(params: IDefectReviewTaskSearch) {
  const res = await axios.post<IRes<IListPageResult<IDefectReviewTaskItem>>>(
    "/qa/defectReviewTask/listReviewTaskPaged",
    params
  )
  return res.data.data
}

export async function getDefectReviewTaskTarget(params: { reviewTaskId: string }) {
  // 评审对象列表
  const res = await axios.get<IRes<IDefectReviewTaskTargetItem[]>>(
    "/qa/defectReviewTask/listReviewTaskProduct",
    { params }
  )
  return res.data.data
}

export async function getDefectReviewTaskDefect(params: { reviewTaskId: string }) {
  // 缺陷登记
  const res = await axios.get<IRes<IDefectReviewTaskDefectItem[]>>(
    "/qa/defectReviewFlawRegister/listFlawRegister",
    { params }
  )
  return res.data.data
}

export async function getDefectReviewTaskDivide(params: { reviewTaskId: string }) {
  // 评审对象列表
  const res = await axios.get<IRes<IDefectReviewTaskDivideItem[]>>(
    "/qa/defectReviewTask/listReviewTaskSplitProductResult",
    { params }
  )
  return res.data.data
}
