import type { IDepartmentItem } from "@/types/base-info/department"
import type { IEmployeeListItem } from "@/types/base-info/employee"
import type { IFileInfo } from "@/types/base-info/file"
import type { IRequestPageParams } from "@/types/common"

export interface IMroRepairPageListParams
  extends IRequestPageParams<
    Partial<{
      barcode: string // Mro标签码
      handleDepartmentIds: string[] // 处理部门id
      mroInformationId: string // mro实体的id
      mroNo: string // MRO序列号
      mroModelNo: string // MRO型号编号
      repairNo: string // 任务单号
      repairResult: number // 维修结果 (1已解决|0报废|2转下一轮维修)
      repairStatus: number // 任务状态 (0未复核|1待维修|2已完成)
      repairMode: number // 维修方式 (1内部维修|2委外维修)
      sourceNo: string // 来源单号
      sourceType: number // 来源 (1校验异常|2保养异常|3手动创建)
    }>
  > {}

export interface IMroRepairPageListItem {
  barcode: string // MRO绑定的标签码
  completeTime: string // 办结时间 (日期+时间点)
  createBy: string // 创建人的ID，如果未提供则默认为NULL
  createTime: string // 创建时间，默认为当前时间戳，不允许为空
  handleDepartment: IDepartmentItem
  handleUser: IEmployeeListItem
  responsibleUser: IEmployeeListItem
  handlePosition: string // 处理职位（部门-职位）
  id: string
  linkedExceptionTaskId: string // 关联异常工单ID
  linkedExceptionTaskNo: string // 关联异常工单号
  mroInformationId: string // MRO信息的ID
  mroModelId: string // Mro型号
  mroModelNo: string // Mro型号编号
  mroModelName: string // Mro型号名称
  mroNo: string // MRO序列号
  mroSpec: string // MRO规格
  mroClassifyName: string // MRO分类
  mroCategoryName: string // MRO类型
  mroScrapProcInstId: string // 报废流程id
  repairRound: number // 维修轮次
  previousRepairNo: string // 上一轮维修单号
  repairMode: number // 维修方式
  entrustUnit: string // 委托单位
  faultDescription: string // 故障描述
  analysis: string // 故障分析
  solutionMeasures: string // 解决措施
  repairStartTime: string // 开始维修时间
  repairEndTime: string // 维修完成时间
  remarks: string // 备注
  repairAfterLife: number // 维修后寿命（百分比）
  repairBeforeLife: number // 维修前寿命（百分比）
  currentLife: number // current life
  repairNo: string // 任务单号
  repairReason: string // 维修原因（历史字段）
  repairResult: number | "" // 维修结果 (1已解决|0报废|2转下一轮维修)
  repairStatus: number // 任务状态 (0未复核|1待维修|2已完成)
  reportUser: IEmployeeListItem
  scrapFiles: IFileInfo[]
  scrapId: string // 报废单id
  scrapReason: string // 报废原因
  serialNo: string // Mro序列号
  sourceId: string // 来源单 id
  sourceNo: string // 来源单 编号
  sourceType: number // 来源 (1校验异常|2保养异常|3手动创建)
  totalLife: number // 寿命上限（次）
  updateBy: string // 更新人的ID，如果未提供则默认为NULL
  updateTime: string // 更新时间，默认为当前时间戳，不允许为空
}

export interface IMroRepairCreateParams {
  mroInformationId: string // Mro实例id
  mroNo?: string // MRO序列号
  mroModelId?: string // MRO型号id
  mroModelNo?: string // MRO编号
  mroModelName?: string // MRO名称
  mroSpec?: string // MRO规格
  mroClassifyName?: string // MRO分类
  mroCategoryName?: string // MRO类型
  repairBeforeLife?: number // 维修前寿命
  faultDescription: string // 故障描述
  analysis?: string // 故障分析
  solutionMeasures?: string // 解决措施
  repairMode?: number // 维修方式
  entrustUnit?: string // 委托单位
  reportUserId: string // 报修人id
}

export interface IMroRepairFeedBackParams
  extends Partial<{
    fileIds: string[] // 报废附件id
    handleDepartmentId: string // 处理部门id
    handleUserId: string // 处理人id
    handleUserName: string // handler name
    responsibleUserId: string // 责任人id
    id: string // 维修单id
    faultDescription: string // 故障描述
    analysis: string // 故障分析
    solutionMeasures: string // 解决措施
    remarks: string // 备注
    repairStartTime: string // 开始维修时间
    repairEndTime: string // 维修完成时间
    repairAfterLife: number // 维修后寿命（百分比）
    repairResult: number // 维修结果 (1已解决/0报废/2转下一轮维修)
    repairMode: number // 维修方式
    entrustUnit: string // 委托单位
    scrapReason: string // 报废原因
  }> {}

export interface IMroRepairUpdateParams
  extends Partial<{
    id: string
    mroInformationId: string
    mroNo: string
    mroModelId: string
    mroModelNo: string
    mroModelName: string
    mroSpec: string
    mroClassifyName: string
    mroCategoryName: string
    faultDescription: string
    analysis: string
    solutionMeasures: string
    repairMode: number
    entrustUnit: string
    reportUserId: string
  }> {}

export interface IMroRepairReviewParams {
  id: string
}

export interface IMroRepairAssignResponsibleParams {
  id: string
  responsibleUserId: string
}
