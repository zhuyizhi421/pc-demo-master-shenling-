import type { IListPageResult } from "@/types/common"
import type {
  IEquipmentRepairBaseConfigItem,
  IEquipmentRepairBaseConfigPageParams,
  IEquipmentRepairBaseConfigSaveParams,
  TEquipmentRepairBaseConfigType
} from "@/types/maintain/equipment-manage/equipment-repair-base-config"

const STORAGE_KEY = "device-repair-base-configs"

const TEXT = {
  admin: "\u7cfb\u7edf\u7ba1\u7406\u5458",
  duplicate: "\u5f53\u524d\u914d\u7f6e\u7f16\u53f7\u6216\u540d\u79f0\u5df2\u5b58\u5728",
  notFound: "\u5f53\u524d\u7ef4\u4fee\u57fa\u7840\u914d\u7f6e\u4e0d\u5b58\u5728"
} as const

const defaultConfigs: IEquipmentRepairBaseConfigItem[] = [
  {
    id: "sc1",
    configType: "faultCategory",
    configCode: "FC-001",
    configName: "\u7535\u6c14\u6545\u969c",
    remarks: "\u8bbe\u5907\u7ef4\u4fee\u6545\u969c\u7c7b\u578b",
    createBy: TEXT.admin,
    createTime: "2026-04-01 10:00:00",
    updateBy: TEXT.admin,
    updateTime: "2026-04-01 10:00:00"
  },
  {
    id: "sc2",
    configType: "faultCategory",
    configCode: "FC-002",
    configName: "\u673a\u68b0\u6545\u969c",
    remarks: "\u8bbe\u5907\u7ef4\u4fee\u6545\u969c\u7c7b\u578b",
    createBy: TEXT.admin,
    createTime: "2026-04-01 10:05:00",
    updateBy: TEXT.admin,
    updateTime: "2026-04-01 10:05:00"
  },
  {
    id: "sc3",
    configType: "faultCategory",
    configCode: "FC-003",
    configName: "\u63a7\u5236\u6545\u969c",
    remarks: "\u8bbe\u5907\u7ef4\u4fee\u6545\u969c\u7c7b\u578b",
    createBy: TEXT.admin,
    createTime: "2026-04-01 10:10:00",
    updateBy: TEXT.admin,
    updateTime: "2026-04-01 10:10:00"
  },
  {
    id: "1",
    configType: "faultLevel",
    configCode: "FL-001",
    configName: "\u4e00\u822c",
    remarks: "\u8bbe\u5907\u7ef4\u4fee\u6545\u969c\u7b49\u7ea7",
    createBy: TEXT.admin,
    createTime: "2026-04-01 10:20:00",
    updateBy: TEXT.admin,
    updateTime: "2026-04-01 10:20:00"
  },
  {
    id: "2",
    configType: "faultLevel",
    configCode: "FL-002",
    configName: "\u91cd\u8981",
    remarks: "\u8bbe\u5907\u7ef4\u4fee\u6545\u969c\u7b49\u7ea7",
    createBy: TEXT.admin,
    createTime: "2026-04-01 10:25:00",
    updateBy: TEXT.admin,
    updateTime: "2026-04-01 10:25:00"
  },
  {
    id: "3",
    configType: "faultLevel",
    configCode: "FL-003",
    configName: "\u7d27\u6025",
    remarks: "\u8bbe\u5907\u7ef4\u4fee\u6545\u969c\u7b49\u7ea7",
    createBy: TEXT.admin,
    createTime: "2026-04-01 10:30:00",
    updateBy: TEXT.admin,
    updateTime: "2026-04-01 10:30:00"
  },
  {
    id: "sf1-1",
    configType: "faultReason",
    configCode: "FR-001",
    configName: "\u4f20\u611f\u5668\u8001\u5316",
    remarks: "\u8bbe\u5907\u7ef4\u4fee\u6545\u969c\u539f\u56e0",
    createBy: TEXT.admin,
    createTime: "2026-04-01 10:40:00",
    updateBy: TEXT.admin,
    updateTime: "2026-04-01 10:40:00"
  },
  {
    id: "sf2-1",
    configType: "faultReason",
    configCode: "FR-002",
    configName: "\u6da6\u6ed1\u4e0d\u8db3",
    remarks: "\u8bbe\u5907\u7ef4\u4fee\u6545\u969c\u539f\u56e0",
    createBy: TEXT.admin,
    createTime: "2026-04-01 10:45:00",
    updateBy: TEXT.admin,
    updateTime: "2026-04-01 10:45:00"
  },
  {
    id: "fr-003",
    configType: "faultReason",
    configCode: "FR-003",
    configName: "\u6a21\u5757\u635f\u574f",
    remarks: "\u8bbe\u5907\u7ef4\u4fee\u6545\u969c\u539f\u56e0",
    createBy: TEXT.admin,
    createTime: "2026-04-01 10:50:00",
    updateBy: TEXT.admin,
    updateTime: "2026-04-01 10:50:00"
  }
]

function nowText() {
  const date = new Date()
  const pad = (value: number) => String(value).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

function getStorage() {
  if (typeof window === "undefined") return null
  return window.localStorage
}

function readStore() {
  const storage = getStorage()
  if (!storage) return clone(defaultConfigs)
  const raw = storage.getItem(STORAGE_KEY)
  if (!raw) {
    storage.setItem(STORAGE_KEY, JSON.stringify(defaultConfigs))
    return clone(defaultConfigs)
  }
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed as IEquipmentRepairBaseConfigItem[]
  } catch {}
  storage.setItem(STORAGE_KEY, JSON.stringify(defaultConfigs))
  return clone(defaultConfigs)
}

function writeStore(list: IEquipmentRepairBaseConfigItem[]) {
  const storage = getStorage()
  if (storage) {
    storage.setItem(STORAGE_KEY, JSON.stringify(list))
  }
}

function listByType(configType: TEquipmentRepairBaseConfigType) {
  return readStore()
    .filter((item) => item.configType === configType)
    .sort((a, b) => String(a.configCode || "").localeCompare(String(b.configCode || "")))
}

function pageResult<T>(pageNum: number, pageSize: number, records: T[]): IListPageResult<T> {
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

function assertUnique(params: IEquipmentRepairBaseConfigSaveParams, currentId = "") {
  const targetCode = String(params.configCode || "").trim()
  const targetName = String(params.configName || "").trim()
  const duplicated = listByType(params.configType).find((item) => {
    if (String(item.id) === String(currentId || "")) return false
    return (
      String(item.configCode || "").trim() === targetCode ||
      String(item.configName || "").trim() === targetName
    )
  })
  if (duplicated) {
    throw new Error(TEXT.duplicate)
  }
}

export const queryEquipmentRepairBaseConfigPageList = async (
  params: IEquipmentRepairBaseConfigPageParams
) => {
  const pageNum = Number(params?.pageQuery?.pageNum || 1)
  const pageSize = Number(params?.pageQuery?.pageSize || 20)
  const queryParam = params?.queryParam || {}
  const rows = listByType(queryParam.configType || "faultCategory").filter((item) => {
    const matchCode =
      !queryParam.configCode || String(item.configCode || "").includes(String(queryParam.configCode))
    const matchName =
      !queryParam.configName || String(item.configName || "").includes(String(queryParam.configName))
    return matchCode && matchName
  })
  return pageResult(pageNum, pageSize, rows)
}

export const requestEquipmentRepairBaseConfigList = async (
  configType: TEquipmentRepairBaseConfigType
) => {
  return listByType(configType)
}

export const queryEquipmentRepairBaseConfigDetail = async (id: string) => {
  return readStore().find((item) => String(item.id) === String(id || "")) || (null as never)
}

export const requestCreateEquipmentRepairBaseConfig = async (
  params: IEquipmentRepairBaseConfigSaveParams
) => {
  assertUnique(params)
  const list = readStore()
  const now = nowText()
  list.push({
    id: `repair-base-${Date.now()}`,
    configType: params.configType,
    configCode: String(params.configCode || "").trim(),
    configName: String(params.configName || "").trim(),
    remarks: String(params.remarks || "").trim(),
    createBy: TEXT.admin,
    createTime: now,
    updateBy: TEXT.admin,
    updateTime: now
  })
  writeStore(list)
  return null
}

export const requestUpdateEquipmentRepairBaseConfig = async (
  params: IEquipmentRepairBaseConfigSaveParams
) => {
  assertUnique(params, String(params.id || ""))
  const list = readStore()
  const index = list.findIndex((item) => String(item.id) === String(params.id || ""))
  if (index < 0) {
    throw new Error(TEXT.notFound)
  }
  list[index] = {
    ...list[index],
    configCode: String(params.configCode || "").trim(),
    configName: String(params.configName || "").trim(),
    remarks: String(params.remarks || "").trim(),
    updateBy: TEXT.admin,
    updateTime: nowText()
  }
  writeStore(list)
  return null
}

export const requestDeleteEquipmentRepairBaseConfig = async (id: string) => {
  const list = readStore().filter((item) => String(item.id) !== String(id || ""))
  writeStore(list)
  return null
}
