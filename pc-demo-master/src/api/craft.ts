import axios from "axios"

import type {
  IAllCraftListParams,
  ICraftItem,
  ICraftRouteItem,
  ICraftRouteParams,
  ICraftTechPageParams,
  IProduceBasicMachineCraftItem
} from "@/types/base-info/craftRoute"
import type {
  ICraftTypeCreateParams,
  ICraftTypeItem,
  ICraftTypePageListParams,
  ICraftTypeUpdateParams
} from "@/types/base-info/craftType"
import type { IListPageResult } from "@/types/common"

import type { IRes } from "./interceptor"
import { type IPagedAPIParams } from "./type"

export interface ProductModelUnit {
  //产品模型绑定单位集
  conversionBasis: number
  createBy: number
  createTime: string
  id: string
  isDefaultUnit: number
  productModelId: number
  unitCode: string
  unitId: string
  unitName: string
  updateBy: number
  updateTime: string
}

export interface ProductModel {
  code: string
  createBy: number
  createTime: string
  defaultUnitId: number
  defaultUnitName: string
  id: string
  name: string
  productCategoryCode: string
  productCategoryId: number
  productCategoryName: string
  productModelUnitList: ProductModelUnit[]
  productType: number
  remark: string
  status: number
  updateBy: number
  updateTime: string
}

const craftTypeRequestTimeout = 3000

function normalizeCraftTypeField(value?: string) {
  return String(value || "")
    .trim()
    .toLowerCase()
}

async function ensureCraftTypeUnique(params: {
  id?: string
  craftTypeNo?: string
  craftTypeName: string
}) {
  const normalizedId = String(params.id || "").trim()
  const normalizedNo = normalizeCraftTypeField(params.craftTypeNo)
  const normalizedName = normalizeCraftTypeField(params.craftTypeName)
  if (!normalizedNo && !normalizedName) return

  const { records } = await queryCraftTypePageList({
    pageQuery: {
      pageNum: 1,
      pageSize: 999
    },
    queryParam: {}
  })

  const duplicatedItem = (records || []).find((item) => {
    if (normalizedId && String(item.id || "").trim() === normalizedId) return false
    if (normalizedNo && normalizeCraftTypeField(item.craftTypeNo) === normalizedNo) return true
    if (normalizedName && normalizeCraftTypeField(item.craftTypeName) === normalizedName) return true
    return false
  })

  if (!duplicatedItem) return

  if (
    normalizedNo &&
    normalizeCraftTypeField(duplicatedItem.craftTypeNo) === normalizedNo &&
    (!normalizedName || normalizeCraftTypeField(duplicatedItem.craftTypeName) !== normalizedName)
  ) {
    throw new Error("工艺类型编号已存在，请重新输入")
  }

  throw new Error("工艺类型名称已存在，请重新输入")
}

async function ensureCraftTypeNotReferenced(id: string) {
  const res = await axios.post<IRes<IListPageResult<ICraftItem>>>("/tech/page", {
    pageQuery: {
      pageNum: 1,
      pageSize: 1
    },
    queryParam: {
      craftTypeId: id
    }
  })
  const total = Number(res.data.data?.total || 0)
  if (total > 0) {
    throw new Error("该工艺类型已被引用，无法删除")
  }
}
export async function getCraftPaged(params: ICraftTechPageParams) {
  const res = await axios.post<IRes<IListPageResult<ICraftItem>>>("/tech/page", params)
  return res.data.data
}

/** 获取所有工艺信息 */
export const queryAllCraftList = async (params: IAllCraftListParams) => {
  const res = await axios.post<IRes<ICraftItem[]>>("/tech/list", params)
  return res.data.data
}

export async function queryCraftTypeList() {
  const { records } = await queryCraftTypePageList({
    pageQuery: {
      pageNum: 1,
      pageSize: 999
    },
    queryParam: {}
  })
  return records || []
}

export async function createCraftItem(params: {
  name: string
  remarks: string
  no?: string
  craftTypeId?: string
  craftTypeName?: string
  craftTypeNo?: string
}) {
  const res = await axios.post<IRes>("/tech/create", params)
  return res.data.data
}

export async function deleteCraftItem(id: string) {
  const res = await axios.delete<IRes>(`/tech/delete/${id}`)
  return res.data.data
}

export async function updateCraftItem(params: {
  name: string
  remarks: string
  id: string
  craftTypeId?: string
  craftTypeName?: string
  craftTypeNo?: string
}) {
  const res = await axios.put<IRes>("/tech/update", params)
  return res.data.data
}

export async function queryCraftTypePageList(params: ICraftTypePageListParams) {
  const res = await axios.post<IRes<IListPageResult<ICraftTypeItem>>>("/craftType/page", params, {
    timeout: craftTypeRequestTimeout
  })
  return res.data.data
}

export async function queryCraftTypeDetail(id: string) {
  const res = await axios.get<IRes<ICraftTypeItem>>("/craftType/getOne", {
    params: { id },
    timeout: craftTypeRequestTimeout
  })
  return res.data.data
}

export async function requestCreateCraftType(params: ICraftTypeCreateParams) {
  await ensureCraftTypeUnique(params)
  const res = await axios.post<IRes>("/craftType/createType", params, {
    timeout: craftTypeRequestTimeout
  })
  return res.data.data
}

export async function requestUpdateCraftType(params: ICraftTypeUpdateParams) {
  await ensureCraftTypeUnique(params)
  const res = await axios.post<IRes>("/craftType/updateCraftType", params, {
    timeout: craftTypeRequestTimeout
  })
  return res.data.data
}

export async function requestDeleteCraftType(params: { id: string }) {
  await ensureCraftTypeNotReferenced(params.id)
  const res = await axios.delete<IRes>("/craftType/deleteTypeById", {
    params,
    timeout: craftTypeRequestTimeout
  })
  return res.data.data
}

// #region 工艺信息库-生产要素

export async function setProduceBasic(
  params: Partial<{
    machineReqList: any[]
    manReqList: any[]
    materialReqList: any[]
    measurementReqList: any[]
    methodReqList: any[]
    mroReqList: any[]
    prodUnitReqList: any[]
    productReqList: any[]
    techVersionId: string
    processId?: string
  }>
) {
  const res = await axios.post<IRes>(
    "/techVersion/techStandard/saveTechStandardMachineList",
    params
  )
  return res.data.data
}

export async function setProduceBasicMachineCraft(id: string, params: any) {
  const res = await axios.post<IRes>(`/techVersion/techStandard/create/machine/${id}`, params)
  return res.data.data
}

export interface IProduceBasicManItem {
  count: number
  createBy: string
  createTime: string
  id: string
  license: {
    autoFreeze: number
    createBy: number
    createTime: number
    equipmentBizIdList: number[]
    equipmentBizIds: string
    equipmentBizNames: string
    equipmentType: number
    id: string
    idleMaxDays: number
    jobId: string
    jobNo?: string
    jobCode?: string
    jobName: string
    licenseName: string
    preNoticeDays: number
    updateBy: number
    updateTime: number
  }
  refId: number // 1.按职位position_id，2.按岗位job_id，3.按上岗证license_id
  techDetailId: string
  type: number // 1.按职位，2.按岗位，3.按上岗证
  updateBy: string
  updateTime: string
}

export async function getProductBasicMachineCraft(
  params: IPagedAPIParams<{
    id: string
  }>
) {
  const res = await axios.post<IRes<IListPageResult<IProduceBasicMachineCraftItem>>>(
    `/techVersion/techStandard/machine/method`,
    params
  )
  return res.data.data
}

export interface IProduceBasicMaterialItem {
  baseAmount: number
  createBy: string
  createTime: string
  id: string
  isReversal: boolean // 是1，否0
  productModel: any
  techDetailId: string
  unitItem: any
  updateBy: string
  updateTime: string
  validity_end: string
  validity_start: string
}

export async function getProduceBasicMaterial(id: string) {
  const res = await axios.get<IRes<IProduceBasicMaterialItem[]>>(
    `/techVersion/techStandard/material/${id}`
  )
  return res.data.data
}

export interface IProduceBasicOutputItem {
  baseAmount: number
  createBy: string
  createTime: string
  id: string
  productModel: any
  productModelId: string
  techDetailId: string
  type: number // 输出产品类型 1.具体产品 2.跟随主料
  unitId: string
  unitItem: any
  updateBy: string
  updateTime: string
}

export async function getProduceBasicOutput(id: string) {
  const res = await axios.get<IRes<IProduceBasicOutputItem[]>>(
    `/techVersion/techStandard/product/${id}`
  )
  return res.data.data
}

export async function queryCraftRoutePageList(params: ICraftRouteParams) {
  const res = await axios.post<IRes<IListPageResult<ICraftRouteItem>>>("/tech_process/page", params)
  return res.data.data
}

// 获取指定工艺路线id列表
export const requestCraftRouteListByIds = async (params: { idList: string[] }) => {
  const res = await axios.post<IRes<ICraftRouteItem[]>>(`/tech_process/listByIds`, params)
  return res.data.data
}

export async function updateCraftRouteItem(params: {
  productionModelId?: string
  remarks?: string
  unitId?: string
  processId?: string
  no?: string
  routePurpose?: "standard" | "rework-template"
}) {
  const res = await axios.post<IRes<ICraftRouteItem>>("/tech_process/saveOrUpdate", params)
  return res.data.data
}

export async function publishCraftRouteItem(params: {
  remarks: string
  techProcId: string
  version: string
}) {
  const res = await axios.put<IRes>(`/tech_process/publish`, params)
  return res.data.data
}

export async function deleteCraftRouteItem(id: string) {
  const res = await axios.delete<IRes>(`/tech_process/delete/${id}`)
  return res.data.data
}

export async function cancelCraftRouteItem(id: string) {
  const res = await axios.put<IRes>(`/tech_process/deprecated/${id}`)
  return res.data.data
}

export async function copyCraftRouteItem(params: {
  productModelId?: string
  remarks: string
  techProcId: string
  no?: string
  unitId?: string
  routePurpose?: "standard" | "rework-template"
}) {
  const res = await axios.post<IRes>("/tech_process/snapshot", params)
  return res.data.data
}

export async function requestCraftRouteSubTreeList(id: string) {
  const res = await axios.get<IRes<any[]>>(`/tech_process/subTech/tree/${id}`)
  return res.data.data
}

export interface PlanAbleList {
  availableAmount: number
  type: number
  nature: number
  planAmount: number
  processSerial: string
  productBaseAmount: number
  productionOrderPlanId: string
  techFlowNodeId: string
  techName: string
  techNo: string
  techVersionId: string
  unPublishAmount: number
}

export async function queryPlanAble(data: {
  areaPlanId?: string
  orderId: string
  queryType: number
}) {
  const res = await axios.post<IRes<PlanAbleList[]>>(
    `/productionOrderPlan/processSerial/planAble`,
    data
  )
  return res.data.data
}

export async function inferNodeOutput(data: {
  items: { amount: number; id: string }[]
  processId: string
}) {
  const res = await axios.post<IRes<{ amount: number; id: string }[]>>(
    `/delegate/productionOrder/inferNodeOutput`,
    data
  )
  return res.data.data
}
// #endregion

// 料
export interface TechStandardMaterialListItem {
  baseAmount: number
  id: string
  isReversal: number
  feedingControl?: number
  pickMaterial: number // 排产后联动领料(0否 1是)
  productCategoryName: string
  productModelCode: string
  productModelId: string
  productModelName: string
  productModelUnitList: any[]
  productType: number
  productTypeName: string
  drawingNumber: string
  decimalNumber: number
  sourceProcessSerial: string
  usedByChildrenProcessSerial: string
  sourceTechFlowNodeIds: number[]
  unitId: string
  unitName: string
  primaryMaterial: number
  replaceItemList: {
    productModelName: string
    productModelCode: string
    productModelId: string
    productCategoryName: string
    productType: number
    productTypeName: string
    baseAmount: number
    unitId: string
    unitName: string
    pickMaterial: number
  }[]
}

export async function getTechStandardMaterialList(params: { techVersionId: string; processId?: string }) {
  const res = await axios.get<IRes<TechStandardMaterialListItem[]>>(
    `/techVersion/techStandard/getTechStandardMaterialList`,
    { params }
  )
  return res.data.data
}
interface MaterialList {
  baseAmount: number
  id: string
  feedingControl?: number
  pickMaterial: number
  primaryMaterial: number
  productModelId: string
  sourceProcessSerial: string
  unitId: string
  // 被哪个工序使用（关联当前工序）
  usedByChildrenProcessSerial?: string
}

// 料
export async function saveTechStandardMaterialList(params: {
  techVersionId: string
  processId?: string
  materialList: MaterialList[]
}) {
  const res = await axios.post<IRes>(
    `/techVersion/techStandard/saveTechStandardMaterialList`,
    params
  )
  return res.data.data
}

// 人获取
export async function getTechStandardManList(params: { techVersionId: string; processId?: string }) {
  const res = await axios.get<IRes<IProduceBasicManItem[]>>(
    `/techVersion/techStandard/getTechStandardManList`,
    { params }
  )
  return res.data.data
}

export interface ManList {
  count?: number
  id?: string
  refId: string
  type: number
  [key: string]: any
}

// 人保存
export async function saveTechStandardManList(params: {
  techVersionId: string
  processId?: string
  manReqList: ManList[]
}) {
  const res = await axios.post<IRes<IProduceBasicManItem[]>>(
    `/techVersion/techStandard/saveTechStandardManList`,
    params
  )
  return res.data.data
}
export interface MachineList {
  createBy: number
  createTime: string
  id: string
  refId: string
  techDetailId: string
  tsesEquipment: any
  tsesEquipmentModel: any
  type: number
  updateBy: number
  updateTime: string
}

// 机 获取
export async function getTechStandardMachineList(params: { techVersionId: string; processId?: string }) {
  const res = await axios.get<IRes<MachineList[]>>(
    `/techVersion/techStandard/getTechStandardMachineList`,
    { params }
  )
  return res.data.data
}

//法 获取
export interface TsesFileResource {
  createBy: number
  createTime: string
  deploymentId: number
  extension: string
  fileName: string
  fileSize: string
  fileStatus: number
  hash: string
  id: string
  path: string
  size: string
  sourceName: string
  updateBy: number
  updateTime: string
  version: string
  directoryName: string
}
export interface MethodList {
  createBy: number
  createTime: string
  fileId: string
  fileStatus: number
  id: string
  techDetailId: number
  tsesFileResource: TsesFileResource
  type: number
  updateBy: number
  updateTime: string
  documentSourceType: number // 文档类型 1：文档库下发 2：自发上传
}

export async function getTechStandardMethodList(params: { techVersionId: string; processId?: string }) {
  const res = await axios.get<IRes<MethodList[]>>(
    `/techVersion/techStandard/getTechStandardMethodList`,
    { params }
  )
  return res.data.data
}
interface MethodReqList {
  fileId: string
  id?: string
  type: number
}

export async function saveTechStandardMethodList(params: {
  techVersionId: string
  processId?: string
  methodReqList: MethodReqList[]
}) {
  const res = await axios.post<IRes<IProduceBasicManItem[]>>(
    `/techVersion/techStandard/saveTechStandardMethodList`,
    params
  )
  return res.data.data
}

// MRO
export interface MroList {
  baseUseLife: number
  percentBaseUseLife: string
  createBy: number
  createTime: string
  id: string
  mroModelId: string
  mroModelVo: {
    alarmDepartments: {
      createBy: number
      createTime: string
      depCode: string
      depName: string
      depType: number
      id: number
      parentDepId: number
      remark: string
      updateBy: number
      updateTime: string
    }[]
    alarmLine: number
    checkManage: number
    createBy: number
    createTime: string
    decimalNumber: number
    id: string
    identityManage: number
    lifeManage: number
    maintenanceManage: number
    mroCategoryId: string
    mroCategoryName: string
    mroModelName: string
    mroModelNo: string
    mroSpec: string
    mroTypeName: string
    mroScrapProcessId: string
    mroScrapProcessName: string
    remarks: string
    repairDepartments: {
      createBy: number
      createTime: string
      depCode: string
      depName: string
      depType: number
      id: number
      parentDepId: number
      remark: string
      updateBy: number
      updateTime: string
    }[]
    safeDepartments: {
      createBy: number
      createTime: string
      depCode: string
      depName: string
      depType: number
      id: number
      parentDepId: number
      remark: string
      updateBy: number
      updateTime: string
    }[]
    safeStock: number
    safeStockManage: number
    sparePartsProcessId: string
    sparePartsProcessName: string
    stocks: number
    stopProAndonId: number
    stopProAndonName: string
    stopProLine: number
    unitModelId: number
    unitModelName: string
    updateBy: number
    updateTime: string
  }
  techDetailId: number
  updateBy: number
  updateTime: string
  quantity:number
}

export async function getTechStandardMroList(params: { techVersionId: string; processId?: string }) {
  const res = await axios.get<IRes<MroList[]>>(`/techVersion/techStandard/getTechStandardMroList`, {
    params
  })
  return res.data.data
}
interface MroReqList {
  baseUseLife: number
  id: string
  mroModelId: string
}

export async function saveTechStandardMroList(params: {
  techVersionId: string
  processId?: string
  mroReqList: MroReqList[]
}) {
  const res = await axios.post<IRes>(`/techVersion/techStandard/saveTechStandardMroList`, params)
  return res.data.data
}

// 产出
export interface IProduceBasicOutputItemNew {
  baseAmount: number
  id: string
  mainProduct: number
  productCategoryName: string
  productModelCode: string
  productModelId: string
  productModelName: string
  productType: number
  productTypeName: string
  productModelUnitList: {
    conversionBasis: number //单位换算基数
    createBy: string //创建人ID
    createTime: string //创建时间
    id: string //ID
    isDefaultUnit: number //是否是默认单位(0-否,1-是)
    productModelId: string //产品模型ID(外键)
    unitCode: string //单位编号(冗余)
    unitId: string //单位ID(外键)
    unitName: string //单位名字(冗余)
    updateBy: string //更新人ID
    updateTime: string //更新时间
  }[]
  relatedMaterialId: string
  remark: string
  sourceProcessSerial: string
  unitId: string
  unitName: string
}

export async function getTechStandardOutputList(params: { techVersionId: string; processId?: string }) {
  const res = await axios.get<IRes<IProduceBasicOutputItemNew[]>>(
    `/techVersion/techStandard/getTechStandardOutputList`,
    { params }
  )
  return res.data.data
}
interface OutputProductList {
  baseAmount: number
  id: string
  mainProduct: number
  productModelId: string
  unitId: string
  relatedMaterialId: string
  // 完整产品信息（用于自动生成的产出，可能没有productModelId）
  productModelName?: string
  productModelCode?: string
  productCategoryName?: string
  productType?: number
  productTypeName?: string
  unitName?: string
  remark?: string
}

export async function saveTechStandardOutputList(params: {
  techVersionId: string
  sourceProcessId?: string
  outputProductList: OutputProductList[]
}) {
  const res = await axios.post<IRes>(`/techVersion/techStandard/saveTechStandardOutputList`, params)
  return res.data.data
}
// 过程检

type InspectItemDetailParams = {
  id?: string
  isSampleReturn?: boolean // 样品是否还回
  isSpc?: boolean // 是否是SPC检验，0-否，1-是
  remark?: string // 备注
  firstInspectionCondition?: number[] // 首检自动触发条件，1-换天，2-换班，3-换型，4-换单，5-更换MRO
  imageIds: string[]
  inspectItemCode: string // 产品检验项编号
  inspectItemId?: string // 产品检验项ID 引用时不能为空
  inspectItemName?: string // 产品检验项名称 新增时不能为空
  inspectRate?: number // 检验频率(分钟)1-1440整数,仅巡检有
  sampleNum?: number // 样本数
  laboratoryIdList: string[] // 检验场所
  inspectType: number // 产品检验类型
  inspectionStandard: {
    standardDesc: string
    standardMax: number
    standardMaxInclusive: number
    standardMin: number
    standardMinInclusive: number
    standardType: number
    quantitativeMode?: "lower" | "upper" | "range"
    standardValue?: number | string | null
    upperTolerance?: number | string | null
    lowerTolerance?: number | string | null
    upperToleranceSign?: "+" | "-"
    lowerToleranceSign?: "+" | "-"
    unitId: string
    unitName?: string
  }
  methodDesc: string // 方法要求
  pollingTrigger?: number // 巡检触发方式，0-不自动触发，1-按时间，2-按数量，默认按时间频率
  triggerAmount?: number // 巡检触发数量
  productModelId: string // 产品模型ID
  techVersionId: string // 工艺版本ID
}

export async function getTechStandardMeasurementList(params: {
  inspectType?: number
  productModelId: string
  techVersionId: string
}) {
  const res = await axios.get<IRes<any[]>>(
    `/techVersion/techStandard/getTechStandardMeasurementList`,
    { params }
  )
  return res.data.data
}

//删除检验要求
export async function deleteTechStandardMeasurementById(id: string) {
  const res = await axios.delete<IRes>(
    "/techVersion/techStandard/deleteTechStandardMeasurementById",
    {
      params: { id }
    }
  )
  return res.data.data
}

// 编辑检验要求
export async function updateTechStandardMeasurement(params: any) {
  const res = await axios.put<IRes>(
    "/techVersion/techStandard/updateTechStandardMeasurement",
    params
  )
  return res.data.data
}

// 过程检中 新增单检验类型检验要求(和普通新增检验项或引用新增检验项操作一起)
export async function createTechStandardMeasurementWithInspectItem(
  params: any
) {
  const res = await axios.post<IRes>(
    "/techVersion/techStandard/createTechStandardMeasurementWithInspectItem",
    params
  )
  return res.data.data
}

// 生产单位
interface ProdUnitLis {
  createBy: number
  createTime: string
  ctTime: number
  fmEntity: any
  facilityId: string
  id: string
  postChangeTime: number
  preChangeTime: number
  priority: number
  techDetailId: number
  updateBy: number
  updateTime: string
  workerNum: number
  lossTime: number
}

export async function getTechStandardProdUnitList(params: { techVersionId: string; processId?: string }) {
  const res = await axios.get<IRes<ProdUnitLis[]>>(
    `/techVersion/techStandard/getTechStandardProdUnitList`,
    { params }
  )
  return res.data.data
}
interface ProdUnitReqList {
  ctTime?: number
  abstractAreaId: number
  id: string
  postChangeTime?: number
  preChangeTime?: number
  priority: number
  workerNum?: number
  lossTime?: number
}

export async function saveTechStandardProdUnitList(params: {
  techVersionId: string
  processId?: string
  prodUnitReqList: ProdUnitReqList[]
}) {
  const res = await axios.post<IRes>(
    `/techVersion/techStandard/saveTechStandardProdUnitList`,
    params
  )
  return res.data.data
}

// 包装规范
export interface IPackMaterialListItem {
  decimalNumber: number
  productModelCode: string
  productModelId: string
  productModelName: string
  quantity: number
  unitId: string
  unitName: string
}

interface IPackInfo {
  // 1:包 2:袋 3:箱
  container: number
  isCreateNewBatch: number
  // 0=否 1=是
  packMaterialList: IPackMaterialListItem[]
}

export async function getTechPackStandard(params: { techVersionId: string }) {
  const res = await axios.post<IRes<IPackInfo>>(`/techVersion/techStandard/getPackStandard`, params)
  return res.data.data
}

interface ISavePackInfo extends IPackInfo {
  techVersionId: string
}

export async function saveTechPackStandard(params: ISavePackInfo) {
  const res = await axios.post<IRes>(`/techVersion/techStandard/savePackStandard`, params)
  return res.data.data
}

// 获取工艺详情
export async function getTechProcessInfo(id: string | number) {
  const res = await axios.get<IRes<ICraftRouteItem>>(`/tech_process/${id}`)
  return res.data.data
}

// 获取工艺组详情 (这里返回结构同工艺路线详情，为了保证结构一致，但是数据不一定有)
export async function getSonTechProcessInfo(id: string | number) {
  const res = await axios.post<IRes<ICraftRouteItem>>(`/tech_process/sonProcessInfo/${id}`)
  return res.data.data
}

export interface TechProcessInfo {
  craftTypeId?: string
  craftTypeName?: string
  craftTypeNo?: string
  id: string
  name: string
  nature: number
  bizTypeName: string
  bizType: number
  preProcessList: {
    id: string
    processSerial: string
  }[]
  processSerial: string
  reportType: number
  sortNum: number
  techId: string
  techNo: string
  techVersionId: string
  isReverseTime: number
  type: number
  status: number
  outputType: number
  productionSchedulingType: number
  defaultCodeRelationType: number
  codeRelate: number
  vehicleRelate: number
}

// 获取工序列表
export async function getTechProcessList(id: string | number) {
  const res = await axios.post<IRes<TechProcessInfo[]>>(`/tech_process/processList/${id}`)
  return res.data.data
}

// 保存单条工序信息
export async function saveTech(params: {
  craftTypeId?: string
  craftTypeName?: string
  craftTypeNo?: string
  id: string
  name: string
  nature: number
  bizType: number
  bizTypeName: string
  preProcessList: string[]
  processSerial: string
  codeRelate: number
  sortNum: number
  techId: string
  type: number
  vehicleRelate: number
  productionSchedulingType: number
  defaultCodeRelationType: number
}) {
  const res = await axios.post<IRes<TechProcessInfo[]>>(`/tech_process/saveTech`, params)
  return res.data.data
}

// 引用工序
export async function quoteTech(
  params: {
    techVersionIdMain: string
    techVersionIdSon: string
  }[]
) {
  const res = await axios.post<IRes>(`/tech_process/quoteTech`, params)
  return res.data.data
}

// 排序
export async function changeTechOrder(params: {
  sortDtoList: {
    sortNum: number
    techNodeId: number | string
  }[]
  techVersionId: string
}) {
  const res = await axios.post<IRes>(`/tech_process/changeTechOrder`, params)
  return res.data.data
}

// 新增工序或工序组
export async function createTech(params: { techVersionIdMain: string; type: number }) {
  const res = await axios.post<IRes>(`/tech_process/createTech`, params)
  return res.data.data
}

// 删除工序路线
export async function deletetechProcess(id: string) {
  const res = await axios.post<IRes>(`/tech_process/deleteTech/${id}`)
  return res.data.data
}

// 过程控制计划相关接口
export interface IProcessControlPlanItem {
  id?: string
  productModelId?: string
  productModelName?: string
  processSerial: string
  inspectionItemName: string
  method: string
  requirement: string
  inspectionType: string
  inspectionStandard?: {
    standardNo: string
    standardName: string
    standardContent: string
  }
  standardValue: string
  upperLimit: string
  lowerLimit: string
  unit: string
  isSpc: number
  inspectionCondition?: {
    conditionName: string
    conditionValue: string
    conditionDesc: string
  }
  isDestructive: number
  remark: string
}

// 获取过程控制计划列表
export async function getProcessControlPlanList(techVersionId: string) {
  const res = await axios.post<IRes<IProcessControlPlanItem[]>>(`/tech_process/processControlPlan/list/${techVersionId}`)
  return res.data.data
}

// 保存过程控制计划列表
export async function saveProcessControlPlanList(params: {
  techVersionId: string
  planList: any[]
}) {
  const res = await axios.post<IRes>(`/tech_process/processControlPlan/save`, params)
  return res.data.data
}

// 导入过程控制计划
export async function importProcessControlPlan(params: {
  techVersionId: string
  file: File
}) {
  const formData = new FormData()
  formData.append('file', params.file)
  formData.append('techVersionId', params.techVersionId)
  const res = await axios.post<IRes>(`/tech_process/processControlPlan/import`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return res.data.data
}

// 导出过程控制计划
export async function exportProcessControlPlan(techVersionId: string) {
  const res = await axios.post<Blob>(`/tech_process/processControlPlan/export/${techVersionId}`, {}, {
    responseType: 'blob'
  })
  return res.data
}
