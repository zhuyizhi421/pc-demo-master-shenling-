export interface ISearchCustomerParams {
  pageNum: number
  pageSize: number
  customerName?: string
  customerAbbr?: string
  stateList?: number[]
}

export interface ISearchCustomerItem {
  billingAddress: string
  businessAddress: string
  contactName: string
  contactTitle: string
  createBy: string
  createTime: string
  customerAbbr: string
  customerCode: string
  customerName: string
  email: string
  id: string
  isCheck: 0 | 1
  phone: string
  remarks: string
  taxNo: string
  /** 0 启用，1 停用（列表展示） */
  state?: number
  updateBy: string
  updateTime: string
  website: string
}
