export interface IMroInventoryCheckPageListParams {
  checkNo?: string
  checkStatusList?: number[]
  checkDateStart?: string
  checkDateEnd?: string
  checkEmpName?: string
  warehouseNo?: string
  warehouseName?: string
  mroModelNo?: string
  mroSerialNo?: string
  mroModelName?: string
  pageNum: number
  pageSize: number
}

export interface IMroInventoryCheckPageListItem {
  id: string
  checkNo: string
  checkStatus: number
  checkDate: string
  checkEmpId: string
  checkEmpName: string
  warehouseId: string
  warehouseNo: string
  warehouseName: string
  remark: string
  createByName: string
  createTime: string
  statementEmpName: string
  statementTime: string
}

export interface IMroInventoryCheckDetailItem {
  id?: string
  mroInformationId?: string
  mroModelId: string
  mroModelNo: string
  mroSerialNo: string
  mroModelName: string
  mroSpec: string
  mroClassifyName: string
  mroTypeName: string
  barcode: string
  identityManage: number
  warehouseLocationId: string
  warehouseLocationNo: string
  warehouseLocationName: string
  originalQuantity: number
  checkQuantity: number | null
  changeQuantity: number
}

export interface IMroInventoryCheckRecordItem extends IMroInventoryCheckDetailItem {
  createTime?: string
  updateTime?: string
}

export interface IMroInventoryCheckCreateParams {
  warehouseId: string
  checkDate: string
  checkEmpId: string
  checkEmpName: string
  remark?: string
  detailList: {
    id?: string
    mroModelId: string
    checkQuantity: number
  }[]
}

export interface IMroInventoryCheckUpdateParams extends IMroInventoryCheckCreateParams {
  id: string
}
