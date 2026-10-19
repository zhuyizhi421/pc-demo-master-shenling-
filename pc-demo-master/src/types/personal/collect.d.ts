export interface ITableItem {
  id: string
  createBy: string
  createTime: string
  updateBy: string
  updateTime: string
  userId: string
  menuId: string
  menuCode: string
  menuPath: string
  menuName: string
  menuFullName: string
}

export interface ITreeMenuItemResult {
  id: string
  parentId: string
  menuCode: string
  menuName: string
  levelTree: string
  path: string
  checkedStatus: boolean
}

export interface ITreeMenuItem {
  checkedStatus: boolean
  id: string
  label: string
  levelTree: string
  path: string
  value: string
  children: ITreeMenuItem[]
}
