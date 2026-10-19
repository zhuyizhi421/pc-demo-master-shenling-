import axios from "axios"

import type {
  IRoleCreateParams,
  IRoleInfo,
  IRoleInfoUpdateParams,
  IRoleRelateMenuResult,
  IRoleUpdateParams,
  IUserRoleInfo
} from "@/types/base-info/user"
import type { IResponse } from "@/types/common"

// 查询所有角色列表
export const queryRoleList = async () => {
  const res = await axios.get<IResponse<IUserRoleInfo[]>>("/role/getRoleList")
  return res.data.data
}

// 创建角色
export const requestCreateRole = async (params: IRoleCreateParams) => {
  const res = await axios.post<IResponse>("/role/create", params)
  return res.data.data
}

// 获取所有菜单以及可选权限项，并附带勾选状态
export const queryRoleMenuInfo = async (roleId?: string) => {
  const res = await axios.get<IResponse<IRoleRelateMenuResult>>(
    "/role/getMenusAndSelectablePermissionsWithCheckedStatus",
    {
      params: {
        roleId
      }
    }
  )
  return res.data.data
}

// 编辑角色权限
export const requestUpdateRole = async (params: IRoleUpdateParams) => {
  const res = await axios.put<IResponse>("/role/updatePermission", params)
  return res.data.data
}

// 删除角色
export const requestDeleteRole = async (params: { id: string }) => {
  const res = await axios.delete<IResponse>("/role/deleteRoleById", { params })
  return res.data.data
}

/** 获取角色详情 */
export const queryRoleDetail = async (id: string) => {
  const res = await axios.get<IResponse<IRoleInfo>>(`/role/${id}`)
  return res.data.data
}

/** 更新角色信息 */
export const requestUpdateRoleInfo = async (params: IRoleInfoUpdateParams) => {
  const res = await axios.post<IResponse>(`/role/update`, params)
  return res.data.data
}
