export interface IPackageTaskCreateParams {
  deliveryPlanId: string // 发货计划ID
  productionTaskId?: string // 生产任务ID
  beginTime?: string // 开始时间
  endTime?: string // 结束时间
  entityIds?: string[] // 位置ID列表
  productList: {
    planQty: number // 计划数量
    productModelId: string // 产品模型ID
    unitId: string // 单位Id
  }[]
}

export interface IPackageScheduleTaskDetail {
  customerName: string // 客户名称
  deliveryCode: string // 发货计划编号
  id: string // 发货计划ID
  defaultEntityIds: string[] // 默认生产单位id
  scheduleTaskVos: {
    // 排产任务
    areaIds: string[]
    completeEmpName: string
    createTime: string // 创建时间
    deliveryCode: string
    endTime: string // 结束时间
    entityNames: string // 位置信息
    id: string // 排产任务ID
    no: string // 排产任务编号
    planEndTime: string // 计划结束时间
    planStartTime: string // 计划开始时间
    products: {
      decimalNumber: number // 单位精度
      planQty: number // 计划数量
      productModelCode: string // 产品编号
      productModelId: string // 产品模型ID
      productModelName: string // 产品名称
      schedulableQty: number // 可排数
      unPublishQty: number // 未发布数
      unitId: string // 单位id
      unitName: string // 单位名称
    }[]
    startTime: string // 开始时间
    status: number // 状态，1已复核 5未复核 6执行中 8已暂停 9已完成 10已关闭
  }[]
  selectableProducts: {
    // 可选产品列表
    decimalNumber: number // 单位精度
    planQty: number // 计划数量
    productModelCode: string // 产品编号
    productModelId: string // 产品模型ID
    productModelName: string // 产品名称
    schedulableQty: number // 可排数
    unPublishQty: number // 未发布数
    unitId: string // 单位id
    unitName: string // 单位名称
  }[]
}

export interface IPackageScheduleTaskListItem {
  decimalNumber: number // 单位精度
  productModelCode: string // 产品编号
  productModelId: string // 产品模型ID
  productModelName: string // 产品名称
  schedulableQty: number // 可排数
  unitId: string // 单位id
  unitName: string // 单位名称
  planQty?: number // 排产数量
  isSelect?: boolean // 是否选中
}
