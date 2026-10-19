export interface ISystemMessageItem {
  id: string
  createBy: string
  createTime: string
  updateBy: string
  updateTime: string
  messageType: number // 消息类型：1系统消息 2流程消息
  procInstId: string // 流程实例Id
  subject: string
  content: string
  receiveBy: string
  sendTime: string
  isRead: number // 是否已读： 0未读 1已读
  readTime: string
}

export interface ICategory {
  name: string
  type: number
  unreadNum: string
}

export interface IMessageSearchParams {
  pageNum: number
  pageSize: number
  sendTimeEnd?: string
  sendTimeStart?: string
  type: number // 消息类型 0全部消息 1系统消息 2流程消息 3维检消息 4告警消息
}
