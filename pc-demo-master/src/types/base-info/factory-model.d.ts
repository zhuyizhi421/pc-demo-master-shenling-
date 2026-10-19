/** 工厂建模类型定义 */

import type { IRequestPageParams } from "@/types/common"

export interface IFactoryModelTreeNode {
  entityCode: string // 建模实体编码
  entityId: string // 建模实体ID
  entityName: string // 建模实体名称
  levelTag: string // 层级标签
  parentId: string // 父级模型ID
  children: IFactoryModelTreeNode[] // 子节点
  level?: number // 前端标记层级
  disabled?: boolean // 前端标记是否禁用
  propertyVO: {
    isInspection: number // 是否开启检验 0=否 1=是
    isProduction: number // 是否开启生产 0=否 1=是
    isStorage: number // 是否开启仓储 0=否 1=是
    isStorageLocation: number // 是否为库位 0=否 1=是
    levelTag: string // 等级标签
    leader?: string // 负责人
  }
}

export interface IFactoryModelListItem {
  entityCode: string // 实体编码
  entityName: string // 实体名称
  id: string // 实体id
  isEnable: boolean // 是否启用
  isInspection: boolean // 是否检验单位
  isProduction: boolean // 是否生产单位
  isStorage: boolean // 是否仓储单位
  isStorageLocation: boolean // 是否检验库位
  levelTag: string // 实体层级标签
  parentCode: string // 上级实体编码
  parentId: string // 上级实体ID
  parentName: string // 上级实体名称
  leader?: string // 负责人
}

export interface IFactoryPageParams
  extends IRequestPageParams<
    Partial<{
      code: string // 建模实体编码
      name: string // 建模实体名称
      parentId: string // 上级实体id
    }>
  > {}

export interface IFactoryListItem {
  entityCode: string // 实体编码
  entityName: string // 实体名称
  id: string // 实体id
  isEnable: boolean // 是否启用
  isInspection: boolean // 是否检验单位
  isProduction: boolean // 是否生产单位
  isStorage: boolean // 是否仓储单位
  isStorageLocation: boolean // 是否检验库位
  levelTag: string // 实体层级标签
  parentCode: string // 上级实体编码
  parentName: string // 上级实体名称
  parentId: string // 上级实体ID
  leader?: string // 负责人
}

export interface IFactoryCreateParams {
  autoGenerateCode: boolean // 是否自动生成标签码
  entityName: string // 实体名称
  entityCode: string // 实体编码
  equipmentIds: string[] // 设备id列表
  inspectionType: number // 检验单位类型 1实验室 2检验站
  modelId: string // 模型id
  parentId: string // 父级id
  barCode: string // 库位条码
  storageBarcode: string // 仓库条码
  warehouseType: number // 仓库类型:1原料库2成品库3半成品库4线边库5不合格品库6报废库7MRO库8EPC全检库
  leader?: string // 负责人
}

export interface IFactoryUpdateParams {
  autoGenerateCode: boolean // 是否自动生成标签码
  entityName: string // 实体名称
  equipmentIds: string[] // 设备id列表
  id: string // 实体id
  barCode: string // 库位条码
  inspectionType: number // 检验单位类型 1实验室 2检验站
  outboundRule: number // 出库规则:0无1建议先进先出2建议后进先出3强制先进先出4强制后进先出
  storageBarcode: string // 仓库条码
  warehouseType: number // 仓库类型:1原料库2成品库3半成品库4线边库5不合格品库6报废库7MRO库8EPC全检库
  leader?: string // 负责人
}

export interface IFactoryItemInfo {
  barcode: string //条码
  barcodeId: string // 条码id
  entityName: string // 实体名称
  entityCode: string // 实体编码
  equipments: {
    code: string // 实例编码
    equipmentBarCode: string // 设备标签码
    equipmentNo: string // 设备编号
    id: string // 实例id
    name: string // 实例名称
    type: string // 实例类型
  }[] // 设备列表
  id: string // 实体id
  inspectionType: number // 检验单位类型 1实验室 2检验站
  isEnable: boolean // 是否启用
  isInspection: boolean // 是否检验单位
  isProduction: boolean // 是否生产单位
  isStorage: boolean // 是否仓储单位
  isStorageLocation: boolean // 是否为库位 0=否 1=是
  levelTag: string // 实体层级标签
  parentCode: string // 父级实体编号
  parentName: string // 父级实体名称
  parentId: string // 父级实体ID
  warehouseType: number // 仓库类型:1原料库2成品库3半成品库4线边库5不合格品库6报废库7MRO库8EPC全检库
  leader?: string // 负责人
}

export interface IStorageCreateParams {
  autoGenerateCode: boolean // 是否自动生成标签码
  barcode: string // 库位标签码
  code: string // 库位编码
  name: string // 库位名称
}

export interface IStorageUpdateParams extends IStorageCreateParams {
  id: string // 库位id
}

export interface IFactoryModelAuth {
  inspectionPermit: number // 检验权限 1=是 0=否 默认0
  productionPermit: number // 生产权限 1=是 0=否 默认0
  storagePermit: number // 仓储权限 1=是 0=否 默认0
  tagName: string // 层级标签
}

/** 工厂建模父级节点下可创建的区域类型 */
export interface IFactoryUnderClasses {
  id: string // 区域类型id
  inspectionPermit: number // 检验权限 1=是 0=否 默认0
  locationPermit: number // 库位权限 1=是 0=否 默认0
  productionPermit: number // 生产权限 1=是 0=否 默认0
  storagePermit: number // 仓储权限 1=是 0=否 默认0
  tagName: string // 层级标签
}
