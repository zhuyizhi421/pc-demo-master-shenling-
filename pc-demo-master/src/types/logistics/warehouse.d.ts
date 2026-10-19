export interface IWarehousePageParams {
  facilityCode: string // 可选字段：仓库编号
  facilityName: string // 可选字段：仓库名称
  isEnable: boolean // 可选字段：状态是否启用
  pageNum: number // 必选字段：每页显示条数
  pageSize: number // 必选字段：当前页页码
  warehouseType: number
}

export interface IWarehousePageListParams {
  facilityCode: string // 可选字段：仓库编号
  facilityName: string // 可选字段：仓库名称
  isEnable: boolean // 可选字段：状态是否启用
  pageNum: number // 必选字段：每页显示条数
  pageSize: number // 必选字段：当前页页码
  warehouseTypeList: number[] // 可选字段：仓库类型列表
}

export interface IWarehousePageListItem {
  barcode: string // 非必须字段：仓库标签码
  barcodeId: number // 非必须字段：仓库标签码id，格式为 int32
  facilityCode: string // 非必须字段：仓库编号
  facilityName: string // 非必须字段：仓库名称
  id: number // 非必须字段：ID，格式为 int64
  isEnable: boolean // 非必须字段：状态是否启用
  locationNum: number // 非必须字段：库位数量，格式为 int32
  outboundRule: number // 非必须字段：出库规则（0无，1建议先进先出，2建议后进先出，3强制先进先出，4强制后进先出），格式为 int32
  parentEntityName: string // 非必须字段：所属区域名称
  parentId: number // 非必须字段：所属区域模型id，格式为 int64
  supervisorNames: string // 非必须字段：仓库负责人
  warehouseType: number
}

export interface IWarehouseEditParams {
  autoGenerateCode: boolean
  barcode: string
  facilityName?: string // 非必须字段：仓库名称
  outboundRule?: number // 非必须字段：出库规则（0无，1建议先进先出，2建议后进先出，3强制先进先出，4强制后进先出），格式为 int32
  supervisors?: {
    createBy?: number // 非必须字段：创建人ID，格式为 int64
    createTime?: string // 非必须字段：创建时间，格式为 date-time
    id?: number // 非必须字段：ID，格式为 int64
    supervisorId?: number // 非必须字段：负责人ID，格式为 int64
    supervisorName?: string // 非必须字段：负责人
    updateBy?: number // 非必须字段：更新人ID，格式为 int64
    updateTime?: string
  }[] // 非必须字段：负责人列表，每个负责人是一个 Supervisor 对象的数组
}
