/** 生产运营管理-生产输出 */

export interface IProductOutputPageListRes {
  decimalNumber: number // 保留位数
  executionBatch: number // 调度任务报工批次
  facilityName: string // 生产单位名称
  id: string // 报工记录ID
  processSerial: string // 工序编号
  productModelCode: string // 产品编号
  productModelId: number // 产品模型ID
  productModelName: string // 产品名称
  productionExecutionId: number // 调度任务id
  productionExecutionNo: string // 调度任务编号
  productionOrderId: number // 生产订单id
  productionOrderNo: string // 生产订单编号
  productionTaskId: number // 生产任务id
  productionTaskNo: string // 生产任务编号
  outputName: string // 报工人
  reportQty: number // 报工总数
  reportTime: string // 报工时间
  rotationName: string // 报工班次
  techName: string // 工艺名称
  unitId: number // 单位Id
  unitName: string // 单位名称
  workStationName: string // 工位名称
  sourceType: number // 来源
  productIds: string[] // 包含的产品id
}

export interface IProductOutputPageListReq {
  dateRange: {
    endDate?: string
    startDate?: string
  }
  pageQuery: {
    pageNum: number
    pageSize: number
  }
  queryParam: {
    productModelName?: string
    productionOrderNo?: string
    productionTaskNo?: string
    workstationName?: string
    outputName?: string
  }
  sort?: {
    field: string
    order: string
  }[]
}
