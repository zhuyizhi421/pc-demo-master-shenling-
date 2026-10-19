/** 生产订单 */
import type { IRequestDynamicPageParams, IRequestPageParams } from "@/types/common"

export interface IProductionTaskUpdateReq {
  ctTime: number // ct耗时
  directPublish: boolean // 是否直接发布
  facilityId: string // 生产单位的ID，与版本一对一
  planBeginTime: string // 计划开始时间
  planEndTime: string // 计划结束时间
  productionOrderPlanId: string // 所属排产计划ID
  productionTaskId: string // 主键id productionTaskId 更新传
  remarks: string // 备注
  taskAmount: number // 排产数量
}

export interface IProductionScheduleProcessReq {
  areaPlanId?: string // 区域计划ID
  orderId: string // 订单ID
  queryType: number // 查询方式 1-按订单查询 2-按区域计划查询
}

export interface IProductionScheduleProcessRes {
  availableAmount: number // 可排产数量
  planAmount: number // 计划排产数量
  processSerial: string // 工序
  nature: number // 加工性质 1.自制，2.委外
  prodUnits: {
    createBy: string // 创建人ID
    createTime: string // 创建时间
    ctTime: number // 标准工时-CT（基数）单位分钟
    facilityId: string // 生产单位ID
    id: string // ID
    postChangeTime: number // 后置换型时间 单位分钟
    preChangeTime: number // 前置换型时间 单位分钟
    priority: number // 优先级
    techDetailId: string // 工艺详情ID
    updateBy: string // 更新人ID
    updateTime: string // 更新时间
    workerNum: number // 所需工作人数
  }[] // 生产单位-CT耗时
  productBaseAmount: number // 产出基数
  productModel: {
    code: string // 产品编号
    createBy: string // 创建人ID
    createTime: string // 创建时间
    defaultUnitId: string // 默认单位ID
    defaultUnitName: string // 默认单位名字
    id: string // ID
    isKeyMaterial: boolean // 是否主体物料（0否 1是）
    isReversal: number // 是否是倒扣反冲物料（0否 1是）
    name: string // 产品名称
    period: number // 质保期（天）
    minStock?: number // 最低库存
    safeStock?: number // 安全库存
    productCategoryCode: string // 产品类别编号
    productCategoryId: string // 产品类别ID
    productCategoryName: string // 产品类别名字
    productType: number // 产品类型(1-原材料/2-外购件/3-总成品/4-半成品)
    remark: string // 备注
    status: number // 状态(1-启用,0-停用)
    updateBy: string // 更新人ID
    updateTime: string // 更新时间
  } // 产品模型
  productionOrderPlanId: string // 所属排产计划ID
  schedulingProductionTaskId: string // 计划任务ID
  sourceNodeIds: number[] // 来源节点
  techFlowNodeId: string // 所属工序节点
  techName: string // 工艺名称
  techNo: string // 工艺编号
  techVersionId: string // 工序对应的工艺版本Id
  type: number // 工艺类型1单工艺2工艺组3且工艺
  unPublishAmount: number // 未发布排产数量
  unitItem: {
    createBy: string // 创建人ID
    createTime: string // 创建时间
    decimalNumber: number // 保留小数点位数
    id: string // ID
    remarks: string // 备注
    unitCode: string // 单位编号
    unitName: string // 单位名称
    updateBy: string // 更新人ID
    updateTime: string // 更新时间
  }
}

export interface IRequestProcessAmountByMainProductReq {
  mainPlanAmount: number // 订单主产出物排产数量
  orderId: string // 生产订单 ID
}

export interface IRequestProcessAmountByMainProductRes {
  inferAmount: number // 推算数量
  processSerial: string // 工序
  productionOrderPlanId: string // 所属排产计划
  techFlowNodeId: string // 所属工序节点
}

export interface IRequestSaleOrderListByProductReq {
  dateRange?: {
    endDate: string
    startDate: string
  }
  pageQuery: {
    pageNum: number
    pageSize: number
  }
  queryParam: {
    id: string
  }
  sort?: [
    {
      field: string
      order: string
    }
  ]
}

export interface IProductionOrderReturnItem {
  didAmount: number // 已返工/改制数量
  orderId: string // 订单ID
  processSerial: string // 工序
  productModelCode: string // 产品模型编号
  productModelId: string // 产品模型ID
  productModelName: string // 产品模型名称
  reviewTaskId: string[] // 建议返工/改制任务ID
  suggestionAmount: number // 建议可返工/改制总数
  techName: string // 工艺名称
  totalAmount: number // 需返工/改制总数
  undoAmount: number // 剩余可返工/改制总数
  unitId: string // 单位ID
  unitName: string // 单位名称
}

export interface IProductionOrderReturnRes {
  items: IProductionOrderReturnItem[]
  type: number // 订单类型 1 量产 5返工 10试产 15改制
}

export interface ISaleOrderItem {
  attachmentFileId: string // 附件ID
  createTime: string // 创建时间
  customerCode: string // 客户编号
  customerId: string // 客户ID
  customerName: string // 客户名称
  customizedFields: {
    fieldCode: string // 字段代码
    fieldName: string // 字段名称
    fieldType: number // 字段类型
    formType: number // 表单类型
    id: string // ID
    isActive: boolean // 是否启用
    isRequired: boolean // 是否必填
  }[] // 自定义字段
  dataSource: number // 来源 1MES 2ERP
  details: {
    deciamlNumber: number // 保留小数点位数
    deliveryQty: number // 已发货数量
    id: string // ID
    planDeliveryQty: number // 已计划发货数量
    productModelCode: string // 产品编号
    productModelId: string // 产品模型ID
    productModelName: string // 产品名称
    productModelUnitList: {
      conversionBasis: number // 单位换算基数
      createBy: string // 创建人ID
      createTime: string // 创建时间
      id: string // ID
      isDefaultUnit: number // 是否是默认单位(0-否,1-是)
      productModelId: string // 产品模型ID(外键)
      unitCode: string // 单位编号(冗余)
      unitId: string // 单位ID(外键)
      unitName: string // 单位名字(冗余)
      updateBy: string // 更新人ID
      updateTime: string // 更新时间
    }[] // 产品模型单位列表
    quantity: number // 销售数量
    saleId: string // 销售任务ID
    specifiedOutboundWarehouseId: string // 指定发货出库仓库ID
    specifiedOutboundWarehouseName: string // 指定发货出库仓库名称
    unitId: string // 单位ID
    unitName: string // 单位
  }[] // 明细
  id: string // ID
  planDeliveryTime: string // 计划交货日期
  priority: number // 优先级 1=低 2=中 3=高
  remarks: string // 备注
  saleCode: string // 销售单号
  saleContent: string // 销售内容
  saleStatus: number // 状态 0未发货 1进行中 2已完成
  statementTime: string // 结单时间
}

export interface IProductionOrderItem {
  completeAmount: number // 实际完成数量
  createBy: string // 创建人ID
  createByName: string // 创建人姓名
  createTime: string // 创建时间
  deliveryDate: string // 交付日期
  fileIds: string[] // 文件ID
  files: {
    fileId: string
    fileName: string
    fileURL: string
  }[] // 文件
  hasPackProcess: boolean // 是否包含包装工序
  id: string // ID
  materials: {
    availAmount: number // 正常可领料数量
    createBy: string // 创建人ID
    createTime: string // 创建时间
    exceedAmount: number // 超领数量
    id: string // ID
    processSerial: string // 对应工序
    processSerials: string[] // 投料工序
    productionOrderId: string // 生产订单ID
    standardMaterialVo: {} // 生产要素-料返回对象
    storageAmount: number // 在库数量
    storageId: string // 发料仓库
    storageName: string // 发料仓库名称
    totalAmount: number // 投料数量
    updateBy: string // 更新人ID
    updateTime: string // 更新时间
    unitId: string // 单位ID
    unitCode: string // 单位编号
    unitName: string // 单位名称
    productModelName: string // 产品名称
    productModelCode: string // 产品编号
    productModelId: string // 产品模型ID
    baseAmount: number // 基数
    techStandardMaterialId: string
  }[] // 物料
  no: string // 订单号
  orderAmount: number // 订单数量
  orderId: string // 返工/改制 订单的原生产订单ID
  originalOrderNo: string
  planAmount: number // 排产数量
  productModel: {
    code: string // 产品编号
    createBy: string // 创建人ID
    createTime: string // 创建时间
    defaultUnitId: string // 默认单位ID
    defaultUnitName: string // 默认单位名字
    id: string // ID
    isKeyMaterial: boolean // 是否主体物料（0否 1是）
    isReversal: number // 是否是倒扣反冲物料（0否 1是）
    name: string // 产品名称
    period: number // 质保期（天）
    minStock?: number // 最低库存
    safeStock?: number // 安全库存
    productCategoryCode: string // 产品类别编号
    productCategoryId: string // 产品类别ID
    productCategoryName: string // 产品类别名字
    productType: number // 产品类型(1-原材料/2-外购件/3-总成品/4-半成品)
    remark: string // 备注
    status: number // 状态(1-启用,0-停用)
    updateBy: string // 更新人ID
    updateTime: string // 更新时间
  }
  productModelId: string // 产品模型ID
  productModelNo: string // 产品编号
  productModelSpec?: string // 产品规格
  productionMethod: number // 生产方式 1-自制 2-委外
  productionProgress: number // 生产进度
  remark: string // 备注
  saleCode: string // 销售任务编号
  saleId: string // 销售订单ID
  saleVOList: {
    attachmentFile: any
    attachmentFileId: string // 附件ID
    createBy: string // 创建人ID
    createTime: string // 创建时间
    customerCode: string // 客户编号
    customerId: string // 客户ID
    customerName: string // 客户名称
    customizedFields: {
      fieldCode: string // 字段代码
      fieldName: string // 字段名称
      fieldType: number // 字段类型
      formType: number // 表单类型
      id: string // ID
      isActive: boolean // 是否启用
      isRequired: boolean // 是否必填
    }[] // 自定义字段
    dataSource: number // 来源 1MES 2ERP
    details: any[]
    id: string // ID
    planDeliveryTime: string // 计划交货日期
    priority: number // 优先级 1=低 2=中 3=高
    remarks: string // 备注
    saleCode: string // 销售单号
    saleContent: string // 销售内容
    saleStatus: number // 状态 0未发货 1进行中 2已完成
    statementTime: string // 结单时间
  }[]
  serialInfos: {
    amountInOrder: number // 订单数量
    bizType: number
    finishAmount: number // 完工数量
    inboundAmount: number // 入库数量
    nature: number // 性质，1.自制，2.委外
    nodeId: string // 工序id
    serial: string // 工序号
    techName: string // 工艺名称
    totalAmount: number // 生产进度
    unitName: string // 单位名称
  }[] // 序列号信息
  serialVos: any // 序列号信息
  source: number // 来源 1MES 2ERP
  specifiedInboundWarehouseId: string // 指定入库仓库ID
  specifiedInboundWarehouseName: string // 指定入库仓库名称
  status: number // 状态，1已复核 5未复核 10结案
  techProcess: any // 工艺路线
  techProcessDto: any // 工艺路线基础DTO对象
  techProcessId: string // 工艺路线ID
  techProcessVersionStatus: number // 工艺路线版本状态(1.设计中 2.已发布 3.已作废)
  type: number // 类型 1 量产 5返工 10试产 15改制
  unitId: string // 单位
  unitItem: any // 单位项
  updateBy: string // 更新人ID
  updateTime: string // 更新时间
}

export interface ISyncOrderProcessToCraftRouteReq {
  processId: string // 工单工艺id
  no?: string // 工艺路线编号
  remarks?: string // 备注
}

export interface IProductionOrderReAddReq {
  deliveryDate: string // 交货日期
  productionOrderId: string // 生产订单id
  quantity: number // 追加数量
  remark: string // 备注
  // 兼容后端不同版本字段
  orderId?: string
  id?: string
  addAmount?: number
  remarks?: string
}

export interface IReAddRecordPageListReq {
  endDate: string // 创建结束时间
  orderNo: string // 订单号
  productModelCode: string // 产品模型编码
  source: number // 来源 1MES 2ERP
  startDate: string // 创建开始时间
  status: number // 状态，0未复核 1已复核
}

export interface IReAddRecordListItem {
  addAmount: number // 追加数量
  createTime: string // 创建时间
  deliveryDate: string // 交货日期
  orderAmount: number // 订单数量
  orderId: string // 生产订单id
  orderNo: string // 订单号
  productModelCode: string // 产品模型编码
  productModelId: string // 产品模型id
  productModelName: string // 产品模型名称
  recordId: string // 追加记录id
  remark: string // 备注
  source: number // 来源 1MES 2ERP
  status: number // 状态，0未复核 1已复核
  unitId: string // 单位
  unitName: string // 单位名称
}

export type IProductionOrderPageParams = IRequestPageParams<{
  no?: string
  type?: number // 1 量产 5返工 10试产 15改制
  types?: number[]
  source?: number //1MES 2ERP
  status?: number // 1已复核 5未复核 10结案
  statusList?: number[]
  productModelNo?: string
  productionMethod?: number // 1自制 2委外
  productModelName?: string
  containRewordOrReform?: boolean // type/types的用途，是否查结果产品包含返工或改制的订单
  saleCode?: string // 销售订单
}>

export interface IProductionOrderPageItem {
  archiveTime: string // 结案时间
  cachedProcessId: string // 试产后修改的工艺路线ID,缓存作用
  completeAmount: number // 实际完成数量
  createBy: string // 创建人ID
  createByName: string // 创建人姓名
  createTime: string // 创建时间
  deliveryDate: string // 交付日期
  fileIds: string[] // 文件ID
  files: {
    fileId: string
    fileName: string
    fileURL: string
  }[] // 文件
  id: string // ID
  materials: any[]
  no: string // 订单号
  orderAmount: number // 订单数量
  orderId: string // 返工/改制 订单的原生产订单ID
  originalOrderNo: string // 返工/改制 订单的原生产订单NO
  planAmount: number // 排产数量
  productModel: {
    code: string // 产品编号
    createBy: string // 创建人ID
    createTime: string // 创建时间
    defaultUnitId: string // 默认单位ID
    defaultUnitName: string // 默认单位名字
    drawingNumber: string // 产品图号
    id: string // ID
    isKeyMaterial: boolean // 是否主体物料（0否 1是）
    isReversal: number // 是否是倒扣反冲物料（0否 1是）
    name: string // 产品名称
    period: number // 质保期（天）
    minStock?: number // 最低库存
    safeStock?: number // 安全库存
    productCategoryCode: string // 产品类别编号
    productCategoryId: string // 产品类别ID
    productCategoryName: string // 产品类别名字
    productModelUnitList: any[]
    productType: number // 产品类型(1-原材料/2-外购件/3-总成品/4-半成品)
    remark: string // 备注
    specification: string // 产品规格
    status: number // 状态(1-启用,0-停用)
    updateBy: string // 更新人ID
    updateTime: string // 更新时间
  }

  productModelId: string // 产品模型ID
  productModelNo: string // 产品编号
  productionMethod: number // 生产方式 1-自制 2-委外
  productionProgress: number // 生产进度
  remark: string // 备注
  saleCode: string // 销售任务编号
  saleId: string // 销售订单ID
  saleVOList: any[] // 销售订单列表
  serialInfos: any[] // 序列号信息
  source: number // 来源 1MES 2ERP
  specifiedInboundWarehouseId: string // 指定入库仓库ID
  specifiedInboundWarehouseName: string // 指定入库仓库名称
  status: number // 状态，1已复核 5未复核 10结案
  tag: string // 标签
  taskId: string // 工艺路线ID
  techProcess: any // 工艺路线
  techProcessDto: any // 工艺路线基础DTO对象
  techProcessId: string // 工艺路线ID
  techProcessVersionStatus: number // 工艺路线版本状态(1.设计中 2.已发布 3.已作废)
  type: number // 类型 1 量产 5返工 10试产 15改制
  unitId: string // 单位
  unitItem: {
    createBy: string // 创建人ID
    createTime: string // 创建时间
    decimalNumber: number // 保留小数点位数
    id: string // ID
    remark: string // 备注
    unitCode: string // 单位编号
    unitName: string // 单位名称
    updateBy: string // 更新人ID
    updateTime: string // 更新时间
  } // 单位项
  updateBy: string // 更新人ID
  updateTime: string // 更新时间
}

export type IDynamicProductionOrderPageParams = IRequestDynamicPageParams<Record<string, any>>

export interface IDynamicProductionOrderPageItem {
  bizType: number // 末道工序业务属性
  completeAmount: number // 实际完成数量
  createTime: string // 创建时间
  decimalNumber: number // 单位精度
  deliveryDate: string // 发货日期
  id: string // 订单ID
  no: string // 订单号
  orderAmount: number // 订单数量
  productModelCode: string // 产品编号
  productModelName: string // 产品名称
  productModelSpec?: string // 产品规格
  productionProgress: number // 生产进度
  remark: string // 备注
  saleCode: string // 销售订单号
  scheduledQuantity: number // 排产数量
  source: number // 来源 1MES 2ERP
  status: number // 状态，1已复核 5未复核 10结案
  taskId: string // 对应的任务ID
  techProcessId: string // 工艺路线ID
  type: number // 类型 1 量产 5返工 10试产 15改制
  unitId: string // 单位ID
  unitName: string // 单位名称
  workshopName?: string // 车间名称
}

export type IProductionReportPageParams = IRequestPageParams<{
  entityIds?: string[]
  productModelName?: string
  productModelCode?: string
  productionOrderNo?: string
  productionTaskNo?: string
  reportName?: string
  packTaskNo?: string
  deliveryPlanNo?: string
  barcode?: string
  bizType?: number
  bizTypeName?: string
}>

export interface IProductionReportPageItem {
  defectiveQty: number
  executionBatch: number
  facilityName: string
  processSerial: string
  productIds: string[]
  productModelCode: string
  productModelId: string
  productModelName: string
  productionExecutionId: string
  productionExecutionNo: string
  productionOrderId: string
  productionOrderNo: string
  productionTaskId: string
  productionTaskNo: string
  qualifiedQty: number
  reportQty: number
  reportTime: string
  rotationName: string
  sourceNo: string
  techName: string
  unitId: string
  unitName: string
  decimalNumber?: number
  workStationName: string
  sourceType: number
  reportType?: number
  bizType?: number
  id?: string
  index?: number
  methodRecordId?: string
  level?: number
  children?: IProductionReportPageItem[]
  // 审核相关字段
  reviewedQty?: number | null
  reviewer?: string
  reviewTime?: string
  remark?: string
}

export interface IProductionOrderMaterialItem {
  baseAmount: number // 来源标准-料的基数
  decimalNumber: number // 保留小数点位数
  flowNodeIds: string[] // 投料工序
  processSerials: string[] // 投料工序
  productModelCode: string // 产品编号
  productModelId: string // 产品模型id
  productModelName: string // 产品名称
  totalAmount: number // 投料数量
  unitCode: string // 单位编号
  unitId: string // 单位ID
  unitName: string // 单位名称
}
