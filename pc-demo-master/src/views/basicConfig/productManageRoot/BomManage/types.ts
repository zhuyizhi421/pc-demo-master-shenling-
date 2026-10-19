/**
 * BOM列表项
 */
export interface IBomItem {
  id: string
  productCode: string
  productName: string
  source: "ERP" | "系统"
  version: string
  status: "unpublished" | "published" | "disabled"
  effectiveTime: string
  createTime: string
  remark?: string
}

/**
 * BOM查询参数
 */
export interface IBomParams {
  pageNum: number
  pageSize: number
  productCode?: string
  productName?: string
  source?: string
  status?: string
}

/**
 * BOM表单数据
 */
export interface IBomFormData {
  id?: string
  productId: string
  productCode: string
  productName: string
  version: string
  effectiveTime: string
  remark?: string
  items: IBomItemDetail[]
}

/**
 * BOM明细项
 */
export interface IProductUnit {
  unitId: string
  unitName: string
  unitCode?: string
  isDefaultUnit?: number
}

export interface IBomItemDetail {
  id?: string
  productId: string
  productCode: string
  productName: string
  unitId: string
  unitName: string
  unitList: IProductUnit[]
  baseQuantity: number
  composeQuantity: number
}

/**
 * BOM升级数据
 */
export interface IBomUpgradeData {
  originalId: string
  version: string
  effectiveTime: string
}
