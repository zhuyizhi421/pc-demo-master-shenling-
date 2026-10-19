import type { IRequestPageParams } from "@/types/common"

export interface IProduceTaskCompleteRateReportPageParams
  extends IRequestPageParams<
    Partial<{
      endDate: string // 结束时间
      entityIds: string[] // 生产区域id列表（详情时传）
      entityLevel: string // 所汇总层级（1-公司 2-工厂 3-区域 4-生产单位 21-工位。汇总的时候传）
      startDate: string // 开始时间
      statuses: number[] // 状态 1已复核 5未复核 6执行中 8已暂停 9已完成 10已关闭
      summaryEntity: string // 所汇总区域(汇总到单个区域-不分页的时候传)
      summaryEntityList: string[] // 所汇总区域(汇总到整个层级-分页的时候传)
    }>
  > {}

export interface IProduceTaskCompleteRateReportDetailPageItem {
  completeQty: number // 完工数量
  completionRate: number // 完成率
  date: string // 日期
  entityIds: string[] // 生产区域id列表
  entityName: string // 生产区域
  planProcessingQty: number // 计划加工数量
  planStartTime: string // 计划开始时间
  productCode: string // 产品编号
  productName: string // 产品名称
  remark: string // 备注
  taskId: string // 生产任务ID
}

export interface IProduceTaskCompleteRateReportSummaryPageItem {
  entityName: string // 生产区域
  monthCompletionRate: {
    monthCompletionRate: number // 月完成率
    monthDate: string // 月份日期（例：2025年6月）
  }[] // 月完成率列表
  yearCompletionRate: {
    yearCompletionRate: number // 年完成率
    year: string // 年份（例：2025年）
  }[] // 年完成率列表
}
