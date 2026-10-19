import { IRequestPageParams } from "@/types/common"

export interface IInspectOptionTemplatePageListReq
  extends IRequestPageParams<{
    categoryId: string // 检验项模板类别ID
    itemCode: string // 检验项模板编号
    itemName: string // 检验项模板名称
  }> {}

export interface IInspectOptionTemplateListItem {
  categoryName: string // 父类别名称
  id: string // ID
  itemCode: string // 检验项编号
  itemName: string // 检验项名称
  methodDesc: string // 方法要求
  standardType: number // 检验标准类型(1-数值 2-文本)
  status: number // 状态(1-启用/0-停用)
}

export interface IInspectOptionTemplateReq {
  categoryId: string // 检验项模板类别ID
  itemCode: string // 检验项模板编号
  itemName: string // 检验项模板名称
}

export interface IInspectOptionTemplateCreateReq {
  categoryId: string // 产品检验项类别ID
  images: string[] // 图片文件ID列表
  inspectItemCode?: string // 产品检验项编号
  inspectItemName: string // 产品检验项名称
  methodDesc: string // 方法要求
  standardType: number // 检验标准类型(1-数值 2-文本)
  standardDesc?: string // 标准描述(文本型必带)
  standardMax?: number | null // 标准区间上限
  standardMaxInclusive?: number | null // 标准区间上限是否包含(1-包含 0-不包含)
  standardMin?: number | null // 标准区间下限
  standardMinInclusive?: number | null // 标准区间下限是否包含(1-包含 0-不包含)
  unitId?: string // 单位ID
}

export interface IInspectOptionTemplateUpdateReq extends IInspectOptionTemplateCreateReq {
  id: string // ID
}

export interface IInspectOptionTemplateDetail {
  categoryId: string // 产品检验项类别ID
  id: string // ID
  images: {
    createBy: string // 创建人ID
    createTime: string // 创建时间
    deploymentId: string // 部署ID
    extension: string // 扩展名
    fileName: string // 文件名
    hash: string // 文件哈希值
    id: string // ID
    path: string // 路径
    size: string // 文件大小
    sourceName: string // 来源名称
    updateBy: string // 更新人ID
    updateTime: string // 更新时间
    version: string // 版本号
  }[] // 图片
  standardDesc: string // 标准描述(文本型必带)
  inspectItemCode: string // 产品检验项编号
  inspectItemName: string // 产品检验项名称
  methodDesc: string // 方法要求
  standardMax: number // 标准区间上限
  standardMaxInclusive: number // 标准区间上限是否包含(1-包含 0-不包含)
  standardMin: number // 标准区间下限
  standardMinInclusive: number // 标准区间下限是否包含(1-包含 0-不包含)
  standardType: number // 检验标准类型(1-数值 2-文本)
  unitId: string // 单位ID
}
