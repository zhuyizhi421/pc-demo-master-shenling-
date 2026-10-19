/** 物流管理-领料计划-领料计划 */
import type { IProductModelListItem } from "@/api/product"
import type { IRequestPageParams } from "@/types/common"

export interface IPreparationMaterialPageReq {
  pageQuery: {
    pageNum: number
    pageSize: number
  }
  queryParam: {
    createTimeEnd?: string
    createTimeStart?: string
    delegateOrderNo?: string // 委外订单编号
    planNo?: string // 计划单号
    productionOrderNo?: string // 生产订单编号
    productionTaskNo?: string // 生产任务编号
    deliveryTaskNo?: string // 发货计划单号
    packTaskNo?: string // 包装任务号
    relatedNo?: string // 关联单号
    status?: number
    statusList?: number[]
    useForList?: number[] // 领料用途
    productName?: string // 产品名称
    productNo?: string // 产品编号
    planPickTimeStart?: string // 计划领取开始时间
    planPickTimeEnd?: string // 计划领取结束时间
  }
  sort?: {
    field: string
    order: string
  }[]
}

export interface IPreparationMaterialPlanContent {
  amount: number // 计划领取数量
  preparedAmount: number // 已领取数量
  decimalNumber?: number // 小数位数
  id: string // 备货明细ID
  productCode: string // 产品编号
  productName: string // 产品名称
  unit: string // 单位
}

export interface IPreparationMaterialItem {
  id: string
  no: string // 领料计划单号
  planContent: IPreparationMaterialPlanContent[] // 计划内容
  planTime: string // 计划领取时间
  sourceNo: string // 来源单号
  status: number // 状态 1=未复核 2=已复核 10=已结案
  storageId: string // 仓库ID
  type: number // 类型 1=正常 2=超领
  useFor: number // 领料用途 1=生产 2=委外
  warehouseName: string // 仓库
}

export interface IPreparationTaskItem extends IPreparationMaterialItem {
  createTime: string // 创建时间
  createByName: string
  planNo: string // 领料计划单号
}

/** 复核时查询 */
export interface IPreparationMaterialAuditItem {
  preparationDetailId: string
  productModelId: string
  productModelName: string
  productModelCode: string
  defaultStorageId?: string
}

export interface IPreparationMaterialCreateReq {
  id?: string
  no?: string // 领料计划单号(为空自动生成)
  planTime: string // 计划领取时间
  productList: {
    prepareQuantity: number // 领料数量
    productModelId: string // 产品型号ID
    unitId: string // 单位ID
    replaceList: {
      decimalNumber: number
      originalQuantity: number
      originalRatio: number
      productModelCode: string
      productModelId: string
      productModelName: string
      quantity: number
      replaceRatio: number
      unitId: string
      unitName: string
    }[]
  }[] // 计划内容
  remarks?: string // 备注
  sourceNo: string // 来源单号
  type: number // 类型 1=正常 2=超领
  useFor: number // 领料用途 1=生产 2=委外
}

export interface IPreparationMaterialReq {
  orderId?: string // 来源订单id
  orderNo?: string // 来源订单号
  showProcessProduct: boolean // 是否展示过程产物
  taskId?: string // 生产任务id
  taskNo?: string // 生产任务号
  useFor: number // 领料用途 1=生产 2=委外
  warehouseId: string // 仓库id
}

export interface IPreparationMaterialReplaceItem {
  decimalNumber: number // 小数位数
  originalQuantity: number // 换算成原料的数量
  originalRatio: number // 原料比例
  productModelCode: string // 产品模型编号,替换者
  productModelId: string // 产品模型id,替换者
  productModelName: string // 产品模型名称,替换者
  quantity: number // 实际物料需求数量
  replaceRatio: number // 替换料比例
  unitId: string // 替换料单位ID
  unitName: string // 替换料单位名称
}

export interface IPreparationMaterialRes {
  backAmount: number // 退料数量
  decimalNumber: number // 小数位数
  defaultStorageId: string // 默认仓库ID
  defaultWarehouseName: string // 默认仓库名称
  needAmount: number // 需求数量
  overPickRate: number // 超领比例
  pickedAmount: number // 已领数量
  planPickedAmount: number // 计划已领数量
  productModelCode: string // 产品编号
  productModelId: string // 产品模型ID
  productModelName: string // 产品名称
  stockNumber: number // 在库数量
  unPickAmount: number // 待领数量
  unitId: string // 单位Id
  unitName: string // 单位名称
  defaultPrepare: boolean // 是否默认领料
  planAmount: number // 计划领料数量
  replaceList: IPreparationMaterialReplaceItem[]
}

export type ISelectMaterialModel = Partial<IProductModelListItem> & IPreparationMaterialRes

export interface IPreparationMaterialDetail {
  no: string // 领料计划单号
  planStartTime: string // 计划开始时间
  planTime: string // 计划领取时间
  remarks: string // 备注
  sourceNo: string // 来源单号
  sourceStatus: number // 来源单状态
  status: number // 状态 1=未复核 2=已复核 10=已结案
  storageId: string // 仓库ID
  type: number // 类型 1=正常 2=超领
  useFor: number // 领料用途 1=生产 2=委外
  warehouseName: string // 仓库
  itemList: IPreparationMaterialRes[]
}

export interface IPreparationMaterialTaskPageListParams
  extends IRequestPageParams<{
    createTimeStart?: string
    createTimeEnd?: string
    productName?: string
    statusList?: number[]
    useForList?: number[]
    type?: number
    no?: string
    planNo?: string
  }> {}

export interface IPreparationTaskDetailProduct {
  decimalNumber: number // 精度
  pickedQuantity: number // 已领取数量
  productDetailList: {
    barcode: string // 产品标签码
    decimalNumber: number // 精度
    outboundTime: string // 领料出库时间
    productModelName: string // 产品名称
    quantity: number // 产品数量
    unitId: string // 单位ID
    unitName: string // 单位（如：个、件、kg）
  }[]
  productModelCode: string // 产品编号
  productModelName: string // 产品名称
  unitName: string // 单位名称
}
