import type { IPrintTemplateListItem } from "@/types/base-info/print-template"
import type { IRequestPageParams } from "@/types/common"

export interface IDeliveryPlanPageListItem {
  crateTime: string // 创建时间
  customerCode: string // 客户编号
  customerId: string // 客户ID
  customerName: string // 客户名称
  dataSource: number // 来源 1MES 2ERP
  deliveryCode: string // 计划单号
  deliveryContent: string // 发货内容
  deliveryStatus: number // 状态 5未复核 1未开始 6进行中 9已结案
  deliveryTime: string // 发货日期
  detailVOList: {
    // 发货内容列表
    completeAmount: number // 已排产数
    decimalNumber: number // 保留小数点位数
    deliveryQty: number // 发货数量
    inspectionCode: string // 检验单号
    inspectionId: string // 检验ID
    inspectionResult: number // 检验结果(0-结果未出 1-通过 2-不通过)
    isDeliveryInspection: boolean // 是否发货检验
    outboundQty: number // 出库数量
    planAmount: number // 计划总数
    productCategoryCode: string // 产品类别编号
    productCategoryId: string // 产品类别ID
    productCategoryName: string // 产品类别名称
    productModelCode: string // 产品编号
    productModelId: string // 产品模型ID
    productModelName: string // 产品名称
    remainAmount: number // 可排产数
    specifiedOutboundWarehouseId: string // 指定发货出库仓库ID
    specifiedOutboundWarehouseName: string // 指定发货出库仓库名字
    unitId: string // 单位ID
    unitName: string // 单位名称
  }[]
  facilityCode: string // 仓库编号
  facilityId: string // 仓库ID
  facilityName: string // 仓库名称
  id: string // 发货计划id
  saleCode: string // 销售单号
  saleId: string // 销售任务ID
  statementTime: string // 结单时间
  techVersionId: string // 工艺版本ID
  remarks: string // 备注
  isPack: boolean // 是否开启包装
}

export interface IDeliveryPlanPageListParams
  extends IRequestPageParams<
    Partial<{
      customerId: string // 客户ID
      dataSource: number // 来源 1MES 2ERP
      deliveryCode: string // 计划单号
      deliveryStatus: number // 状态 0未结 1已结
      deliveryStatusList: number[] // 状态列表
      deliveryTimeEnd: string // 发货日期范围-结束
      deliveryTimeStart: string // 发货日期范围-开始
      productModelName: string // 产品名称
      facilityId: string // 仓库ID
      saleCode: string // 销售单号
      isPack: boolean // 开启包装
    }>
  > {}

export interface ISaleOrderListByNotPlanDeliveryParams {
  pageNum: number
  pageSize: number
  customerId?: string
  saleCode?: string
  saleStatus?: string
}

export interface ISaleOrderListItemByNotPlanDelivery {
  createTime: string // 创建时间
  customerCode: string // 客户编号
  customerId: string // 客户ID
  customerName: string // 客户名称
  id: string // 销售单ID
  saleCode: string // 销售单号
  saleContent: string // 销售内容
  saleStatus: number // 状态 0未发货 1进行中 2已完成
}

export interface IDeliveryDetailItem {
  attachmentFileId: string // 附件id
  attachmentFileName: string // 附件名称
  createTime: string // 创建时间
  customerCode: string // 客户编号
  customerId: string // 客户ID
  customerName: string // 客户名称
  dataSource: number // 来源 1MES 2ERP
  deliveryCode: string // 计划单号
  deliveryStatus: number // 状态 5未复核 1未开始 6进行中 9已结案
  deliveryTime: string // 发货日期
  facilityCode: string // 仓库编号
  facilityId: string // 仓库ID
  facilityName: string // 仓库名称
  id: string // 发货计划id
  isPack: boolean // 是否开启包装
  remarks: string // 备注
  saleCode: string // 销售单号
  saleId: string // 销售订单ID
  statementTime: string // 结单时间
  techVersionId: string // 工艺版本ID
}

export interface IDeliveryPlanPackageSpecItem {
  allowMixed: boolean // 是否允许混装
  containerType: string // 容器类型
  containerTypeName: string // 容器名称
  id: string // 规范ID
  no: string // 规范编号
  packSpecProductVoList: {
    decimalNumber: number // 保留小数点位数
    drawingNumber: string // 图号
    packQty: number // 封装数量
    productModelCode: string // 产品编号
    productModelId: string // 产品模型ID
    productModelName: string // 产品名称
    unitId: string // 单位ID
    unitName: string // 单位
  }[]
  remark: string // 备注说明
  specName: string // 包装规范名称
  status: string // 状态 enable/disable
  templateDto: IPrintTemplateListItem // 打印模板
  transportType: string // 运输方式
}

export interface IDeliveryPlanProductRecordItem {
  decimalNumber: number // 保留小数点位数
  deliveryQty: number // 已发货数量
  packQty: number // 已包装数量
  planQty: number // 本次计划发货数量
  productModelCode: string // 产品编号
  productModelId: string // 产品模型ID
  productModelName: string // 产品名称
  productionQty: number // 已排产数量
  unitId: string // 单位ID
  unitName: string // 单位名称
  specifiedOutboundWarehouseId: string // 指定发货出库仓库ID
  specifiedOutboundWarehouseName: string // 指定发货出库仓库名字
}

export interface IDeliveryPlanMaterialOutRecordItem {
  barCode: string // 标签码
  barCodeId: string // 标签码id
  decimalNumber: number // 保留小数点位数
  facilityId: string // 仓库id
  facilityName: string // 仓库名称
  locationId: string // 库位id
  locationName: string // 库位名称
  outboundCode: string // 出库编号
  outboundId: string // 出库任务ID
  outboundTime: string // 出库时间(yyyy-MM-dd HH:mm:ss)
  productId: string // 产品实例ID
  productModelCode: string // 产品编号
  productModelId: string // 产品模型ID
  productModelName: string // 产品名称
  quantity: number // 数量
  unitId: string // 单位ID
  unitName: string // 单位
}

export interface IDeliveryPlanPackageRecordItem {
  barcode: string // 标签码
  bindProducts: {
    barcode: string // 标签码
    barcodeId: string // 标签码id
    batchId: string // 批次ID
    batchNo: string // 批次号
    decimalNumber: number // 保留小数点位数
    defaultQuantity: number // 默认单位对应数量
    defaultUnitId: string // 默认单位ID
    defaultUnitName: string // 默认单位名字
    drawingNumber: string // 产品图号
    productId: string // 产品实例ID
    productModelCode: string // 产品模型编码
    productModelId: string // 产品模型ID
    productModelName: string // 产品模型名字
  }[] // 装载的产品
  childContainers: IDeliveryPlanPackageRecordItem[]
  containerType: string // 容器类型
  id: string //包装容器ID
  packTime: string // 包装时间
}

export interface IDeliveryPlanDeliveryRecordItem {
  decimalNumber: number // 保留小数点位数
  deliveryCode: string // 发货单号
  deliveryQty: number // 发货数量
  deliveryTime: string // 发货时间
  facilityId: string // 仓库id
  facilityName: string // 仓库名称
  id: string // 出库任务ID
  locationId: string // 库位id
  locationName: string // 库位名称
  productModelCode: string // 产品编号
  productModelId: string // 产品模型ID
  productModelName: string // 产品名称
  unitId: string // 单位ID
  unitName: string // 单位
}

export interface IDeliveryPlanPackageProductItem {
  decimalNumber: number // 保留小数点位数
  deliveryQty: number // 已发货数量
  pickMaterial: number // 排产后联动领料(0否 1是)
  id: string // 工艺--料主键ID
  inventoryQty: number // 库存数量
  pickMaterial: number // 排产后联动领料(0否 1是)
  plannedDeliveryQty: number // 已计划发货数量
  productModelCode: string // 产品模型编号
  productModelId: string // 产品模型ID
  saleDetailId: string // 销售单明细ID
  productModelName: string // 产品模型名称
  drawingNumber: string // 产品图号
  saleQty: number // 销售单数量
  unitCode: string // 单位编码
  unitId: string // 单位ID
  unitName: string // 单位名称
  specifiedOutboundWarehouseId: string // 指定发货出库仓库ID
}

export interface IDeliveryPlanPackageProductSaveParams {
  techVersionId: string // 工艺版本ID
  productList: Partial<{
    decimalNumber: number // 保留小数点位数
    deliveryQty: number // 本次发货数量
    id: string // 工艺--料主键ID
    inventoryQty: number // 库存数量
    pickMaterial: number // 排产后联动领料(0否 1是)
    plannedDeliveryQty: number // 已计划发货数量
    productModelCode: string // 产品模型编号
    productModelId: string // 产品模型ID
    productModelName: string // 产品模型名称
    saleQty: number // 销售单数量
    unitCode: string // 单位编码
    unitId: string // 单位ID
    unitName: string // 单位名称
  }>[]
}

export interface IDeliveryPlanCopyPackageProcessParams {
  saleId: string // 销售订单ID
  techVersionId: string // 工艺版本ID
  oldTechVersionId: string // 原工艺版本ID
}

export interface ISaleOrderProductPageListParams
  extends IRequestPageParams<
    Partial<{
      filterSystemProcessProduct: boolean // 是否过滤掉系统过程产物，默认过滤
      hasInventory: boolean // 是否有库存
      productCategoryName: string // 产品类别名称
      productModelCode: string // 产品编号
      productModelName: string // 产品名称
      saleId: string // 销售订单ID
    }>
  > {}

export interface ISaleOrderProductListItem {
  id: string
  decimalNumber: number // 保留小数点位数
  pickMaterial: number // 排产后联动领料(0否 1是)
  inventoryQuantity: number // 库存总数
  productCategoryCode: string // 产品类别编号
  productCategoryId: string // 产品类别ID
  productCategoryName: string // 产品类别名称
  productModelCode: string // 产品编号
  productModelId: string // 产品模型ID
  productModelName: string // 产品名称
  productType: number // 产品类型
  remark: string // 备注
  saleDetailId: string // 销售单明细ID
  unitId: string // 单位ID
  unitName: string // 单位名称
}

export interface IDeliveryPlanSaveParams
  extends Partial<{
    attachmentFileId: string // 附件id
    customerId: string // 客户ID
    deliveryCode: string // 发货单号
    deliveryTime: string // 发货日期
    facilityId: string // 仓库ID
    id: string // 发货计划id 编辑时传
    isPack: boolean // 开启包装
    productList: Partial<{
      decimalNumber: number // 保留小数点位数
      deliveryQty: number // 本次发货数量
      id: string // 工艺--料主键ID
      inventoryQty: number // 库存数量
      pickMaterial: number // 排产后联动领料(0否 1是)
      plannedDeliveryQty: number // 已计划发货数量
      productModelCode: string // 产品模型编号
      productModelId: string // 产品模型ID
      productModelName: string // 产品模型名称
      saleQty: number // 销售单数量
      unitCode: string // 单位编码
      unitId: string // 单位ID
      unitName: string // 单位名称
    }>[]
    remarks: string // 备注
    saleId: string // 销售订单ID
    techVersionId: string // 工艺版本ID 开启包装时传
  }> {}

export interface IProcessInfo {
  id: string // 工艺ID
  status: number // 工艺版本状态 1.设计中 2.已发布 3.已作废，默认为1-设计中
  tips: boolean // 是否需要提示
}
