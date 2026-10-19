import type { IEmployeeListItem } from "@/types/base-info/employee"
import type { IFileInfo } from "@/types/base-info/file"
import type { IRequestPageParams } from "@/types/common"

export interface IMroVerifyExceptionTaskPageListParams
  extends IRequestPageParams<
    Partial<{
      mroInformationId: string // mro信息id
      mroNo: string // mro编号
      sourceType: number // 异常来源类型(1校验2保养)
      taskNo: string // 异常单号
      taskStatus: number // 异常状态 (0待处理|1已完成)
    }>
  > {}

interface IMroVerifyExceptionTaskFault {
  createBy: string // 创建人ID
  createTime: string // 创建时间
  faultCategoryId: string // 故障类型ID
  faultName: string // 故障项名字
  faultNo: string // 故障项编号，不允许为空
  faultType: number // 故障类型业务分类(1设备故障,2MRO故障,3产品故障,4Andon故障)
  id: string // 故障项ID
  isEnabled: boolean // 是否启用(0-停用 1-启用)
  remarks: string // 备注
  updateBy: string // 更新人ID
  updateTime: string // 更新时间
}

interface IMroExceptionHandlePosition {
  depId: string
  depName: string
  positionId: string
  positionName: string
}

export interface IMroVerifyExceptionTaskPageListItem {
  analysis: string // 分析备注
  attachmentFileList: IFileInfo[] // 附件列表
  completeTime: string // 办结时间
  createBy: string // 创建人的ID，如果未提供则默认为NULL
  createTime: string // 创建时间，默认为当前时间戳，不允许为空
  faults: IMroVerifyExceptionTaskFault[] // 故障列表
  handleUsers: IEmployeeListItem[] // 处理人列表
  id: string // 主键ID
  mroInformationId: string // MRO信息的ID
  mroModelId: string // MRO型号
  mroModelNo: string // MRO编号
  mroModelName: string // MRO型号名称
  mroName: string // MRO名称
  mroNo: string // MRO 编号
  mroSpec: string // MRO规格
  mroClassifyName: string // MRO分类
  mroTypeName: string // MRO类型
  exceptionHandlePositionList: IMroExceptionHandlePosition[] // 异常处理职位
  exceptionHandlePositionName: string // 异常处理职位展示
  mroRepairId: string // MRO维修的ID，如果有关联的维修工单
  mroRepairNo: string // MRO维修单的编号，如果有关联的维修工单
  mroScrapId: string // MRO报废，如果有关联的报废工单
  mroScrapProcInstId: string // 流程id
  solutionMeasures: string // 解决措施说明
  remarks: string // 备注
  faultDescription: string // 故障描述
  responsibleUsers: IEmployeeListItem[] // 责任人列表
  reportUsers: IEmployeeListItem[] // 报告人列表
  solution: number // 解决措施 (1无碍/2维修/3报废)
  sourceId: string // 来源Id,异常项的ID
  sourceName: string // 来源名称|异常项名称
  sourceNo: string // 来源单号|异常项单号
  sourceType: number // 来源 (1校验异常|2保养异常)
  taskNo: string // 异常单号
  taskStatus: number // 异常状态 (0待处理|1已完成)
  updateBy: string // 更新人的ID，如果未提供则默认为NULL
  updateTime: string // 更新时间，默认为当前时间戳，不允许为空
}

export interface IMroVerifyExceptionTaskFeedBackParams
  extends Partial<{
    analysis: string // 分析备注
    faultDescription: string // 故障描述
    faultIds: string[] // 故障项ID列表
    handleUserIds: string[] // 处理人ID列表
    id: string // 主键ID
    remarks: string // 备注
    responsibleUserIds: string[] // 责任人ID列表
    repairReason: string // 维修原因
    scrapFileIds: string[] // 报废文件ID列表
    scrapReason: string // 报废原因
    solutionMeasures: string // 解决措施说明
    solution: number // 解决措施 (1无碍/2维修/3报废)
  }> {}

export interface IMroVerifyExceptionTaskAssignResponsibleParams {
  id: string
  responsibleUserId: string
}
