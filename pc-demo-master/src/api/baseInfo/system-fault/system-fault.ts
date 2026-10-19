import axios from "axios"

import type {
  ISystemFaultCreateParams,
  ISystemFaultInfo,
  ISystemFaultPageParams,
  ISystemFaultTreeItem,
  ISystemFaultUpdateParams,
  ISystemFaultUpdateStatusParams
} from "@/types/base-info/system-fault"
import type { IListPageResult, IResponse } from "@/types/common"
import { isGlobalModuleMockEnabled } from "@/utils/moduleMockEnv"

const mockSystemFaults: ISystemFaultInfo[] = [
  // Device fault (faultType = 1)
  {
    id: "sf1-1",
    faultType: 1,
    faultCategoryId: "sc1",
    faultCategoryName: "设备故障-电气",
    faultNo: "DF-ELEC-001",
    faultName: "电气故障-示例1",
    isEnabled: true,
    remarks: "mock",
    createBy: "1",
    createTime: new Date().toISOString(),
    updateBy: "1",
    updateTime: new Date().toISOString()
  },
  {
    id: "sf1-2",
    faultType: 1,
    faultCategoryId: "sc1",
    faultCategoryName: "设备故障-电气",
    faultNo: "DF-ELEC-002",
    faultName: "电气故障-示例2",
    isEnabled: false,
    remarks: "mock",
    createBy: "1",
    createTime: new Date().toISOString(),
    updateBy: "1",
    updateTime: new Date().toISOString()
  },
  {
    id: "sf2-1",
    faultType: 1,
    faultCategoryId: "sc2",
    faultCategoryName: "设备故障-机械",
    faultNo: "DF-MECH-001",
    faultName: "机械故障-示例1",
    isEnabled: true,
    remarks: "mock",
    createBy: "1",
    createTime: new Date().toISOString(),
    updateBy: "1",
    updateTime: new Date().toISOString()
  },
  {
    id: "sf2-2",
    faultType: 1,
    faultCategoryId: "sc2",
    faultCategoryName: "设备故障-机械",
    faultNo: "DF-MECH-002",
    faultName: "机械故障-示例2",
    isEnabled: true,
    remarks: "mock",
    createBy: "1",
    createTime: new Date().toISOString(),
    updateBy: "1",
    updateTime: new Date().toISOString()
  },
  // MRO fault (faultType = 2)
  {
    id: "sf3-1",
    faultType: 2,
    faultCategoryId: "sc3",
    faultCategoryName: "MRO故障-维修运维",
    faultNo: "MRO-001",
    faultName: "MRO故障-示例1",
    isEnabled: true,
    remarks: "mock",
    createBy: "1",
    createTime: new Date().toISOString(),
    updateBy: "1",
    updateTime: new Date().toISOString()
  },
  // Product fault (faultType = 3)
  {
    id: "sf4-1",
    faultType: 3,
    faultCategoryId: "sc4",
    faultCategoryName: "产品故障-质量问题",
    faultNo: "PROD-001",
    faultName: "产品故障-示例1",
    isEnabled: true,
    remarks: "mock",
    createBy: "1",
    createTime: new Date().toISOString(),
    updateBy: "1",
    updateTime: new Date().toISOString()
  },
  // Andon fault (faultType = 4)
  {
    id: "sf5-1",
    faultType: 4,
    faultCategoryId: "sc5",
    faultCategoryName: "Andon故障-停线告警",
    faultNo: "ANDON-001",
    faultName: "Andon故障-示例1",
    isEnabled: true,
    remarks: "mock",
    createBy: "1",
    createTime: new Date().toISOString(),
    updateBy: "1",
    updateTime: new Date().toISOString()
  }
]

function pageResultWithRecords<T>(pageNum: number, pageSize: number, records: T[]): IListPageResult<T> {
  const total = records.length
  const pages = Math.max(1, Math.ceil(total / pageSize) || 1)
  const start = (pageNum - 1) * pageSize
  return {
    current: String(pageNum),
    pages: String(pages),
    records: records.slice(start, start + pageSize),
    size: String(pageSize),
    total: String(total)
  }
}

// 系统故障分页
export const querySystemFaultPageList = async (params: ISystemFaultPageParams) => {
  const res = await axios.get<IResponse<IListPageResult<ISystemFaultInfo>>>("/sysFault/listPaged", {
    params
  })

  const page = res.data.data
  // If module mock is enabled but shared mock server returns empty page, fallback to local mock.
  if (isGlobalModuleMockEnabled && page?.records && page.records.length === 0) {
    const { faultType, faultCategoryId, faultName, faultNo, isEnabled, pageNum, pageSize } = params
    let rows = mockSystemFaults
    if (faultType !== undefined && !Number.isNaN(faultType)) rows = rows.filter((it) => it.faultType === faultType)
    if (faultCategoryId) rows = rows.filter((it) => it.faultCategoryId === faultCategoryId)
    if (faultName) rows = rows.filter((it) => String(it.faultName || "").includes(String(faultName)))
    if (faultNo) rows = rows.filter((it) => String(it.faultNo || "").includes(String(faultNo)))
    if (isEnabled !== undefined) rows = rows.filter((it) => it.isEnabled === isEnabled)
    return pageResultWithRecords(pageNum, pageSize, rows)
  }

  return page
}

// 系统故障指定故障id列表
export const requestSystemFaultListByIds = async (params: { idList: string[] }) => {
  const res = await axios.post<IResponse<ISystemFaultInfo[]>>("/sysFault/listByIds", params)
  const list = res.data.data
  if (isGlobalModuleMockEnabled && Array.isArray(list) && list.length === 0) {
    const idList = Array.isArray(params?.idList) ? params.idList.map(String) : []
    return mockSystemFaults.filter((it) => idList.includes(String(it.id)))
  }
  return list
}

// 系统故障创建
export const requestCreateSystemFault = async (params: ISystemFaultCreateParams) => {
  const res = await axios.post<IResponse>("/sysFault/create", params)
  return res.data.data
}

// 系统故障删除
export const requestDeleteSystemFault = async (id: string) => {
  const res = await axios.delete<IResponse>(`/sysFault/delete`, { params: { id } })
  return res.data.data
}

// 系统故障更新
export const requestUpdateSystemFault = async (params: ISystemFaultUpdateParams) => {
  const res = await axios.put<IResponse>("/sysFault/update", params)
  return res.data.data
}

// 系统故障切换启用停用状态
export const requestSwitchStatusSystemFault = async (params: ISystemFaultUpdateStatusParams) => {
  const res = await axios.put<IResponse>(
    `/sysFault/updateEnabledStatus?faultId=${params.faultId}&newEnabledStatus=${params.newEnabledStatus}`
  )
  return res.data.data
}

function asFaultTreeList(data: unknown): ISystemFaultTreeItem[] {
  if (Array.isArray(data)) return data as ISystemFaultTreeItem[]
  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>
    if (Array.isArray(o.list)) return o.list as ISystemFaultTreeItem[]
    if (Array.isArray(o.tree)) return o.tree as ISystemFaultTreeItem[]
    if (Array.isArray(o.records)) return o.records as ISystemFaultTreeItem[]
  }
  return []
}

// 系统故障树形结构
// faultType: 故障类型业务分类(1设备故障,2MRO故障,3产品故障,4Andon故障)
export const requestSystemFaultTree = async (faultType: number) => {
  const res = await axios.get<IResponse<ISystemFaultTreeItem[]>>("/sysFault/getFaultCascadeTree", {
    params: { faultType }
  })
  return asFaultTreeList(res.data.data)
}
