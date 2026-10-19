import axios from "axios"

import type {
  ISupplierDeliveryOrderItem,
  ISupplierDeliveryOrderPageParams,
  ISupplierDeliveryOrderProductItem,
  ISupplierDeliveryOrderProductParams,
  ISupplierDeliveryOrderReportItem,
  ISupplierDeliveryOrderReportParams
} from "@/types/base-info/supplier-platform"
import type { IResponse } from "@/types/common"

/** 供应商送货单分页 */
export const querySupplierDeliveryPageList = async (params: ISupplierDeliveryOrderPageParams) => {
  const res = await axios.post<IResponse<ISupplierDeliveryOrderItem[]>>(
    `/supplierPlatform/sendOrderList`,
    params
  )
  return res.data.data
}

/** 供应商送货单详情 */
export const querySupplierDeliveryOrderDetail = async (params: {
  sendOrderNo: string
  supplierId: string
}) => {
  const res = await axios.post<IResponse<ISupplierDeliveryOrderItem>>(
    `/supplierPlatform/sendOrderDetail`,
    params
  )
  return res.data.data
}

/** 供应商送货单产品清单列表 */
export const querySupplierDeliveryOrderProductList = async (
  params: ISupplierDeliveryOrderProductParams
) => {
  const res = await axios.post<IResponse<ISupplierDeliveryOrderProductItem[]>>(
    `/supplierPlatform/sendOrderProductList`,
    params
  )
  return res.data.data
}

/** 供应商送货单报告列表 */
export const querySupplierDeliveryReportList = async (
  params: ISupplierDeliveryOrderReportParams
) => {
  const res = await axios.post<IResponse<ISupplierDeliveryOrderReportItem[]>>(
    `/supplierPlatform/reportList`,
    params
  )
  return res.data.data
}

/** 供应商送货单打印 */
export const requestSupplierDeliveryOrderPrint = async (params: {
  sendOrderNo: string
  supplierId: string
}) => {
  const res = await axios.post<
    IResponse<{
      filePath: string
    }>
  >(`/supplierPlatform/printSendOrder`, params)
  return res.data.data
}
