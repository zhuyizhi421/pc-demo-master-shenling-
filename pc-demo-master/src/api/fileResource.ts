import axios from "axios"

import type {
  IDocumentCreateParams,
  IDocumentUpdateNameParams,
  IFileFlowRecord,
  IFileInfo,
  IFileResourcePageItem,
  IFileResourceParams
} from "@/types/base-info/file"
import type { IListPageResult, IResponse } from "@/types/common"

import type { IRes } from "./interceptor"

type IdParam = { id: number | string }
type IdListParam = { idList: Array<number | string> }

export async function searchFileResourceList(params: IFileResourceParams) {
  const res = await axios.post<IRes<IListPageResult<IFileResourcePageItem>>>(
    "/fileResource/page",
    params
  )
  return res.data.data
}

export async function getFileResourceListById(params: { idList: string[] }) {
  const res = await axios.post<IRes<IFileResourcePageItem[]>>("/fileResource/listById", params)
  return res.data.data
}

export async function fileDownload(fileId: string) {
  const res = await axios.get("/fileResource/download", {
    params: { fileId },
    responseType: "blob"
  })

  return res
}

export async function fileDownloadHandle(fileId: string, fallbackFileName?: string) {
  const res = await fileDownload(fileId)
  const dispositionHeader = res.headers["content-disposition"]
  const fileNameMatch = dispositionHeader?.match(/filename\*?=['"]?(?:UTF-\d['"]*)?([^;\n]*)/i)
  const resolvedFileName = decodeURIComponent(fileNameMatch?.[1] || fallbackFileName || `${fileId}`)
  const a = document.createElement("a")
  a.href = URL.createObjectURL(res.data)
  a.style.display = "none"
  document.body.appendChild(a)
  a.download = resolvedFileName
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(a.href)
}

/** 供应商平台下载文件接口 */
export async function fileDownloadSupplier(fileId: string) {
  const res = await axios.get("/supplierPlatform/download", {
    params: { fileId },
    responseType: "blob"
  })

  return res
}

/** 供应商平台下载文件方法 */
export async function fileDownloadHandleSupplier(fileId: string) {
  const res = await fileDownloadSupplier(fileId)
  const dispositionHeader = res.headers["content-disposition"]
  const fileNameMatch = dispositionHeader.match(/filename\*?=['"]?(?:UTF-\d['"]*)?([^;\n]*)/i)
  let fileName = fileNameMatch && fileNameMatch[1]
  if (fileName) {
    fileName = decodeURIComponent(fileName)
    const a = document.createElement("a")
    a.href = URL.createObjectURL(res.data)
    a.style.display = "none"
    document.body.appendChild(a)
    a.download = fileName
    a.click()
    document.body.removeChild(a)
  }
}

export async function uploadFile(data: FormData) {
  const res = await axios.post<IRes<string[]>>("/fileResource/upload", data, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  })
  return res.data.data
}

/** 上传新文档 */
export const requestCreateDocument = async (params: IDocumentCreateParams) => {
  const res = await axios.post<IRes>("/fileResource/batchSave", params)
  return res.data.data
}

/** 文件修改名称 */
export const requestUpdateFileName = async (params: IDocumentUpdateNameParams) => {
  const res = await axios.post<IRes>("/fileResource/editName", params)
  return res.data.data
}

export async function updateDocument(
  params: Partial<{
    directoryId: number
    fileId: string
    fileName: string
    fileStatus: number
    id: string
    controlType: number
    effectiveTime: string
    expireDate: string
    changeReason: string
    locationRelations: any[]
    productRelations: any[]
  }>
) {
  const res = await axios.post<IRes<string>>("/fileResource/saveOrUpdate", params)
  return res.data.data
}

export async function updateDocumentRelations(
  params: Partial<{
    id: string
    locationRelations: any[]
    productRelations: any[]
  }>
) {
  const res = await axios.post<IRes<string>>("/fileResource/updateRelations", params)
  return res.data.data
}

export async function deleteFile(params: IdListParam) {
  const res = await axios.post<IRes>("/fileResource/cancellation", params)
  return res.data.data
}

export async function deleteHistoryFile(params: IdListParam) {
  const res = await axios.post<IRes>("/fileResource/deleteHistoryFile", params)
  return res.data.data
}

export interface IFileHistory {
  changeReason?: string
  createBy: number
  createTime: string
  deploymentId: number
  extension: string
  fileId?: string
  fileName: string
  fileSize?: string
  hash: string
  id: number
  path: string
  size: number
  sourceName: string
  updateBy: number
  updateTime: string
  version: string
}

export async function getHistoryFileList(id: string) {
  const res = await axios.post<IRes<IFileHistory[]>>("/fileResource/historyList", { id })
  return res.data.data
}

export async function getFileFlowRecord(params: IdParam) {
  const res = await axios.post<IRes<IFileFlowRecord[]>>("/fileResource/flowRecord", params)
  return res.data.data
}

/** 获取文件信息 */
export const queryFileResourceDetail = async (fileId: string) => {
  const res = await axios.get<IResponse<IFileInfo>>(`/fileResource/filePathHandler/${fileId}`)
  return res.data.data
}
