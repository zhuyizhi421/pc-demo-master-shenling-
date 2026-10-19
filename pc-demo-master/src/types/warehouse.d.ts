export interface LogisticsStorageFacility {
  /** 仓库标签码 */
  barcode?: string
  /**
   * 仓库标签码id
   * @format int64
   */
  barcodeId?: number
  /** 仓库编号 */
  facilityCode?: string
  /** 仓库名称 */
  facilityName?: string
  /**
   * ID
   * @format int64
   */
  id?: string
  /**
   * 状态 是否启用
   * @example false
   */
  isEnable?: boolean
  /**
   * 库位数量
   * @format int32
   */
  locationNum?: number
  /**
   * 出库规则:0无1建议先进先出2建议后进先出3强制先进先出4强制后进先出
   * @format int32
   */
  outboundRule?: number
  /** 所属区域名称 */
  parentEntityName?: string
  /**
   * 所属区域模型id
   * @format int64
   */
  parentId?: number
  /** 仓库负责人姓名 */
  supervisorNames?: string
  /** 仓库负责人 */
  supervisors?: TsesFmFacilitySupervisor[]
  /**
   * 仓库类型:1原料库2成品库3半成品库4线边库5不合格品库6报废库7MRO库8EPC全检库
   * @format int32
   */
  warehouseType?: number
}
export interface WarehouseListInter {
  pageNum: number
  pageSize: number
}