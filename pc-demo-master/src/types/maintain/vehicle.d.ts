import type { IRequestPageParams } from "@/types/common"

export type IVehicleModelPageParams = IRequestPageParams<{
  modelName?: string
  modelNo?: string
  vehicleCategoryId?: string
}>

export interface IVehicleModelPageItem {
  createBy: string
  createTime: string
  id: string
  modelImg: string
  modelImgPath: string
  modelName: string
  modelNo: string
  modelStatus: 0 | 1
  remarks: string
  repairProcdefId?: string
  repairProcdefName?: string
  scrapProcdefId?: string
  scrapProcdefName?: string
  type: EnumVehicleType
  updateBy: string
  updateTime: string
  vehicleCategoryId: string
  vehicleCategoryName: string
}

export type IVehiclePageParams = IRequestPageParams<{
  name?: string
  no?: string
  vehicleModelNo?: string
  ledgerStatus?: "enabled" | "disabled" | "scrapped"
  barcode?: string
  productBarcode?: string
}>

export interface IVehiclePageItem {
  barcode: string
  barcodeId: string
  bindProducts: {
    barcode: string
    barcodeId: string
    decimalNumber: number
    defaultQuantity: number
    defaultUnitId: string
    defaultUnitName: string
    productId: string
    productModelCode: string
    productModelId: string
    productModelName: string
  }[]
  createBy: string
  createTime: string
  id: string
  ledgerStatus?: "enabled" | "disabled" | "scrapped"
  loadProductCount?: number
  name: string
  no: string
  parentId: string
  repairProcdefId?: string
  repairProcdefName?: string
  repairTaskStatus?: "none" | "pending" | "processing" | "completed"
  remarks: string
  scrapProcdefId?: string
  scrapProcdefName?: string
  scrapTaskStatus?: "none" | "pending" | "processing" | "completed"
  status: number
  type: number
  updateBy: string
  updateTime: string
  vehicleCategoryId: string
  vehicleCategoryName: string
  vehicleModelId: string
  vehicleModelName: string
  vehicleModelNo: string
}
