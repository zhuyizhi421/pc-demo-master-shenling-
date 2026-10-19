import type { IRequestPageParams } from "@/types/common"

export type MroReturnOrderSourceType = "manual_create" | "terminal_direct"
export type MroReturnDetailSourceType = "mro_info" | "mro_resume"

export interface IMroReturnOrderDetailItem {
  barcode: string
  createBy: string
  createTime: string
  currentLocationName: string
  id: string
  identityManage: number
  mroId: string
  mroModelId: string
  mroModelName: string
  mroModelNo: string
  mroNo: string
  mroSpec: string
  mroClassifyName: string
  mroCategoryName: string
  returnQty: number
  remarks: string
  sourceDetailType: MroReturnDetailSourceType
  updateBy: string
  updateTime: string
  warehouseLocationId: string
  warehouseLocationNo: string
  warehouseLocationName: string
}

export interface IMroReturnOrderPageListItem {
  checkBy: string
  checkByName: string
  completeTime: string
  createBy: string
  createByName: string
  createTime: string
  detailVos: IMroReturnOrderDetailItem[]
  id: string
  linkedMroInboundNo: string
  mroReturnNo: string
  returnArea: string
  returnContent: string
  returnEmpId: string
  returnEmpName: string
  returnEmpNo: string
  returnTime: string
  remark: string
  sourceType: MroReturnOrderSourceType
  status: string
  updateBy: string
  updateTime: string
  warehouseId: string
  warehouseName: string
  warehouseNo: string
  warehouseOperatorId: string
  warehouseOperatorName: string
  warehouseOperatorNo: string
}

export interface IMroReturnOrderPageListParams
  extends IRequestPageParams<
    Partial<{
      linkedMroInboundNo: string
      mroModelName: string
      mroModelNo: string
      mroNo: string
      mroReturnNo: string
      returnArea: string
      returnEmpNo: string
      returnTimeEnd: string
      returnTimeStart: string
      sourceType: MroReturnOrderSourceType
      status: number
      warehouseName: string
      warehouseNo: string
    }>
  > {}

export interface IMroReturnOrderCreateTableItem {
  id?: string
  barcode?: string
  currentLocationName?: string
  identityManage: number
  mroId?: string
  mroModelId: string
  mroModelName: string
  mroModelNo: string
  mroNo?: string
  mroSpec: string
  mroClassifyName?: string
  mroCategoryName?: string
  returnQty: number | ""
  remarks: string
  sourceDetailType: MroReturnDetailSourceType
  warehouseLocationId?: string
  warehouseLocationNo?: string
  warehouseLocationName?: string
}

export interface IMroReturnOrderSubmitDetail {
  id?: string
  mroId?: string
  mroModelId?: string
  returnQty: number
  remarks: string
  sourceDetailType: MroReturnDetailSourceType
  warehouseLocationId?: string
}

export interface IMroReturnOrderCreateParams {
  data: IMroReturnOrderSubmitDetail[]
  remark?: string
  returnArea: string
  returnEmpId: string
  returnEmpName: string
  returnEmpNo: string
  warehouseId: string
}

export interface IMroReturnOrderUpdateParams extends IMroReturnOrderCreateParams {
  id: string
}

export interface IMroReturnOrderReviewParams {
  id: string
}
