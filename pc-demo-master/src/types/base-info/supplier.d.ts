/** 供应商信息 */

export interface ISupplierItem {
  billingAddress: string // 账单地址
  businessAddress: string // 营业地址
  cloudAccount: string // 云账号，若未创建则为null
  contactName: string // 联系人姓名
  contactTitle: string // 联系人职称
  createBy: string // 创建人ID
  createCloudAccount: number // 是否已创建云账号：1已创建，0未创建
  createTime: string // 创建时间
  email: string // 电子邮件
  id: string // ID
  isCheck: number // 状态1已复核，0未复核
  isUncheck: number // 是否免检：1免检，0不免检
  phone: string // 联系电话
  remarks: string // 备注
  supplierAbbr: string // 供应商简称
  supplierCode: string // 供应商编号
  supplierName: string // 供应商名称
  supplierPlatformAccount: string // 供应商平台账号
  supplierPlatformPassword: string // 供应商平台密码
  supplierPlatformStatus: number // 供应商平台开启状态: 1开启 0关闭（默认）
  taxNo: string // 税号
  /** 0 启用，1 停用（列表） */
  state?: number
  updateBy: string // 更新人ID
  updateTime: string // 更新时间
  website: string // 网址
}

export interface ISupplierPlatDetail {
  loginCode: string
  password: string
  supplierCode: string
  supplierName: string
  platformUrl: string
}

export interface ISearchSupplierParams {
  pageNum: number
  pageSize: number
  supplierName?: string
  supplierAbbr?: string
  stateList?: number[]
}

export type ISupplierCreateParams = Partial<{
  billingAddress: string // 账单地址
  businessAddress: string // 营业地址
  contactName: string // 联系人姓名
  contactTitle: string // 联系人职称
  createCloudAccount: number // 是否已创建云账号：1已创建，0未创建
  email: string // 电子邮件
  isUncheck: number // 是否免检：1免检，0不免检
  phone: string // 联系电话
  remarks: string // 备注
  supplierAbbr: string // 供应商简称
  supplierCode: string // 供应商编号
  supplierName: string // 供应商名称
  supplierPlatformStatus: number // 供应商平台开启状态：1 开启，0 关闭（默认）
  taxNo: string // 税号
  website: string // 网址
  state: number // 状态：0 启用，1 停用
}>

export type ISupplierUpdateParams = ISupplierCreateParams & { id: string }

export type ISupplierCopyData = {
  supplierPlatformAccount: string // 供应商平台账号
  supplierPlatformPassword: string // 供应商平台密码
  supplierPlatformAddress: string // 供应商平台地址
}
