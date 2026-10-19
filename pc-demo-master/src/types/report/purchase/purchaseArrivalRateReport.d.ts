import type { IRequestPageParams } from "@/types/common"

export interface IPurchaseArrivalRateReportPageParams
  extends IRequestPageParams<
    Partial<{
      endDate: string // 结束时间
      overdueTime: number // 超期倒料时间（天）
      startDate: string // 开始时间
      supplierIds: string[] // 供应商ID列表
    }>
  > {}

export interface IPurchaseArrivalRateReportPageItem {
  actualArrivalTime: string // 实际收货时间
  arrivalQuantity: number // 收货数量
  closingTime: string // 结案时间
  diffDays: number // 差异时间(天)
  drawingNumber: string // 产品图号
  expectedArrivalTime: string // 预计收货时间
  index: number // 序号
  productName: string // 产品名称
  productNo: string // 产品编号
  purchaseOrderNo: string // 采购订单号
  purchaseQuantity: number // 采购数量
  specification: string // 产品规格
  status: string // 状态
  supplierCode: string // 供应商编号
  supplierName: string // 供应商简称
  unitName: string // 单位
}

export interface IPurchaseArrivalRateReportSummaryParams
  extends Partial<{
    endDate: string // 结束时间
    overdueTime: number // 超期倒料时间（天）
    startDate: string // 开始时间
    supplierIds: string[] // 供应商ID列表
  }> {}

export interface IPurchaseArrivalRateReportSummary {
  onTimeArrivalItemCount: number // 按期到货物料条目数
  onTimeArrivalRate: number // 准时到货率
  onTimeNotArrivalItemCount: number // 按期未到货物料条目数
  overdueArrivalItemCount: number // 超期到货物料条目数
  overdueNotArrivalItemCount: number // 超期未到货物料条目数
  targetOverdueArrivalRate: number // 目标超时到货率
  totalPurchaseOrderItemCount: number // 采购订单物料总条目数
}
