import type { IRequestPageParams } from "@/types/common"

export type IPackContainerPageParams = IRequestPageParams<{
  barcode?: string
  containerType?: string
  createTimeEnd?: string
  createTimeStart?: string
  productBarcode?: string
  useTimeEnd?: string
  useTimeStart?: string
}>

export interface IPackContainerPageItem {
  barcode: string
  bindProducts: IPackContainerBindProductItem[]
  childContainers: IPackContainerPageItem[]
  containerType: string
  createTime: string
  id: string
  totalProducts: IPackContainerTotalProductItem[]
  parentContainer: IPackContainerPageItem
  useTime: string
}

export interface IPackContainerBindProductItem {
  barcode: string
  barcodeId: string
  batchId: string
  batchNo: string
  decimalNumber: number
  defaultQuantity: number
  defaultUnitId: string
  defaultUnitName: string
  productId: string
  productModelCode: string
  productModelId: string
  productModelName: string
}

export interface IPackContainerChildContainerItem {
  barcode: string
  containerType: string
  createTime: string
  id: string
}

export interface IPackContainerTotalProductItem {
  barcode: string
  barcodeId: string
  batchId: string
  batchNo: string
  decimalNumber: number
  defaultQuantity: number
  defaultUnitId: string
  defaultUnitName: string
  productId: string
  productModelCode: string
  productModelId: string
  productModelName: string
}

export interface IProductVoItem {
  barcode: string
  decimalNumber: number
  productInstanceId: string
  productModelCode: string
  productModelId: string
  productModelName: string
  quantity: number
  unitName: string
}

export interface IContainerVoItem {
  barcode: string
  containerId: string
  containerType: string
}

export interface IProductionReportInfo {
  barcode: string
  containerId: string
  containerType: string
  productVoList: IProductVoItem[]
  containerVoList: IContainerVoItem[]
  containerType: string
  recordId: string
  packTime: string
}
