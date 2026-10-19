/** 流程进度 */
export enum EnumFlowProgress {
  RUNNING = 1, // 进行中
  PASSED = 2, // 已通过
  REJECTED = 3 // 已拒绝
}

export enum UserTypeEnum {
  OnlyOne = 1,
  Multi = 2,
  Position = 3
}

export interface IFlowListParams {
  pageNum: number
  pageSize: number
  assigneeId?: string
  endTime?: string
  name?: string
  processDefId?: string
  processInstId?: string
  progress?: number // 流程进度 1进行中  2已结束
  progressList?: number[]
  result?: number
  startTime?: string
  startUserDepId?: string
  startUserId?: string
}

export interface IFlowListResult {
  executionId: string
  taskId: string
  taskDefKey: string
  taskType: string
  taskName: string
  taskProcess: number
  assigneeId: string
  assigneeName: string
  assigneeDeptId: string
  assigneeDeptName: string
  startDeptName: string
  startUserId: string
  startUserName: string
  procVars: {
    formId: string
    formType: number
    approverList: string[]
    INITIATOR: string
  }
  taskLocalVars: {}
  category: string
  deployId: string
  procDefId: string
  procDefKey: string
  procDefName: string
  procDefVersion: number
  procInsId: string
  procProgress: number // 流程进度 1进行中 2已通过 3已拒绝
  comment: {
    comment: string
    type: string
  }
  candidate: string
  createTime: string
  startTime: string
  endTime: string
  duration: string
}

export interface IFlowAuditParams {
  taskList: {
    comment: string
    instanceId: string
    taskId: string
  }[]
}

export interface IFlowAuditRejectParams {
  instanceIds: string[]
  comment: string
}

export interface IFlowableInstParams {
  pageNum: number
  pageSize: number
  processDefId?: string
  progress?: number
  progressList?: number[]
  startTime?: string
  endTime?: string
}

export interface IFlowableInstItem {
  assigneeDeptName: string
  assigneeId: number
  assigneeName: string
  candidate: string
  category: string
  comment: {
    comment: string
    type: string
  }
  createTime: string
  deployId: string
  deptName: string
  duration: string
  executionId: string
  finishTime: string
  hisProcInsId: string
  procDefId: string
  procDefKey: string
  flowTaskDto: any
  parseForm: any
  procDefName: string
  procDefVersion: number
  procInsId: string
  procVars: {}
  startDeptName: string
  startUserId: string
  startUserName: string
  taskDefKey: string
  taskId: string
  taskLocalVars: {}
  taskName: string
}

export interface IFlowableDefinitionParams {
  name?: string
  pageSize: number
  pageNum: number
}

export interface IFlowableDefinitionItem {
  category: string
  deploymentId: string
  deploymentTime: string
  flowKey: string
  formId: number
  formName: string
  id: string
  name: string
  suspensionState: number
  version: number
}
