import axios from "axios"

import type {
  InspectItemDetailParams,
  IProductCateItem,
  IProductCateParams,
  IProductInspectDetailCreateParams,
  IProductInspectListItem,
  IProductInspectListParams,
  IProductModelDocListItem,
  IProductModelItem,
  IProductModelParams,
  IProductTypeItem
} from "@/types/base-info/product"
import type { ICreateUnitParams } from "@/types/base-info/unit"
import type { IListPageResult } from "@/types/common"

import type { ProductModelUnit } from "./craft"
import type { IRes } from "./interceptor"

export interface IProductInstItem {
  barcode: string
  barcodeId: number
  defaultUnitId: number
  id: number
  locationBizId: number
  locationType: number
  productCategoryName: string
  productLocationInfo: {
    bizId: number
    facilityId: number
    facilityName: string
    locationId: number
    locationName: string
  }
  productModelCode: string
  productModelId: number
  productModelName: string
  productQuantities: {
    createBy: number
    createTime: string
    id: number
    productId: number
    quantity: number
    unitId: number
    unitName: string
    updateBy: number
    updateTime: string
  }[]
  productType: number
}

export interface ProductCategoryTreeRes {
  children: ProductCategoryTreeRes[]
  code: string
  id: string
  name: string
  parentId: string
  status: number
}

export async function getCategoryTree() {
  const res = await axios.get<IRes<ProductCategoryTreeRes[]>>("/product/category/getCategoryTree")
  return res.data.data
}

export async function getProductCatePaged(params: IProductCateParams) {
  const res = await axios.get<IRes<IListPageResult<IProductCateItem>>>(
    "/product/category/getPaged",
    { params }
  )
  return res.data.data
}

export async function ableProductCate(params: { productCategoryld: string; newStatus: number }) {
  const res = await axios.put<IRes>(
    `/product/category/changeStatus?productCategoryId=${params.productCategoryld}&newStatus=${params.newStatus}`
  )
  return res.data.data
}

/** 查询产品类型 */
export const queryProductTypeList = async () => {
  const res = await axios.get<IRes<IProductTypeItem[]>>("/sys/product/config/list")
  return res.data.data
}

export async function createProductCate(params: {
  name: string
  parentId: string
  remark: string
  code?: string
  docIds?: string[]
}) {
  const res = await axios.post<IRes>("/product/category/create", params)
  return res.data.data
}

export async function updateProductCate(params: {
  id: string
  name: string
  parentId: string
  remark: string
  docIds?: string[]
}) {
  const res = await axios.put<IRes>("/product/category/update", params)
  return res.data.data
}

export async function deleteProductCate(id: string) {
  const res = await axios.delete<IRes>("/product/category/deleteById", {
    params: { productCategoryId: id }
  })
  return res.data.data
}

export interface IProductModelListItem {
  code: string
  createBy: number
  createTime: string
  id: string
  name: string
  defaultUnitId: string
  defaultUnitName: string
  productCategoryCode: string
  productCategoryId: string
  productCategoryName: string
  productModelUnitList: ProductModelUnit[]
  productType: number
  remark: string
  status: number
  updateBy: number
  updateTime: string
  isKeyMaterial: boolean
  isReversal: number
  period?: number
  customizedFields: any[]
  drawingNumber: string
  specification: string
  minStock?: number
  safeStock?: number
  needCheck?: boolean
}
export interface IProductModelPagedRes {
  current: number
  pages: number
  records: IProductModelListItem[]
  size: number
  total: number
}

export async function queryProductModelPageList(params: IProductModelParams) {
  const res = await axios.post<IRes<IListPageResult<IProductModelItem>>>(
    "/product/model/getPaged",
    params
  )
  return res.data.data
}

export async function queryProductModelListByIdList(params: { idList: string[] }) {
  const res = await axios.post<IRes<IProductModelItem[]>>("/product/model/getByIdList", params)
  return res.data.data
}

export interface InspectTypeListRes {
  controlPattern: number
  createBy: number
  createTime: string
  id: number
  inspectType: number
  productModelId: number
  samplingRatio?: number
  sampleNum?: number
  updateBy: number
  updateTime: string
  samplingMethod: number
  gradientModelId: number
  saleQty?: number
  unplannedDeliveryQty?: number
  inventoryQty?: number
  isDeliveryInspection?: boolean
  saleDetailId?: string
  needCheck?: boolean
  isSampleReturn?: boolean // 样品是否还回
}

/**
 *
 * @description 检验类型编号
 */
export async function getInspectTypeConfigList(params: {
  inspectTypes?: number
  productModelId: string
  techVersionId?: string
}) {
  const res = await axios.get<IRes<InspectTypeListRes[]>>(
    "/product/model/getInspectTypeConfigList",
    {
      params
    }
  )
  return res.data.data
}

export async function ableProductModel(params: { productModelId: string; newStatus: number }) {
  const res = await axios.put<IRes>(
    `/product/model/changeStatus?productModelId=${params.productModelId}&newStatus=${params.newStatus}`
  )
  return res.data.data
}

export async function deleteProductModel(id: string) {
  const res = await axios.delete<IRes>("/product/model/deleteById", {
    params: { productModelId: id }
  })
  return res.data.data
}

interface IProductModelCreate {
  inspectTypeConfigList?: {
    controlPattern: number
    createBy?: string
    createTime?: string
    id: string
    inspectPattern: number
    inspectType: number
    productModelId: string
    samplingRatio: number
    updateBy: string
    updateTime?: string
  }[]
  name: string
  code: string
  productCategoryId?: string
  productType?: number
  remark?: string
  defaultUnitId?: string
  minStock?: number
  safeStock?: number
}

export async function createProductModel(params: IProductModelCreate) {
  const res = await axios.post<IRes<IProductModelCreate & { id: string }>>(
    "/product/model/create",
    params
  )
  return res.data.data
}

export async function getProductModelById(id: string | number) {
  const res = await axios.get<IRes<IProductModelListItem>>(`/product/model/getById`, {
    params: {
      productModelId: id
    }
  })
  return res.data.data
}

export async function updateProductModel(params: IProductModelCreate & { id: string }) {
  const res = await axios.put<IRes>("/product/model/update", params)
  return res.data.data
}

export interface ICateSelectOption {
  code: string
  createBy: string
  createTime: string
  id: string
  name: string
  parentCode: string
  parentId: string
  parentName: string
  remark: string
  status: number
  updateBy: number
  updateTime: string
}

export async function requestProductCategoryList() {
  const res = await axios.get<IRes<ICateSelectOption[]>>(
    "/product/category/getCategorySelectOptions"
  )
  return res.data.data
}

//  #region 产品模型-检验类型相关接口层
// 更新某产品【检验配置】
interface InspectTypeConfig {
  techVersionId?: string
  controlPattern?: number
  inspectType: number
  productModelId: number | string
  samplingRatio?: number
  samplingMethod?: number
  gradientModelId?: number | string
  sampleNum?: number
  isSampleReturn?: boolean // 样品是否还回
}
export async function updateInspectTypeConfig(params: InspectTypeConfig) {
  const res = await axios.post<IRes>(
    "/product/model/inspectType/v3/updateInspectTypeConfig",
    params
  )
  return res.data.data
}

export async function getProductInspectList(params: IProductInspectListParams) {
  const res = await axios.get<IRes<IProductInspectListItem[]>>(
    "/product/model/inspectItemDetail/v3/getList",
    { params }
  )
  return res.data.data
}

export async function deleteProductInspectById(params: { id: string }) {
  const res = await axios.delete<IRes>("/product/model/inspectItemDetail/v3/deleteById", { params })
  return res.data.data
}

export async function batchDeleteProductInspectByIds(params: { idList: string[] }) {
  const res = await axios.post<IRes>("/product/model/inspectItemDetail/v3/batchDelete", params)
  return res.data.data
}

export async function batchCreateProductInspect(params: IProductInspectDetailCreateParams) {
  const res = await axios.post<IRes>("/product/model/inspectItemDetail/v3/batchCreate", params)
  return res.data.data
}

export async function updateProductInspectByIdV3(params: InspectItemDetailParams) {
  const res = await axios.post<IRes>("/product/model/inspectItemDetail/v3/update", params)
  return res.data.data
}

export async function batchSaveProductInspectAll(params: { productModelId: string; inspectItems: InspectItemDetailParams[] }) {
  const res = await axios.post<IRes>("/product/model/inspectItemDetail/v3/batchSaveAll", params)
  return res.data.data
}
// #endregion

// #region 产品配置，检验配置
export interface ProductInspectList {
  code: string
  createBy: string
  createTime: string
  id: string
  imageId: string
  imageUrl: string
  name: string
  productModelId: string
  updateBy: string
  updateTime: string
}

// #endregion

// #region 产品配置，文档配置
export async function getDocIdList(productModelId: string) {
  const res = await axios.get<IRes<IProductModelDocListItem[]>>(
    "/product/model/doc/v3/getDocIdList",
    {
      params: { productModelId }
    }
  )
  return res.data.data
}

export async function saveDocList(params: { fileIds: string[]; productModelId: string; documentSourceType?: 1 | 2 }) {
  const res = await axios.post<IRes>("/product/model/doc/v3/saveDocList", params)
  return res.data.data
}

export async function deleteProductModelDoc(id: string) {
  const res = await axios.delete<IRes>(`product/model/doc/v3/delete/${id}`)
  return res.data.data
}
// #endregion

// #region 产品配置，单位配置
export interface IUnitItem {
  conversionBasis: number
  createBy: number
  createTime: string
  id: number
  productModelId: number
  unitCode: string
  unitId: string
  unitName: string
  updateBy: number
  updateTime: string
  isDefaultUnit?: number
}

export async function getUnitList(productModelId: string) {
  const res = await axios.get<IRes<IUnitItem[]>>("/product/model/unit/getUnitList", {
    params: { productModelId }
  })
  return res.data.data
}

export async function createProductModelUnit(params: ICreateUnitParams) {
  const res = await axios.post<IRes>("product/model/unit/v3/create", params)
  return res.data.data
}

export async function deleteProductModelUnit(id: number) {
  const res = await axios.delete<IRes>(`product/model/unit/v3/delete/${id}`)
  return res.data.data
}

export interface IUnitSelectOption {
  createBy: number
  createTime: string
  decimalNumber: number
  id: number
  remarks: string
  unitCode: string
  unitName: string
  updateBy: number
  updateTime: string
}
export async function getUnitSelectOptions() {
  const res = await axios.get<IRes<IUnitSelectOption[]>>("/product/model/unit/getUnitSelectOptions")
  return res.data.data
}

export async function saveUnitList(params: {
  modelUnitCreateVOList: number[]
  productModelId: string
}) {
  const res = await axios.post<IRes>("/product/model/unit/saveUnitList", params)
  return res.data.data
}

// #endregion

// #region 产品配置，检验配置-检验项

export async function updateInspectItemDetail(params: InspectItemDetailParams) {
  const res = await axios.put<IRes>("/product/model/inspectItemDetail/update", params)
  return res.data.data
}

// /product /model/inspectItemDetail/deleteById
export async function deleteInspectItemDetailById(id: string) {
  const res = await axios.delete<IRes>("/product/model/inspectItemDetail/deleteById", {
    params: { id }
  })
  return res.data.data
}

// 新增单检验类型检验要求(和普通新增检验项或引用新增检验项操作一起)
export async function createWithInspectItem(params: InspectItemDetailParams) {
  const res = await axios.post<IRes>(
    "/product/model/inspectItemDetail/createWithInspectItem",
    params
  )
  return res.data.data
}

export interface IInspectItemDetail {
  createBy: number
  createTime: string
  id: string | number
  inspectItemCode: string
  inspectItemId: string | number //传number后端精度要丢失
  inspectItemName: string
  inspectRate: number
  inspectType: number
  inspectTypeId: number
  methodDesc: string
  productModelId: number | string
  spcControl: boolean
  spcLowerSpec: number
  spcUpperSpec: number
  standardDesc: string
  standardMax: number
  standardMaxInclusive: boolean
  standardMin: number
  standardMinInclusive: boolean
  standardType: number
  quantitativeMode?: "lower" | "upper" | "range"
  standardValue?: number | string | null
  upperTolerance?: number | string | null
  lowerTolerance?: number | string | null
  upperToleranceSign?: "+" | "-"
  lowerToleranceSign?: "+" | "-"
  updateBy: number
  updateTime: string
  laboratoryIdList: string[]
  imageUrls: string[]
  imageIds: string[]
  pollingTrigger: number // 巡检触发方式，0-不自动触发，1-按时间，2-按数量，默认按时间频率
  firstInspectionCondition?: number[] // 首检自动触发条件，1-换天，2-换班，3-换型，4-换单，5-更换MRO
  destructive: number // 是否为破坏性检验 0-否 1-是
  isSampleReturn?: boolean // 样品是否还回
  sampleNum?: number // 样本数
  unitId: string
  triggerAmount: number
}

export async function getInspectItemDetailList(params: {
  productModelId: string
  inspectType?: number
  inspectItemId?: string
}) {
  const res = await axios.get<IRes<IInspectItemDetail[]>>(
    "/product/model/inspectItemDetail/getList",
    {
      params
    }
  )
  return res.data.data
}

export const inspectTypeToNameMap: { [key: number]: any } = {
  1: "首检",
  2: "巡检",
  3: "末检",
  4: "采购入库检",
  5: "生产入库检",
  6: "发货出库检",
  7: "退货入库检",
  8: "EPC全检",
  11: "首检专检",
  13: "末检专检"
} as const

// #endregion

// #region 产品配置，安全库存
export interface ISafeStockConfigItem {
  defaultUnitId: string
  defaultUnitName: string
  facilityCode: string
  facilityId: string
  facilityName: string
  productModelId: string
  safeStockQuantity: string
}
export async function getProductSafeStockConfigs(productModelId: string) {
  const res = await axios.get<IRes<ISafeStockConfigItem[]>>(
    "/product/model/safetyStockConfig/listSafetyStockConfigs",
    {
      params: { productModelId }
    }
  )
  return res.data.data
}

export async function setProductSafeStockConfig(params: {
  configItemList: {
    facilityId: string
    safeStockQuantity: string
  }[]
  productModelId: string
}) {
  const res = await axios.post<IRes>(
    "/product/model/safetyStockConfig/saveSafetyStockConfigs",
    params
  )
  return res.data.data
}

// #endregion

export async function getProductInfosByIdsForProductionReport(params: string[]) {
  const res = await axios.post<
    IRes<
      {
        barcode: string
        barcodeId: string
        defaultQuantity: number
        defaultUnitId: string
        defaultUnitName: string
        id: string
        productModelCode: string
        productModelId: string
        productModelName: string
        reportInspectResult: number // 质量情况、报工检结果(0-未检验 1-合格 2-不合格 3-让步接收 4-报废 5-返工 6-验退)
      }[]
    >
  >("/product/getProductInfosByIdsForProductionReport", params)
  return res.data.data
}

// 业务伙伴零件号
// 【下拉框】回显可选业务伙伴
export async function getSelectablePartnerList(partnerType: string) {
  const res = await axios.get<IRes>("/product/model/partnerPartMapping/getSelectablePartnerList", {
    params: { partnerType }
  })
  return res.data.data
}

// 查询罗列某个产品模型的业务伙伴零件号映射配置信息
export async function getListPartnerPartMappingConfigs(productModelId: string) {
  const res = await axios.get<IRes>(
    "/product/model/partnerPartMapping/listPartnerPartMappingConfigs",
    {
      params: { productModelId }
    }
  )
  return res.data.data
}

// 保存业务伙伴零件号配置集合
export async function savePartnerPartMappings(params: {
  configItemList: {
    partnerAbbr?: string
    partnerCode?: string
    partnerId?: string
    partnerName?: string
    partnerPartCode?: string
    partnerType?: string
  }[]
  productModelId: string
}) {
  const res = await axios.post<IRes>(
    "/product/model/partnerPartMapping/savePartnerPartMappings",
    params
  )
  return res.data.data
}

//  含有工艺路线的产品分页
export const queryProductHasTechRoutePageList = async (params: IProductModelParams) => {
  const res = await axios.post<IRes<IListPageResult<IProductModelItem>>>(
    "/product/model/productWithProcess/page",
    params
  )
  return res.data.data
}
