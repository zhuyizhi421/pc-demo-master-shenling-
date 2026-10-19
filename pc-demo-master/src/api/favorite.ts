import axios from "axios"

import type { ITableItem, ITreeMenuItemResult } from "@/types/personal/collect"

import type { IRes } from "./interceptor"

// 查询所有菜单
export const queryFavoriteMenuList = async () => {
  const res = await axios.get<IRes<ITreeMenuItemResult[]>>(
    "/favorite/getSelectableMenusWithCheckedStatus"
  )
  return res.data.data
}

// 查询用户收藏列表
export const queryUserFavoriteMenuList = async () => {
  const res = await axios.get<IRes<ITableItem[]>>("/favorite/getUserFavoriteMenus")
  return res.data.data
}

// 收藏一个菜单
export const requestCreateFavorite = async (params: { menuId: string }) => {
  const res = await axios.post<IRes<null>>(
    `/favorite/addOneRecord?menuId=${params.menuId}`,
    {
    headers: { "Content-Type": "application/json" },
    params
    }
  )
  return res.data.data
}

// 取消收藏菜单
export const requestDeleteFavorite = async (params: { menuId: string }) => {
  const res = await axios.delete<IRes<null>>("/favorite/removeOneRecord", { params })
  return res.data.data
}
