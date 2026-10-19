import axios from "axios"

import type { IResponse } from "@/types/common"
import type {
  IPackageScheduleTaskDetail,
  IPackageTaskCreateParams
} from "@/types/production-manage/package-schedule"

// 包装排产任务创建
export const requestCreatePackageScheduleTask = async (params: IPackageTaskCreateParams) => {
  const res = await axios.post<IResponse>(`/logistics/delivery/schedule/createTask`, params)
  return res.data.data
}

// 包装排产任务更新
export const requestUpdatePackageScheduleTask = async (params: IPackageTaskCreateParams) => {
  const res = await axios.post<IResponse>(`/logistics/delivery/schedule/updateTask`, params)
  return res.data.data
}

// 包装排产任务删除
export const requestDeletePackageScheduleTask = async (id: string) => {
  const res = await axios.post<IResponse>(`/logistics/delivery/schedule/deleteTask`, { id })
  return res.data.data
}

// 包装排产任务发布
export const requestPublishPackageScheduleTask = async (params: {
  deliveryTaskId: string
  idList: string[]
}) => {
  const res = await axios.post<IResponse>(`/logistics/delivery/schedule/publishTask`, params)
  return res.data.data
}

// 发货计划未发布的包装排产任务
export const queryUnpublishedPackageScheduleTaskList = async (deliveryPlanId: string) => {
  const res = await axios.post<IResponse<IPackageScheduleTaskDetail>>(
    `/logistics/delivery/schedule/scheduleTaskList`,
    {
      deliveryPlanId
    }
  )
  return res.data.data
}
