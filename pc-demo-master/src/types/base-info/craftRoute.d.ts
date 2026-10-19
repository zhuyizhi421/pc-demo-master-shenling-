/** 工艺路线 */

import type { IPagedAPIParams } from "@/api/type"
import { EnumBarcodeDefaultRelevanceMode, EnumParentCraftType } from "@/constant/enums"
import type { IProductionOrderItem } from "@/types/production-manage/product-order"

export interface ITechVersionProps {
  techVersionId: string
  status: number
  type: number
  bizType: number
  defaultCodeRelationType?: EnumBarcodeDefaultRelevanceMode
  processId?: string // 当前选中的工序ID
}

export interface ICraftRoutePageCrumbsItem {
  label: string
  value: number
  data?: {
    craftRouteId: string
    techVersionId: string
    craftType: EnumParentCraftType
    isOrderCraft?: boolean // 订单工艺配置标识
    orderInfo?: IProductionOrderItem // 生产订单信息
    routePurpose?: "standard" | "rework-template"
  }
}

export interface ICraftPageCrumbsData {
  craftRouteId: string
  techVersionId: string
  craftType: EnumParentCraftType
  isOrderCraft?: boolean // 订单工艺配置标识
  orderInfo?: IProductionOrderItem // 生产订单信息
  routePurpose?: "standard" | "rework-template"
}

export type ICraftItem = {
  createBy: string
  createTime: string
  craftTypeId?: string
  craftTypeName?: string
  craftTypeNo?: string
  id: string
  name: string
  no: string
  remarks: string
  status: number
  techDetail: any
  techDetailId: string
  updateBy: string
  updateTime: string
  versions: number
}

export interface ICraftConfigInfo extends ICraftRouteItem {
  isCraftGroup?: boolean
  isCraftAnd?: boolean
}

// #region 工艺路线
export interface ICraftRouteItem {
  createBy: string
  createTime: string
  id: string
  techVersionId: string
  name: string
  no: string
  productModel: ProductModel
  remarks: string
  status: number // 0.停用，1.启用
  publishStatus: number // 1.设计中 2.已发布 3.已作废
  routePurpose?: "standard" | "rework-template"
  sourceType: number
  tech: {
    createBy: number
    createTime: string
    id: string
    name: string
    no: string
    remarks: string
    status: number
    techDetailId: number
    techType: number
    updateBy: number
    updateTime: string
    versions: number
  }
  techDetail: {
    createBy: number
    createTime: string
    enableProductModelIds: number[]
    id: number
    nodeCount: number
    updateBy: number
    updateTime: string
  }
  techVersion: {
    createBy: number
    createTime: string
    id: string
    name: string
    nature: number
    no: string
    queryProductName: string
    queryProductNo: string
    remarks: string
    sourceType: number
    status: number
    techDetailId: number
    techId: number
    techNo: string
    type: number
    bizType: number
    updateBy: number
    updateTime: string
    validityEnd: string
    validityStart: string
    version: string
  }
  unitItem: {
    createBy: number
    createTime: string
    decimalNumber: number
    id: string
    remarks: string
    unitCode: string
    unitName: string
    updateBy: number
    updateTime: string
  }
  updateBy: string
  updateTime: string
}

export type ICraftRouteParams = IPagedAPIParams<
  Partial<{
    queryProductName: string
    queryProductNo: string
    exactProductNo: string
    sourceType: number // 1MES, 2ERP
    publishStatusList: number[]
    publishStatus: number // 1.设计中 2.已发布 3.已作废
    version: string
    startDate: string
    endDate: string
    techProcessNo: string
    routePurpose: "standard" | "rework-template"
  }>
>

export type ICraftTechPageParams = IPagedAPIParams<{
  craftTypeId?: string
  craftTypeName?: string
  name?: string
  no?: string
}>

export interface IProduceBasicMachineCraftItem {
  createBy: string
  createTime: string
  detectMethod: string
  desc: string
  files: {
    fileId: string
    fileName?: string
    fileUrl: string
    selected?: boolean
  }[]
  id: string
  inspectItemCode: string
  inspectItemName: string
  inspectionStandard: {
    standardDesc: string
    standardMax: number | null
    standardMaxInclusive: number
    standardMin: number | null
    standardMinInclusive: number
    standardType: number
    quantitativeMode?: "lower" | "upper" | "range"
    standardValue?: number | null
    upperTolerance?: number | null
    lowerTolerance?: number | null
    upperToleranceSign?: "+" | "-"
    lowerToleranceSign?: "+" | "-"
    unitId: string
    unitName: string
  }
  key: string
  monitor: number
  refId: string
  sort?: number
  techDetailId: string
  techStandardMachineId: string
  updateBy: string
  updateTime: string
  val: string
}

export interface IAllCraftListParams
  extends Partial<{
    name: string
    no: string
  }> {}
