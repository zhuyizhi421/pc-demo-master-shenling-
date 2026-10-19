import axios from "axios"

import type { ISystemFaultInfo } from "@/types/base-info/system-fault"
import type { IListPageResult, IResponse } from "@/types/common"
import type {
  IEquipmentExceptionOrderAssignResponsibleParams,
  IEquipmentExceptionOrderFeedbackParams,
  IEquipmentExceptionOrderPageListItem,
  IEquipmentExceptionOrderPageParams
} from "@/types/maintain/equipment-manage/equipment-exception-order"

// 设备异常工单分页
export const queryEquipmentExceptionOrderPageList = async (
  params: IEquipmentExceptionOrderPageParams
) => {
  const res = await axios.post<IResponse<IListPageResult<IEquipmentExceptionOrderPageListItem>>>(
    "/equipmentExceptionTask/page",
    params
  )
  return res.data.data
}

// 设备异常工单详情
export const queryEquipmentExceptionOrderDetail = async (id: string) => {
  const res = await axios.post<IResponse<IEquipmentExceptionOrderPageListItem>>(
    "/equipmentExceptionTask/id",
    {
      id
    }
  )
  return res.data.data
}

// 设备异常工单设备相关故障
export const requestEquipmentExceptionOrderSystemFault = async (equipmentId: string) => {
  const res = await axios.get<IResponse<ISystemFaultInfo[]>>(
    `/equipmentExceptionTask/${equipmentId}/sysFault`,
    {
      params: { equipmentId }
    }
  )
  return res.data.data
}

// 设备异常工单反馈提交
export const requestSubmitEquipmentExceptionOrderFeedback = async (
  params: IEquipmentExceptionOrderFeedbackParams
) => {
  const res = await axios.post<IResponse>("/equipmentExceptionTask/feedback", params)
  return res.data.data
}

// 设备异常工单指派责任人
export const requestAssignEquipmentExceptionOrderResponsible = async (
  params: IEquipmentExceptionOrderAssignResponsibleParams
) => {
  const res = await axios.post<IResponse>("/equipmentExceptionTask/assignResponsible", params)
  return res.data.data
}
