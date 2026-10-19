import axios from "axios"

import type { IListPageResult } from "@/types/common"
import type {
  IEventDetail,
  IEventsGraphQueryParams,
  IRelatedEvent,
  IRelatedEventsGraph,
  IRelatedEventsQueryParams
} from "@/types/trace"

import type { IRes } from "../interceptor"

export async function queryRelatedEvents(params: IRelatedEventsQueryParams) {
  const res = await axios.post<IRes<IListPageResult<IRelatedEvent>>>(
    `/trace/eventParty/infos`,
    params
  )
  return res.data.data
}

/** 通过事件id查询事件详情 */
export async function queryEventDetail(eventId: number) {
  const res = await axios.get<IRes<IEventDetail>>(`/trace/detail/${eventId}`)
  return res.data.data
}

export async function queryEventsGraph(params: IEventsGraphQueryParams) {
  const res = await axios.post<IRes<IRelatedEventsGraph>>(`/trace/eventGraph/infos`, params)
  return res.data.data
}
