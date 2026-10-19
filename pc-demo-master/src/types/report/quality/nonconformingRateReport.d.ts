import type { IRequestPageParams } from "@/types/common"

export interface INonconformingRateReportPageParams
  extends IRequestPageParams<
    Partial<{
      entityIds: string[] // 生产区域
      productModelIds: string[] // 产品模型Id集合
    }>
  > {}

export interface INonconformingRateReportPageItem {
  decimalNumber: number // 保留小数点位数
  index: number // 序号
  productionArea: string // 生产区域
  productionCount: number // 生产数
  qualifiedCount: number // 合格数
  unitName: string // 单位
  unqualifiedCount: number // 不合格数
  unqualifiedRate: number // 不合格率
}

export interface INonconformingRateReportDetailPageItem {
  decimalNumber: number // 保留小数点位数
  drawingNumber: string // 产品图号
  index: number // 序号
  productCode: string // 产品编号
  productName: string // 产品名称
  productionArea: string // 生产区域
  productionOrder: string // 生产订单
  productionQty: number // 生产数
  qualifiedQty: number // 合格数
  specification: string // 产品规格
  unitName: string // 单位
  unqualifiedQty: number // 不合格数
}
