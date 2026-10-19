import type { IRequestPageParams } from "@/types/common"

export interface Demo {}
export interface DelegateOrder {
  /**
   * 委外数量
   * @format bigdecimal
   */
  amount: number
  /** 结案人员 */
  archiveEmpId: string
  /**
   * 结案时间
   * @format date-time
   */
  archiveTime: string
  /** 附件信息 */
  attachFile: AttachFile
  /** 复核人员 */
  checkEmpId: string
  /**
   * 复核时间
   * @format date-time
   */
  checkTime: string
  /** 创建人ID */
  createBy: string
  /**
   * 创建时间
   * @format date-time
   */
  createTime: string
  /**
   * 委外类型 3订单委外 4工序委外
   * @format int32
   */
  delegateType: number
  /**
   * 预计收货时间
   * @format date-time
   */
  expectedReceiveTime: string
  /** 附件ID */
  fileId: string
  /** ID */
  id: string
  /** 物料清单 在pda委外收货时需要使用 */
  materialVos: DelegateOrderMaterial[]
  /** 委外订单编号 */
  no: string
  /** 工序列表 */
  nodes: DelegateOrderNode[]
  /** 工单工艺路线 */
  processId: string
  /** 工艺路线版本 */
  processVersion: string
  /** 产品编号 */
  productModelCode: string
  /** 产品模型ID */
  productModelId: string
  /** 产品名称 */
  productModelName: string
  /**
   * 收货数量
   * @format bigdecimal
   */
  receiveAmount: number
  /** 备注 */
  remark: string
  /**
   * 来源 1-mes 2-erp
   * @format int32
   */
  source: number
  /**
   * 状态，5未复核 6未收货 7进行中 8已合并 10结案
   * @format int32
   */
  status: number
  /** 供应商编号 */
  supplierCode: string
  /** 供应商ID */
  supplierId: string
  /** 供应商名称 */
  supplierName: string
  /**
   * 待收货数量
   * @format bigdecimal
   */
  unReceiveAmount: number
  /** 单位ID */
  unitId: string
  /** 单位名称 */
  unitName: string
  /** 更新人ID */
  updateBy: string
  /**
   * 更新时间
   * @format date-time
   */
  updateTime: string

  decimalNumber: number
}
export interface AttachFile {
  fileId?: string
  fileName?: string
  fileURL?: string
}
export interface DelegateOrderMaterial {
  /**
   * 数量
   * @format bigdecimal
   */
  amount?: number
  /** 创建人ID */
  createBy?: string
  /**
   * 创建时间
   * @format date-time
   */
  createTime?: string
  /** 委外订单ID */
  delegateOrderId?: string
  /**
   * 超领数量
   * @format bigdecimal
   */
  exceedAmount?: number
  /** ID */
  id?: string
  /** 物料来源 */
  nodeMaterialIds?: string
  /** 产品编号 */
  productModelCode?: string
  /** 委外产品模型 */
  productModelId?: string
  /** 产品名称 */
  productModelName?: string
  /** 单位ID */
  unitId?: string
  /** 单位名称 */
  unitName?: string
  /** 更新人ID */
  updateBy?: string
  /**
   * 更新时间
   * @format date-time
   */
  updateTime?: string
}
export interface DelegateOrderNode {
  /**
   * 委外数量
   * @format bigdecimal
   */
  amount?: number
  /** 创建人ID */
  createBy?: string
  /**
   * 创建时间
   * @format date-time
   */
  createTime?: string
  /** 委外订单ID */
  delegateOrderId?: string
  /** ID */
  id?: string
  /** 工序ID */
  nodeId?: string
  /** 产品模型 */
  productModelId?: string
  /** 单位 */
  unitId?: string
  /** 更新人ID */
  updateBy?: string
  /**
   * 更新时间
   * @format date-time
   */
  updateTime?: string
}

/** 新建委外订单 */
export interface DelegateOrderAddInter {
  /**
   * 委外类型 3 订单委外 4工序委外
   * @format int32
   */
  delegateType?: number
  /**
   * 预计收货时间
   * @format date-time
   */
  expectedReceiveTime?: string
  /** 附件id */
  fileIds?: string[]
  /** 委外订单id */
  id?: string
  /** 物料清单 */
  materialItems?: MaterialItem[]
  /** 委外编号 */
  no?: string
  /**
   * 订单数量
   * @format bigdecimal
   */
  orderAmount?: number
  /** 委外订单的原生产订单ID，工序委外需要 */
  originalOrderId?: string
  /** 产出清单 */
  outputItems?: OutputItem[]
  /** 工单工艺路线ID */
  processId?: string
  /** 产品模型ID */
  productModelId?: string
  /** 备注 */
  remark?: string
  /** 委外订单的工序，工序委外需要 */
  serialItems?: SerialItem[]
  /**
   * 来源 1MES 2ERP， 默认1
   * @format int32
   */
  source?: number
  /** 供应商ID */
  supplierId?: string
  /** 单位 */
  unitId?: string
}
/** MaterialItem */
export interface MaterialItem {
  /**
   * 数量
   * @format bigdecimal
   */
  orderAmount?: number
  /** 产品模型id */
  productModelId?: string
  /** 单位id */
  unitId?: string
}
/** OutputItem */
export interface OutputItem {
  /** 产品标签码 */
  barcode?: string
  /**
   * 是否打印新条码
   * @example false
   */
  isPrintBarcode?: boolean
  /** 产品模型ID */
  productModelId?: string
  /**
   * 数量
   * @format bigdecimal
   */
  quantity?: number
  /** 单位ID */
  unitId?: string
  /** 载具标签码 */
  vehicleBarcode?: string
}
/** SerialItem */
export interface SerialItem {
  /** 工序id */
  id?: string
  /**
   * 委外数量
   * @format bigdecimal
   */
  amount?: number
}

// 查询物料清单，订单委外用
export interface TsesDelegateOrderMaterialVo {
  /**
   * 数量
   * @format bigdecimal
   */
  amount?: number
  /** 创建人ID */
  createBy?: string
  /**
   * 创建时间
   * @format date-time
   */
  createTime?: string
  /** 委外订单ID */
  delegateOrderId?: string
  /**
   * 超领数量
   * @format bigdecimal
   */
  exceedAmount?: number
  /** ID */
  id?: string
  /** 物料来源 */
  nodeMaterialIds?: string
  /** 产品编号 */
  productModelCode?: string
  /** 委外产品模型 */
  productModelId?: string
  /** 产品名称 */
  productModelName?: string
  /** 单位ID */
  unitId?: string
  /** 单位名称 */
  unitName?: string
  /** 更新人ID */
  updateBy?: string
  /**
   * 更新时间
   * @format date-time
   */
  updateTime?: string
}

// 询产出清单，订单委外用
export interface IOutOrderProductItem {
  /**
   * 预计数量
   * @format bigdecimal
   */
  amount: number
  /** 创建人ID */
  createBy: string
  /**
   * 创建时间
   * @format date-time
   */
  createTime: string
  /** 委外订单ID */
  delegateOrderId: string
  /** ID */
  id: string
  inboundAmount: number //入库数量
  decimalNumber: number // 单位精度
  /** 产出来源 */
  nodeOutputIds: string
  /** 产品模型ID */
  productModelId: string
  /**
   * 收货数量
   * @format bigdecimal
   */
  receiveAmount: number
  /** 单位 */
  unitId: string
  /** 更新人ID */
  updateBy: string
  /**
   * 更新时间
   * @format date-time
   */
  updateTime: string
}

// 委外订单详情
export interface TsesDelegateOrderVo {
  checkEmpName?: string
  createByName?: string
  /**
   * 委外数量
   * @format bigdecimal
   */
  amount?: number
  /** 结案人员 */
  archiveEmpId?: string
  /**
   * 结案时间
   * @format date-time
   */
  archiveTime?: string
  /** 附件信息 */
  attachFile?: AttachFile[]
  /** 复核人员 */
  checkEmpId?: string
  /**
   * 复核时间
   * @format date-time
   */
  checkTime?: string
  /** 创建人ID */
  createBy?: string
  /**
   * 创建时间
   * @format date-time
   */
  createTime?: string
  /**
   * 委外类型 3订单委外 4工序委外
   * @format int32
   */
  delegateType?: number
  /**
   * 预计收货时间
   * @format date-time
   */
  expectedReceiveTime?: string
  /** 附件ID列表 */
  fileIds?: string[]
  /** ID */
  id?: string
  /** 物料清单 在pda委外收货时需要使用 */
  materialVos?: TsesDelegateOrderMaterialVo[]
  /** 委外订单编号 */
  no?: string
  /** 工序列表 */
  nodes?: TsesDelegateOrderNodeVo[]
  /** 原生产订单 */
  originalOrderId?: string
  /** 原生产订单编号 */
  originalOrderNo?: string
  /** 产出清单 */
  outputVos?: IOutOrderProductItem[]
  /** 工单工艺路线 */
  processId?: string
  /** 工单工艺路线名称 */
  techProcessName?: string
  /** 工单工艺路线编号 */
  techProcessNo?: string
  /** 工艺路线版本 */
  processVersion?: string
  /** 产品编号 */
  productModelCode?: string
  /** 产品模型ID */
  productModelId?: string
  /** 产品名称 */
  productModelName?: string
  /**
   * 收货数量
   * @format bigdecimal
   */
  receiveAmount?: number
  /** 备注 */
  remark?: string
  /**
   * 来源 1-mes 2-erp
   * @format int32
   */
  source?: number
  /**
   * 状态，5未复核 6未收货 7进行中 8已合并 10结案
   * @format int32
   */
  status?: number
  /** 供应商编号 */
  supplierCode?: string
  /** 供应商ID */
  supplierId?: string
  /** 供应商名称 */
  supplierName?: string
  /**
   * 待收货数量
   * @format bigdecimal
   */
  unReceiveAmount?: number
  /** 单位ID */
  unitId?: string
  /** 单位名称 */
  unitName?: string
  /** 更新人ID */
  updateBy?: string
  /**
   * 更新时间
   * @format date-time
   */
  updateTime?: string
  decimalNumber?: number
}
/** TsesDelegateOrderNodeVo */
export interface TsesDelegateOrderNodeVo {
  /**
   * 委外数量
   * @format bigdecimal
   */
  amount?: number
  /** 创建人ID */
  createBy?: string
  /**
   * 创建时间
   * @format date-time
   */
  createTime?: string
  /** 委外订单ID */
  delegateOrderId?: string
  /** ID */
  id?: string
  /** 工序ID */
  nodeId?: string
  /** 产品模型 */
  productModelId?: string
  /** 单位 */
  unitId?: string
  /** 更新人ID */
  updateBy?: string
  /**
   * 更新时间
   * @format date-time
   */
  updateTime?: string
}

/**
 * LogisticsDelegateInspectionRecordVo
 * 委外检验记录VO
 */
export interface LogisticsDelegateInspectionRecordVo {
  /** 产品名称 */
  productName: string
  /**
   * 数量
   * @format bigdecimal
   */
  quantity: number
  /** 结果 0-结果未出 1-通过 2-不通过 */
  result: number
  /**
   * 样本数
   * @format bigdecimal
   */
  sampleNumber: number
  /**
   * 状态 0-未开始 1-进行中 2-已完结
   * @format int32
   */
  status: number
  /** 任务单号 */
  taskNo: string
  /**
   * 检验类型 8-委外入库检
   * @format int32
   */
  type: number
  /** 单位 */
  unitName: string
}

//委外订单-入库记录
export interface IDelegateOrderinboundItem {
  barcode: string
  barcodeId: string
  decimalNumber: number
  facilityId: string
  facilityName: string
  inboundCode: string
  inboundDetailCode: string
  inboundTime: string
  locationId: string
  locationName: string
  productModelCode: string
  productModelId: string
  productModelName: string
  quantity: number
  unitId: string
  unitName: string
}
//委外订单-出库记录
export interface IDelegateOrderoutboundItem {
  ecimalNumber: number
  facilityId: string
  facilityName: string
  locationId: string
  locationName: string
  outboundCode: string
  outboundId: string
  outboundTime: string
  productModelCode: string
  productModelId: string
  productModelName: string
  quantity: number
  unitId: string
  unitName: string
}
//委外订单-物料清单列表
export interface IDelegateOrderMaterialItem {
  amount: number //数量	number($bigdecimal)
  couldReturnAmount: number //可退料数量	number($bigdecimal)
  createBy: string //创建人ID	string
  createTime: string //创建时间	string($date-time)
  decimalNumber: number //小数位数	integer
  defaultStorageId: string //默认仓库ID	string
  defaultWarehouseName: string //默认仓库名称	string
  delegateOrderId: string //委外订单ID	string
  deliveryAmount: number //出库数量	number($bigdecimal)
  exceedAmount: number //超领数量	number($bigdecimal)
  id: string //ID	string
  nodeMaterialIds: string[] //物料来源工序	string
  pickAmount: number //领料数量	number($bigdecimal)
  productModelCode: string //产品编号	string
  productModelId: string //委外产品模型	string
  productModelName: string //产品名称	string
  returnAmount: number //退料数量	number($bigdecimal)
  unitId: string //单位ID	string
  unitName: string //单位名称	string
  updateBy: string //更新人ID	string
  updateTime: string //更新时间	string($date-time)
}

export interface IDelegateOrderMaterialItem {
  amount: number //数量	number($bigdecimal)
  createBy: string //创建人ID	string
  createTime: string //创建时间	string($date-time)
  deciamlNumber: number //小数位数	integer
  defaultStorageId: string //默认仓库ID	string
  defaultWarehouseName: string //默认仓库名称	string
  delegateOrderId: string //委外订单ID	string
  exceedAmount: number //超领数量	number($bigdecimal)
  id: string //ID	string
  nodeMaterialIds: string[] //物料来源工序	string
  pickAMount: string //领料数量
  productModelCode: string //产品编号	string
  productModelId: string //委外产品模型	string
  productModelName: string //产品名称	string
  returnAmount: string //退料数量
  unitId: string //单位ID	string
  unitName: string //单位名称	string
  updateBy: string //更新人ID	string
  updateTime: string //更新时间	string($date-time)
}

//委外退料单VO
export interface IDelegateReturnVo {
  archiveEmpId: string //结案人员ID
  archiveTime: string //结案时间	string($date-time)
  checkEmpId: string //复核人员ID	string
  checkTime: string //复核时间	string($date-time)
  createBy: string //创建人ID	string
  createTime: string //创建时间	string($date-time)
  detailVoList: {
    couldReturnAmount: number //可退料数量	number($bigdecimal)
    createBy: string //创建人ID	string
    createTime: string //创建时间	string($date-time)
    delegateMaterialId: string //委外订单-物料清单ID	string
    id: string //ID	string
    inboundAmount: number //入库数量	number($bigdecimal)
    productModelCode: string //物料编号	string
    productModelId: string //产品模型ID	string
    productModelName: string //物料名称	string
    returnAmount: number //退料数量	number($bigdecimal)
    returnId: string //委外退料ID	string
    unitId: string //单位ID	string
    unitName: string //单位名称	string
    updateBy: string //更新人ID	string
    updateTime: string //更新时间	string($date-time)
  }[] //退料明细	array
  id: string //ID	string
  no: string //委外退料单号	string
  returnDate: string //计划退料日期	string($date)
  source: number //来源 1MES 2ERP， 默认1	integer($int32)
  status: number //状态 5未复核 6未收货 7进行中 10结案	integer($int32)
  supplierId: string //供应商ID	string
  supplierCode: string //供应商编号	string
  supplierName: string //供应商名称	string
  updateBy: string //更新人ID	string
  updateTime: string //更新时间	string($date-time)
}

export interface IDelegateMaterialReturnAddItem {
  couldReturnAmount: number //可退料数量	number($bigdecimal)
  createBy: string //创建人ID	string
  createTime: string //创建时间	string($date-time)
  delegateOrderId?: string //委外订单ID	string
  delegateOrderMaterialId?: string //委外订单-物料清单ID	string
  id: string //ID	string
  inboundAmount: number //入库数量	number($bigdecimal)
  productModelCode: string //物料编号	string
  productModelId: string //产品模型ID	string
  productModelName: string //物料名称	string
  returnAmount: number | undefined //退料数量	number($bigdecimal)
  returnId: string //委外退料ID	string
  unitId: string //单位ID	string
  unitName: string //单位名称	string
  updateBy: string //更新人ID	string
  updateTime: string //更新时间	string($date-time)
}
//委外退料单新增、编辑
export interface IDelegateReturnAddInter {
  detailVoList: IDelegateMaterialReturnAddItem[] //退料明细	array
  id: string //ID	string
  no: string //委外退料单号	string
  returnDate: string //计划退料日期	string($date)
  supplierId: string
}
//委外退料单检验记录
export interface IDelegateReturnInpsectionRecordVo {
  decimalNumber: humber
  productModelCode: string
  productModelName: string
  quantity: number
  result: string
  sampleNumber: number
  status: number
  taskNo: string
  type: number
  unitId: string
  unitName: string
}

//委外退料-物料清单列表
export interface IDelegateReturnMaterialVo {
  amount: number
  coundReturnAmount: number
  createBy: string
  createTime: string
  delegateMaterialId: string
  id: string
  inboundAmount: number
  productModelCode: string
  productModelId: string
  productModelName: string
  returnAmount: number
  returnId: string
  unitId: string
  unitName: string
  updateBy: string
  updateTime: string
  deliveryAmount: number
  decimalNumber?: number
}

//委外退料单收货记录
export interface IDelegateReturnReceiveRecordVo {
  code: string
  productModelCode: string
  productModelId: string
  productModelName: string
  receiveAmount: number
  receiveEmpId: string
  receiveTime: string
  unitId: string
  unitName: string
}
//委外退料单入库记录
export interface IDelegateReturnStorageVo {
  barcode: string
  barcodeId: string
  decimalNumber: number
  facilityId: string
  facilityName: string
  inboundDetailCode: string
  inboundTime: string
  locationId: string
  locationName: string
  productModelCode: string
  productModelId: string
  productModelName: string
  quantity: number
  unitId: string
  unitName: string
}

export interface ISerialLinkParams {
  nodeIdList: string[]
  processId: string
}

export interface IDelegateOrderPageParams
  extends IRequestPageParams<
    Partial<{
      delegateType: number
      endDate: string
      no: string
      productModelName: string
      productModelNo: string
      startDate: string
      status: number | string
      statues: number[]
      supplierId: string
      pickStatus: number // 发料状态 0-未发料 1-已发料
    }>
  > {}

export type IDelegateReturnPageListParams = IRequestPageParams<
  Partial<{
    no: string
    source: number //来源 1-mes 2-erp
    status: number //5未复核 6未收货 7进行中 10结案
    statusList: number[]
    supplierId: string //供应商id
  }>
>
