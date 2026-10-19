import axios from "axios"

import type { IListPageResult, IResponse } from "@/types/common"
import type {
  IEquipmentRepairAssignResponsibleParams,
  IEquipmentRepairConfirmParams,
  IEquipmentRepairCreateParams,
  IEquipmentRepairFeedbackParams,
  IEquipmentRepairPageItem,
  IEquipmentRepairPageParams,
  IEquipmentRepairUpdateParams
} from "@/types/maintain/equipment-manage/equipment-repair"

export const queryEquipmentRepairPageList = async (params: IEquipmentRepairPageParams) => {
  const res = await axios.post<IResponse<IListPageResult<IEquipmentRepairPageItem>>>(
    "/equipmentRepair/page",
    params
  )
  return res.data.data
}

export const queryEquipmentRepairDetail = async (id: string) => {
  const res = await axios.post<IResponse<IEquipmentRepairPageItem>>("/equipmentRepair/id", { id })
  return res.data.data
}

export const requestCreateEquipmentRepair = async (params: IEquipmentRepairCreateParams) => {
  const res = await axios.post<IResponse>("/equipmentRepair/save", params)
  return res.data.data
}

export const requestRegisterEquipmentRepair = requestCreateEquipmentRepair

export const requestUpdateEquipmentRepair = async (params: IEquipmentRepairUpdateParams) => {
  const res = await axios.post<IResponse>("/equipmentRepair/update", params)
  return res.data.data
}

export const requestDeleteEquipmentRepair = async (params: { id: string }) => {
  const res = await axios.post<IResponse>("/equipmentRepair/delete", params)
  return res.data.data
}

export const requestAssignResponsibleEquipmentRepair = async (
  params: IEquipmentRepairAssignResponsibleParams
) => {
  const res = await axios.post<IResponse>("/equipmentRepair/assignResponsible", params)
  return res.data.data
}

export const requestFeedbackEquipmentRepair = async (params: IEquipmentRepairFeedbackParams) => {
  const res = await axios.post<IResponse>("/equipmentRepair/feedback", params)
  return res.data.data
}

export const requestConfirmEquipmentRepair = async (params: IEquipmentRepairConfirmParams) => {
  const res = await axios.post<IResponse>("/equipmentRepair/confirm", params)
  return res.data.data
}
