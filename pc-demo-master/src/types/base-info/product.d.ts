export interface IProductInspectionLabListRes {
  barcode: string // 标签码
  barcodeId: string // 条码id
  createBy: string // 创建人ID
  createTime: string // 创建时间
  facilityCode: string // 生产单位编号
  facilityName: string // 生产单位名称
  facilityType: number // 生产单位性质 11加工单位 12存储单位 13检验单位
  id: string // ID
  isEnable: boolean // 是否启用
  status: number // 状态
  updateBy: string // 更新人ID
  updateTime: string // 更新时间
}

export interface IProductCateParams {
  code?: string
  name?: string
  pageNum: number
  pageSize: number
  parentId: string
}

export interface IProductCateItem {
  code: string
  createBy: number
  createTime: string
  id: number
  name: string
  parentCode: string
  parentId: number
  parentName: string
  remark: string
  status: number
  updateBy: number
  updateTime: string
}

export interface IProductModelParams {
  code?: string
  name?: string
  pageNum: number
  pageSize: number
  productCategoryId?: string
  productType?: number // 产品类型
  productTypes?: number[]
  status?: number // 状态(1-启用,2-停用)
  filterProductModelIds?: string[]
}

export interface IProductModelItem {
  code: string
  createBy: number
  createTime: string
  id: string
  name: string
  defaultUnitId: string
  defaultUnitName: string
  productCategoryCode: string
  productCategoryId: string
  productCategoryName: string
  productModelUnitList: ProductModelUnit[]
  productType: number
  remark: string
  status: number
  updateBy: number
  updateTime: string
  isKeyMaterial: boolean
  isReversal: number
  period?: number
  minStock?: number // 最低库存
  safeStock?: number // 安全库存
  drawingNumber?: string // 产品图号
  specification?: string // 产品规格
  customizedFields?: any[] // 自定义字段
}

export interface IProductTypeItem {
  id: string // 记录的ID（1-原材料，2-半成品 ，3-总成品，4-外购件，5-系统过程产物）
  productType: string // 产品类型名称
  isConfig: number // 是否配置该类型
  createBy: string
  createTime: string
  updateBy: string
  updateTime: string
}

export interface IProductInspectListParams {
  productModelId: string
  inspectType?: number
  searchKey?: string
}

export interface IProductInspectListItem {
  createBy: string
  createTime: string
  id: string
  status?: number
  imageIds: string[]
  imageUrls: string[]
  gradientModelId?: string
  inspectControl: number
  inspectItemCode: string
  inspectItemId: string
  inspectItemName: string
  inspectRate: number
  inspectSiteList: number[]
  inspectType: number
  laboratoryIdList: string[]
  methodDesc: string
  productModelId: string
  qaInspectType: string
  qaInspectTypeName: string
  samplingMethod?: number
  samplingRatio?: number
  spcControl: boolean
  spcLowerSpec: number
  spcUpperSpec: number
  standardDesc: string
  standardMax: number
  standardMaxInclusive: number
  standardMin: number
  standardMinInclusive: number
  standardType: number
  quantitativeMode?: "lower" | "upper" | "range"
  standardValue?: number | string
  upperTolerance?: number | string | null
  lowerTolerance?: number | string | null
  upperToleranceSign?: "+" | "-"
  lowerToleranceSign?: "+" | "-"
  unitId: string
  unitName: string
  updateBy: string
  updateTime: string
  isSampleReturn?: boolean // 样品是否还回
}

export interface InspectItemDetailParams {
  id?: string
  status?: number
  productModelId: string
  inspectItemCode: string // 产品检验项编号
  inspectItemId?: string // 产品检验项ID 引用时不能为空
  inspectItemName?: string // 产品检验项名称 新增时不能为空
  laboratoryIdList: string[] // 检验场所
  inspectType: number // 产品检验类型
  inspectionStandard: {
    standardDesc: string
    standardMax: number
    standardMaxInclusive: number
    standardMin: number
    standardMinInclusive: number
    standardType: number
    quantitativeMode?: "lower" | "upper" | "range"
    standardValue?: number | string | null
    upperTolerance?: number | string | null
    lowerTolerance?: number | string | null
    upperToleranceSign?: "+" | "-"
    lowerToleranceSign?: "+" | "-"
    unitId: string
  }
  methodDesc: string // 方法要求
  imageIds: string[]
  imageUrls?: string[]
  samplingMethod?: number
  samplingRatio?: number
  gradientModelId?: string | number
  isSampleReturn?: boolean // 样品是否还回
}

export type IProductInspectDetailCreateParams = {
  status?: number
  productModelId: string
  inspectItemCode: string // 产品检验项编号
  inspectItemId?: string // 产品检验项ID 引用时不能为空
  inspectItemName?: string // 产品检验项名称 新增时不能为空
  laboratoryIdList: string[] // 检验场所
  inspectTypeList: number[] // 产品检验类型
  inspectionStandard: {
    standardDesc: string
    standardMax: number
    standardMaxInclusive: number
    standardMin: number
    standardMinInclusive: number
    standardType: number
    quantitativeMode?: "lower" | "upper" | "range"
    standardValue?: number | string | null
    upperTolerance?: number | string | null
    lowerTolerance?: number | string | null
    upperToleranceSign?: "+" | "-"
    lowerToleranceSign?: "+" | "-"
    unitId: string
  }
  methodDesc: string // 方法要求
  imageIds: string[]
  imageUrls?: string[]
  samplingMethod?: number
  samplingRatio?: number
  gradientModelId?: string | number
  isSampleReturn?: boolean // 样品是否还回
}

export interface IProductModelDocListItem {
  createBy: string
  createTime: string
  fileId: string
  id: string
  productModelId: string
  updateBy: string
  updateTime: string
  documentSourceType: number
}

export interface ProductModelUnit {
  id: string
  productModelId: string
  unitId: string
  unitName: string
  unitCode: string
  conversionRate: number
  isDefault: boolean
  status: number
  createBy: number
  createTime: string
  updateBy: number
  updateTime: string
}
