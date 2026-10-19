export interface IMroAdjustOrderPageListParams {
  adjustNo?: string
  sourceCheckNo?: string
  sourceDiffNo?: string
  adjustDateStart?: string
  adjustDateEnd?: string
  warehouseNo?: string
  warehouseName?: string
  status?: number
  mroModelNo?: string
  mroSerialNo?: string
  mroModelName?: string
  pageNum: number
  pageSize: number
}

export interface IMroAdjustOrderPageListItem {
  id: string
  adjustNo: string
  adjustDate: string
  sourceCheckId: string
  sourceCheckNo: string
  sourceDiffId: string
  sourceDiffNo: string
  warehouseId?: string
  warehouseNo: string
  warehouseName: string
  status: number
  reviewByName: string
  reviewTime: string
  createTime: string
}

export interface IMroAdjustOrderDetailItem {
  id: string
  mroInformationId?: string
  mroSerialNo: string
  mroModelId: string
  mroModelNo: string
  mroModelName: string
  mroSpec: string
  mroClassifyName: string
  mroTypeName: string
  identityManage: number
  warehouseLocationId?: string
  warehouseLocationNo: string
  warehouseLocationName: string
  adjustQuantity: number
  originalQuantity: number
  checkQuantity: number
  differenceQty: number
}
