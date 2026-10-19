/**
 * 质量运营管理-检验任务模块类型定义
 */

import type { IPaginationSearch, IRequestPageParams } from "@/types/common"

/** 生产过程检-列表查询表单配置接口 */
export interface IProcessInspectSearchForm {
  dispatcherTaskCode?: string
  inspectTaskNo?: string
  date?: [string, string]
  createTimeEnd?: string
  createTimeStart?: string
  inspectType?: number[]
  productionTaskNo?: string
  taskResult?: number[]
  taskStatus?: number[]
  statusList?: number[]
  productModelName?: string
  workstationIdList?: string[]
  facilityldList?: string[]
  productModelNo?: string
}

/** 生产过程检-列表查询参数接口 */
export interface IProcessInspectSearchBaseParams
  extends Omit<IProcessInspectSearchForm, "workstationIdList">,
    IPaginationSearch {
  entityIdList?: string[]
}
export interface IProcessInspectSearchParams {
  pageQueryVO: {
    pageNum: number
    pageSize: number
  }
  conditions: Omit<IProcessInspectSearchBaseParams, "pageNum" | "pageSize">
}

/** 生产过程检-列表项接口 */
export interface IProcessInspectListItem {
  createTime: string
  dispatcherTaskCode: string
  dispatcherTaskId: string
  facilityId: number | string
  facilityName: string
  id: string
  inspectTaskNo: string
  inspectType: number // 1-首检、2-巡检、3-末检、4-采购入库检、5-生产入库检、6-发货出库检、7-退货入库检、8-EPC全检
  productModelCode: string
  productModelId: string
  productModelName: string
  productionTaskNo: string
  sampleNum: number
  taskCompleteBy: number | string
  taskCompleteByName: string
  taskCompleteTime: string
  taskResult: number // 0-结果未出 1-通过 2-不通过
  taskStatus: number // 1-未开始 2-进行中 3-已完结
  techName: string
  workstationId: string
  workstationName: string
  entityName: string
}

/** 生产过程检-样品信息接口 */
export interface IProcessInspectSample {
  id: number
  productModelId: number
  productModelName: string
  sampleItemDTOList: IProcessInspectSampleItem[]
  seqNo: number
  taskId: number
}

/** 生产过程检-样品项信息接口 */
export interface IProcessInspectSampleItem {
  actualValue: number
  createTime: string
  id: number
  inspectItemCode: string
  inspectItemImageUrl: string
  inspectItemName: string
  itemResult: number
  methodDesc: string
  remark: string
  remarkImageIds: string
  remarkImageUrls: string
  sampleId: number
  standardDesc: string
  standardMax: number
  standardMaxInclusive: number
  standardMin: number
  standardMinInclusive: boolean
  standardType: number
  submitterName: string
  taskId: number
  unitName: string
  inspectStandard?: string
}

/** 非过程检-查询项 */
export interface INonProcessInspectSearchForm {
  productModelName?: string
  dispatcherTaskCode?: string
  inspectTaskNo?: string
  date?: [string, string]
  inspectType?: number[]
  productionTaskNo?: string
  taskResult?: number[]
  taskStatus?: number
  statusList?: number[]
  bizCode?: string
}

/** 非过程检-列表查询参数 */
export interface INonProcessInspectSearchParams
  extends IRequestPageParams<Partial<INonProcessInspectSearchForm>> {}

/** 非过程检-列表项接口 */
export interface INonProcessInspectItem {
  id: string
  inspectTaskNo: string
  bizId: string
  bizCode: string
  inspectType: number
  productModelId: string
  productModelCode: string
  productModelName: string
  productTotalQuantity: number
  unitId: string
  unitName: string
  decimalNumber: number
  suggestSampleQuantity: number
  sampleNum: number
  taskStatus: number
  taskResult: number
  createTime: string
  taskCompleteTime: string
  taskCompleteBy: string
  taskCompleteByName: string
}

export interface IEpcInspectTaskDetailHead {
  createTime: string
  decimalNumber: number
  inspectTaskId: number
  inspectTaskNo: string
  productModelCode: string
  productModelId: number
  productModelName: string
  productTotalQuantity: number
  qualifiedProductQuantity: number
  taskCompleteBy: number
  taskCompleteByName: string
  taskCompleteTime: string
  taskStatus: number
  unitId: number
  unitName: string
  unqualifiedProductQuantity: number
}

// 梯度模型 列表模型
export interface GradientModel {
  createBy: string
  createTime: string
  id: string
  modelName: string
  modelNo: string
  remarks: string
  status: number
  updateBy: string
  updateTime: string
}

//梯度搜索表单
export interface GradientSearchedModel {
  modelName: string
  modelNo: string
  status?: 0 | 1
}

export interface GradientListModel {
  batchNumMax: number // 批量下限(含)
  batchNumMin: number // 批量上限(不含)
  createBy: string // 创建人ID
  createTime: string // 创建时间
  id: string // ID
  modelId: string // 梯度模型ID
  sampleNum: number // 样本数量
  seqNo: number // 序号
  updateBy: string // 更新人ID
  updateTime: string // 更新时间
}

//梯度详情模型
export interface GradientDetailModel {
  id: string
  itemList: GradientListModel[]
  modelName: string
  modelNo: string
  remarks: string
  status: number // 状态，0-停用/1-正常
}

// /base-backend-mes/api/pc/qa/inspectTask/attachment/list
export interface AttachmentModel {
  attachmentName: string
  attachmentUrl: string
  id: string
  seqNum: number
  uploadTime: string
}

export interface UploadAttachmentModel {
  fileIds: string[]
  taskId: string
}

//样件
export interface ObjectList {
  barCode: string
  barCodeId: string
  decimalNumber: number
  id: string
  mroInformationId: string
  mroModelCode: string
  mroModelId: string
  mroModelName: string
  stocks: number
  unitModelId: string
  unitModelName: string
}

export interface InspectionStandard {
  standardDesc: string
  standardMax: number
  standardMaxInclusive: number
  standardMin: number
  standardMinInclusive: number
  standardType: number
  unitId: string
  unitName: string
}

export interface JobList {
  createBy: string
  createTime: string
  id: string
  jobName: string
  licenseApplyProcessId: string
  licenseApplyProcessName: string
  licenseUnfreezeProcessId: string
  licenseUnfreezeProcessName: string
  updateBy: string
  updateTime: string
}

export interface LicenseList {
  autoFreeze: number
  createBy: string
  createTime: string
  equipmentBizIdList: number[]
  equipmentBizIds: string
  equipmentBizNames: string
  equipmentType: number
  id: string
  idleMaxDays: number
  jobId: string
  jobName: string
  licenseName: string
  preNoticeDays: number
  updateBy: string
  updateTime: string
}

export interface PositionList {
  code: string
  createBy: string
  createTime: string
  id: string
  name: string
  remark: string
  updateBy: string
  updateTime: string
}

export interface InspectionUser {
  barcode: string
  barcodeId: string
  bindNickname: string
  bindUserId: string
  bindUsername: string
  createBy: string
  createTime: string
  depId: string
  depName: string
  email: string
  empNo: string
  id: string
  jobList: JobList[]
  licenseList: LicenseList[]
  name: string
  phone: string
  positionList: PositionList[]
  remark: string
  status: number
  updateBy: string
  updateTime: string
}

export interface RemarkFile {
  createBy: string
  createTime: string
  deploymentId: string
  directoryName: string
  extension: string
  fileName: string
  fileSize: string | number
  fileStatus: number
  hash: string
  id: string
  path: string
  size: string | number
  sourceName: string
  updateBy: string
  updateTime: string
  version: string
}

export interface File {
  createBy: string
  createTime: string
  deploymentId: string
  directoryName: string
  extension: string
  fileName: string
  fileSize: string
  fileStatus: number
  hash: string
  id: string
  path: string
  size: string
  sourceName: string
  updateBy: string
  updateTime: string
  version: string
}

export interface ItemList {
  createTime: string
  files: File[]
  id: string
  inspectionMethod: string
  inspectionName: string
  inspectionNo: string
  inspectionResult: number
  inspectionStandard: InspectionStandard
  inspectionTime: string
  inspectionUsers: InspectionUser[]
  mroItemConfigId: string
  mroSampleCheckTaskId: string
  mroSampleCheckTaskSampleId: string
  practicalValue: number
  remarkFiles: RemarkFile[]
  remarks: string
}

export interface SampleList {
  barCode: string
  barCodeId: string
  id: string
  itemList: ItemList[]
  mroInformationId: string
  seqNo: number
}

export interface MroSampleCheckTaskPageModel {
  checkComplete: string
  checkNo: string
  checkResult: number
  checkStatus: number
  createTime: string
  equipmentId: string
  equipmentModelId: string
  equipmentModelName: string
  equipmentModelNo: string
  id: string
  mroModelId: string
  mroModelName: string
  mroModelNo: string
  objectList: ObjectList[]
  productModelName: string
  productModelNo: string
  productionExecutionCode: string
  productionExecutionId: string
  productionOrderId: string
  productionOrderNo: string
  productionTaskId: string
  productionTaskNo: string
  remarks: string
  sampleList: SampleList[]
  startTime: string
  inspectionTime?: string
}

export interface ITaskProductItem {
  barcode: string
  batchId: string
  batchNo: string
  decimalNumber: number
  defaultQuantity: number
  defaultUnitName: string
  inspectTaskId: string
  productId: string
  productModelCode: string
  productModelName: string
}

export interface IInspectionObjectTableRow {
  barcode: string
  decimalNumber?: number
  productModelCode: string
  productModelId: string
  productModelName: string
  quantity: number
  unitId: string
  unitName: string
  vehicleId: string
  vehicleBarcode: string
  vehicleId: string
}

export interface ISaveGradientParams {
  id: string | null
  itemList: {
    id: string // ID
    batchNumMax: number // 批量下限(含)
    batchNumMin: number // 批量上限(不含)
    sampleNum: number // 样本数量
  }[]
  modelName: string
  modelNo: string
  remarks: string
  status: number // 状态，0-停用/1-正常
}
