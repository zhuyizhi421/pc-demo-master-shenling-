import axios from "axios"

import type { IRes } from "./interceptor"

export interface IFileDirectory {
  [key: string]: any
  directoryName?: string
  id: number | string
  parentDirectoryName?: string
  parentId?: number | string
  processDefineId?: string
  remarks?: string
  cancellationProcessDefineId?: string
  reviseProcessDefineId?: string
  uploadPermissionRoleCodes?: string[]
  revisePermissionRoleCodes?: string[]
  cancelPermissionRoleCodes?: string[]
  subDirs?: IFileDirectory[]
}

export async function getFileDirectory(params: { id?: number | string }) {
  const res = await axios.post<IRes<IFileDirectory>>("/directory/Hierarchy", {
    id: params.id
  })
  return res.data.data
}

export async function deleteFileDirectory(params: Array<number | string>) {
  const res = await axios.post<IRes>("/directory/delete", { idList: params })
  return res.data.data
}

export async function queryFileDirectoryDetail(params: { id: string }) {
  const res = await axios.post<IRes<IFileDirectory>>("/directory/id", {
    id: params.id
  })
  return res.data.data
}

export async function updateFileDirectory(params: Partial<IFileDirectory>) {
  const res = await axios.post<IRes>("/directory/saveOrUpdate", params)
  return res.data.data
}
