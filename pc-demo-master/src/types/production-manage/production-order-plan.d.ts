/** 新建，调整，拆分:参数 */
export type IProductionOrderUpdateReq = {
  beginTime: string
  ctTime?: numebr
  directPublish?: boolean
  endTime: string
  entityId: string
  level: number
  mainProductQuantity: number
  splitQuantity?: number
  parentProductionTaskId?: string
  remarks?: string
}

/** 工艺信息 */
export interface IProductionOrderTechInfo {
  createBy: string
  createTime: string
  ctTime: number // 标准工时-CT（基数）单位分钟
  abstractAreaId: string // entityId 可能为工位，或者区域等，后端未改字段名
  id: string
  lossTime: number // 损耗工时-单位分钟
  postChangeTime: number // 后置换型时间 单位分钟
  preChangeTime: number // 前置换型时间 单位分钟
  priority: number //优先级
  sourceId: string
  techDetailId: string
  techVersionId: string
  tsn: string
  updateBy: string
  updateTime: string
  workerNum: number // 	所需工作人数
}

interface IReScheduleReqItem {
  beginTime: string
  endTime: string
  entityIds: string[]
  level: number
  productionTaskId?: string
  originalTaskId?: string
  quantity: number
}

/** 生产任务-再排产参数 */
export interface IReScheduleReq {
  originalTask: IReScheduleReqItem
  splitTaskList: IReScheduleReqItem[]
}

/** 根据生产订单下的未发布排产 */
export interface IScheduleInfoByOrderItem {
  drawingNumber: string
  orderId: string
  orderNo: string
  orderPlanSerialVoList: {
    totalAmount?: number
    availableAmount: number
    entityIdList: string[]
    id: string
    planAmount: number
    planBeginTime: string
    planEndTime: string
    planId: string
    processSerial: string
    techId: string
    techName: string
  }[]
  productModelCode: string
  productModelName: string
}

/** 查询订单排产计划信息 */
export interface IOrderPlanSerialVo {
  availableAmount: number
  children: IOrderPlanSerialVo[]
  id: string
  planAmount: number
  processSerial: string
  prodUnits: IProductionOrderTechInfo[]
  productBaseAmount: number
  productModel: {
    code: string
    createBy: string
    createTime: string
    customizedFields: {
      fieldDef: {
        fieldCode: string
        fieldName: string
        fieldType: number
        formType: number
        id: string
        isActive: boolean
        isRequired: boolean
      }
      value: string
    }[]
    defaultStorageId: string
    defaultUnitId: string
    defaultUnitName: string
    drawingNumber: string
    id: string
    isKeyMaterial: boolean
    isReversal: number
    name: string
    overReceiveRate: number
    period: number
    productCategoryCode: string
    productCategoryId: string
    productCategoryName: string
    productModelUnitList: {
      conversionBasis: number
      createBy: string
      createTime: string
      id: string
      isDefaultUnit: number
      productModelId: string
      unitCode: string
      unitId: string
      unitName: string
      updateBy: string
      updateTime: string
    }[]
    productType: number
    remark: string
    specification: string
    status: number
    updateBy: string
    updateTime: string
  }
  techName: string
  techVersionId: string
  type: number
  unPublishAmount: number
  unitItem: {
    createBy: string
    createTime: string
    decimalNumber: number
    id: string
    remarks: string
    unitCode: string
    unitName: string
    updateBy: string
    updateTime: string
  }
}
export interface ISchedulePlanByOrderItem {
  drawingNumber: string
  orderId: string
  orderNo: string
  orderPlanSerialVoList: IOrderPlanSerialVo[]
  productModelCode: string
  productModelName: string
}
