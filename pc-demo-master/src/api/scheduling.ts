import axios from "axios"

import { type IDefectReviewTaskItem } from "@/api/quality/defectReviewTask"
import type { ICraftRouteItem } from "@/types/base-info/craftRoute"
import type { IListPageResult, IRequestPageParams } from "@/types/common"
import type { IProductionReportInfo } from "@/types/logistics/packContainer"
import type {
  IDynamicProductionOrderPageItem,
  IDynamicProductionOrderPageParams,
  IProductionOrderItem,
  IProductionOrderMaterialItem,
  IProductionOrderPageItem,
  IProductionOrderPageParams,
  IProductionOrderReAddReq,
  IProductionOrderReturnRes,
  IProductionReportPageItem,
  IProductionReportPageParams,
  IProductionScheduleProcessReq,
  IProductionScheduleProcessRes,
  IProductionTaskUpdateReq,
  IReAddRecordListItem,
  IReAddRecordPageListReq,
  IRequestProcessAmountByMainProductReq,
  IRequestProcessAmountByMainProductRes,
  IRequestSaleOrderListByProductReq,
  ISaleOrderItem,
  ISyncOrderProcessToCraftRouteReq
} from "@/types/production-manage/product-order"
import type {
  IProductionTaskPageItem,
  IProductionTaskPageParams,
  ISelfOrderToOutRes
} from "@/types/production-manage/product-task"
import type {
  IProductionOrderTechInfo,
  IReScheduleReq,
  IScheduleInfoByOrderItem,
  ISchedulePlanByOrderItem
} from "@/types/production-manage/production-order-plan"
import type {
  IClassesItem,
  ISchedulePlanDetail,
  ISchedulePlanPageItem,
  ISchedulePlanPageParams,
  ITeamGroupItem
} from "@/types/production-manage/scheduling"

import type { IRes } from "./interceptor"
import { type IPagedAPIParams } from "./type"

// #region 班次管理

export async function getClassesList() {
  const res = await axios.get<IRes<IClassesItem[]>>("/scheduling/rotation")

  return res.data.data
}

export async function getEnabledClassesList() {
  const res = await axios.get<IRes<IClassesItem[]>>("/scheduling/rotation/enabled")
  return res.data.data
}

export interface IClassesCreateParams {
  beforeMinute: number
  belongDay: number
  endTime: string
  remark: string
  rotationName: string
  rotationStatus: number
  startTime: string
  stopPeriodList: {
    endTime: string
    id: string
    startTime: string
  }[]
}

export async function createClasses(params: Partial<IClassesCreateParams>) {
  const res = await axios.post<IRes>("/scheduling/rotation", params)
  return res.data.data
}

export async function updateClasses(id: string, params: Partial<IClassesCreateParams>) {
  const res = await axios.put<IRes>(`/scheduling/rotation/${id}`, params)
  return res.data.data
}

export async function deleteClasses(id: string) {
  const res = await axios.delete<IRes>(`/scheduling/rotation/${id}`)
  return res.data.data
}

export async function disabledClasses(id: string) {
  const res = await axios.put<IRes>(`/scheduling/rotation/${id}/disable`)
  return res.data.data
}

export async function enableClasses(id: string) {
  const res = await axios.put<IRes>(`/scheduling/rotation/${id}/enable`)
  return res.data.data
}

export interface IClassesStopPeriodItem {
  createBy: number
  createTime: string
  endTime: string
  id: number
  rotationId: number
  startTime: string
  updateBy: number
  updateTime: string
}

export async function getClassesStopPeriod(id: string) {
  const res = await axios.get<IRes<IClassesStopPeriodItem[]>>(
    `/scheduling/rotation/${id}/stopPeriod`
  )
  return res.data.data
}

// #endregion

// #region 班组管理

export async function getTeamGroupList() {
  const res = await axios.get<IRes<ITeamGroupItem[]>>("/scheduling/team")
  return res.data.data
}

export async function getEnabledTeamGroupList() {
  const res = await axios.get<IRes<ITeamGroupItem[]>>("/scheduling/team/enabled")
  return res.data.data
}

export async function createTeamGroupItem(
  params: Partial<{
    leaderIds: string[]
    memberNumber: number
    remark: string
    teamName: string
    teamCode?: string
  }>
) {
  const res = await axios.post<IRes>("/scheduling/team", params)
  return res.data.data
}

export async function updateTeamGroupItem(
  id: string,
  params: Partial<{
    leaderIds: string[]
    memberNumber: number
    remark: string
    teamName: string
    teamCode?: string
    teamStatus: number
  }>
) {
  const res = await axios.put<IRes>(`/scheduling/team/${id}`, params)
  return res.data.data
}

export async function deleteTeamGroupItem(id: string) {
  const res = await axios.delete<IRes>(`/scheduling/team/${id}`)
  return res.data.data
}

export async function disabledTeamGroupItem(id: string) {
  const res = await axios.put<IRes>(`/scheduling/team/${id}/disable`)
  return res.data.data
}

export async function enableTeamGroupItem(id: string) {
  const res = await axios.put<IRes>(`/scheduling/team/${id}/enable`)
  return res.data.data
}

// #endregion

// #region 排班计划

export async function getSchedulePlanPaged(params: ISchedulePlanPageParams) {
  const res = await axios.post<IRes<IListPageResult<ISchedulePlanPageItem>>>(
    "/scheduling/schedule/search",
    params
  )
  return res.data.data
}

export async function createSchedulePlanItem(params: {
  productionUnitIdList: string[]
  detailList: {
    cycleType: number
    rotationId: string
    teamId: string
    weeklyRule: string[]
  }[]
  endDate: string
  remark: string
  schedulingName: string
  startDate: string
}) {
  const res = await axios.post<IRes>("/scheduling/schedule", params)
  return res.data.data
}

export async function getSchedulePlanRecord(id: string) {
  const res = await axios.get<IRes<any[]>>(`/scheduling/schedule/${id}/shiftRecord`)
  return res.data.data
}

export interface IScheduleModelItem {
  createBy: string
  createTime: string
  id: string
  modelCode: string
  modelName: string
  remark: string
  updateBy: string
  updateTime: string
}

export async function getScheduleModelList() {
  const res = await axios.get<IRes<IScheduleModelItem[]>>("/scheduling/model")
  return res.data.data
}

export async function createScheduleModelItem(params: {
  modelName: string
  remark: string
  ruleList: {
    cycleType: string
    id: string
    rotationId: string
    weeklyRule: string[]
  }[]
}) {
  const res = await axios.post<IRes>("/scheduling/model", params)
  return res.data.data
}

export async function updateScheduleModelItem(
  id: string,
  params: {
    modelName: string
    remark: string
    ruleList: {
      cycleType: string
      id: string
      rotationId: string
      weeklyRule: string[]
    }[]
  }
) {
  const res = await axios.put<IRes>(`/scheduling/model/${id}`, params)
  return res.data.data
}

export async function deleteScheduleModelItem(id: string) {
  const res = await axios.delete<IRes>(`/scheduling/model/${id}`)
  return res.data.data
}

export interface IScheduleModelRuleItem {
  belongDay: number
  cycleType: number
  endTime: string
  rotationId: string
  rotationName: string
  startTime: string
  weeklyRule: string[]
}

export async function getScheduleModelRule(id: string) {
  const res = await axios.get<IRes<IScheduleModelRuleItem[]>>(`/scheduling/model/${id}/rule`)
  return res.data.data
}

// #endregion

// #region 生产订单
export interface ProductModelUnit {
  //产品模型绑定单位集
  conversionBasis: number
  createBy: number
  createTime: string
  id: string
  isDefaultUnit: number
  productModelId: string
  unitCode: string
  unitId: string
  unitName: string
  updateBy: number
  updateTime: string
}
export interface Materials {
  availAmount: number
  createBy: number
  createTime: string
  exceedAmount: number
  id: string
  processSerial: string
  productionOrderId: number
  standardMaterialVo: {
    baseAmount: number
    createBy: number
    createTime: string
    id: string
    isReversal: number
    productModel: {
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
    techDetailId: number
    unitItem: {
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
    updateBy: number
    updateTime: string
    validity_end: string
    validity_start: string
  }
  storageAmount: number
  storageId: number
  storageName: string
  totalAmount: number
  updateBy: number
  updateTime: string
}

// 生产订单分页
export async function queryProductOrderPageList(params: IProductionOrderPageParams) {
  const res = await axios.post<IRes<IListPageResult<IProductionOrderPageItem>>>(
    "/productionOrder/page",
    params
  )
  return res.data.data
}

// 生产订单分页（动态列配置）
export async function queryDynamicProductOrderPageList(params: IDynamicProductionOrderPageParams) {
  const res = await axios.post<IRes<IListPageResult<IDynamicProductionOrderPageItem>>>(
    "/productionOrder/dynamicPage",
    params
  )
  return res.data.data
}

// 获取指定id列表对应的生产订单列表
export const requestProductionOrderListByIds = async (params: { idList: string[] }) => {
  const res = await axios.post<IRes<IProductionOrderPageItem[]>>(
    "/productionOrder/listByIds",
    params
  )
  return res.data.data
}

export async function archiveProductionOrderItem(id: string | number) {
  const res = await axios.put<IRes>(`/productionOrder/archive`, { id })
  return res.data.data
}

export async function checkProductionOrderItem(params: { id: string }) {
  const res = await axios.put<IRes<{ result: number; message: string }>>(
    `/productionOrder/check`,
    params
  )
  return res.data.data
}

export async function unCheckProductionOrderItem(id: string | number) {
  const res = await axios.put<IRes>(`/productionOrder/unCheck`, { id })
  return res.data.data
}

export async function deleteProductionOrderItem(id: string | number) {
  const res = await axios.post<IRes>(`/productionOrder/delete`, { idList: [id] })
  return res.data.data
}

export async function updateProductionOrderItem(params: {
  deliveryDate: string
  id: string
  materialCreateReq: {
    id: string
    storageId: string
    techStandardMaterialId: string
    totalAmount: number
  }[]
  orderAmount: number
  productModelId: string
  source: number // 1MES 2ERP
  techProcessId: string
  type: number // 1 量产 5返工 10试产 15改制
  unitId: string
}) {
  const res = await axios.post<IRes>(`/productionOrder/saveOrUpdate`, params)
  return res.data.data
}

// #endregion

// #region 生产任务
export async function queryProductTaskPageList(params: IProductionTaskPageParams) {
  const res = await axios.post<IRes<IListPageResult<IProductionTaskPageItem>>>(
    "/productionTask/page",
    params
  )
  return res.data.data
}

// 获取指定id列表对应的生产任务列表
export const requestProductTaskListByIds = async (params: { idList: string[] }) => {
  const res = await axios.post<IRes<IProductionTaskPageItem[]>>("/productionTask/listByIds", params)
  return res.data.data
}

export async function archiveProductionTaskCase(id: string) {
  const res = await axios.put<IRes>(`/productionTask/archive`, { id })
  return res.data.data
}

export async function closeProductionTaskCase(id: string) {
  const res = await axios.post<IRes>(`/productionTask/close`, { id })
  return res.data.data
}

// #endregion

// #region 计划排产
export interface ProductionOrderPlanVo {
  entityId: string
  entityName: string
  level: number
  list: InnerProductionOrderPlan[]
}
export interface InnerProductionOrderPlan {
  entityId: string
  taskId: string
  taskType: number
  beginTime: string
  endTime: string
}
export async function getProductionOrderPlanList(
  params: Partial<{
    entityIdList: string[]
    beginTime: string
    endTime: string
    level: number
    source: string // 任务来源 productionOrder/deliveryPlan
  }>
) {
  const res = await axios.post<IRes<ProductionOrderPlanVo[]>>("/productionOrderPlan/list", params)
  return res.data.data
}

// 0无未发布的排产，1当前排产处于未发布状态
export enum PublishStatus {
  None = 0,
  UnPublished = 1
}

export async function getPublishStatus() {
  // /api/productionOrderPlan/task/getPublishStatus
  const res = await axios.get<IRes<PublishStatus>>(`/productionOrderPlan/task/getPublishStatus`)
  return res.data.data
}

export interface IFacilityWorkerNumsItem {
  entityId: string
  entityName: string
  level: number
  taskNum: number
  workerNum: number
}

export async function getFacilityWorkerNums(params: {
  startTime: string
  endTime: string
  level: number
}) {
  const res = await axios.get<IRes<IFacilityWorkerNumsItem[]>>(
    `/productionOrderPlan/getFacilityWorkerNums`,
    {
      params
    }
  )
  return res.data.data
}

export async function getProductionOrderItemDetail(params: {
  currentTime: string
  entityId: string
  level: number
  taskId: string
  taskType: number
  source: string // 任务来源 productionOrder/deliveryPlan
}) {
  const res = await axios.post<IRes<ISchedulePlanDetail>>(
    `/productionOrderPlan/getPlanDetail`,
    params
  )
  return res.data.data
}

export async function getExamSetInfo() {
  const res = await axios.get<
    IRes<{
      createBy: number
      createTime: string
      id: number
      procDefId: string
      procDefName: string
      status: number
      updateBy: number
      updateTime: string
    }>
  >(`/productionOrderPlan/procManager`)
  return res.data.data
}

export async function updateExamSetInfo(params: { id: string; procDefId: string; status: number }) {
  const res = await axios.put<IRes>(`/productionOrderPlan/procManager/saveOrUpdate`, params)
  return res.data.data
}

export async function getProductionOrderProcList() {
  const res = await axios.post<IRes<any[]>>(`/productionOrderPlan/procManager/list`, {})
  return res.data.data
}

// #endregion

// #region 生产报工

export async function getProductionReportPaged(params: IProductionReportPageParams) {
  const res = await axios.post<IRes<IListPageResult<IProductionReportPageItem>>>(
    "/production/report/page",
    params
  )
  return res.data.data
}

export async function getProductionReportInfo(id: string) {
  const res = await axios.post<IRes<IProductionReportInfo>>("/production/report/info", {
    id
  })
  return res.data.data
}

// 获取审核记录
export async function getProductionReportReviews(reportId: string, pageNum = 1, pageSize = 10) {
  const res = await axios.post<IRes<IListPageResult<any>>>("/production/report/review/records", {
    reportId,
    pageQuery: { pageNum, pageSize }
  })
  return res.data.data
}

export enum ReportChartType {
  // 1产品报工合格率统计 2生产单位报工合格率统计 3班次报工数量统计
  Product = 1,
  Unit = 2,
  Classes = 3
}

const ReportChartTypeNameMap = {
  [ReportChartType.Product]: "产品报工合格率统计",
  [ReportChartType.Unit]: "生产单位报工合格率统计",
  [ReportChartType.Classes]: "班次报工数量统计"
} as const

export const ReportChartTypeList = [
  {
    label: ReportChartTypeNameMap[ReportChartType.Product],
    value: ReportChartType.Product,
    legend: "产品报工合格率",
    type: "rate"
  },
  {
    label: ReportChartTypeNameMap[ReportChartType.Unit],
    value: ReportChartType.Unit,
    legend: "生产单位报工合格率",
    type: "rate"
  },
  {
    label: ReportChartTypeNameMap[ReportChartType.Classes],
    value: ReportChartType.Classes,
    legend: "班次报工数量",
    type: "amount"
  }
] as const

/** 生产订单详情 */
export const queryProductionOrderDetail = async (id: string) => {
  const res = await axios.get<IRes<IProductionOrderItem>>(`/productionOrder/${id}`)
  return res.data.data
}

/** 生产任务排产批量保存及更新 */
export const requestUpdateBatchProductionTask = async (
  params: Partial<IProductionTaskUpdateReq>[]
) => {
  const res = await axios.post<IRes>("/productionOrderPlan/task/batchSaveOrUpdate", params)
  return res.data.data
}

/** 生产订单排产时获取可排产工序 */
export const requestProductionScheduleProcessList = async (
  params: Partial<IProductionScheduleProcessReq>
) => {
  const res = await axios.post<IRes<IProductionScheduleProcessRes[]>>(
    "/productionOrderPlan/processSerial/list",
    params
  )
  return res.data.data
}

/** 生产订单-待排产数量 */
export const requestProductionOrderUnPlanAmount = async (id: string) => {
  const res = await axios.get<IRes<number>>(`/productionOrder/unPlanAmount`, {
    params: { orderId: id }
  })
  return res.data.data
}

/** 根据主产出物排产数量获取生产订单各个工序排产数量 */
export const requestProcessAmountByMainProduct = async (
  params: IRequestProcessAmountByMainProductReq
) => {
  const res = await axios.post<IRes<IRequestProcessAmountByMainProductRes[]>>(
    "/productionOrderPlan/inferSerialAmount",
    params
  )
  return res.data.data
}

/** 根据产品类型获取对应销售订单 */
export const requestSaleOrderListByProduct = async (params: IRequestSaleOrderListByProductReq) => {
  const res = await axios.post<IRes<IListPageResult<ISaleOrderItem>>>(
    "/productionOrder/searchSales",
    params
  )
  return res.data.data
}

// 获取指定id列表对应的销售订单列表
export const requestSaleOrderListByIds = async (params: { idList: string[] }) => {
  const res = await axios.post<IRes<ISaleOrderItem[]>>(`/productionOrder/searchSaleByIds`, params)
  return res.data.data
}

/** 查看订单返工、改制信息 */
export const requestProductionOrderReturnOrChangeInfo = async (params: {
  orderId: string
  type: number // 5-返工 15-改制
}) => {
  const res = await axios.post<IRes<IProductionOrderReturnRes>>(
    "/productionOrder/getReworkInfo",
    params
  )
  return res.data.data
}

/** 根据ID查询不合格品评审列表 */
export const requestUnQualifiedReasonList = async (idList: string[]) => {
  const res = await axios.post<IRes<IDefectReviewTaskItem[]>>(`/productionOrder/reviewTasks`, {
    idList
  })
  return res.data.data
}

interface ICopyCraftRouteToTechProcessReq {
  processId: string
  allReverse: boolean
}

/** 复制已有的工艺路线为工单工艺 */
export const requestCopyCraftRouteToTechProcess = async (
  params: ICopyCraftRouteToTechProcessReq
) => {
  const res = await axios.post<IRes<any>>(`/productionOrder/copyTechProcessToProduction`, params)
  return res.data.data
}

/** 自动复制已有的工艺路线为工单工艺 */
export const requestAutoCopyCraftRouteToTechProcess = async (params: { id: string }) => {
  const res = await axios.post<IRes<any>>(
    `/productionOrder/autoCopyTechProcessToProduction`,
    params
  )
  return res.data.data
}

/** 创建新的工单工艺 */
export const requestCreateOrderProcess = async (params: {
  productModelId: string
  orderId?: string
  allReverse: boolean
}) => {
  const res = await axios.post<IRes<any>>(`/productionOrder/createOrderProcess`, params)
  return res.data.data
}

/** 获取生产任务详情 */
export const queryProductionTaskDetail = async (id: string) => {
  const res = await axios.get<IRes<IProductionTaskPageItem>>(`/productionTask/${id}`)
  return res.data.data
}

/** 获取生产任务所在排产计划的剩余可排产数量 */
export const getAvailablePlanQuantity = async (id: string) => {
  const res = await axios.post<IRes<number>>(`/productionTask/getAvailablePlanQuantity`, {
    id
  })
  return res.data.data
}

/** 生产任务追加数量 */
export const requestAddProductionTaskQuantity = async (params: {
  productionTaskId: string
  quantity: number
}) => {
  const res = await axios.post<IRes<number>>(`/productionTask/add`, params)
  return res.data.data
}

/** 自制订单转委外订单 */
export const requestSelfOrderToOutsourcedOrder = async (params: Partial<ISelfOrderToOutRes>) => {
  const res = await axios.post<IRes>(`/productionOrderPlan/convertToDelegate`, params)
  return res.data.data
}

/** 校验工单流程完整性 */
export const requestCheckOrderProcess = async ({
  orderId,
  id
}: {
  orderId: string
  id: string
}) => {
  const res = await axios.post<IRes>(`/productionOrder/checkIntegrity/${orderId}`, { id })
  return res.data.data
}

/** 同步工单关联的流程为工艺路线 */
export const requestSyncOrderProcessToCraftRoute = async (
  params: ISyncOrderProcessToCraftRouteReq
) => {
  const res = await axios.post<IRes<ICraftRouteItem>>(`/productionOrder/syncToTechProcess`, params)
  return res.data.data
}

/** 更新工单流程 */
export const requestUpdateOrderProcess = async (params: { id: string }) => {
  const res = await axios.post<IRes>(`/productionOrder/updateOrderProcess`, params)
  return res.data.data
}

/** 获取试产订单的缓存工单工艺 */
export const requestCachedTechProcessByOrder = async (params: { id: string }) => {
  const res = await axios.post<IRes<ICraftRouteItem>>(
    `/productionOrder/getOrCreateCachedProcess`,
    params
  )
  return res.data.data
}

/** 生产任务子任务列表 */
export const requestChildProductionTask = async (params: IPagedAPIParams<{ id: string }>) => {
  const res = await axios.post<IRes<IListPageResult<IProductionTaskPageItem>>>(
    "/productionTask/children/page",
    params
  )
  return res.data.data
}

/** 生产任务再排产任务列表 */
export const requestReScheduleProduction = async (data: IReScheduleReq) => {
  const res = await axios.post<IRes>("/productionTask/reSchedule", data)
  return res.data.data
}

/** 文智-排产查询工艺相关信息-Ctime,lossTime */
export const queryTechInfoInProductionOrderPlan = async (techVersionId: string) => {
  const res = await axios.post<IRes<IProductionOrderTechInfo[]>>(`/productionOrderPlan/getCTs`, {
    techVersionId
  })
  return res.data.data
}

/** 文智1.2.0 工艺组类型的生产计划拆分 */
export const requestSplitGroupTech = async (id: string) => {
  const res = await axios.post<IRes>(`/productionOrderPlan/groupPlan/split`, { id })
  return res.data.data
}

/** 文智1.2.0 恢复工艺组类型的生产计划 */
export const requestRecoverSplitedGroupTech = async (data: { nodeId: string; orderId: string }) => {
  const res = await axios.post<IRes>(`/productionOrderPlan/groupPlan/recovery`, data)
  return res.data.data
}

/** 文智1.2.0 批量更新排产 */
export const requestBatchUpdateProductionOrderPlan = async (
  data: {
    beginTime?: string
    endTime?: string
    entityIdList?: string[]
    id: string
    mainProductQuantity?: number
    remarks?: string
  }[]
) => {
  const res = await axios.post<IRes>(`/productionOrderPlan/batchUpdateScheduling`, {
    updateReqList: data
  })
  return res.data.data
}

/** 文智1.2.0 批量查询生产订单下的未发布排产 */
export const queryUnpublishedScheduleByOrder = async (orderIds: string[]) => {
  const res = await axios.post<IRes<IScheduleInfoByOrderItem[]>>(
    `/productionOrderPlan/batchQueryScheduling`,
    {
      orderIds
    }
  )
  return res.data.data
}

/** 文智1.2.0 查询订单排产计划信息 */
export const querySchedulePlanByOrder = async (orderIds: string[]) => {
  const res = await axios.post<IRes<ISchedulePlanByOrderItem[]>>(
    `/productionOrderPlan/batchQuery`,
    {
      orderIds
    }
  )
  return res.data.data
}

/** 文智1.2.0 提交发布 */
export const requestPushPublish = async (taskIdList: string[]) => {
  const res = await axios.post<IRes>(`/productionOrderPlan/batchPublishScheduling`, { taskIdList })
  return res.data.data
}

/** 文智1.2.0 取消发布所有未发布的排产 */
export const requestCancelPublishAll = async () => {
  const res = await axios.post<IRes>(`/productionOrderPlan/cancelAllUnpublishedScheduling`)
  return res.data.data
}

/** 文智1.2.0 删除订单下的未发布排产 */
export const requestDeleteSchedule = async (id: string) => {
  const res = await axios.post<IRes>(`/productionOrderPlan/batchDeleteScheduling`, { id })
  return res.data.data
}

/** 文智1.2.0 批量添加排产 */
export const requestBatchAddSchedule = async (data: { id: string; planIdList: string[] }) => {
  const res = await axios.post<IRes>(`/productionOrderPlan/batchAddScheduling`, data)
  return res.data.data
}

/** 文智1.2.0 删除右侧未发布排产 */
export const requestDeleteScheduleRight = async (idList: string[]) => {
  // /api/productionOrderPlan/batchDeleteSchedulingList
  const res = await axios.post<IRes>(`/productionOrderPlan/batchDeleteSchedulingList`, { idList })
  return res.data.data
}

/** 生产订单追加数量提交 */
export const requestProductionOrderReAdd = async (params: IProductionOrderReAddReq) => {
  const res = await axios.post<IRes>(`/productionOrder/add`, params)
  return res.data.data
}

/** 生产订单追加记录分页列表 */
export const queryProductionOrderReAddPageList = async (
  params: IRequestPageParams<Partial<IReAddRecordPageListReq>>
) => {
  const res = await axios.post<IRes<IListPageResult<IReAddRecordListItem>>>(
    "/productionOrder/add/page",
    params
  )
  return res.data.data
}

/** 追加记录复核 */
export const requestReviewProductionOrderReAdd = async (id: string) => {
  const res = await axios.put<IRes>(`/productionOrder/add/check/${id}`)
  return res.data.data
}

/** 追加记录撤回 */
export const requestCallBackProductionOrderReAdd = async (params: { id: string }) => {
  const res = await axios.post<IRes>(`/productionOrder/add/withdraw`, params)
  return res.data.data
}

/** 获取指定生产订单的追加记录 */
export const requestReAddRecordListByProductionOrder = async (params: { id: string }) => {
  const res = await axios.post<IRes<IReAddRecordListItem[]>>(`/productionOrder/add/query`, params)
  return res.data.data
}

/** 生产订单追加数量校验是否存在待复核追加记录订单 */
export const requestCheckReAddRecord = async (params: { id: string }) => {
  const res = await axios.put<IRes<boolean>>(`/productionOrder/add/hasUncheckedRecord`, params)
  return res.data.data
}

/** 获取生产订单所需物料列表 */
export const requestMaterialListByProductionOrder = async (params: {
  techProcessId: string // 工艺路线ID
  orderAmount: number // 订单数量
}) => {
  const res = await axios.get<IRes<IProductionOrderMaterialItem[]>>(
    `/productionOrder/computeMaterials`,
    {
      params
    }
  )
  return res.data.data
}

/** 预排产 */
export interface IAutoScheduleReq {
  productionUnitIds: string[] // 生产单元ID列表
  orderIds: string[] // 订单ID列表
  planBeginTime: string // 计划开始时间
  urgentInsertReason?: string // 紧急插单原因
}

export const requestAutoSchedule = async (params: IAutoScheduleReq) => {
  const res = await axios.post<IRes>(`/productionOrderPlan/autoSchedule`, params)
  return res.data.data
}

// 新增排产计划到列表
export const requestAddScheduleToPlan = async (params: {
  orderId: string
  orderNo: string
  productModelName: string
  planAmount: number
  planBeginTime: string
  planEndTime: string
  entityIdList: string[]
  urgentInsertReason?: string
}) => {
  const res = await axios.post<IRes>(`/productionOrderPlan/addSchedule`, params)
  return res.data.data
}
