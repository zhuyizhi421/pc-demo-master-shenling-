// 调拨单查询列表
export interface IWarehouseAllotPageListParams {
  createTimeEnd?: string
  createTimeStart?: string
  pageNum: number
  pageSize: number
  allocateCode?: string
  allocateStatus?: number
  allocateStatusList?: number[]
  inWarehouseId?: string
  outWarehouseId?: string
}
/**
 * 调拨VO
 */
export interface LogisticsAllocateRecord {
  /** 调拨单号 */
  allocateCode?: string
  /** 调拨内容 */
  allocateContent?: string
  /**
   * 状态 0未开始 1进行中 2已完成
   * @format int32
   */
  allocateStatus?: number
  /**
   * 创建时间
   * @format date-time
   */
  createTime?: string
  /** 来源 1MES 2ERP */
  dataSource?: number
  /**
   * 调拨id
   * @format int64
   */
  id?: string
  /**
   * 拨入仓库ID
   * @format int64
   */
  inWarehouseId?: number
  /** 拨入仓库名称 */
  inWarehouseName?: string
  /**
   * 拨出仓库ID
   * @format int64
   */
  outWarehouseId?: number
  /** 拨出仓库名称 */
  outWarehouseName?: string
  /**
   * 结单时间
   * @format date-time
   */
  statementTime?: string
}

//调拨明细
/**
 * TsesLogisticsAllocateDetailVO
 * 调拨明细VO
 */
export interface LogisticsAllocateDetail {
  /**
   * 调拨数量
   * @format bigdecimal
   */
  allocateQty: number | string
  /**
   * 保留小数点位数
   * @format int32
   */
  decimalNumber?: number
  /**
   * 调拨明细ID
   * @format int64
   */
  id?: string
  /**
   * 已拨入数量
   * @format bigdecimal
   */
  inQty?: number
  /**
   * 库存数量
   * @format bigdecimal
   */
  inventoryQty: number
  /**
   * 已拨出数量
   * @format bigdecimal
   */
  outQty?: number
  /** 产品编号 */
  productModelCode?: string
  /**
   * 产品模型ID
   * @format int64
   */
  productModelId: string
  /** 产品名称 */
  productModelName?: string
  /**
   * 单位ID
   * @format int64
   */
  unitId?: string
  /** 单位名称 */
  unitName?: string

  unionId?: string
}

// 出入库记录
/**
 * 拨出产品库存VO
 */
export interface LogisticsAllocateOutInventory {
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
   * 入库库位ID
   * @format int64
   */
  inLocationId?: number
  /** 入库库位名称 */
  inLocationName?: string
  /**
   * 入库操作员ID
   * @format int64
   */
  inOperatorId?: number
  /** 入库操作员姓名 */
  inOperatorName?: string
  /**
   * 入库时间
   * @format date-time
   */
  inboundTime?: string
  /**
   * 出库库位ID
   * @format int64
   */
  outLocationId?: number
  /** 出库库位名称 */
  outLocationName?: string
  /**
   * 出库操作员ID
   * @format int64
   */
  outOperatorId?: number
  /** 出库操作员姓名 */
  outOperatorName?: string
  /**
   * 出库时间
   * @format date-time
   */
  outboundTime?: string
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
   * 数量
   * @format bigdecimal
   */
  quantity?: number
  /**
   * 单位ID
   * @format int64
   */
  unitId?: number
  /** 单位名称 */
  unitName?: string
}

// 产品模型列表

export interface ProductModel {
  /** 产品编号 */
  code?: string
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
   * 默认单位ID
   * @format int64
   */
  defaultUnitId?: number
  /** 默认单位名字 */
  defaultUnitName?: string
  /**
   * ID
   * @format int64
   */
  id?: number
  /**
   * 是否是倒扣反冲物料（0否 1是）
   * @format int32
   */
  isReversal?: number
  /** 产品名称 */
  name?: string
  /** 产品类别编号 */
  productCategoryCode?: string
  /**
   * 产品类别ID
   * @format int64
   */
  productCategoryId?: number
  /** 产品类别名字 */
  productCategoryName?: string
  /** 产品模型绑定单位集 */
  productModelUnitList?: ProductModelUnit[]
  /**
   * 产品类型(1-原材料/2-外购件/3-总成品/4-半成品)
   * @format int32
   */
  productType?: number
  /** 备注 */
  remark?: string
  /**
   * 状态(1-启用,0-停用)
   * @format int32
   */
  status?: number
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

// 产品库存查询

export interface LogProductInventoryInter {
  facilityId: string
  pageNum: number
  pageSize: number
  productModelName?: string
  productModelCode?: string
}
/**
 * 按产品合并库存VO
 */
export interface LogisticsInventoryFacilityGroupRecord {
  /**
   * 保留小数点位数
   * @format int32
   */
  decimalNumber?: number
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
   * 数量
   * @format bigdecimal
   */
  quantity?: number
  /**
   * 单位ID
   * @format int64
   */
  unitId?: number
  /** 单位 */
  unitName?: string
}
