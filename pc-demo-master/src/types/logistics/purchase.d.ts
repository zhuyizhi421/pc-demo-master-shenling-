import type { IRequestDynamicPageParams } from "@/types/common"

/**
 * 新增/编辑采购
 */
export interface IPurchaseOrderCreateParams {
  /**
   * 附件id
   * @format int64
   */
  attachmentFileId?: string
  /** 采购产品清单 */
  details?: PurchaseTaskDetail[]
  /**
   * 预计收货时间
   * @format date-time
   */
  eta?: string
  /**
   * 生产订单ID
   * @format int64
   */
  productionOrderId?: number
  /** 采购单号 */
  purchaseCode?: string
  /**
   * 采购类型 1普通采购 3订单委外 4工序委外
   * @format int32
   */
  purchaseType?: number
  /** 备注 */
  remarks?: string
  /**
   * 供应商ID
   * @format int64
   */
  supplierId?: number
  /**
   * 工艺节点id
   * @format int64
   */
  techFlowNodeId?: number
}
/**
 * 编辑采购明细VO
 */
export interface PurchaseTaskDetail {
  /**
   * ID
   * @format int64
   */
  id?: string
  /**
   * 是否主产出 1是 0不是
   * @format int32
   */
  mainProduct?: number
  /**
   * 产品模型ID
   * @format int64
   */
  productModelId?: string
  /**
   * 数量
   * @format bigdecimal
   */
  quantity?: number
  /**
   * 指定入库仓库ID
   * @format int64
   */
  specifiedInboundWarehouseId?: string
  /**
   * 单位ID
   * @format int64
   */
  unitId?: string
}

// 采购订单 详情
export interface IPurchaseOrderDetail {
  /**
   * 附件id
   * @format int64
   */
  attachmentFileId?: string
  attachmentFileResource?: {
    sourceName: string
    id: string
  }
  /**
   * 创建时间
   * @format date-time
   */
  createTime?: string
  /**
   * 来源 1MES 2ERP
   * @format int32
   */
  dataSource?: number
  /**
   * 预计收货时间
   * @format date-time
   */
  eta?: string
  /** 工序 */
  processSerial?: string
  /**
   * 生产订单ID
   * @format int64
   */
  productionOrderId?: number
  /** 生产订单编号 */
  productionOrderNo?: string
  /** 采购编号 */
  purchaseCode?: string
  /**
   * 状态 0未收货 1进行中 2已完成
   * @format int32
   */
  purchaseStatus?: number
  /**
   * 采购类型 1普通采购 3订单委外 4工序委外
   * @format int32
   */
  purchaseType?: number
  /** 备注 */
  remarks?: string
  /**
   * 结单时间
   * @format date-time
   */
  statementTime?: string
  /** 供应商编号 */
  supplierCode?: string
  /**
   * 供应商ID
   * @format int64
   */
  supplierId?: number
  /** 供应商名称 */
  supplierName?: string
  /**
   * 工艺节点id
   * @format int64
   */
  techFlowNodeId?: number
}
//采购订单查询 params
export interface IPurchaseOrderPageListParams {
  createTimeEnd?: string
  createTimeStart?: string
  pageNum: number
  pageSize: number
  purchaseCode?: string
  purchaseStatus?: number
  purchaseStatusList?: number[]
  purchaseType?: number
  supplierId?: string
  productModelName?: string
  productModelCode?: string
  arrivalTimeEnd?: string
  arrivalTimeStart?: string
}

//采购订单查询 record
export interface IPurchaseOrderPageListItem {
  checkTime: string // 复核时间
  createTime: string // 创建时间
  dataSource: number // 来源 1MES 2ERP
  eta: string // 预计到货时间
  id: string
  purchaseCode: string // 采购编号
  purchaseContent: string // 采购内容
  purchaseStatus: number // 状态 -1未复核 0未到货 1进行中 2已完成
  purchaseType: number // 采购类型 1普通采购 3订单委外 4工序委外
  remarks: string // 备注
  statementTime: string // 结单时间
  supplierCode: string // 供应商编号
  supplierId: string // 供应商ID
  supplierName: string // 供应商名称
}

export interface IDynamicPurchaseOrderPageListParams
  extends IRequestDynamicPageParams<Record<string, any>> {}

/**
 * 采购任务明细VO
 */
export interface LogisticsPurchaseTaskDetail {
  /**
   * 收货数量
   * @format bigdecimal
   */
  arrivalQuantity?: number
  /**
   * 保留小数点位数
   * @format int32
   */
  decimalNumber?: number
  /**
   * 明细ID
   * @format int64
   */
  id?: string
  /**
   * 入库数量
   * @format bigdecimal
   */
  inboundQuantity?: number
  /**
   * 产品类别ID
   * @format int64
   */
  productCategoryId?: string
  /** 产品类别名称 */
  productCategoryName?: string
  /** 产品编号 */
  productModelCode?: string
  /**
   * 产品模型ID
   * @format int64
   */
  productModelId?: string
  /** 产品名称 */
  productModelName?: string
  /** 产品模型绑定单位集 */
  productModelUnitList?: ProductModelUnit[]
  /**
   * 采购任务ID
   * @format int64
   */
  purchaseId?: number
  /**
   * 采购数量
   * @format bigdecimal
   */
  quantity?: number
  /**
   * 指定入库仓库ID
   * @format int64
   */
  specifiedInboundWarehouseId?: number
  /** 指定入库仓库名称 */
  specifiedInboundWarehouseName?: string
  /**
   * 单位ID
   * @format int64
   */
  unitId?: string
  /** 单位名称 */
  unitName?: string

  eta: string // 预计到货日期
}
export interface ProductModelUnit {
  /**
   * 单位换算基数
   * @format bigdecimal
   */
  conversionBasis?: number
  /**
   * 创建人ID
   * @format int64
   */
  createBy?: number
  /**
   * 创建时间
   * @format date-time
   */
  createTime?: string
  /**
   * ID
   * @format int64
   */
  id?: number
  /**
   * 是否是默认单位(0-否,1-是)
   * @format int32
   */
  isDefaultUnit?: number
  /**
   * 产品模型ID(外键)
   * @format int64
   */
  productModelId?: number
  /** 单位编号(冗余) */
  unitCode?: string
  /**
   * 单位ID(外键)
   * @format int64
   */
  unitId?: number
  /** 单位名字(冗余) */
  unitName?: string
  /**
   * 更新人ID
   * @format int64
   */
  updateBy?: number
  /**
   * 更新时间
   * @format date-time
   */
  updateTime?: string
}

/**
 * TsesLogisticsPurchaseArrivalRecordVO
 * 收货记录VO
 */
export interface LogisticsPurchaseArrivalRecord {
  /** 采购收货单id */
  receiptId: string

  /** 收货编号 */
  arrivalCode: string
  /**
   * 收货数量
   * @format bigdecimal
   */
  arrivalQuantity: number
  /**
   * 收货时间
   * @format date-time
   */
  arrivalTime: string
  /**
   * 保留小数点位数
   * @format int32
   */
  decimalNumber: number
  /**
   * 入库数量
   * @format bigdecimal
   */
  inboundQuantity: number
  /**
   * 检验任务结果(0-结果未出 1-通过 2-不通过)
   * @format int32
   */
  inspTaskResult: number
  /** 检验单号 */
  inspectionCode: string
  /**
   * 检验单id
   * @format int64
   */
  inspectionId: string
  /**
   * 验收数量
   * @format bigdecimal
   */
  inspectionRcvQty: number
  /** 检验结果（待检验/合格/不合格） */
  inspectionResult: string
  /**
   * 验退数量
   * @format bigdecimal
   */
  inspectionReturnQty: number
  /**
   * 产品模型id
   * @format int64
   */
  productModelId: string
  /** 产品名称 */
  productModelName: string
  /** 产品编号 */
  productModelCode: string
  /**
   * 退货数量
   * @format bigdecimal
   */
  returnQuantity: number
  /**
   * 退补数量
   * @format bigdecimal
   */
  returnSupplyQuantity: number
  /**
   * 单位ID
   * @format int64
   */
  unitId: string
  /** 单位 */
  unitName: string
}

/**
 * TsesLogisticsPurchaseInboundRecordVO
 * 入库记录VO
 */
export interface LogisticsPurchaseInboundRecord {
  decimalNumber: number // 保留小数点位数
  detailVOList: {
    decimalNumber: number // 保留小数点位数
    facilityCode: string // 仓库编号
    facilityId: string // 仓库id
    facilityName: string // 仓库名称
    inboundCode: string // 入库编号
    inboundId: string // 入库任务ID
    inboundTime: string // 入库时间
    productModelCode: string // 产品编号
    productModelId: string // 产品模型id
    productModelName: string // 产品名称
    quantity: number // 入库数量
    unitId: string // 单位ID
    unitName: string // 单位
  }[]
  facitityCode: string // 仓库编号
  facitityId: string // 仓库id
  facitityName: string // 仓库名称
  inboundCode: string // 入库编号
  inboundId: string // 入库任务ID
  inboundTime: string // 入库时间
  productModelCode: string // 产品编号
  productModelId: string // 产品模型id
  productModelName: string // 产品名称
  quantity: number // 入库数量
  unitId: string // 单位ID
  unitName: string // 单位
}

/**
 * TsesLogisticsPurchaseReturnOutboundRecordVO
 * 退货出库记录VO
 */
export interface LogisticsPurchaseReturnOutboundRecord {
  /** 标签码 */
  barcode?: string
  /**
   * 标签码id
   * @format int64
   */
  barcodeId?: number
  /**
   * 保留小数点位数
   * @format int32
   */
  decimalNumber?: number
  /**
   * 仓库id
   * @format int64
   */
  facilityId?: number
  /** 仓库名称 */
  facilityName?: string
  /**
   * 库位id
   * @format int64
   */
  locationId?: number
  /** 库位名称 */
  locationName?: string
  /**
   * 出库明细ID
   * @format int64
   */
  outboundDetailId?: number
  /**
   * 出库任务ID
   * @format int64
   */
  outboundId?: number
  /**
   * 出库时间
   * @format date-time
   */
  outboundTime?: string
  /**
   * 产品实例id
   * @format int64
   */
  productId?: number
  /**
   * 产品模型id
   * @format int64
   */
  productModelId?: number
  /** 产品名称 */
  productModelName?: string
  productModelCode: string // 产品编号
  /**
   * 出库数量
   * @format bigdecimal
   */
  quantity?: number
  /**
   * 单位ID
   * @format int64
   */

  returnTaskCode: string // 退货出库单号
  unitId?: number
  /** 单位名称 */
  unitName?: string
}
/**
 * TsesLogisticsPurchaseReturnInspectRecordVO
 * 退货检验记录VO
 */
export interface LogisticsPurchaseReturnInspectRecord {
  /** 产品名称 */
  productName?: string
  /**
   * 数量
   * @format bigdecimal
   */
  quantity?: number
  decimalNumber?: number
  /** 结果 */
  result?: string
  /**
   * 样本数
   * @format bigdecimal
   */
  sampleNumber?: number
  /**
   * 状态
   * @format int32
   */
  status?: number
  /** 任务单号 */
  taskNo?: string
  /**
   * 检验类型
   * @format int32
   */
  type?: number
  /** 单位 */
  unitName?: string
  returnAmount: number // 评审退货数量
  replenishAmount: number // 评审退补数量
}

// 采购收货

/** CustomizeFieldValueVO */
export interface CustomizeFieldValueVO {
  /** 属性定义 */
  fieldDef?: CustomizedFieldDTO
  /** 属性值 */
  value?: string
}
/** CustomizedFieldDTO */
export interface CustomizedFieldDTO {
  /** 字段代码 */
  fieldCode?: string
  /** 字段名称 */
  fieldName?: string
  /**
   * 字段类型
   * @format int32
   */
  fieldType?: number
  /**
   * 表单类型
   * @format int32
   */
  formType?: number
  /** id */
  id?: string
  /**
   * 是否启用
   * @example false
   */
  isActive?: boolean
  /**
   * 是否必填
   * @example false
   */
  isRequired?: boolean
}

export interface IInventoryReturnPageListItem {
  createTime: string // 创建时间
  dataSource: 1 | 2 // 来源 1-MES 2-ERP
  detailContent: string // 退货内容
  id: string // 采购退货单ID
  statementTime: string // 结案时间
  supplierCode: string // 供应商编号
  supplierId: string // 供应商ID
  supplierName: string // 供应商名称
  taskCode: string // 采购退货单号
  taskStatus: number // 任务状态 0-未开始 1-进行中 2-已结案
}

export interface IInventoryReturnPageListParams {
  createTimeStart?: string // 创建时间开始
  createTimeEnd?: string // 创建时间结束
  dataSource?: number // 来源 1-MES 2-ERP
  pageNum: number
  pageSize: number
  supplierId?: string // 供应商ID
  taskCode?: string // 采购退货单号
  taskStatus?: number // 任务状态 0-未开始 1-进行中 2-已结案
  taskStatusList?: number[] // 任务状态列表
}

export interface ICreateData {
  details: {
    productModelId: string
    relatedPurchaseTaskCode?: string
    relatedPurchaseTaskId?: string
    returnQuantity?: number
    specifiedInboundWarehouseId?: string
    unitId: string
  }[]
  planReturnTime: string
  supplierId: string
  taskCode: string
}

export interface IPurchaseReturnListItem {
  createBy: number
  createTime: string
  id: string
  outboundQuantity: number
  productModelCode: string
  productModelId: string
  productModelName: string
  quantity: number
  relatedOrderType: number
  relatedPurchaseTaskCode: string
  relatedPurchaseTaskId: string
  relatedPurchaseTaskInboundQuantity: number
  returnTaskId: string
  specifiedInboundWarehouseId: string
  unitId: string
  unitName: string
  updateBy: number
  updateTime: string
  productCategoryName: string
  purchaseInboundQuantity: number
  decimalNumber?: number
}
// 采购退货单列表参数
export interface IPurchaseReturnTaskPageItem {
  createTime: string
  dataSource: 1 | 2
  detailContent: string
  id: number | string
  statementTime: string
  supplierCode: string
  supplierName: string
  taskCode: string
  taskStatus: 0 | 1 | 2
}
// 采购退货单详情参数
export interface IPurchaseReturnTaskDetail {
  createBy: number
  createTime: string
  dataSource: 1 | 2
  id: string
  planReturnTime: string
  statementTime: string
  supplierCode: string
  supplierId: string
  supplierName: string
  taskCode: string
  taskStatus: 0 | 1 | 2
  updateBy: number
  updateTime: string
}

export interface IOutRecordInfo {
  barcode: string // 标签码
  decimalNumber: number // 保留小数点位数
  locationName: string // 库位名称
  outboundCode: string // 出库单号
  outboundTime: string // 出库时间
  productModelName: string // 产品名称
  quantity: number // 数量
  unitName: string // 单位
  warehouseName: string // 仓库名称
}

export interface LogisticsPurchaseArrivalInstanceVO {
  barcode: string // 标签码
  productId: string // 产品实例id
  productModelCode: string // 产品模型编号
  productModelId: string // 产品模型id
  productModelName: string // 产品模型名称
  quantity: number // 数量
  unit: string // 单位
  unitId: string // 单位id
}
