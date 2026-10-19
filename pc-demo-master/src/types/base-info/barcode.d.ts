export interface IBatchCreateBarcodeParams {
  entityType: number
  quantity: number
}

export interface IBarcodeParams {
  barcode?: string
  entityCode?: string
  entityType?: number
  startDate?: string
  endDate?: string
  startBindDate?: string
  endBindDate?: string
  pageNum: number
  pageSize: number
}

export interface IBarcodeItem {
  barcode: string
  bindTime: string
  createTime: string
  entityCode: string
  entityId: number
  entityType: number
  id: number
  isBind: number
  remark: string
}
