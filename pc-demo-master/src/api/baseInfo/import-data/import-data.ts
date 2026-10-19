import axios from "axios"

import type {
  IImportDataCreateParams,
  IImportDataPageItem,
  IImportDataPageParams,
  IImportDataTaskTypeItem,
  IImportDataTemplateDownloadParams
} from "@/types/base-info/import-data"
import type { IListPageResult, IResponse } from "@/types/common"

/** 数据导入列表分页 */
export const queryImportDataPageList = async (params: IImportDataPageParams) => {
  const res = await axios.post<IResponse<IListPageResult<IImportDataPageItem>>>(
    `/import/importTaskPage`,
    params
  )
  return res.data.data
}

/** 数据导入作业类型 */
export const requestImportDataTaskType = async () => {
  const res = await axios.post<IResponse<IImportDataTaskTypeItem[]>>(`/import/importConfigList`)
  return res.data.data
}

/** 导入模板下载 */
export const requestDownloadImportTemplate = async (params: IImportDataTemplateDownloadParams) => {
  const res = await axios.post(`/import/downloadImportTemplate`, params, {
    responseType: "blob"
  })
  return res
}

/** 创建导入任务 */
export const requestCreateImportTask = async (params: IImportDataCreateParams) => {
  const res = await axios.post<IResponse<string>>(`/import/createImportTask`, params)
  return res.data.data
}
