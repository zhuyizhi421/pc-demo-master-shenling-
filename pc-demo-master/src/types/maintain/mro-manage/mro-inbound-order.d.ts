import type { IRequestPageParams } from "@/types/common"

export type MroInboundOrderSourceType = "register_auto" | "manual_create"
export type MroInboundDetailSourceType = "mro_info" | "mro_resume"

export interface IMroInboundOrderDetailItem {
  barcode: string
  createBy: string
  createTime: string
  currentLocationName: string
  id: string
  identityManage: number
  inboundQty: number
  mroId: string
  mroModelId: string
  mroClassifyName: string
  mroCategoryName: string
  mroModelName: string
  mroModelNo: string
  mroNo: string
  mroSpec: string
  remarks: string
  sourceDetailType: MroInboundDetailSourceType
  updateBy: string
  updateTime: string
  warehouseLocationId: string
  warehouseLocationNo: string
  warehouseLocationName: string
}

export interface IMroInboundOrderPageListItem {
  checkBy: string
  checkByName: string
  completeTime: string
  createBy: string
  createByName: string
  createTime: string
  detailVos: IMroInboundOrderDetailItem[]
  id: string
  inboundContent: string
  mroInboundEmpId: string
  mroInboundEmpName: string
  mroInboundEmpNo: string
  mroInboundNo: string
  remark: string
  sourceBizId: string
  sourceBizNo: string
  sourceType: MroInboundOrderSourceType
  status: string
  updateBy: string
  updateTime: string
  warehouseId: string
  warehouseName: string
  warehouseNo: string
}

export interface IMroInboundOrderPageListParams
  extends IRequestPageParams<
    Partial<{
      mroInboundNo: string
      sourceBizNo: string
      sourceType: MroInboundOrderSourceType
      status: number
      warehouseName: string
    }>
  > {}

export interface IMroInboundOrderCreateTableItem {
  id?: string
  barcode?: string
  currentLocationName?: string
  identityManage: number
  inboundQty: number | ""
  mroId?: string
  mroModelId: string
  mroClassifyName?: string
  mroCategoryName?: string
  mroModelName: string
  mroModelNo: string
  mroNo?: string
  mroSpec: string
  remarks: string
  sourceDetailType: MroInboundDetailSourceType
  warehouseLocationId?: string
  warehouseLocationNo?: string
  warehouseLocationName?: string
}

export interface IMroInboundOrderSubmitDetail {
  id?: string
  inboundQty: number
  mroId?: string
  mroModelId?: string
  remarks: string
  sourceDetailType: MroInboundDetailSourceType
  warehouseLocationId?: string
}

export interface IMroInboundOrderCreateParams {
  data: IMroInboundOrderSubmitDetail[]
  mroInboundEmpId: string
  mroInboundEmpName: string
  mroInboundEmpNo: string
  remark?: string
  warehouseId: string
}

export interface IMroInboundOrderUpdateParams extends IMroInboundOrderCreateParams {
  id: string
}

export interface IMroInboundOrderReviewParams {
  id: string
}
