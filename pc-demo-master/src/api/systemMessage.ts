import axios from "axios"

import type { IListPageResult, IResponse } from "@/types/common"
import type {
  ICategory,
  IMessageSearchParams,
  ISystemMessageItem
} from "@/types/personal/system-message"

// 查询当前用户接收的消息
export const querySystemMessageList = async (params: IMessageSearchParams) => {
  const res = await axios.get<IResponse<IListPageResult<ISystemMessageItem>>>(
    "/msg/message/search",
    {
      params
    }
  )
  return res.data.data
}

// 获取消息分类列表
export const queryMessageCategoryList = async () => {
  const res = await axios.get<IResponse<ICategory[]>>("/msg/message/category")
  return res.data.data
}

// 设置已读
export const requestMessageSetRead = async (params: { readIdList: string[] }) => {
  const res = await axios.put<IResponse>("/msg/message/read", params)
  return res.data.data
}

// 设置全部已读
export const requestMessageSetAllRead = async (params: { type: number }) => {
  const res = await axios.put<IResponse>(
    `/msg/message/readAll/${params.type}`,
    {}
  )
  return res.data.data
}

/** 获取用户未读消息数量 */
export const requestUnreadMessageCount = async () => {
  const res = await axios.get<IResponse<number>>("/msg/message/search/unread")
  return res.data.data
}
