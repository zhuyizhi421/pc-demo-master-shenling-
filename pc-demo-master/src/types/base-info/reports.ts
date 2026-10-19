export interface QualificationRateReq {
  pageQuery: {
    pageNum: number
    pageSize: number
  }
  queryParam: {
    areaName?: string
    processName?: string
    productName?: string
    productCode?: string
    qualificationRate?: number | null
    screen?: number | null
    year?: number
  }
}

export interface QualificationRateVo {
  april: number
  areaName: string
  august: number
  average: number
  december: number
  february: number
  january: number
  july: number
  june: number
  march: number
  may: number
  november: number
  october: number
  processName: string
  productCode: string
  productName: string
  september: number
  serialNumber: number
}

export interface QualityDefectRecordReq {
  pageQuery: {
    pageNum: number
    pageSize: number
  }
  queryParam: {
    defectName: string
    orderCode: string
    processName: string
    productName: string
    productCode: string
    statisticsTime?: string
    startTime: string
    endTime: string
  }
}

export interface QualityDefectRecordVo {
  areaName: string
  defectName: string
  defectNumber: number
  executor: string
  orderNumber: string
  orderType: string
  process: string
  processName: string
  productCode: string
  productFigureNumber: string
  productName: string
  serialNumber: number
  source: string
  station: string
  taskCode: string
  unit: string
  workCenterName: string
}

export interface QualityDefectStatisticsReq {
  pageQuery: {
    pageNum: number
    pageSize: number
  }
  queryParam: {
    defectName: string
    productName: string
    productCode: string
    statisticsTime?: string
    startTime?: string
    endTime?: string
  }
}

export interface QualityDefectStatisticsVo {
  defectCode: string
  defectName: string
  defectNumber: number
  productCode: string
  productName: string
  serialNumber: number
}
export interface QualityDefectAnalysisReq {
  endTime?: string | Date
  startTime?: string | Date
}

export interface QualityDefectAnalysisVo {
  barChart: { title: string; value: number }[]
  lineChart: { title: string; value: number }[]
}

export interface ProductionAchievementAnalysisReportReq {
  productName: string
  productNo: string
  productionOrderNo: string
}

export interface ProductionAnalysisReq {
  pageQuery: {
    pageNum: number
    pageSize: number
  }
  queryParam: {
    productName: string
    productNo: string
    productionOrderNo: string
  }
}

export interface ProductionAnalysisVo {
  achievingProportion: number
  actualBeginTime: string
  actualEndTime: string
  completeAmount: number
  index: number
  operation: string
  orderNo: string
  planAmount: number
  planBeginTime: string
  planEndTime: string
  productName: string
  productNo: string
  productionOrderID: string
  unit: string
}
export interface ProductionAnalysisDetailReq {
  pageQuery: {
    pageNum: number
    pageSize: number
  }
  queryParam: {
    productionOrderID: string
  }
}
export interface ProductionAnalysisDetailVo {
  actualBeginTime: string
  actualEndTime: string
  completeAmount: number
  planAmount: number
  processSerial: string
  techName: string
}

export interface ProductionInProcessReq {
  pageQuery: {
    pageNum: number
    pageSize: number
  }
  queryParam: {
    productName: string
    productNo: string
    productionOrderNo: string
    productionTaskNo: string
  }
}
export interface ProductionInProcessVo {
  actualBeginTime: string
  actualEndTime: string
  inProcessAmount: number
  index: number
  orderNo: string
  planAmount: number
  planBeginTime: string
  planEndTime: string
  processSerial: string
  productName: string
  productNo: string
  taskOrderNo: string
  techName: string
  unit: string
}

export interface ProductionInProcessStatisticsReq {
  pageQuery: {
    pageNum: number
    pageSize: number
  }
  queryParam: {
    productionIDs: string[]
  }
}

export interface ProductionInProcessStatisticsVo {
  index: number
  operation: string
  productFigureNumber: string
  productID: string
  productName: string
  productNo: string
  totalAmount: number
  unit: string
}

export interface ProductionInProcessStatisticsDetailReq {
  pageQuery: {
    pageNum: number
    pageSize: number
  }
  queryParam: {
    productionID: string
  }
}

export interface ProductionInProcessStatisticsDetailVo {
  amount: number
  processSerial: string
  techName: string
}

export interface QualityFirstPassRateAnalysisReq {
  endTime: string
  areaIds: string[]
  productModelIds: string[]
  startTime: string
}

export interface QualityFirstPassRateAnalysisVo {
  firstPassQuantity: number
  firstPassRate: number
  index: number
  producedQuantity: number
  productModelCode: string
  productModelName: string
}

export interface LogisticsStockStatisticsReq {
  productModelIds: string[]
  storageIds: string[]
}
export interface LogisticsStockStatisticsVo {
  index: number
  productModelCode: string
  productModelName: string
  stockAmount: number
  storageCode: string
  storageName: string
  unit: string
}

export interface LogisticsPurchaseIntimeRateStatisticsReq {
  endTime: string
  startTime: string
  supplierIds: string[]
}

export interface LogisticsPurchaseIntimeRateStatisticsVo {
  actualAmount: number
  deliveryRate: number
  index: number
  planAmount: number
  supplierCode: string
  supplierName: string
}

export interface LogisticsPurchaseBatchRateStatisticsReq {
  endTime: string
  startTime: string
  supplierIds: string[]
}

export interface LogisticsPurchaseBatchRateStatisticsVo {
  index: number
  inspectQuantity: number
  ngQuantity: number
  passRate: number
  supplierCode: string
  supplierName: string
}

export interface LogisticsInboundInspectRateStatisticsReq {
  supplierIds: string[]
  endTime: string
  startTime: string
}

export interface LogisticsInboundInspectRateStatisticsVo {
  finishRate: number
  index: number
  inspectTaskQuantity: number
  notFinishTaskQuantity: number
  supplierCode: string
  supplierName: string
}

export interface LogisticsOutboundInspectRateStatisticsReq {
  customerIds: string[]
  endTime: string
  startTime: string
}

export interface LogisticsOutboundInspectRateStatisticsVo {
  customerCode: string
  customerName: string
  finishRate: number
  index: number
  inspectTaskQuantity: number
  notFinishTaskQuantity: number
}
