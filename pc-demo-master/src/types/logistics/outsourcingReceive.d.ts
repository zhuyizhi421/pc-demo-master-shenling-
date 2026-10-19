/** 委外收货 */

import type { IRequestPageParams } from "@/types/common"

export interface IOutsourcingReceivePageListReq
  extends IRequestPageParams<
    Partial<{
      productModelCode: string
      productModelName: string
      receiveNo: string
    }>
  > {}

export interface IOutsourcingReceiveList {
  countId: string
  current: string
  maxLimit: string
  optimizeCountSql: boolean
  orders: OrderItem[]
  pages: string
  records: IOutsourcingReceiveListItem[]
  searchCount: boolean
  size: string
  total: string
}

export interface OrderItem {
  asc: boolean
  column: string
}

export interface IOutsourcingReceiveListItem {
  businessId: string //关联的业务单
  code: string //收货编号
  createBy: string //创建人ID
  createTime: string //创建时间
  delegateNo: string //委外单号
  delegateType: string //委外类型
  deliveryCode: string
  fileIds: string[] //附件ID列表
  id: string //ID
  productBatchId: string //批次id
  productBatchNo: string //批次号
  receiveEmpId: string //收货员工ID
  receiveEmpName: string //收货员工名称
  receiveItems: ReveiveItems[] //收货内容
  receiveTime: string //收货时间
  supplierCode: string //供应商编号
  supplierId: string //供应商ID
  supplierName: string //供应商名称
  supplierAbbr: string //供应商简称
  type: number //收货类型 3-订单委外 4-工序委外
  updateBy: string //更新人ID
  updateTime: string //更新时间
}
export interface ReveiveItems {
  barcode: string
  businessId: string
  createBy: string
  createTime: string
  delegateNo: string
  deliveryCode: string
  id: string
  inboundAmount: number
  productBatchId: string
  productBatchNo: string
  productId: string
  productModelCode: string
  productModelId: string
  productModelName: string
  quantity: number
  receiveEmpId: string
  receiveId: string
  receiveNo: string
  receiveTime: string
  type: number
  unitId: string
  unitName: string
  updateBy: string
  updateTime: string
}

export interface AttachFile {
  fileId: string
  fileName: string
  fileURL: string
}
