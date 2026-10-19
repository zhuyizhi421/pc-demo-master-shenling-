import type { IEmployeeListItem } from "@/types/base-info/employee"
import type { IFileInfo } from "@/types/base-info/file"
import type { IRequestPageParams } from "@/types/common"

export type IEquipmentScrapPageListParams = IRequestPageParams<
  Partial<{
    scrapStatus: number
    scrapStatusList: number[]
    sourceType: number
    sourceTypeList: number[]
    equipmentId: string
    processDefineId: string
  }>
>

export type IEquipmentScrapPageItem = {
  createBy: string // 创建人的 ID，如果未提供则默认为 NULL
  createTime: string // 创建时间，默认为当前时间戳，不允许为空
  equipmentId: string // 设备ID，不允许为空
  equipmentName: string // 设备名称
  equipmentNo: string // 设备编号
  files: IFileInfo[] // 文件列表
  id: string // id
  processDefineId: string // 流程定义
  processDefineName: string // 流程名称
  processInstanceId: string // 流程实例Id
  remarks: string // 备注
  reportUsers: IEmployeeListItem[] // 报废申请人
  scrapReason: string // 报废原因，不允许为空
  scrapStatus: number // 报废申请状态 1申请中|2已通过|3未通过
  sourceId: string // 来源的ID
  sourceNo: string // 来源单号
  sourceType: number // 来源类型 (1保养|2维修|3手动创建)
  updateBy: string // 更新人的 ID，如果未提供则默认为 NULL
  updateTime: string // 更新时间，默认为当前时间戳，不允许为空
}

export interface IEquipmentScrapApplyCreateParams {
  equipmentId: string
  fileIds: string[]
  remarks: string
  reportUserId: string
  scrapReason: string
}
