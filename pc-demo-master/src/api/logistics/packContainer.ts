import axios from "axios"

import type { IListPageResult } from "@/types/common"
import type {
  IPackContainerPageItem,
  IPackContainerPageParams
} from "@/types/logistics/packContainer"

import type { IRes } from "../interceptor"

// 获取包装容器分页
export async function getPackContainerPage(data: IPackContainerPageParams) {
  const res = await axios.post<IRes<IListPageResult<IPackContainerPageItem>>>(
    `/packContainer/page`,
    data
  )
  return res.data.data
}

// 获取包装容器详情
export async function getPackContainerData(id: string) {
  const res = await axios.post<IRes<IPackContainerPageItem>>(`/packContainer/detail`, {
    id
  })
  return res.data.data
}
