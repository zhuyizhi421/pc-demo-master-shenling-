/** 生产订单执行监控报表 */

export interface IProductionOrderExecutionMonitorPageParams {
  pageNum: number
  pageSize: number
  // 筛选条件
  planBeginTimeStart?: string // 计划开始时间-开始
  planBeginTimeEnd?: string // 计划开始时间-结束
  equipmentNo?: string // 设备编号
  productionOrderNo?: string // 生产订单号
  productionTaskNo?: string // 生产任务号
  processSerial?: string // 工序编号
  productModelCode?: string // 产品编号
  productModelName?: string // 产品名称
  reporterName?: string // 报工人姓名
}

export interface IProductionOrderExecutionMonitorPageItem {
  // 基本信息
  id: string
  equipmentNo: string // 设备编号
  dataType: "plan" | "manual" | "collection" // 类型：计划/人工/数采
  productionOrderNo: string // 生产订单号
  productModelName: string // 产品名称
  productModelCode: string // 产品编号
  productionTaskNo: string // 生产任务号
  techName: string // 工艺名称
  processSerial: string // 工序编号

  // 时间信息
  startTime: string // 开始时间
  endTime: string // 结束时间

  // 数量信息
  duration: number // 工作时长(分钟)
  waitingTime: number // 设备待机时长(分钟)
  outputQty: number // 产量

  // 人员信息
  reporterName: string // 报工人

  // 统计信息
  statDate: string // 统计日期
}

// 数采详情
export interface IEquipmentCollectionDetailItem {
  equipmentNo: string // 设备编号
  processingTime: number | null // 加工时长(S)
  alarmTime: number | null // 报警时长(S)
  idleTime: number | null // 空闲时长(S)
  startTime: string // 开始时间
  endTime: string // 结束时间
  status: "正常" | "报警" // 设备运行状态
}
