import axios from "axios"

import { type IPagedAPIRes } from "@/api/type"
import type {
  IBarcodeItem,
  IBarcodeParams,
  IBatchCreateBarcodeParams
} from "@/types/base-info/barcode"
import type { IListPageResult, IResponse } from "@/types/common"

import type { IRes } from "./interceptor"
// 条码类型
// 1产品 2载具 4库位 5设备 6仓库 7MRO 8员工
export enum BarcodeType {
  Product = 1,
  Carrier = 2,
  Location = 4,
  Device = 5,
  Warehouse = 6,
  MRO = 7,
  Employee = 8
}

export async function updateBarcodeRemarks(params: { id: string; remark: string }) {
  const res = await axios.put<IRes>("/sys/barcode/editRemark", params)
  return res.data.data
}

export async function getBarcode(params: IBarcodeParams) {
  const res = await axios.get<IRes<IListPageResult<IBarcodeItem>>>("/sys/barcode/search", {
    params
  })
  return res.data.data
}

/** 批量创建条码 */
export const requestCreateBatchBarcode = async (params: IBatchCreateBarcodeParams) => {
  const res = await axios.post<IResponse>("/sys/barcode/batchCreate", params)
  return res.data.data
}

/** 批量创建条码并导出 */
export const requestBatchBarcodeCreateAndExport = async (params: IBatchCreateBarcodeParams) => {
  const res = await axios.post<IResponse>("/sys/barcode/batchCreateAndExport", params, {
    responseType: "blob"
  })
  return res
}

/** 批量创建条码并打印 */
export const requestBatchBarcodeCreateAndPrint = async (params: IBatchCreateBarcodeParams) => {
  const res = await axios.post<IResponse>("/sys/barcode/batchCreateAndPrint", params)
  return res.data.data
}

/** 条码预览 */
export const requestPreviewBarcode = async (params: { barcodeList: string[] }) => {
  const res = await axios.post<IRes<any>>("/sys/printServer/preview", params)
  return res.data.data
}

/** 盘点打印条码 */
export const requestPrintCheckBarcode = async (params: { barcode: string; quantity: number }[]) => {
  const res = await axios.post<IRes<any>>("/sys/printServer/preview/quantity", params)
  return res.data.data
}
