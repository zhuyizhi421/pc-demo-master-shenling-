export interface ISupplierDeliveryOrderPageParams {
  orderNo: string // 单据编号
  orderType: number // 单据类型 1:采购单 2:委外单
}

export interface ISupplierDeliveryOrderItem {
  createTime: string // 创建时间
  orderNo: string // 业务单(委外单/采购单)编号
  orderType: number // 单据类型 1:采购单 2:委外单
  productContent: string // 货品内容
  supplierId: string // 供应商ID
  productVOList: {
    barcode: string // 标签码
    barcodeId: string // 标签码ID(外键)
    decimalNumber: number // 保留小数点位数
    id: string // ID
    productModelCode: string // 产品编号
    productModelId: string // 产品模型ID
    productModelName: string // 产品名称
    quantity: number // 数量
    unitId: string // 单位ID
    unitName: string // 单位
  }[] // 商品列表
  remark: string // 备注
  sendOrderNo: string // 送货单编号
  sendTime: string // 送货日期
}

export interface ISupplierDeliveryOrderProductParams {
  sendOrderNo: string // 送货单编号
  supplierId: string // 供应商ID
}

export interface ISupplierDeliveryOrderProductItem {
  decimalNumber: number // 单位精度
  productModelCode: string // 产品编号
  productModelName: string // 产品名称
  quantity: number // 数量
  unitCode: string // 单位编号
  unitId: string // 单位
  unitName: string // 单位
}

export interface ISupplierDeliveryOrderReportParams {
  sendOrderNo: string // 送货单编号
  supplierId: string // 供应商ID
}

export interface ISupplierDeliveryOrderReportItem {
  fileId: string // 文件ID
  fileName: string // 文件名称
  fileURL: string // 文件URL
  remark: string // 备注
  sendOrderNo: string // 送货单编号
  uploadTime: string // 文件上传时间
}

export interface ISupplierDeliveryData {
  sendOrderNo: string // 送货单编号
  orderNo: string // 单据编号
  orderType: number // 单据类型 1:采购单 2:委外单
  supplierId: string // 供应商ID
}
