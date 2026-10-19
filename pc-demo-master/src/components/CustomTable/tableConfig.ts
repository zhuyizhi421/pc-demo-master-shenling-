import axios from "axios"

import type { ITableColumnConfig } from "@/components/CustomTable/type"
import type { IResponse } from "@/types/common"

// 查询表格列配置信息
export const requestTableColumnConfig = async (params: { queryKey: string }) => {
  const res = await axios.get<IResponse<ITableColumnConfig>>(`/query-config/query`, { params })
  return res.data.data
}
