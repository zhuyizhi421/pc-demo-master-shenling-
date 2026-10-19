import type { IPrintTemplateListItem } from "@/types/base-info/print-template"
import type { IRequestPageParams } from "@/types/common"

export interface IPackageProcessPageListParams
  extends IRequestPageParams<
    Partial<{
      name: string // 包装工序名称
      status: string // 状态，enable/disable
    }>
  > {}

export interface IPackageProcessPageListItem {
  bizTypeName: string // 业务类型名称
  bizType: number // 业务类型 1.加工，2.包装 3.检验 4.指向料工艺
  createTime: string // 创建时间
  id: string // 包装工序ID
  name: string // 包装工序名称
  nature: number // 性质，1.自制，2.委外
  remark: string // 备注
  status: string // 状态(enable/disable)
  techId: string // 工艺Id
  techName: string // 工艺名称
  techVersionId: string // 工艺版本ID
  versionStatus: number // 工艺版本状态
  updateTime: string // 更新时间
}

export interface IPackageProcessCreateParams {
  bizTypeName: string // 业务类型 1.加工，2.包装 3.检验 4.指向料工艺
  name: string // 包装工序名称
  nature: number // 性质，1.自制，2.委外
  remark: string // 备注
  techId: string // 工艺Id
}

export interface IPackageProcessUpdateParams extends IPackageProcessCreateParams {
  id: string // 包装工序ID
  techVersionId: string // 工艺版本ID
}

export interface IPackageProcessProductAddParams {
  productModelIds: string[]
  techVersionId: string
}

export interface IPackageProcessProductUpdateParams {
  productModelId: string
  pickMaterial?: number // 排产后联动领料(0否 1是)
  baseAmount?: number // 比例
  techVersionId: string
}

export interface IPackageProcessProductDeleteParams {
  productModelId: string
  techVersionId: string
}

export interface IPackageProcessPackageSpecAddParams {
  packSpecIdList: string[] // 包装规范ID
  techVersionId: string // 工艺版本ID
}

export interface IPackageProcessPackageSpecDeleteParams {
  packSpecId: string // 包装规范ID
  techVersionId: string // 工艺版本ID
}

export interface IPackageProcessPackageSpecSortParams {
  packSpecId1: string // 包装规范ID1
  packSpecId2: string // 包装规范ID2
  techVersionId: string // 工艺版本ID
}

export interface IPackageProcessProductSaveParams {
  id: string // 包装工序ID
  productVoList: Partial<{
    decimalNumber: number // 保留小数点位数
    drawingNumber: string // 图号
    packQty: number // 封装数量
    productModelCode: string // 产品编号
    productModelId: string // 产品模型ID
    productModelName: string // 产品名称
    unitId: string // 单位ID
    unitName: string // 单位
  }>[]
}

export interface IPackageSpecConfigList {
  allowMixed: boolean // 是否允许混装
  containerType: string // 容器类型
  containerTypeName: string // 容器名称
  id: string // id
  no: string // 规范编号
  packSpecId: string // 规范ID
  productVoList: {
    decimalNumber: number // 保留小数点位数
    drawingNumber: string // 图号
    packQty?: number // 封装数量
    productModelCode: string // 产品编号
    productModelId: string // 产品模型ID
    productModelName: string // 产品名称
    unitId: string // 单位ID
    unitName: string // 单位
    isSelect?: boolean // 是否选中
  }[]
  remark: string // 备注说明
  sortNum: number // 排序-升序
  specName: string // 包装规范名称
  status: string // 状态 enable/disable
  templateDto: IPrintTemplateListItem
  transportType: string // 运输方式
}

export interface IPackageProcessCopyParams {
  techVersionIdMain: string // 主工艺版本id
  techVersionIdSon: string // 子工艺版本id
}
