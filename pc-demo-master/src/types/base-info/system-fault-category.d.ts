export interface ISystemFaultCategoryInfo {
  categoryName: string // 类型名称
  categoryNo: string // 类型编号
  createBy: string // 创建人ID
  createTime: string // 创建时间
  faultType: number // 故障类型(1设备故障,2MRO故障,3产品故障,4Andon故障)
  id: string // 故障类型ID
  remarks: string // 备注
  updateBy: string // 更新人ID
  updateTime: string // 更新时间
}

export interface ISystemFaultCategoryCreateParams
  extends Partial<{
    categoryName: string // 类型名称
    categoryNo: string // 类型编号
    faultType: number // 故障类型(1设备故障,2MRO故障,3产品故障,4Andon故障)
    remarks: string // 备注
  }> {}

export interface ISystemFaultCategoryUpdateParams extends ISystemFaultCategoryCreateParams {
  id: string
}

export interface ISystemFaultCategoryAllListParams {
  faultType: number // 故障类型业务分类(1设备故障,2MRO故障,3产品故障,4Andon故障)
  categoryNo?: string // 类型编号
  categoryName?: string // 类型名称
}

export interface ISystemFaultTypePageListParams {
  categoryName?: string // 类型名称
  categoryNo?: string // 类型编号
  faultType?: number // 1设备故障,2MRO故障,3产品故障,4Andon故障)
  pageNum: number
  pageSize: number
}
