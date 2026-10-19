import axios from "axios"

import type { IResponse } from "@/types/common"
import type { IMroCategoryListItem } from "@/types/maintain/mro-manage/mro-category"

// 查询所有MRO类别数据
export async function queryMroCategoryList() {
  const res = await axios.get<IResponse<IMroCategoryListItem[]>>("/mroCategory/list")
  return res.data.data
}
