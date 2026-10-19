import type { IDepartmentItem } from "@/types/base-info/department"
import type { IEmployeeListItem } from "@/types/base-info/employee"
import type { IFileInfo } from "@/types/base-info/file"
import type { IRequestPageParams } from "@/types/common"

export interface IMroScrapApplyPageListParams
  extends IRequestPageParams<
    Partial<{
      mroInformationId: string // mro实体id
      scrapStatus: number // 申请状态(1申请中|2已通过|3未通过)
      scrapStatusList: number[] // 申请状态列表
      sourceType: number // 来源(1维修报废/2盘亏报废/3手动创建)
      sourceTypeList: number[] // 来源列表
    }>
  > {}

export interface IMroScrapApplyPageListItem {
  createBy: string // 创建人ID
  createTime: string // 创建时间
  files: IFileInfo[] // 文件列表
  id: string // id
  lifeSpan: number // 寿命
  mroInformationId: string // MRO信息ID
  mroClassifyName: string // MRO分类
  mroCategoryName: string // MRO类型
  mroModelId: string // MRO型号
  mroModelNo: string // MRO编号
  mroModelName: string // MRO型号名称
  mroName: string // MRO名称
  mroNo: string // MRO序列号
  processDefineId: string // 流程定义ID
  processDefineName: string // 流程名称
  processInstanceId: string // 流程实例ID
  processStarter: string // 流程发起人
  reportUser: IEmployeeListItem // 报废人
  reportUserDepartment: IDepartmentItem // 报废人部门
  scrapReason: string // 报废原因
  scrapStatus: number // 申请状态(1申请中|2已通过|3未通过)
  sourceId: string // 关联表单
  sourceNo: string // 关联表单编号
  sourceType: number // 来源 1校验异常2保养异常3维修报废4手动创建
  updateBy: string // 更新人ID
  updateTime: string // 更新时间
}

export interface IMroScrapApplyCreateParams
  extends Partial<{
    fileIds: string[] // 文件ID列表
    mroInformationId: string // MRO信息ID
    processDefineId: string // 流程定义ID
    reportUserIds: string[] // 报废人ID列表
    scrapReason: string // 报废原因
    sourceId: string // 关联表单
    sourceType: number // 来源 1校验异常2保养异常3维修报废4手动创建
  }> {}
