import type { IDepartmentItem } from "@/types/base-info/department"
import type { IEmployeeListItem } from "@/types/base-info/employee"
import type { IFileInfo } from "@/types/base-info/file"
import type { IRequestPageParams } from "@/types/common"

export interface IMroInspectionTaskPageListParams
  extends IRequestPageParams<
    Partial<{
      barCode: string // mro标签码
      curDep: number // 是否只显示当前员工部门数据, 1是
      empId: string // 员工id
      inspectionNo: string // 校验任务单号
      inspectionResult: number // 检验结果 (1OK|0NG|2未出结果)
      inspectionResultList: number[] // 检验结果列表
      mroInformationId: string // mro实体的id
      mroNo: string // Mro 编号
      taskSourceList: string[] // 任务单来源列表
      taskStatus: number // 任务状态
      taskStatusList: number[] // 任务状态列表
    }>
  > {}

export interface IMroInspectionTaskItem {
  createBy: string // 创建人的ID，如果未提供则默认为NULL
  createTime: string // 创建时间，默认为当前时间戳，不允许为空
  exceptionAttachmentFileId: string // 外部校验异常附件ID
  exceptionTaskId: string // 异常工单的ID，如果有异常工单关联的话
  exceptionTaskNo: string // 异常工单编号，如果有异常工单关联的话
  fileDesc: string // 文件说明
  files: IFileInfo[] // 附件列表
  id: string // 校验任务ID
  inspectionDepartments: IDepartmentItem[] // 检验部门
  inspectionMethod: string // 方法要求
  inspectionName: string // 检验项名称
  inspectionNo: string // 检验项编号
  inspectionResult: number // 检验结果 (1OK|0NG|2未出结果)
  inspectionStandard: {
    standardDesc: string // 检验标准文本描述， 检验标准为1,2都可以传，但为2必传
    standardMax: number // 区间上限 大于0, -1 表示无该区间
    standardMaxInclusive: number // 标准区间上限是否包含(1-包含 0-不包含)，默认不包含
    standardMin: number // 区间下限 大于0, -1 表示无该区间
    standardMinInclusive: number // 标准区间下限是否包含(1-包含 0-不包含), 默认不包含
    standardType: number // 检验标准 1数值 2文本
    unitId: string // 单位ID
    unitName: string // 单位名称
  }
  inspectionTaskId: string // MRO校验任务的ID
  inspectionTime: string // 提交时间
  inspectionUsers: IEmployeeListItem[] // 校验人员
  mroItemConfigId: string // MRO配置项的ID
  mroItemConfigName: string // MRO配置项的名称
  ngDepartments: IDepartmentItem[] // NG部门
  ngReason: string // NG说明
  practicalValue: number // 实测值
  remarkFiles: IFileInfo[] // 备注附件列表
  remarks: string // 备注
  updateBy: string // 更新人的ID，如果未提供则默认为NULL
  updateTime: string // 更新时间，默认为当前时间戳，不允许为空
}

export interface IMroInspectionTaskPageListItem {
  barCode: string // 标签码
  barCodeId: string // 标签码id
  createBy: string // 创建人的 ID
  createTime: string // 创建时间
  curLocation: number // MRO当前位置(1在库2生产单位3在途)
  departments: string // 部门
  executePosition: string // 执行职位
  id: string // 校验任务ID
  inspectionComplete: string // 校验结束时间
  inspectionInstitution: string // 校验机构
  inspectionNo: string // 校验任务单号
  inspectionResult: number // 检验结果 (1OK|0NG|2未出结果)
  inspectionStart: string // 校验开始时间
  inspectionStatus: number // 校验任务状态（1待执行|2执行中|3已完成|0已过期）
  inspectionUsers: IEmployeeListItem[] // 校验人员
  items: IMroInspectionTaskItem[] // Mro检验条目列表
  locationName: string // 库位名
  mroInformationId: string // MRO信息的ID，不允许为空
  mroModelId: string // Mro型号
  mroModelName: string // Mro型号名称
  mroModelNo: string // MRO编号
  mroSpec: string // MRO规格
  mroClassifyName: string // MRO分类
  mroTypeName: string // MRO类型
  mroNo: string // MRO信息编号
  planStartTime: string // 计划开始时间
  submitterName: string // 提交人
  checkByName: string // 复核人
  checkTime: string // 复核时间
  taskSource: string // 任务单来源
  voidByName: string // 作废人
  voidReason: string // 作废原因
  voidTime: string // 作废时间
  remarks: string // 备注
  updateBy: string // 更新人的 ID，如果未提供则默认为 NULL
  updateTime: string // 更新时间，默认为当前时间戳，不允许为空
  warehouseId: string // 仓库id
  warehouseLocationId: string // 库位id
  warehouseName: string // 仓库名
  workStationId: string // 工位id，针对在生产单位的MRO
  workStationName: string // 生产单位名
}

export interface IMroInspectionTaskItemPageListParams
  extends IRequestPageParams<
    Partial<{
      inspectionNo: string // 检验项编号
      inspectionResult: number // 检验结果 (1OK|0NG|2未出结果)
      inspectionTaskId: string // MRO校验任务的ID
    }>
  > {}

export interface IMroVerifyTaskAttachment
  extends Partial<{
    fileId: string // 文件id
    fileName: string // 文件名称
    inspectionTaskId: string // MRO校验任务id
  }> {}

export interface IMroVerifyTaskAttachmentInfo {
  approvedFileId: string // 已审核通过的文件ID
  cancellationProcessDefineId: string // 部署记录的创建人
  createBy: string // 部署记录的创建时间
  createTime: string // 所在目录的ID
  directoryId: string // 所在目录名
  directoryName: string // 文件扩展
  extension: string // 关联的文件ID
  fileId: string // 文件的名称
  fileName: string // 文件的状态0|修订1正常|2审核|-1作废
  fileStatus: number // 文件hash
  hash: string // 唯一标识文件部署的ID
  id: string // 关联的流程定义ID
  path: string // 关联的流程定义ID
  reviseProcessDefineId: string // 是否显示受控章
  showControlledSeal: boolean // example: false
  size: string // 文件大小
  sourceName: string // 源文件名
  uploadTime: string // 文件上传时间
  version: string // 文件版本
}

export interface IMroInspectionTaskSubmitItem {
  id?: string
  inspectionName: string
  inspectionNo: string
  inspectionResult: number
  mroItemConfigId?: string
  practicalValue?: string
  remarkFileIds?: string[]
  remarks?: string
}

export interface IMroInspectionTaskSubmitParams {
  id?: string
  executePosition: string
  inspectionNo?: string
  items: IMroInspectionTaskSubmitItem[]
  mroInformationId: string
  mroModelId: string
  mroNo: string
  planStartTime: string
  remarks?: string
  taskSource: string
}

export interface IMroInspectionTaskVoidParams {
  id: string
  reason?: string
  voidByName?: string
  voidReason: string
}
