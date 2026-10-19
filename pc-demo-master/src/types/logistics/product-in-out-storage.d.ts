export interface IProductInStoragePageListParams {
  barcode?: string // 标签码
  facilityIdStr?: string // 仓库ID拼接字符串
  inboundTimeEnd?: string // 入库时间-结束(yyyy-MM-dd HH:mm:ss)
  inboundTimeStart?: string // 入库时间-开始(yyyy-MM-dd HH:mm:ss)
  inboundType?: number // 入库类型 1采购入库 2MRO入库 3调拨入库 4退货入库 5退料入库 6生产入库 7杂项入库
  locationIdStr?: string // 库位ID拼接字符串
  pageNum: number // 每页显示条数
  pageSize: number // 当前页页码
  productName?: string // 产品名称
}

export interface IProductInStoragePageListItem {
  barcode: string
  barcodeId: string
  facilityId: string
  facilityName: string
  inboundDetailCode: string
  inboundDetailId: string
  inboundId: string
  inboundTime: string
  inboundType: number
  locationId: string
  locationName: string
  operatorId: string
  operatorName: string
  productId: string
  productModelCode: string
  productModelId: string
  productModelName: string
  quantity: number
  unitId: string
  unitName: string
}

export interface IProductOutStoragePageListParams {
  barcode?: string // 标签码
  facilityIdStr?: string // 仓库ID拼接字符串
  locationIdStr?: string // 库位ID拼接字符串
  outboundTimeEnd?: string // 出库时间-结束(yyyy-MM-dd HH:mm:ss)
  outboundTimeStart?: string // 出库时间-开始(yyyy-MM-dd HH:mm:ss)
  outboundType?: number // 出库类型 1发货出库 2MRO出库 3调拨出库 4领料出库 5其他出库 6委外领料出库 7采购退货出库 8盘亏出库
  pageNum: number // 每页显示条数
  pageSize: number // 当前页页码
  productName?: string // 产品名称
}

export interface IProductOutStoragePageListItem {
  barcode: string
  barcodeId: string
  facilityId: string
  facilityName: string
  inboundDetailCode: string
  inboundDetailId: string
  inboundId: string
  inboundTime: string
  inboundType: number
  locationId: string
  locationName: string
  operatorId: string
  operatorName: string
  productId: string
  productModelCode: string
  productModelId: string
  productModelName: string
  quantity: number
  unitId: string
  unitName: string
}
