export interface IProductBatchPageListParams {
  pageNum: number
  pageSize: number
  batchNo?: string
  batchType?: string
  productModelCode?: string
  productModelName?: string
  processSerial?: string
  createTimeEnd?: string
  createTimeStart?: string
  productionOrderNo?: string
}
/**
 * 批次VO
 */
export interface IProductBatchDetail {
  /** 批次号 */
  batchNo?: string
  /**
   * 批次总数
   * @format bigdecimal
   */
  batchQuantity?: number
  /**
   * 批次类型 1采购批次 2生产批次 3退货批次 4盘点批次 5合并批次 6其他批次
   * @format int32
   */
  batchType?: number
  /**
   * 创建时间
   * @format date-time
   */
  createTime?: string
  /**
   * 保留小数点位数
   * @format int32
   */
  decimalNumber?: number
  /**
   * 批次ID
   * @format int64
   */
  id?: number
  /** 盘点信息 */
  inventoryCheckInfo?: InventoryCheckInfo
  /** 产品编号 */
  productModelCode?: string
  /**
   * 产品模型ID
   * @format int64
   */
  productModelId?: number
  /** 产品名称 */
  productModelName?: string
  /** 生产信息 */
  productionInfo?: BacthProductionInfo
  /** 采购信息 */
  purchaseInfo?: BatchPurchaseInfo
  /** 退货信息 */
  returnInfo?: BatchReturnInfo
  /**
   * 单位ID
   * @format int64
   */
  unitId?: number
  /** 单位名称 */
  unitName?: string
}
/**
 * 批次盘点信息VO
 */
export interface InventoryCheckInfo {
  /** 盘点单号 */
  inventoryCheckCode?: string
  /**
   * 盘点时间
   * @format date-time
   */
  inventoryCheckTime?: string
}
/**
 * 批次生产信息VO
 */
export interface BacthProductionInfo {
  /** 调度任务编号 */
  executionCode?: string
  /** 生产订单编号 */
  productionOrderNo?: string
  /**
   * 报工时间
   * @format date-time
   */
  reportTime?: string
  /** 工序编号 */
  techVersionNo?: string
}

/**
 * 批次采购信息VO
 */
export interface BatchPurchaseInfo {
  /**
   * 收货时间
   * @format date-time
   */
  arrivalTime?: string
  /** 采购任务编号 */
  purchaseCode?: string
  /**
   * 采购类型 1普通采购 3订单委外 4工序委外
   * @format int32
   */
  purchaseType?: number
  /** 供应商名称 */
  supplierName?: string
}
/**
 * 批次退货信息VO
 */
export interface BatchReturnInfo {
  /** 客户简称 */
  customerAbbr?: string
  /** 客户编号 */
  customerCode?: string
  /** 客户全称 */
  customerName?: string
  /**
   * 退货时间
   * @format date-time
   */
  returnTime?: string
  /** 销售任务编号 */
  saleCode?: string
}
/**
 * 批次分页Record
 */
export interface IProductBatchPageListItem {
  /** 批次号 */
  batchNo?: string
  /**
   * 批次总数
   * @format bigdecimal
   */
  batchQuantity?: number
  /**
   * 批次类型 1采购批次 2生产批次 3退货批次 4盘点批次 5合并批次 6其他批次
   * @format int32
   */
  batchType?: number
  /**
   * 创建时间
   * @format date-time
   */
  createTime?: string
  /**
   * 保留小数点位数
   * @format int32
   */
  decimalNumber?: number
  /**
   * 批次ID
   * @format int64
   */
  id?: number
  /** 产品编号 */
  productModelCode?: string
  /**
   * 产品模型ID
   * @format int64
   */
  productModelId?: number
  /** 产品名称 */
  productModelName?: string
  /**
   * 单位ID
   * @format int64
   */
  unitId?: number
  /** 单位名称 */
  unitName?: string
}
