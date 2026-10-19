export interface ISystemFaultInfo {
  createBy: string // 创建人的 ID，如果未提供则默认为 NULL
  createTime: string // 创建时间，默认为当前时间戳，不允许为空
  faultCategoryId: string // 故障类型ID
  faultCategoryName: string // 故障类型名字
  faultName: string // 故障项名字
  faultNo: string // 故障项编号
  faultType: number // 故障类型业务分类(1设备故障,2MRO故障,3产品故障,4Andon故障)
  id: string // 故障项ID
  isEnabled: boolean // example: false 是否启用(false-停用 true-启用)
  remarks: string // 备注
  updateBy: string // 更新人的 ID，如果未提供则默认为 NULL
  updateTime: string // 更新时间，默认为当前时间戳，不允许为空
}

export interface ISystemFaultPageParams {
  faultCategoryId?: string // 故障类型ID
  faultName?: string // 故障项名
  faultNo?: string // 故障项编号
  faultType?: number // 1设备故障,2MRO故障,3产品故障,4Andon故障)
  isEnabled?: boolean // 启用状态(false-已停用,true-已启用)
  pageNum: number
  pageSize: number
}

export interface ISystemFaultCreateParams
  extends Partial<{
    faultCategoryId: string // 故障类型ID
    faultName: string // 故障项名
    faultNo: string // 故障项编号
    remarks: string // 备注
  }> {}

export interface ISystemFaultUpdateParams extends ISystemFaultCreateParams {
  id: string
}

export interface ISystemFaultUpdateStatusParams {
  faultId: string // 故障项ID
  newEnabledStatus: boolean // 新的启用状态(true-启用 false-停用)
}

export interface ISystemFaultTreeItem {
  categoryName: string // 类型名称
  categoryNo: string // 类型编号
  faultTreeNodeList: ISystemFaultTreeItem[] // 子故障项树形节点集合
  faultType: number // 故障类型业务分类(1设备故障,2MRO故障,3产品故障,4Andon故障)
  id: string // 故障类型ID
}
