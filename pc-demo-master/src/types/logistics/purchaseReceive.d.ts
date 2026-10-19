/**
 * 采购管理-采购收货
 */

export interface IPurchaseReceiveDetailContentItem {
  arrivalReceiptId: string
  barcode: string
  id: string
  productBatch: string
  productCode: string
  productName: string
  receiveNum: number
  unit: string
}

export interface IPurchaseReceivePageListItem {
  /** 批次号 */
  batchCode?: string
  /** 自定义字段 */
  customizedFields?: CustomizeFieldValueVO[]
  /** 退货内容 */
  detailContent?: IPurchaseReceiveDetailContentItem[]
  /** 采购收货单ID */
  id: string
  /**
   * 收货时间
   * @format date-time
   */
  receiveTime?: string
  /** 收货人 */
  receiver?: string
  /** 供应商名称 */
  supplierName?: string
  /** 供应商简称 */
  supplierShortName?: string
  /** 采购收货单号 */
  taskCode?: string
  receiptCode?: string
  purchaseCode?: string
}

export interface IPurchaseReceivePageParams {
  productNameOrCode?: string
  receiveTimeEnd?: string
  receiveTimeStart?: string // 收货时间开始
  taskCode?: string //收货单号
  purchaseCode?: string //采购单号
  batchCode?: string //批次号
  productBarcode?: string //产品条码
  pageNum: number
  pageSize: number
}

export interface LogisticsPurchaseReceiveAttachment {
  /** 文件id */
  id: string
  /** 文件名称 */
  sourceName: string
  path: string
  extension: string
}

export interface IPurchaseReceiveReceiveDetail {
  batchCode: string // 批次号
  detailContent: {
    barcode: string // 收货实体标签
    decimalNumber: number // 精度
    productModelCode: string // 产品编号
    productModelId: string // 产品模型ID
    productModelName: string // 产品名称
    receiveQuantity: number // 收货数量
    unitName: string // 单位
    unitId: string // 单位ID
  }[]
  id: string // 采购收货单ID
  purchaseCode: string // 采购单号
  purchaseId: string // 采购单ID
  receiptCode: string // 收货单号
  receiveTime: string // 收货时间
  receiver: string // 收货人
  supplierName: string // 供应商名称
  supplierShortName: string // 供应商简称
}
