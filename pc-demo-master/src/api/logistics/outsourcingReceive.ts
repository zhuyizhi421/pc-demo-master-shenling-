/** 委外收货 */

import axios from "axios"

import type { IResponse } from "@/types/common"
import type {
  AttachFile,
  IOutsourcingReceiveList,
  IOutsourcingReceivePageListReq,
  ReveiveItems
} from "@/types/logistics/outsourcingReceive"

/** 委外收货分页 */
export const queryOutsourcingReceivePage = async (params: IOutsourcingReceivePageListReq) => {
  const res = await axios.post<IResponse<IOutsourcingReceiveList>>(
    "/logistics/delegate/receipt/page",
    params
  )
  return res.data.data
}

/** 获取产品清单 */
export const queryOutsourcingReceiveDetail = async (id: string) => {
  const res = await axios.post<IResponse<ReveiveItems[]>>(`/logistics/delegate/receipt/detail`, {
    id
  })
  return res.data.data
}

// 获取附件列表
export const queryAttachFiles = async (id: string) => {
  const res = await axios.post<IResponse<AttachFile[]>>(`/logistics/delegate/receipt/attachFiles`, {
    id
  })
  return res.data.data
}

// 附件上传
export const uploadAttachFile = async (businessId: string, fileIds: string[]) => {
  const res = await axios.post<IResponse>(`/logistics/delegate/receipt/uploadAttachFile`, {
    businessId,
    fileIds
  })
  return res.data.data
}
