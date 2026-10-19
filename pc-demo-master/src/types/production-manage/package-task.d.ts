import type { IRequestPageParams } from "@/types/common"

export interface IPackageTaskPageListParams
  extends IRequestPageParams<
    Partial<{
      deliveryPlanNo: string // 发货计划编号
      drawingNumber: string // 产品图号
      endDate: string // 结束时间
      entityIds: string[] // 工厂建模实体id列表
      productModelName: string // 产品名称
      productModelNo: string // 产品编号
      productionTaskNo: string // 生产任务编号
      startDate: string // 开始时间
      status: number // 状态 1已复核 5未复核 6执行中 8已暂停 9已完成 10已关闭
      statuses: number[] // 状态列表
    }>
  > {}

export interface IPackageTaskListItem {
  areaIds: string[] // 位置信息ID
  completeEmpName: string // 结案人
  createTime: string // 创建时间
  deliveryCode: string // 发货计划编号
  endTime: string // 结束时间
  entityNames: string // 位置信息
  id: string // 排产任务ID
  no: string // 排产任务编号
  planEndTime: string // 计划结束时间
  planStartTime: string // 计划开始时间
  products: {
    drawingNumber: number // 产品图号
    decimalNumber: number // 单位精度
    planQty: number // 计划数量
    completeQuantity: number // 完成数量
    productModelCode: string // 产品编号
    productModelId: string // 产品模型ID
    productModelName: string // 产品名称
    schedulableQty: number // 可排数
    unPublishQty: number // 未发布数
    unitId: string // 单位id
    unitName: string // 单位名称
  }[] // 产品信息
  startTime: string // 开始时间
  status: number // 状态，1已复核 5未复核 6执行中 8已暂停 9已完成 10已关闭
}

export interface IPackageTaskAppendNumberParams {
  taskId: string // 排产任务id
  additions: {
    addQty: number // 追加数量
    productModelId: string // 产品模型id
  }[]
}

export type IPackageTaskAppendNumberTableItem = IPackageTaskListItem["products"][0] & {
  addQty?: number // 追加数量
}
