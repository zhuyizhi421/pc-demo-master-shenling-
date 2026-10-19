import type { IPrintTemplateListItem } from "@/types/base-info/print-template"
import type { IRequestPageParams } from "@/types/common"

export interface IPackageSpecPageListParams
  extends IRequestPageParams<
    Partial<{
      no: string //规范编号
      specName: string //包装规范名称
      status: string //状态 'enable' | 'disable'
    }>
  > {}

export interface IPackageSpecPageListItem {
  allowMixed: boolean //是否允许混装
  id: string //规范ID
  no: string //规范编号
  remark: string //备注说明
  specName: string //包装规范名称
  status: string //状态 'enable' | 'disable'
  containerType: string //包装容器类型
  containerTypeName: string //包装容器类型名称
  templateDto: IPrintTemplateListItem //当前使用的标识模板
  transportType: string //运输方式
}

export interface IPackageSpecCreateParams
  extends Partial<{
    allowMixed: boolean //是否允许混装
    containerType: string //包装容器类型
    id: string // 规范ID
    no: string //规范编号
    remark: string //备注说明
    specName: string //包装规范名称
    templateId: string //当前使用的标识模板id
    transportType: string //运输方式
  }> {}
