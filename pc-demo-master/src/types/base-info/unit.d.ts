export interface IUnitParams {
  id?: number
  pageNum?: number
  pageSize?: number
  remarks?: string
  unitCode?: string
  unitName?: string
  decimalNumber?: number
}

export type IUnitQueryParams = Omit<IUnitParams, "pageNum" | "pageSize">

export interface IUnitItem {
  id: number
  unitCode: string
  unitName: string
  decimalNumber: number
  remarks: string
  createBy: number
  createTime: string
  updateBy: number
  updateTime: string
}

export interface ICreateUnitParams {
  productModelId: string
  unitId: string
  isDefaultUnit: number
}
