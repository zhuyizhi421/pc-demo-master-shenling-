/** 销售订单 */

export interface ISaleOrderDetail {
  attachmentFile: {
    createBy: string // 创建人ID
    createTime: string // 创建时间
    deploymentId: string // 文档id
    directoryName: string // 文档类型
    extension: string // 文档后缀
    fileName: string // 文件名
    fileSize: string // 文件大小
    fileStatus: number // 文件的状态, 0修订中，1正常，2审核中
    hash: string // 文件hash值
    id: string // ID
    path: string // 文件路径
    size: string // 文件大小
    sourceName: string // 文件原名
    updateBy: string // 更新人ID
    updateTime: string // 更新时间
  }
  attachmentFileId: string // 附件id
  createTime: string // 创建时间
  customerCode: string // 客户编号
  customerId: string // 客户ID
  customerName: string // 客户名称
  customizedFields: any[] // 自定义字段
  dataSource: number // 来源 1MES 2ERP
  details: ISaleOrderDetail[] // 明细
  id: string // ID
  planDeliveryTime: string // 计划交货日期
  priority: number // 优先级 10=低 20=中 30=高
  remarks: string // 备注
  saleCode: string // 销售单号
  saleContent: string // 销售内容
  saleStatus: number // 状态 0未发货 1进行中 2已完成
  statementTime: string // 结单时间
}

export interface ISaleOrderDetail {
  decimalNumber: number // 保留小数点位数
  deliveryQty: number // 已发货数量
  id: string // ID
  planDeliveryQty: number // 已计划发货数量
  productModelCode: string // 产品编号
  productModelId: string // 产品模型ID
  productModelName: string // 产品名称
  productModelUnitList: {
    conversionFactor: number // 单位换算因子
    createBy: string // 创建人ID
    createTime: string // 创建时间
    id: string // ID
    isDefaultUnit: number // 是否是默认单位(0-否,1-是)
    productModelId: string // 产品模型ID(外键)
    unitCode: string // 单位编号(冗余)
    unitId: string // 单位ID(外键)
    unitName: string // 单位名字(冗余)
    updateBy: string // 更新人ID
    updateTime: string // 更新时间
  }[] // 产品单位列表
  quantity: number // 销售数量
  saleId: string // 销售任务ID
  specifiedOutboundWarehouseId: string // 指定发货出库仓库ID
  specifiedOutboundWarehouseName: string // 指定发货出库仓库名称
  unitId: string // 单位ID
  unitName: string // 单位
}

export interface ISettleDeliveryPlan {
  createTime: string // 创建时间
  customerCode: string // 客户编号
  customerId: string // 客户ID
  customerName: string // 客户名称
  dataSource: number // 来源 1MES 2ERP
  deliveryCode: string // 计划单号
  deliveryStatus: number // 状态 0未结 1已结
  deliveryTime: string // 发货日期
  facilityCode: string // 仓库编号
  facilityId: string // 仓库ID
  facilityName: string // 仓库名称
  id: string // 发货计划id
  saleCode: string // 销售单号
  saleId: string // 销售订单ID
  statementTime: string // 结单时间
}

export interface ISaleOrderPageListParams
  extends IRequestPageParams<{
    createTimeEnd: string // 创建时间范围-结束
    createTimeStart: string // 创建时间范围-开始
    customerId: string // 客户ID
    productModelName: string // 产品名称
    productModelNo: string // 产品编号
    saleCode: string // 销售单号
    saleStatus: number //  状态 0未发货 1进行中 2已完成
    saleStatusList: number[] // 状态列表
  }> {}

export interface ISaleOrderPageListItem {
  attachmentFile: {
    createBy: string // 创建人ID
    createTime: string // 创建时间
    deploymentId: string // 文档id
    directoryName: string // 文档类型
    extension: string // 文档后缀
    fileName: string // 文件名
    fileSize: string // 文件大小
    fileStatus: number // 文件的状态, 0修订中，1正常，2审核中
    hash: string // 文件hash值
    id: string // ID
    path: string // 文件路径
    size: string // 文件大小
    sourceName: string // 文件原名
    updateBy: string // 更新人ID
    updateTime: string // 更新时间
  }
  attachmentFileId: string // 附件id
  createTime: string // 创建时间
  customerAbbr: string // 客户简称
  customerCode: string // 客户编号
  customerId: string // 客户ID
  customerName: string // 客户名称
  dataSource: number // 来源 1MES 2ERP
  id: string // ID
  planDeliveryTime: string // 计划交货日期
  priority: number // 优先级 10=低 20=中 30=高
  remarks: string // 备注
  saleCode: string // 销售单号
  saleContent: string // 销售内容
  saleStatus: number // 状态 0未发货 1进行中 2已完成
  statementTime: string //
  saleDetailVOList: {
    decimalNumber: number // 保留小数点位数
    deliveryQty: number // 已发货数量
    id: string // ID
    planDeliveryQty: number // 已计划发货数量
    productModelCode: string // 产品编号
    productModelId: string // 产品模型ID
    productModelName: string // 产品名称
    productModelUnitList: {
      conversionFactor: number // 单位换算因子
      createBy: string // 创建人ID
      createTime: string // 创建时间
      id: string // ID
      isDefaultUnit: number // 是否是默认单位(0-否,1-是)
      productModelId: string // 产品模型ID(外键)
      unitCode: string // 单位编号(冗余)
      unitId: string // 单位ID(外键)
      unitName: string // 单位名字(冗余)
      updateBy: string // 更新人ID
      updateTime: string // 更新时间
    }[] // 产品单位列表
    quantity: number // 销售数量
    saleId: string // 销售任务ID
    specifiedOutboundWarehouseId: string // 指定发货出库仓库ID
    specifiedOutboundWarehouseName: string // 指定发货出库仓库名称
    unitId: string // 单位ID
    unitName: string // 单位
  }[]
}

export interface IDynamicSaleOrderPageListParams
  extends IRequestDynamicPageParams<Record<string, any>> {}

export interface ISaleOrderCreateParams {
  details: {
    id?: string // 非必须字段：ID，格式为 int64
    productModelId?: string // 非必须字段：产品模型ID，格式为 int64
    productModelCode?: string // 非必须字段：产品模型编码
    productName?: string // 非必须字段：产品名称
    quantity?: number // 非必须字段：数量，格式为 bigdecimal
    unitId?: string // 非必须字段：单位ID，格式为 int64
    specifiedOutboundWarehouseId?: string
    planDeliveryTime: string // 计划交货日期
  }[]
  customerId?: string
  saleCode?: string
  planDeliveryTime?: string
  priority?: string
  remarks?: string
  attachmentFileId?: string
}
