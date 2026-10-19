export interface IDeviceCateHierarchyTreeRes {
  categoryName: string
  categoryNo: string
  id: string
  parentCategoryName: string
  parentId: string
  record: any[]
  remarks: string
  subDirs: IDeviceCateHierarchyTreeRes[]
}

export interface IDeviceCategoryCreateParams {
  categoryName: string // 类别名称
  categoryNo: string // 类别编号
  parentId: string // 父类ID
  remarks: string // 备注
}

export interface IDeviceCategoryUpdateParams {
  categoryName: string // 类别名称
  id: string
  remarks: string // 备注
}
