import type { IRequestPageParams } from "@/types/common"

export type MroOutboundOrderSourceType = "manual_create" | "pickup_auto"
export type MroOutboundDetailSourceType = "mro_info" | "mro_resume"

export interface IMroOutboundOrderDetailItem {
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
  outboundQty: number
  remarks: string
  sourceDetailType: MroOutboundDetailSourceType
  updateBy: string
  updateTime: string
  warehouseLocationId: string
  warehouseLocationNo: string
  warehouseLocationName: string
}

export interface IMroOutboundOrderPageListItem {
  checkBy: string
  checkByName: string
  completeTime: string
  createBy: string
  createByName: string
  createTime: string
  detailVos: IMroOutboundOrderDetailItem[]
  id: string
  mroOutboundNo: string
  sourceBizId: string
  sourceBizNo: string
  outboundTime: string
  outboundContent: string
  remark: string
  sourceType: MroOutboundOrderSourceType
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

export interface IMroOutboundOrderPageListParams
  extends IRequestPageParams<
    Partial<{
      mroOutboundNo: string
      sourceBizNo: string
      sourceType: MroOutboundOrderSourceType
      status: number
      warehouseNo: string
      warehouseName: string
      warehouseOperatorName: string
      mroModelNo: string
      mroNo: string
      mroModelName: string
      outboundTimeStart: string
      outboundTimeEnd: string
    }>
  > {}

export interface IMroOutboundOrderCreateTableItem {
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
  outboundQty: number | ""
  remarks: string
  sourceDetailType: MroOutboundDetailSourceType
  warehouseLocationId?: string
  warehouseLocationNo?: string
  warehouseLocationName?: string
}

export interface IMroOutboundOrderSubmitDetail {
  id?: string
  mroId?: string
  mroModelId?: string
  outboundQty: number
  remarks: string
  sourceDetailType: MroOutboundDetailSourceType
  warehouseLocationId?: string
}

export interface IMroOutboundOrderCreateParams {
  data: IMroOutboundOrderSubmitDetail[]
  warehouseId: string
  warehouseOperatorId: string
  warehouseOperatorName: string
  warehouseOperatorNo: string
  remark?: string
}

export interface IMroOutboundOrderUpdateParams extends IMroOutboundOrderCreateParams {
  id: string
}

export interface IMroOutboundOrderReviewParams {
  id: string
}
