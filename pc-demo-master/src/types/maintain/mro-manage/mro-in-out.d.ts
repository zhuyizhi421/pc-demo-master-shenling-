export interface IMroInRecordPageListParams {
  barcode?: string //标签码
  facilityId?: string //仓库ID
  inboundTimeEnd?: string //入库时间结束
  inboundTimeStart?: string //入库时间开始
  locationId?: string //库位ID
  mroModelName?: string //MRO型号名称
  mroNo?: string //MRO编号
  pageNum: number //页码
  pageSize: number //每页条数
}

export interface IMroOutRecordPageListParams {
  barcode?: string //标签码
  facilityId?: string //仓库ID
  locationId?: string //库位ID
  mroModelName?: string //MRO型号名称
  mroNo?: string //MRO编号
  outboundTimeEnd?: string //出库时间结束
  outboundTimeStart?: string //出库时间开始
  pageNum: number //页码
  pageSize: number //每页条数
}

export interface IMroInRecordPageListItem {
  barcode: string //标签码
  barcodeId: string //标签码id
  decimalNumber: number //保留小数点位数
  facilityId: string //仓库ID
  facilityName: string //仓库名称
  inboundDetailCode: string //编号
  inboundDetailId: string //入库任务明细id
  inboundId: string //入库任务ID
  inboundTime: string //入库时间(yyyy-MM-dd HH:mm:ss)
  locationId: string //库位ID
  locationName: string //库位名称
  mroId: string //MRO实例ID
  mroModelId: string //MRO型号id
  mroModelName: string //MRO型号名称
  mroNo: string //MRO编号
  operatorId: string //操作员ID
  operatorName: string //操作员名称
  quantity: number //数量
  unitId: string //单位ID
  unitName: string //单位名称
}

export interface IMroOutRecordPageListItem {
  barcode: string //标签码
  barcodeId: string //标签码id
  decimalNumber: number //保留小数点位数
  facilityId: string //仓库ID
  facilityName: string //仓库名称
  id: string //ID
  locationId: string //库位ID
  locationName: string //库位名称
  mroId: string //MRO实例ID
  mroModelId: string //MRO型号id
  mroModelName: string //MRO型号名称
  mroNo: string //MRO编号
  operatorId: string //操作员ID
  operatorName: string //操作员名称
  outboundDetailCode: string //编号
  outboundDetailId: string //出库任务明细id
  outboundId: string //出库任务ID
  outboundTime: string //出库时间(yyyy-MM-dd HH:mm:ss)
  quantity: number //数量
  reason: string //出库原因
  unitId: string //单位ID
  unitName: string //单位名称
}
