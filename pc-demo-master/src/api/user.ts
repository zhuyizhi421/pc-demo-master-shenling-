import axios from "axios"

import type {
  IRoleUser,
  IUserInfo,
  IUserInfoCreateParams,
  IUserInfoListItem,
  IUserInfoListParams,
  IUserInfoUpdateParams,
  TenantInfoVO
} from "@/types/base-info/user"
import type { IListPageResult, IResponse } from "@/types/common"

// 查询单个用户信息(通过id或者username)
export const queryUserInfoDetail = async (params: { userId?: string; username?: string }) => {
  const res = await axios.get<IResponse<IUserInfo>>("/user/getUserInfoByIdOrName", {
    params
  })
  return res.data.data
}

// 修改密码
export const requestUpdatePassword = async (params: { id: string; password: string }) => {
  const res = await axios.post<IResponse>("/user/updatePassword", params)
  return res.data.data
}

// 直接获取用户信息列表(带角色信息+分页)
export const queryUserInfoList = async (params: IUserInfoListParams) => {
  const res = await axios.post<IResponse<IListPageResult<IUserInfoListItem>>>(
    "/user/getUserInfoWithRolePaged",
    params
  )
  return res.data.data
}

// 获取指定id列表的用户信息列表
export const requestUserInfoListByIds = async (params: { idList: string[] }) => {
  const res = await axios.post<IResponse<IUserInfoListItem[]>>("/user/listByIds", params)
  return res.data.data
}

// 删除用户
export const requestDeleteUser = async (params: { id: string }) => {
  const res = await axios.delete<IResponse>("/user/deleteUserById", { params })
  return res.data.data
}

// 创建用户
export const requestCreateUser = async (params: IUserInfoCreateParams) => {
  const res = await axios.post<IResponse>("/user/createUser", params)
  return res.data.data
}

// 修改用户信息
export const requestUpdateUser = async (params: IUserInfoUpdateParams) => {
  const res = await axios.post<IResponse>("/user/updateUser", params)
  return res.data.data
}

export async function login(params: { password: string; username: string; tenantId: string }) {
  const res = await axios.post<IResponse>("/group/user/login", params)
  return res.data.data
}

export async function loginOut(username: string) {
  const res = await axios.post<IResponse>(`/user/logout?username=${username}`)
  return res.data.data
}

export async function requestUserList(params: any) {
  const res = await axios.post<IResponse<IUserInfo[]>>("/user/getUserInfoWithRole", params)
  return res.data.data
}

// 根据用户名获取用户权限信息
export async function getUserAllInfo(username: string) {
  const res = await axios.get<IResponse<any>>("/user/getLoginUserDetailsByUsername", {
    params: { username }
  })
  return res.data.data
}

/** 查询所有角色列表及有对应角色的用户 */
export const requestAllRoleListWithUsers = async () => {
  const res = await axios.get<IResponse<IRoleUser[]>>("/role/getRoleListWithUsers")
  return res.data.data
}

/** 查询组织/租户列表 */
export const queryTenantList = async () => {
  const res = await axios.get<IResponse<TenantInfoVO[]>>("/tenant/list")
  return res.data.data
}
