import type { IRequestPageParams } from "@/types/common"

export interface IImportDataPageParams
  extends IRequestPageParams<
    Partial<{
      taskTypes: string[] // 作业项类型
    }>
  > {}

export interface IImportDataPageItem {
  endTime: string // 结束时间
  errorFile: {
    fileId: string // 文件ID
    fileName: string // 文件名称
    fileURL: string // 文件URL
    uploadTime: string // 文件上传时间
  }
  errorFileId: string // 错误文件ID
  importFile: {
    fileId: string // 文件ID
    fileName: string // 文件名称
    fileURL: string // 文件URL
    uploadTime: string // 文件上传时间
  }
  importFileId: string // 导入文件ID
  no: string // 任务编号
  startTime: string // 开始时间
  status: string // 状态：PENDING-等待中 PROCESSING-执行中 SUCCESS-成功 FAILED-失败 REJECTED-被拒绝
  taskItem: string // 作业项
  taskItemName: string // 作业项名称
  taskType: string // 作业项类型
  taskTypeName: string // 作业项类型名称
}

export interface IImportDataTaskTypeItem {
  importTaskItemTypeConfigList: {
    order: number // 显示顺序
    taskItem: string // 作业项
    taskItemName: string // 作业项名称
  }[] // 作业项列表
  order: number // 行内显示顺序
  row: number // 显示所在行
  taskType: string // 作业项类型
  taskTypeName: string // 作业项类型名称
}

export interface IImportDataTemplateDownloadParams {
  taskItem: string // 作业项
  taskType: string // 作业项类型
}

export interface IImportDataCreateParams {
  fileId: string // 文件ID
  taskItem: string // 作业项
  taskItemName: string // 作业项名称
  taskType: string // 作业项类型
  taskTypeName: string // 作业项类型名称
}
