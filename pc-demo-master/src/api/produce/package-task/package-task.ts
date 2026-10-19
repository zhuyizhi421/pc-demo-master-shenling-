import axios from "axios"

import type { IListPageResult, IResponse } from "@/types/common"
import type {
  IPackageTaskAppendNumberParams,
  IPackageTaskListItem,
  IPackageTaskPageListParams
} from "@/types/production-manage/package-task"

// 包装任务分页列表
export const queryPackageTaskPageList = async (params: IPackageTaskPageListParams) => {
  const res = await axios.post<IResponse<IListPageResult<IPackageTaskListItem>>>(
    `/logistics/delivery/schedule/packTask/page`,
    params
  )
  return res.data.data
}

// 包装任务追加数量
export const requestAppendNumberPackageTask = async (params: IPackageTaskAppendNumberParams) => {
  const res = await axios.post<IResponse<string>>(`/logistics/delivery/schedule/appendQty`, params)
  return res.data.data
}

// 获取包装任务详情
export const queryPackageTaskDetail = async (id: string) => {
  const res = await axios.post<IResponse<IPackageTaskListItem>>(
    `/logistics/delivery/schedule/taskInfo`,
    {
      id
    }
  )
  return res.data.data
}
