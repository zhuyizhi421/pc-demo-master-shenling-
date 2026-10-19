interface IUserInfoBase {
  nickname: string
  password: string
  username: string
}

export interface IUserInfo {
  id: string
  createBy: string
  createTime: string
  updateBy: string
  updateTime: string
  username: string
  nickname: string
  empId: string
  empNo: string
  empName: string
  roleList: IUserRoleInfo[]
}

export interface IUserInfoListItem extends IUserInfo {
  role: string[]
  roleId: string[]
}

export interface IUserRoleInfo {
  id: string
  createBy: string
  createTime: string
  updateBy: string
  updateTime: string
  roleCode: string
  roleName: string
  remark: string
}

export interface IUserInfoListParams {
  pageNum: number
  pageSize: number
  nickname?: string
  empNo?: string
  empName?: string
  username?: string
}

interface IUserInfoCreateParams {
  nickname: string
  username: string
  password: string
  roleCodeList: string[]
  empName?: string
  empNo?: string
  empId?: string
}

export interface IUserInfoCreateForm {
  nickname: string
  username: string
  password: string
  role: string[]
  relatedEmId?: string
  relatedEmName?: string
  relatedEmNo?: string
}

export interface IUserInfoUpdateParams {
  id: string
  nickname: string
  username: string
  roleCodeList: string[]
  empName?: string
  empNo?: string
  empId?: string
}

export interface IRoleCreateParams {
  name: string
  remark?: string
  userIds?: string[]
}

export interface IRoleUpdateParams {
  roleId: string
  selectMenuCodes: {
    deviceTag: string // 设备标识
    selectMenuCodeList: string[]
  }[]
  selectPermissionCodeList: string[]
}

export interface IMenuListItem {
  id: string
  parentId: string
  menuCode: string
  menuName: string
  levelTree: string
  path: string
  checkedStatus: boolean
}

export interface IPermissionListItem {
  id: string
  permissionCode: string
  permissionName: string
  menuId: string
  checkedStatus: boolean
}

export interface IRoleRelateMenuResult {
  deviceMenuList: {
    MC: IMenuListItem[]
    PAD: IMenuListItem[]
    PC: IMenuListItem[]
    PDA: IMenuListItem[]
  }
  permissionList: IPermissionListItem[]
}

export interface IMenuTreeItem<T, U> extends IMenuListItem {
  children?: T[]
  permissions?: U[]
}

export interface IMeneTreeDisplay {
  label: string
  id: string
  checkedStatus: boolean
  type: "menu" | "permission"
  menuCode?: string
  children?: IMeneTreeDisplay[]
  permissionCode?: string
}

export interface IRoleUser {
  id: string // 主键
  remark: string // 备注
  roleCode: string // 角色编码
  roleName: string // 角色名
  userList: {
    // 用户列表
    id: string // 用户ID
    nickname: string // 用户昵称
    username: string // 用户名
  }[]
}

export interface TenantInfoVO {
  createBy: string //创建人ID
  createTime: string //创建时间
  id: string //ID
  name: string //租户名称
  remark: string //备注信息
  updateBy: string //更新人ID
  updateTime: string //更新时间
}

export interface IRoleInfo {
  id: string // 主键
  remark: string // 备注
  roleCode: string // 角色编码
  roleName: string // 角色名
  userList: {
    // 用户列表
    id: string // 用户ID
    nickname: string // 用户昵称
    username: string // 用户名
  }[]
}

export interface IRoleInfoUpdateParams extends IRoleCreateParams {
  id: string
}
