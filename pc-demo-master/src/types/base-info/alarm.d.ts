export interface IAlarmModelParams {
  isEnabled?: boolean // 启用停用状态(true启用 false停用)
  modelName?: string
  pageNum: number
  pageSize: number
}

export interface IAlarmModelItem {
  createBy: string
  createTime: string
  id: string
  isEnabled: boolean
  modelName: string
  modelNo: string
  remarks: string
  totalLevel: number
  updateBy: number
  updateTime: string
}
