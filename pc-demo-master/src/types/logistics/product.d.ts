export interface ProductModel {
  /** 产品编号 */
  code?: string
  /**
   * 创建人ID
   * @format int64
   */
  createBy?: number
  /**
   * 创建时间
   * @format date-time
   */
  createTime?: string
  /** 自定义字段 */
  customizedFields?: CustomizeFieldValueVO[]
  /**
   * 默认单位ID
   * @format int64
   */
  defaultUnitId?: number
  /** 默认单位名字 */
  defaultUnitName?: string
  /**
   * ID
   * @format int64
   */
  id?: number
  /**
   * 是否主体物料（0否 1是）
   * @example false
   */
  isKeyMaterial?: boolean
  /**
   * 是否是倒扣反冲物料（0否 1是）
   * @format int32
   */
  isReversal?: number
  /** 产品名称 */
  name?: string
  /**
   * 最低库存
   * @format bigdecimal
   */
  minStock?: number
  /**
   * 安全库存
   * @format bigdecimal
   */
  safeStock?: number
  /** 产品类别编号 */
  productCategoryCode?: string
  /**
   * 产品类别ID
   * @format int64
   */
  productCategoryId?: number
  /** 产品类别名字 */
  productCategoryName?: string
  /** 产品模型绑定单位集 */
  productModelUnitList?: ProductModelUnit[]
  /**
   * 产品类型(1-原材料/2-外购件/3-总成品/4-半成品)
   * @format int32
   */
  productType?: number
  /** 备注 */
  remark?: string
  /**
   * 状态(1-启用,0-停用)
   * @format int32
   */
  status?: number
  /**
   * 更新人ID
   * @format int64
   */
  updateBy?: number
  /**
   * 更新时间
   * @format date-time
   */
  updateTime?: string
}
export interface CustomizeFieldValueVO {
  /** 属性定义 */
  fieldDef?: CustomizedFieldDTO
  /** 属性值 */
  value?: string
}
/** ProductModelUnit */
export interface ProductModelUnit {
  /**
   * 单位换算基数
   * @format bigdecimal
   */
  conversionBasis?: number
  /**
   * 创建人ID
   * @format int64
   */
  createBy?: number
  /**
   * 创建时间
   * @format date-time
   */
  createTime?: string
  /**
   * ID
   * @format int64
   */
  id?: number
  /**
   * 是否是默认单位(0-否,1-是)
   * @format int32
   */
  isDefaultUnit?: number
  /**
   * 产品模型ID(外键)
   * @format int64
   */
  productModelId?: number
  /** 单位编号(冗余) */
  unitCode?: string
  /**
   * 单位ID(外键)
   * @format int64
   */
  unitId?: number
  /** 单位名字(冗余) */
  unitName?: string
  /**
   * 更新人ID
   * @format int64
   */
  updateBy?: number
  /**
   * 更新时间
   * @format date-time
   */
  updateTime?: string
}
