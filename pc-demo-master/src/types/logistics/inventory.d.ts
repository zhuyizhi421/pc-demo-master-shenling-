// 产品库存查询
export interface LogInventorySearchInter {
  facilityId?: string // 必须字段：仓库id
  pageNum: number // 必须字段：每页显示条数
  pageSize: number // 必须字段：当前页页码
  productModelCode?: string // 非必须字段：产品编号
  productModelName?: string
}

export interface LogInventorySearchReturn {
  facilityId?: number // 非必须字段：仓库id
  productModelCode?: string // 非必须字段：产品编号
  productModelId?: number // 非必须字段：产品模型ID，格式为 int64
  productModelName?: string // 非必须字段：产品名称
  quantity?: number // 非必须字段：数量，格式为 bigdecimal
  unitId?: number // 非必须字段：单位ID，格式为 int64
  unitName?: string
}

// 库位明细查询
export interface LogProductPositionSearchDetailInter {
  locationId: string // 必须字段：库位id
  pageNum: number // 必须字段：每页显示条数
  pageSize: number // 必须字段：当前页页码
  productModelCode?: string // 非必须字段：产品编号
  productModelName?: string
}
/**
 * 库存VO
 */
export interface PositionDetailRecord {
  /** 标签码 */
  barCode?: string
  /**
   * 标签码id
   * @format int64
   */
  barCodeId?: number
  /**
   * 批次ID
   * @format int64
   */
  batchId?: number
  /** 批次号 */
  batchNo?: string
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
   * ID
   * @format int64
   */
  id?: number
  /**
   * 入库时间
   * @format date-time
   */
  inboundTime?: string
  /**
   * 实例ID
   * @format int64
   */
  instanceId?: number
  /**
   * 库位id
   * @format int64
   */
  locationId?: number
  /** 库位名称 */
  locationName?: string
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
   * 生产日期
   * @format date-time
   */
  productionTime?: string
  /**
   * 数量
   * @format bigdecimal
   */
  quantity?: number
  /**
   * 供应商ID
   * @format int64
   */
  supplierId?: number
  /** 供应商名称 */
  supplierName?: string
  /**
   * 单位ID
   * @format int64
   */
  unitId?: number
  /** 单位 */
  unitName?: string
}

// 获取仓库和库位树
/**
 * 所有仓库VO
 */
export interface FmStorageFacilityTree {
  /** 生产单位编号 */
  facilityCode?: string
  /** 生产单位名称 */
  facilityName?: string
  /**
   * ID
   * @format int64
   */
  id?: number
  /** 库位详情 */
  locations?: any[]
}

// 存放库位查询
export interface LogProductPositionSearchInter {
  facilityId: number // 必须字段：仓库id
  pageNum: number // 必须字段：每页显示条数
  pageSize: number // 必须字段：当前页页码
  productModelId: number // 必须字段：产品模型id
}

export interface LogProductPositionSearchReturn {
  locationCode?: string // 非必须字段：库位编号
  locationId?: number // 非必须字段：库位id，格式为 int64
  locationName?: string // 非必须字段：库位名称
  quantity?: number // 非必须字段：数量，格式为 bigdecimal
  unitId?: number // 非必须字段：单位ID，格式为 int64
  unitName?: string
}

export interface ProductModelUnitList {
  conversionBasis: number
  createBy: number
  createTime: string
  id: number
  isDefaultUnit: number
  productModelId: string
  unitCode: string
  unitId: number
  unitName: string
  updateBy: number
  updateTime: string
}

export interface IInventoryListItem {
  arrivalQuantity: number
  decimalNumber: number
  id: string
  inboundQuantity: number
  productCategoryId: string
  productCategoryName: string
  productModelCode: string
  productModelId: string
  productModelName: string
  productModelUnitList: ProductModelUnitList[]
  purchaseId: string
  quantity: number
  specifiedInboundWarehouseId: string
  specifiedInboundWarehouseName: string
  unitId: string
  unitName: string
}
