import type { IRequestPageParams } from "@/types/common"

export type MroBarcodeHandleType = "customer_existing" | "system_generate"

export interface IMroRegisterPageListParams
  extends IRequestPageParams<
    Partial<{
      mroInformationId: string
      mroModelId: string
      mroRegisterNo: string
      status: number
      warehouseName: string
    }>
  > {}

export interface IMroRegisterItem {
  autoGenerateCode: boolean
  barcodeHandleType?: MroBarcodeHandleType | ""
  barcodes?: string[]
  createBy: string
  createTime: string
  decimalNumber: number
  id: string
  identityManage: number
  mroCategoryId: string
  mroCategoryName: string
  mroModelId: string
  mroModelName: string
  mroModelNo: string
  mroSpec: string
  mroRegisterId: string
  registerNums: number
  remarks: string
  unitModelId: string
  unitModelName: string
  updateBy: string
  updateTime: string
  warehouseLocationId: string
  warehouseLocationName: string
}

export interface IMroRegisterPageListItem {
  checkBy: string
  checkByName: string
  completeTime: string
  createBy: string
  createByName: string
  createTime: string
  id: string
  mroRegisterEmpId: string
  mroRegisterEmpName: string
  mroRegisterEmpNo: string
  mroRegisterNo: string
  registerContent: string
  registerItemVos: IMroRegisterItem[]
  status: string
  updateBy: string
  updateTime: string
  warehouseId: string
  warehouseInEntryId: string
  warehouseInEntryNo: string
  warehouseName: string
  warehouseNo: string
}

export interface IMroRegisterItemUpdateParams {
  id: string
  mroRegisterEmpId: string
  mroRegisterEmpName: string
  mroRegisterEmpNo: string
  warehouseId: string
  data: {
    barcodeHandleType?: MroBarcodeHandleType | ""
    barcode?: string
    id: string
    mroModelId: string
    mroRegisterId: string
    registerNums: number
    remarks: string
    warehouseLocationId?: string
  }[]
}

export interface IMroRegisterCreateParams {
  mroRegisterEmpId: string
  mroRegisterEmpName: string
  mroRegisterEmpNo: string
  mroList: {
    barcodeHandleType?: MroBarcodeHandleType | ""
    mroModelId: string
    registerNums: number
    remarks: string
    warehouseLocationId?: string
  }[]
  warehouseId: string
}

export interface IMroRegisterCreateTableItem {
  id?: string
  barcodeHandleType?: MroBarcodeHandleType | ""
  mroModelId: string
  mroModelName: string
  mroModelNo: string
  mroSpec: string
  mroCategoryName: string
  identityManage: number
  registerNums: number | ""
  autoGenerateCode: boolean
  unitModelName: string
  warehouseLocationId?: string
  remarks: string
}

export interface IMroRegisterLabelBinding {
  registerItemId: string
  barcodeHandleType?: MroBarcodeHandleType | ""
  barcodes?: string[]
}

export interface IMroRegisterReviewParams {
  id: string
  labelBindings?: IMroRegisterLabelBinding[]
}

export interface IMroRegisterReviewResult {
  barcodeList: string[]
  createdMroCount: number
  warehouseInEntryNo: string
}
