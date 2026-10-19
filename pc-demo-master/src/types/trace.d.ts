/** 关联事件 */
export interface IRelatedEvent {
  eventTypeName: string
  eventId: number
  operator: string | null
  eventTime: string
  memo: {
    field: string
    value: string
  }[]
}

/** 事件详情 */
interface IEventDetailDataBasic {
  eventContentField: string
  eventContentName: string
  type: "KEY_VALUE" | "LIST"
}
interface IEventDetailKeyValueData extends IEventDetailDataBasic {
  type: "KEY_VALUE"
  value: {
    name: string
    field: string
    value: string
    component: "text" | "node"
    uri: unknown
    url: unknown
  }[]
}
interface IEventDetailListData extends IEventDetailDataBasic {
  type: "LIST"
  contentBean: {
    title: string[]
    rows: {
      field: string
      component: "text" | "node"
      content: string
      uri: unknown
      url: unknown
    }[][]
  }
}
type IEventDetailData = IEventDetailKeyValueData | IEventDetailListData

export interface IEventDetail {
  eventId: number
  eventTypeName: string
  eventTypeField: string
  eventTime: string
  type: string
  operator: unknown
  data: IEventDetailData[]
  objects: string[]
}

/** 事件关系图 */
export interface IRelatedEventsGraph {
  events: IRelatedEvent[]
  relations: {
    startEventId: number
    endEventId: number
    objects: string[]
  }[]
}

/** 使用唯一标识查询关联事件 */
export enum RelatedEventsSortEnum {
  降序 = "desc",
  升序 = "asc"
}
export interface IRelatedEventsQueryParams {
  dateRange?: {
    endDate?: string
    startDate?: string
  }
  pageQuery?: {
    pageNum: number
    pageSize: number
  }
  queryParam?: {
    traceObjectCode: string
  }
  sort?: {
    field: string
    order: string
  }[]
}

/** 通过事件id与唯一标识查询关联事件图 */
export interface IEventsGraphQueryParams {
  eventId: number
  // 追踪/追溯方向，默认全向
  direction?: TraceDirectionEnum
  traceObjectCode?: string[]
  // 层级，默认10
  level?: number
}
