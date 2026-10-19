import type { IRequestPageParams } from "@/types/common"

export interface INonconformingAnalysisReportPageParams
  extends IRequestPageParams<
    Partial<{
      defectTypeIds: string[] // 缺陷类型ID数组
      endDate: string // 结束时间
      entityIds: string[] // 实体ID数组
      startDate: string // 开始时间
      status: number // 已评审-1 ，未评审-2
    }>
  > {}

export interface INonconformingAnalysisReportPageItem {
  createDate: string // 创建日期
  registerDate: string // 登记日期
  decimalNumber: number // 保留小数位
  defectName: string // 缺陷名称
  drawingNumber: string // 产品图号
  defectTypeName: string // 缺陷类型名称
  quantity: number // 处理数量
  index: number // 序号
  productCode: string // 产品编号
  productName: string // 产品名称
  reviewResult: number // 处理方式(3-让步接收 4-报废 5-返工 6-验退 7-改制 8-料废 9-工废 10-简易返工 11-退补)
  specification: string // 产品规格
  status: number // 状态
  unitName: string // 单位
}

export interface INonconformingAnalysisReportChart {
  barChart: {
    title: string
    value: number
  }[]
  lineChart: {
    title: string
    value: number
  }[]
}
