import axios from "axios"

import type { IListPageResult, IResponse } from "@/types/common"
import type {
  IMroInventoryCheckCreateParams,
  IMroInventoryCheckDetailItem,
  IMroInventoryCheckPageListItem,
  IMroInventoryCheckPageListParams,
  IMroInventoryCheckRecordItem,
  IMroInventoryCheckUpdateParams
} from "@/types/maintain/mro-manage/mro-inventory-check"

export const queryMroInventoryCheckPageList = async (params: IMroInventoryCheckPageListParams) => {
  const res = await axios.post<IResponse<IListPageResult<IMroInventoryCheckPageListItem>>>(
    "/mroInventoryCheck/page",
    params
  )
  return res.data.data
}

export const requestCreateMroInventoryCheck = async (params: IMroInventoryCheckCreateParams) => {
  const res = await axios.post<IResponse>("/mroInventoryCheck/create", params)
  return res.data.data
}

export const requestUpdateMroInventoryCheck = async (params: IMroInventoryCheckUpdateParams) => {
  const res = await axios.post<IResponse>("/mroInventoryCheck/update", params)
  return res.data.data
}

export const requestDeleteMroInventoryCheck = async (id: string) => {
  const res = await axios.post<IResponse>("/mroInventoryCheck/delete", { id })
  return res.data.data
}

export const queryMroInventoryCheckDetail = async (id: string) => {
  const res = await axios.post<IResponse<IMroInventoryCheckDetailItem[]>>("/mroInventoryCheck/detail", {
    id
  })
  return res.data.data
}

export const requestGenerateMroInventoryCheckDetail = async (params: {
  id?: string
  warehouseId: string
}) => {
  const res = await axios.post<IResponse<IMroInventoryCheckDetailItem[]>>(
    "/mroInventoryCheck/generateDetail",
    params
  )
  return res.data.data
}

export const requestPublishMroInventoryCheck = async (id: string) => {
  const res = await axios.post<IResponse>("/mroInventoryCheck/publish", { id })
  return res.data.data
}

export const requestSettleMroInventoryCheck = async (params: { id: string; accept: boolean }) => {
  const res = await axios.post<IResponse>("/mroInventoryCheck/close", params)
  return res.data.data
}

export const requestMroInventoryCheckRecords = async (params: { id: string; mroModelId?: string }) => {
  const res = await axios.post<IResponse<IMroInventoryCheckRecordItem[]>>(
    "/mroInventoryCheck/record",
    params
  )
  return res.data.data
}

export type IMroInventoryCheckLockedWarehouseOption = {
  value: string
  label: string
  code: string
}

export const queryMroInventoryCheckLockedWarehouses = async () => {
  const res = await axios.post<IResponse<IMroInventoryCheckLockedWarehouseOption[]>>(
    "/mroInventoryCheck/lockedWarehouse/list"
  )
  return res.data.data
}

export const requestLockMroInventoryCheckWarehouse = async (params: {
  warehouseId: string
  warehouseName: string
  warehouseNo: string
}) => {
  const res = await axios.post<IResponse>("/mroInventoryCheck/lockedWarehouse/lock", params)
  return res.data.data
}

export const requestUnlockMroInventoryCheckWarehouse = async (params: { warehouseId: string }) => {
  const res = await axios.post<IResponse>("/mroInventoryCheck/lockedWarehouse/unlock", params)
  return res.data.data
}
