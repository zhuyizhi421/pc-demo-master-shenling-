import type { IRequestPageParams } from "@/types/common"

export type MroPickupOrderSourceType = "manual_create" | "terminal_direct"
export type MroPickupDetailSourceType = "mro_info" | "mro_resume"

export interface IMroPickupOrderDetailItem {
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
  pickupQty: number
  remarks: string
  sourceDetailType: MroPickupDetailSourceType
  updateBy: string
  updateTime: string
  warehouseLocationId: string
  warehouseLocationNo: string
  warehouseLocationName: string
}

export interface IMroPickupOrderPageListItem {
  checkBy: string
  checkByName: string
  completeTime: string
  createBy: string
  createByName: string
  createTime: string
  detailVos: IMroPickupOrderDetailItem[]
  id: string
  linkedMroOutboundNo: string
  mroPickupNo: string
  pickupArea: string
  pickupContent: string
  pickupEmpId: string
  pickupEmpName: string
  pickupEmpNo: string
  pickupProdUnit: string
  pickupStation: string
  pickupTime: string
  remark: string
  sourceType: MroPickupOrderSourceType
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

export interface IMroPickupOrderPageListParams
  extends IRequestPageParams<
    Partial<{
      linkedMroOutboundNo: string
      mroModelName: string
      mroModelNo: string
      mroNo: string
      mroPickupNo: string
      pickupArea: string
      pickupEmpNo: string
      pickupProdUnit: string
      pickupStation: string
      pickupTimeEnd: string
      pickupTimeStart: string
      sourceType: MroPickupOrderSourceType
      status: number
      warehouseName: string
    }>
  > {}

export interface IMroPickupOrderCreateTableItem {
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
  pickupQty: number | ""
  remarks: string
  sourceDetailType: MroPickupDetailSourceType
  warehouseLocationId?: string
  warehouseLocationNo?: string
  warehouseLocationName?: string
}

export interface IMroPickupOrderSubmitDetail {
  id?: string
  mroId?: string
  mroModelId?: string
  pickupQty: number
  remarks: string
  sourceDetailType: MroPickupDetailSourceType
  warehouseLocationId?: string
}

export interface IMroPickupOrderCreateParams {
  data: IMroPickupOrderSubmitDetail[]
  pickupArea: string
  pickupEmpId: string
  pickupEmpName: string
  pickupEmpNo: string
  pickupProdUnit: string
  pickupStation: string
  remark?: string
  warehouseId: string
}

export interface IMroPickupOrderUpdateParams extends IMroPickupOrderCreateParams {
  id: string
}

export interface IMroPickupOrderReviewParams {
  id: string
}
