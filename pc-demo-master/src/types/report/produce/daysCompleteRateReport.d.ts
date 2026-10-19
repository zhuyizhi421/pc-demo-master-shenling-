import type { IRequestPageParams } from "@/types/common"

export interface IDaysCompleteRateReportPageParams
  extends IRequestPageParams<
    Partial<{
      endDate: string // 结束时间
      startDate: string // 开始时间
      entityIds: string[] // 生产区域ID集合
    }>
  > {}

export interface IDaysCompleteRateReportPageItem {
  completionRate: number // 完成率
  facilityName: string // 生产单位
  facilityId: string // 生产单位ID
  time: string // 时间
}

export interface IDaysCompleteRateDetailParams {
  date: string // 日期
  entityId: string // 生产单位ID
}

export interface IDaysCompleteRateDetailItem {
  completedQuantity: number // 每日完工数量
  completionRate: number // 每日完工率
  orderNo: string // 订单单号
  plannedQuantity: number // 每日计划加工数量
  productModelName: string // 产品名称
  productModelNo: string // 产品编号
  taskNo: string // 任务单号
  unitName: string // 单位
}
