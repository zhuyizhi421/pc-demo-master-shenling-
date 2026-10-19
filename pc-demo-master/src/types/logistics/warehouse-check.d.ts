export interface IWarehouseCheckPageListParams {
  checkCode?: string // 盘点编号
  checkStatus?: number // 状态 0未发布 1已发布 2已结案
  checkStatusList?: number[] // 状态列表
  facilityId?: string // 仓库ID
  productModelName?: string // 盘点产品名称
  pageNum: number // 页码
  pageSize: number // 页大小
}

export interface IWarehouseCheckPageListItem {
  checkCode: string // 盘点编号
  checkContent: string // 盘点内容
  checkStatus: number // 状态 0未发布 1已发布 2已结案
  createTime: string // 创建时间
  facilityCode: string // 仓库编号
  facilityId: string // 仓库ID
  facilityName: string // 仓库名称
  id: string // 盘点单ID
  statementEmpId: string // 结案人ID
  statementEmpName: string // 结案人姓名
  statementTime: string // 结案时间
}

export interface IWarehouseCheckCreateParams {
  facilityId: string // 仓库ID
  detail: {
    id: string // 明细ID(创建时不用传)
    productModelId: string // 产品模型ID
    unitId: string // 单位ID
  }[]
}

export interface IWarehouseCheckUpdateParams {
  id: string // 盘点单ID
  detail: {
    id: string // 明细ID(创建时不用传)
    productModelId: string // 产品模型ID
  }[]
}

export interface IWarehouseCheckDetail {
  changeQuantity: number // 变更总数
  checkQuantity: number // 实盘总数
  decimalNumber: number // 保留小数点位数
  id: string // 盘点明细ID
  inventoryCheckId: string // 盘点任务ID
  inventoryQuantity: number // 库存数量
  originalQuantity: number // 原数量
  productModelCode: string // 产品编号
  productModelId: string // 产品模型ID
  productModelName: string // 产品名称
  unitId: string // 单位ID
  unitName: string // 单位名称
}

export interface IWarehouseCheckRecordItem {
  barcode: string
  barcodeId: string
  changeQuantity: number
  checkLocationId: string
  checkLocationName: string
  checkQuantity: number
  id: string
  originalLocationId: string
  originalLocationName: string
  originalQuantity: number
  productModelCode: string
  productModelId: string
  productModelName: string
  unitId: string
  unitName: string
  decimalNumber?: number
}

export interface IWarehouseCheckProductListParams {
  facilityId: string // 仓库id
  pageNum: number
  pageSize: number
  hasInventory?: boolean // 是否有库存
  productCategoryName?: string // 产品类别名称
  productModelCode?: string // 产品编号
  productModelName?: string // 产品名称
}

export interface IWarehouseCheckProductListItem {
  id: string
  decimalNumber: number // 保留小数点位数
  inventoryQuantity: number // 库存总数
  productCategoryCode: string // 产品类别编号
  productCategoryId: string // 产品类别ID
  productCategoryName: string // 产品类别名称
  productModelCode: string // 产品编号
  productModelId: string // 产品模型ID
  productModelName: string // 产品名称
  productType: number // 产品类型(1-原材料/2-外购件/3-总成品/4-半成品)
  remark: string // 备注
  unitId: string // 单位ID
  unitName: string // 单位名称
  saleDetailId: string // 销售明细ID
  deliveryQty?: number
  quantity?: number
}

export interface IWarehouseCheckProductModelListByIdsParams {
  facilityId: string // 仓库id
  idList: string[] // id列表
}
