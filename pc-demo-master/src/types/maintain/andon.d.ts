import type { IRequestPageParams } from "@/types/common"

export type IAndonRecordParams = IRequestPageParams<{
  andonId?: string
  entityId?: string
  andonFaultId?: string
  no?: string
  andonTriggerTimeStart?: string
  andonTriggerTimeEnd?: string
}>

export interface IAndonRecordItem {
  andonCategoryId: number
  andonCategoryName: string
  andonFaultCategoryId: number
  andonFaultCategoryName: string
  andonFaultId: number
  andonFaultName: string
  andonFeedback: number //是否需要维修反馈 1维修反馈 0不需要 2查看反馈
  andonRecordItem: {
    andonConsumeTime: {
      nano: number
      negative: boolean
      seconds: number
      units: {
        dateBased: boolean
        durationEstimated: boolean
        timeBased: boolean
      }[]
      zero: boolean
    }
    andonExecuteEmpBarcode: number
    andonExecuteEmpId: number
    andonExecuteEmpName: string
    andonExecuteResult: number
    andonExecuteTime: string
    andonRecordId: number
    createBy: number
    createTime: string
    equipmentId: number
    equipmentName: string
    facilityId: number
    facilityName: string
    id: number
    remarks: string
    type: number
    updateBy: number
    updateTime: string
    workStationId: number
    workStationName: string
  }[]
  andonFeedbackId: number
  andonHandlerResult: number // 621 允许生产 622暂停生产
  andonId: number
  andonName: string
  andonTriggerTime: string
  createBy: number
  createTime: string
  equipmentId: number
  equipmentName: string
  facilityId: number
  facilityName: string
  id: number
  no: string
  remarks: string
  status: EnumAndonRecordStatus // (611 待处理 | 612 处理中 | 613 待确认 | 614 已确认)
  updateBy: number
  updateTime: string
  workStationId: number
  workStationName: string
}

export interface IAndonModelParams {
  pageNum?: number
  pageSize?: number
  categoryId?: string
  andonName?: string
  isEnabled?: boolean
}

export interface IAndonModelItem {
  alarmModelId: string
  andonName: string
  andonNo: string
  bindFaultList: {
    andonId: string
    bindType: number
    faultCategoryId: string
    faultCategoryName: string
    faultId: string
    faultName: string
    faultNo: string
    id: string
  }[]
  categoryId: string
  categoryName: string
  createTime: string
  handlerIds: number[]
  handlerType: number
  id: string
  isAutoConfirm: boolean
  isEnabled: boolean
  needAlarmModel: boolean
  needFeedback: boolean
  remarks: string
}

export interface IAndonRecordDetail {
  andonCategoryId: string // Andon 类型 ID
  andonCategoryName: string // Andon 类型 名称
  andonFaultCategoryId: string // Andon 故障类型 ID (如果有)
  andonFaultCategoryName: string // Andon 故障类型 名称 (如果有)
  andonFaultId: string // Andon 故障 ID (如果有)
  andonFaultName: string // Andon 故障 名称 (如果有)
  andonFeedback: number //是否需要维修反馈 1维修反馈 0不需要 2查看反馈
  andonFeedbackId: string // andon 反馈id
  andonHandlerIds: string[]
  andonHandlerNames: string[]
  andonHandlerResult: number // 621 允许生产 622暂停生产
  andonHandlerType: number // Andon 处理对象类型(1-按员工 2-按部门 3-按职位)
  andonId: string // Andon ID
  andonName: string // Andon 名称
  andonRecordItem: {
    abstractAreaId: string // 抽象工厂建模id
    abstractAreaName: string // 抽象工厂建模名称
    andonConsumeTime: string // andon 处理耗时 类型为处理时是响应耗时，类型为关闭为处理耗时
    andonConsumeTimeSeconds: string // andon 处理耗时 单位秒
    andonExecuteEmpBarcode: string // Andon 处理人员 标签码
    andonExecuteEmpId: string // Andon 处理人员 ID
    andonExecuteEmpName: string // Andon 处理人员 名称
    andonExecuteResult: number // 处理结果 621 允许生产 622暂停生产 623 已解决 624 未解决
    andonExecuteTime: string // Andon 处理时间
    andonRecordId: string // Andon 记录 ID
    createBy: string // 创建人
    createTime: string // 创建时间
    entityId: string // 工厂建模id,同 abstractAreaId ,冗余
    entityName: string // 工厂建模名称,同 abstractAreaName ,冗余
    equipmentId: string // 设备 ID
    equipmentName: string // 设备 名称
    facilityId: string // 生产单位 ID
    facilityName: string // 生产单位 名称
    id: string // parentEntityId	string 工厂建模id,同 abstractAreaId ,冗余
    parentEntityName: string // parentEntityName	string 工厂建模名称,同 abstractAreaName ,冗余
    remarks: string // 备注
    triggerTypeEnum: string // Andon触发枚举值
    triggerTypeName: string // Andon触发枚举名称
    type: number // Andon 记录类型 (631 触发 | 632 处理 | 633 确认 | 634 关闭)
    updateBy: string // 更新人
    updateTime: string // 更新时间
    workStationId: string // 工位 ID
    workStationName: string // 工位 名称
  }[] // Andon 记录详情 分页查询不会返回该值
  AndonRecordItemVo: {} // Andon 记录项返回实体
  abstractAreaId: string // 抽象工厂建模id
  abstractAreaName: string // 抽象工厂建模名称
  andonConsumeTime: string // andon 处理耗时 类型为处理时是响应耗时，类型为关闭为处理耗时
  andonConsumeTimeSeconds: string // andon 处理耗时 单位秒
  andonExecuteEmpBarcode: string // Andon 处理人员 标签码
  andonExecuteEmpId: string // Andon 处理人员 ID
  andonExecuteEmpName: string // Andon 处理人员 名称
  andonExecuteResult: number // 处理结果 621 允许生产 622暂停生产 623 已解决 624 未解决
  andonExecuteTime: string // Andon 处理时间
  andonRecordId: string // Andon 记录 ID
  createBy: string // 创建人
  createTime: string // 创建时间
  entityId: string // 工厂建模id,同 abstractAreaId ,冗余
  entityName: string // 工厂建模名称,同 abstractAreaName ,冗余
  equipmentId: string // 设备 ID
  equipmentName: string // 设备 名称
  facilityId: string // 生产单位 ID
  facilityName: string // 生产单位 名称
  id: string // parentEntityId	string 工厂建模id,同 abstractAreaId ,冗余
  parentEntityName: string // parentEntityName	string 工厂建模名称,同 abstractAreaName ,冗余
  remarks: string // 备注
  triggerTypeEnum: string // Andon触发枚举值
  triggerTypeName: string // Andon触发枚举名称
  type: number // Andon 记录类型 (631 触发 | 632 处理 | 633 确认 | 634 关闭)
  updateBy: string // 更新人
  updateTime: string // 更新时间
  workStationId: string // 工位 ID
  workStationName: string // 工位 名称
}
