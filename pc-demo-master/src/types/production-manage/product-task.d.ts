import type { IRequestPageParams } from "@/types/common"

export interface ISelfOrderToOutRes {
  delegateType: number // 委外类型 3 订单委外 4工序委外
  expectedReceiveTime: string // 预计收货时间
  fileIds: string[] // 文件ID列表
  materialItems: {
    orderAmount: number // 数量
    productModelId: string // 产品模型id
    unitId: string // 单位id
  }[] // 物料明细
  no: string // 委托单号
  orderAmount: number // 订单委外数量
  originalOrderId: string // 原生产订单ID
  outputItems: {
    orderAmount: number // 数量
    productModelId: string // 产品模型id
    unitId: string // 单位id
  }[] // 产出物明细
  processId: string // 工艺路线ID
  productModelId: string // 产品模型ID
  remark: string // 备注
  serialItems: {
    id: string // 工序ID
    amount: number // 工序委外数量
  }[] // 委外订单的工序，工序委外需要
  source: number // 来源 1MES 2ERP， 默认1
  supplierId: string // 供应商ID
}

export type IProductionTaskPageParams = IRequestPageParams<{
  entityIds?: string[]
  drawingNumber?: string
  productModelName?: string
  productModelNo?: string
  productionOrderNo?: string
  productionTaskNo?: string
  status?: number
  statuses?: number[]
  startDate?: string
  endDate?: string
}>

export interface IProductionTaskPageItem {
  archiveMan: string // 结案人
  archiveManName: string // 结案人姓名
  areaId: string // 区域ID
  areaName: string // 区域名称
  beginTime: string // 实际开始时间
  completeAmount: number // 实际完工数量
  createBy: string // 创建人的ID，如果未提供则默认为NULL
  createTime: string // 创建时间，默认为当前时间戳，不允许为空
  decimalNumber: number // 小数位数
  drawingNumber: string // 产品图号
  endTime: string // 实际结束时间
  entityId: string[] // 生产区域的ID
  entityName: string //生产区域名称
  facilityId: string // 生产单位的ID，与版本一对一
  facilityName: string // 生产单位名称，与版本一对一
  hasChildren: boolean // 是否有子任务
  id: string
  no: string // 任务编号
  planBeginTime: string // 计划开始时间
  planEndTime: string // 计划结束时间
  processSerial: string // 工序
  productModelId: string // 报工产品的ID
  productModelName: string // 报工产品名称
  productModelNo: string // 报工产品编号
  productModelSpec?: string // 报工产品规格
  productionOrderId: string // 所属生产订单id，冗余
  productionOrderNo: string // 所属生产订单编号
  productionOrderType?: number // 订单类型
  productionOrderPlanId: string // 所属排产计划ID
  productBaseAmount: number // 产出基数
  remarks: string // 备注
  status: number // 任务状态（15未开始/11进行中/10已结案）
  taskAmount: number // 排产数量| 计划加工数量
  techNo: string // 子工艺编号
  techName: string // 子工艺名称
  techProcessId: string // 子工艺所属的工艺路线ID
  techProcessNo: string //工艺路线编号
  techVersionId: string // 子工艺版本的ID
  unitId: string // 单位的ID，来自工序里面相应产品的配置单位
  unitName: string // 单位的名称
  updateBy: string // 更新人的ID，如果未提供则默认为NULL
  updateTime: string // 更新时间，默认为当前时间戳，不允许为空
  version: string // 子工艺版本
  nodeId: string
  bizType: number // 业务类型
}
