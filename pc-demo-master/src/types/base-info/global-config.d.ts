import { EnumRemainingPeriodType, EnumSelectUser } from "@/constant/enums"
export interface IOption {
  label: string
  value: string | number
}

export interface IUploadPhoto {
  fileName?: string
  fileId: string
  fileUrl: string
  selected?: boolean // 图片是否选中
}

export interface ISystemForm {
  companyName: string
  logoFileList: IUploadPhoto[]
  loginBackgroundList: IUploadPhoto[]
  systemName?: string
  systemShortName?: string
}

export interface IProductionForm {
  productionTaskAutoCloseIntervalDays?: number
  dispatchBetweenFacilityPermitObjectIds: string[]
  dispatchBetweenFacilityPermitObjectType: EnumSelectUser
  allowNoLimit: boolean | undefined
  allowPartialReview: boolean | undefined
  pilotProductionOrderReviewPermitObjectIds: string[]
  pilotProductionOrderReviewPermitObjectType: EnumSelectUser
  dispatchPermitObjectIds: string[]
  dispatchPermitObjectType: EnumSelectUser
}

export interface IGlobalConfigProductionParams {
  productionTaskAutoCloseIntervalDays?: number // 生产任务自动结案间隔时间，单位：天
  dispatchBetweenFacilityPermitObjectType: number // 跨生产单位调度权限实体类型 1-员工 2-部门 3-职位
  dispatchBetweenFacilityPermitObjectIds: string[] // 跨生产单位调度权限实体ID列表
  allowNoLimit: boolean | undefined
  allowPartialReview: boolean | undefined
  pilotProductionOrderReviewPermitObjectIds: string[]
  pilotProductionOrderReviewPermitObjectType: number
  dispatchPermitObjectIds: string[]
  dispatchPermitObjectType: number
  productionLoadAuthRoleIds?: string[] // 生产上料授权角色ID列表
}

// export interface IGlobalConfigQualityParams {
//   mcInspectionTaskCloseObjectType: number // 一体机端自检任务关闭权限实体类型 1-员工 2-部门 3-职位
//   mcInspectionTaskCloseObjectIds: string[] // 一体机端自检任务关闭权限实体id列表
//   periodType: number // 在库检后剩余保质期天数设置类型 0=自定义 1=产品保质期
//   periodAfterInspection: number // 在库检后剩余保质期天数
//   materialInspectionAlarmId: string // 来料检提醒模型id
// }

export interface IGlobalConfigQualityParams {
  deliverInspectionOvertimeAlarmId: string
  firstInspectionOvertimeAlarmId: string
  firstSpecialInspectionOvertimeAlarmId: string
  inStockInspectionOvertimeAlarmId: string
  inboundInspectionOvertimeAlarmId: string
  lastInspectionOvertimeAlarmId: string
  lastSpecialInspectionOvertimeAlarmId: string
  materialInspectionAlarmId: string
  mcInspectionTaskCloseObjectIds: string[]
  mcInspectionTaskCloseObjectType: number
  outsourceInspectionOvertimeAlarmId: string
  periodAfterInspection: number
  periodType: number
  purchaseInspectionOvertimeAlarmId: string
  routineInspectionOvertimeAlarmId: string
  routineSpecialInspectionOvertimeAlarmId: string
  salesReturnInspectionOvertimeAlarmId: string
}

export interface IQualityForm {
  periodType?: EnumRemainingPeriodType // 在库检后剩余保质期天数设置类型 0=自定义 1=产品保质期
  periodAfterInspection?: number // 在库检后剩余保质期天数
  materialInspectionAlarmId?: string // 来料检提醒模型id
  purchaseInspectionOvertimeAlarmId?: string //采购入库检 超时提醒模型id
  outsourceInspectionOvertimeAlarmId?: string //委外入库检 超时提醒模型id
  inboundInspectionOvertimeAlarmId?: string
  deliverInspectionOvertimeAlarmId?: string
  salesReturnInspectionOvertimeAlarmId?: string
  inStockInspectionOvertimeAlarmId?: string
  firstInspectionOvertimeAlarmId?: string
  firstSpecialInspectionOvertimeAlarmId?: string
  routineInspectionOvertimeAlarmId?: string
  routineSpecialInspectionOvertimeAlarmId?: string
  lastInspectionOvertimeAlarmId?: string
  lastSpecialInspectionOvertimeAlarmId?: string
}

export interface IGlobalConfigStyleParams {
  companyName: string // 公司名称
  logoFileList: {
    imageFileId: string
    imageUrl: string
    isSelected: boolean
  }[] // 公司logo图片列表
  loginBackgroundList: {
    imageFileId: string
    imageUrl: string
    isSelected: boolean
  }[] // 登录背景图片列表
  systemName: string // 系统名称
  systemShortName: string // 系统简称
}

export interface ILogisticsForm {
  materialAfterInboundAlarmId?: string
  materialArriveOvertimeAlarmId?: string
  materialInboundOvertimeAlarmId?: string
}
