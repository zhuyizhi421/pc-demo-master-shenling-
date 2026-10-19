import { IRequestPageParams } from "@/types/common"

export interface IInspectOptionCategoryPageListReq
  extends IRequestPageParams<{
    categoryName: string
    parentId?: String
  }> {}

export interface IInspectOptionCategoryListReq {
  categoryName?: string
  parentId?: String
}

export interface IInspectOptionCategoryListItem {
  categoryCode: string // 类别编号
  categoryName: string // 类别名称
  id: string // ID
  parentCode: string // 父类别编号
  parentName: string // 父类别名称
  status: number // 状态(1-启用/0-停用)
  remark: string // 备注
}

export interface IInspectOptionCategoryCreateReq {
  parentId?: string
  categoryName: string
  remark: string
}

export interface IInspectOptionCategoryTree {
  code: string // 类别编号
  id: string // ID
  name: string // 类别名字
  parentId: string // 父类别ID
  status: number // 状态(1-启用/0-停用)
  children: IInspectOptionCategoryTree[] // 子类别
}
