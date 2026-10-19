import type { IRequestPageParams } from "@/types/common"

export interface IScrapRecordPageListReq
  extends IRequestPageParams<
    Partial<{
      productModeCode: string
      productModeName: string
      reportUserID: string
      scrapRecordNo: string
      vehicleBarcode: string
    }>
  > {}

export interface IScrapRecordItem {
  attachmentId: string // 报废附件ID
  attachmentUrl: string // 报废附件url
  createTime: string // 报废时间
  id: string // ID
  no: string // 报废单号
  productList: {
    barcode: string // 标签码
    defaultQuantity: number // 默认单位对应数量
    defaultUnitName: string // 默认单位名字
    productId: string // 产品实例ID
    productModelCode: string // 产品模型编码
    productModelName: string // 产品模型名字
  }[] // 报废产品
  remarks: string // 备注
  reportUser: {
    name: string
  }
  vehicleBarcodes: string // 相关载具标签码
}
