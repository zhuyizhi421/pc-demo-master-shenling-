export interface IClassesItem {
  beforeMinute: number
  belongDay: number
  createBy: number
  createTime: string
  endTime: string
  id: number
  remark: string
  rotationCode: string
  rotationName: string
  rotationStatus: number
  rotationTime: string
  startTime: string
  updateBy: number
  updateTime: string
}

export interface ITeamGroupItem {
  createBy: number
  createTime: string
  id: number
  leader: {
    id: number
    name: string
  }
  leaderIds: string[]
  leaderNames: string
  memberNumber: number
  remark: string
  teamCode: string
  teamName: string
  teamStatus: number
  updateBy: number
  updateTime: string
  leaderList?: {
    name: string
  }[]
}

export interface ISchedulePlanPageParams {
  productionUnitIdList?: string[]
  pageNum: number
  pageSize: number
  schedulingName?: string
  startDate?: string
  endDate?: string
}

export interface ISchedulePlanPageItem {
  productionUnitId: string
  productionUnitName: string
  createBy: string
  createTime: string
  endDate: string
  id: string
  remark: string
  schedulingCode: string
  schedulingName: string
  startDate: string
  updateBy: string
  updateTime: string
}

export interface ISchedulePlanDetail {
  deliveryPlanVo: {
    customerName: string // 客户名称
    deliveryCode: string // 发货计划编号
    deliveryTime: string // 发货日期
    details: {
      decimalNumber: number // 单位精度
      detailId: string // 发货计划明细ID
      planQty: number // 计划发货数量
      productModelId: string // 产品模型Id
      productModelName: string // 产品名称
      schedulableQty: number // 可排包装数
      unitCode: string // 单位编号
      unitId: string // 产品模型Id
      unitName: string // 单位名称
      unpublishedQty: number // 未发布数量
    }[]
    id: string // 发货计划ID
    planBeginTime: string // 计划开始时间
    planEndTime: string // 计划结束时间
    targetDetails: {
      decimalNumber: number // 单位精度
      detailId: string // 发货计划明细ID
      planQty: number // 计划发货数量
      productModelId: string // 产品模型Id
      productModelName: string // 产品名称
      schedulableQty: number // 可排包装数
      unitCode: string // 单位编号
      unitId: string // 产品模型Id
      unitName: string // 单位名称
      unpublishedQty: number // 未发布数量
    }[]
  }
  entityCode: string // 工厂建模编号
  entityIds: string[] // 工厂建模ID
  entityName: string // 工厂建模名称
  level: number // 工厂建模的层级 1-公司 2-工厂 3-区域 4-生产单位 21-工位
  orderDetail: {
    archiveTime: string // 结案时间
    cachedProcessId: string // 试产后修改的工艺路线ID,缓存作用
    completeAmount: number // 实际完成数量
    createBy: string // 创建人ID
    createByName: string // 创建人姓名
    createTime: string // 创建时间
    deliveryDate: string // 交付日期
    fileIds: string[] // 附件ID列表
    files: {
      fileId: string
      fileName: string
      fileURL: string
    }[]
    id: string
    materials: any[]
    no: string // 订单号
    orderAmount: number // 订单数量
    orderId: string // 返工/改制 订单的原生产订单ID
    originalOrderNo: string // 返工/改制 订单的原生产订单NO
    planAmount: number // 排产数量
    productModel: any
    productModelId: string // 产品模型ID
    productModelNo: string // 产品编号
    productionMethod: number // 1-自制 2-委外
    productionProgress: number // 生产进度
    remark: string // 备注
    saleCode: string // 销售任务编号
    saleContent: string // 销售订单
    saleId: string // 销售订单ID
    saleIds: string[] // 销售订单ID列表
    saleVOList: any[] // 销售订单列表
    serialInfos: any[] // 序列号信息
    source: number // 来源 1MES 2ERP
    sourceCode: string // 来源单号
    specifiedInboundWarehouseId: string // 指定入库仓库ID
    specifiedInboundWarehouseName: string // 指定入库仓库名称
    status: number // 状态，1已复核 5未复核 9结案 10已关闭
    tag: string // 标签
    taskId: string // 任务ID
    techProcess: any // 工艺路线基础DTO对象
    techProcessDto: any // 工艺路线基础DTO对象
    techProcessId: string // 工艺路线ID
    techProcessVersionStatus: number // 工艺路线版本状态(1.设计中 2.已发布 3.已作废)
    type: number // 类型 1 量产 5返工 10试产 15改制
    unitId: string // 单位
    unitItem: any // 单位DTO对象
    updateBy: string // 更新人ID
    updateTime: string // 更新时间
  }
  orderPlanDetail: {
    availableAmount: number // 可排生产数量
    createBy: string // 创建人的 ID，如果未提供则默认为 NULL
    createTime: string // 创建时间，默认为当前时间戳，不允许为空
    ctTime: number // 预计生产或CT耗时 单位分钟
    id: string // 计划ID
    planAmount: number // 计划生产数量
    planBeginTime: string // 计划开始时间
    planEndTime: string // 计划结束时间
    processSerial: string // 工序 子工艺版本所处当前路线的位置
    productModelName: string // 产出产品名称
    taskAmount: number // 本次排产数量-排产计划下的某个任务的排产数量
    taskType: number // 任务状态 未发布 251， 审批中 253， 已发布 257 已加工 262
    techName: string // 工艺名称
    techVersionId: string // 工序(工艺版本ID）
    unPublishAmount: number // 未发布排产
    updateBy: string // 更新人的 ID，如果未提供则默认为 NULL
    updateTime: string // 更新时间，默认为当前时间戳，不允许为空
  }
  schedulingDetail: {
    endTime: string // 结束时间 yyyy-MM-dd HH:mm:ss
    isStopTime: boolean // 是否处于停机时间
    leaderList: {
      id: string // 班组长id
      name: string // 姓名
    }[]
    memberNumber: number // 班组人数
    rotationCode: string // 班次编号
    rotationName: string // 班次名称
    shiftDate: string // 归属日期 yyyy-MM-dd
    startTime: string // 开始时间 yyyy-MM-dd HH:mm:ss
    stopEndTime: string // 停机结束时间 yyyy-MM-dd HH:mm:ss
    stopStartTime: string // 停机开始时间 yyyy-MM-dd HH:mm:ss
    teamCode: string // 班组编号
    teamName: string // 班组名称
  }
}
