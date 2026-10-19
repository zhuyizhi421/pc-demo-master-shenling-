import type { IRequestPageParams } from "@/types/common"

export interface IProductInProgressAnalysisReportParams
  extends IRequestPageParams<{
    productModelIds?: string[] // 产品模型id列表
  }> {}

export interface IProductInProgressAnalysisReportPageItem {
  inProcessSerialList: {
    processSerial: string // 制程编号
    processTechs: {
      processProduct: {
        inProcessQty: number // 在制数量
        isTransferToNextProcess: boolean // 是否流转到下一道工序
        processProductId: string // 过程产品id
        processProductName: string // 过程产品名称
        processProductNo: string // 过程产品编号
      }[] // 制程产品信息
      techId: string // 工艺ID
      techName: string // 工艺名称
    }[] // 制程产品信息
  }[] // 在制工艺信息
  maxInProcessProcessSerial: string // 最大在制数量对应的工序
  maxInProcessQty: number // 最大在制数量
  processId: string // 产品工序ID
  productModelDesc: string // 产品描述
  productModelId: string // 产品模型ID
  productModelName: string // 产品名称
  productModelNo: string // 产品编号
  techVersion: string // 产品版本号
  totalInProcessQty: number // 总的在制数量
}

export interface IProductInProcessAnalysisTopChartItem {
  inProcessAmountRate: number // 在制数量占比
  processSerial: string // 制程工序
  productModelName: string // 产品名称
}
