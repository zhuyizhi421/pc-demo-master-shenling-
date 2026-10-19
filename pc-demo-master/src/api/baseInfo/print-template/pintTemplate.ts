import axios from "axios"

import type {
  IPrintTemplateListItem,
  IPrintTemplateListQuery
} from "@/types/base-info/print-template"
import type { IResponse } from "@/types/common"

/** 打印模板列表 */
export const queryPrintTemplateList = async (params: IPrintTemplateListQuery) => {
  const res = await axios.post<IResponse<IPrintTemplateListItem[]>>(`/printTemplate/all`, params)
  return res.data.data
}
