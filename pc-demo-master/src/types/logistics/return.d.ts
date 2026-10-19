export interface IReturnOrderPageListParams {
  pageNum: number
  pageSize: number
  createTimeEnd?: string
  createTimeStart?: string
  productModelName?: string
  customerId?: string
  saleCode?: string
}

export interface IReturnOrderPageListItem {
  createTime: string // 创建时间
  customerCode: string // 客户编号
  customerId: string // 客户ID
  customerName: string // 客户名称
  dataSource: number // 来源 1MES 2ERP
  decimalNumber: number // 保留小数点位数
  id: string // 退货ID
  inboundQty: number // 实际入库数量
  inspectionCode: string // 检验单号
  inspectionId: string // 检验ID
  inspectionResult: number // 检验结果 0-结果未出 1-合格、2-不合格
  isReturnInspection: boolean // example: false
  isSplit: boolean // example: false
  productCategory: string // 产品类别
  productCategoryId: string // 产品类别ID
  productModelId: string // 产品模型ID
  productModelName: string // 产品名称
  returnQty: number // 退货数量
  returnStatus: number // 状态 0未结 1已结
  saleCode: string // 销售单号
  saleId: string // 销售任务ID
  specifiedInboundWarehouseId: string // 指定退货入库仓库ID
  specifiedInboundWarehouseName: string // 指定退货入库仓库名称
  statementTime: string // 结单时间
  unitId: string // 单位ID
  unitName: string // 单位名称
}

export interface IReturnOrderCreateByNotSaleOrderParams {
  productModelId?: string
  customerId?: string
  returnQty?: string
  isReturnInspection?: boolean
  unitId?: string
}

export interface IReturnOrderCreateBySaleOrderParams {
  productModelId?: string
  saleId?: string
  returnQty?: string
  isReturnInspection?: boolean
  unitId?: string
}

export interface IReturnOrderDetail {
  barcode: string // 标签码
  barcodeId: string // 标签码ID
  decimalNumber: number // 保留小数点位数
  productId: string // 产品实例ID
  productModelId: string // 产品模型ID
  productModelName: string // 产品名称
  quantity: number // 数量
  unitId: string // 单位ID
  unitName: string // 单位
}

export interface IReturnOrderProductInfo {
  decimalNumber: number // 保留小数点位数
  deliveryQty: number // 已发货数量
  inspectionExemption: boolean // 是否免检
  productModelId: string // 产品模型ID
  productModelName: string // 产品名称
  unitId: string // 单位ID
  unitName: string // 单位
}

export interface ISaleOrderBySaleParams {
  pageNum: number
  pageSize: number
  customerId?: string
  saleCode?: string
  saleStatus?: string
}

export interface ISaleOrderBySaleListItem {
  createTime: string // 创建时间
  customerCode: string // 客户编号
  customerId: string // 客户ID
  customerName: string // 客户名称
  id: string // 销售单ID
  saleCode: string // 销售单号
  saleContent: string // 销售内容
  saleStatus: number // 状态 0未发货 1进行中 2已完成
}
