export interface IMroDifferenceOrderPageListParams {
  diffNo?: string
  sourceCheckNo?: string
  diffDateStart?: string
  diffDateEnd?: string
  checkEmpName?: string
  warehouseNo?: string
  warehouseName?: string
  status?: number
  mroModelNo?: string
  mroSerialNo?: string
  mroModelName?: string
  pageNum: number
  pageSize: number
}

export interface IMroDifferenceOrderPageListItem {
  id: string
  diffNo: string
  diffDate: string
  sourceCheckId: string
  sourceCheckNo: string
  checkEmpName: string
  warehouseNo: string
  warehouseName: string
  status: number
  reviewByName: string
  reviewTime: string
  createTime: string
}

export interface IMroDifferenceOrderDetailItem {
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
  warehouseLocationNo: string
  warehouseLocationName: string
  originalQuantity: number
  checkQuantity: number
  differenceQty: number
  differenceReason: string
}
