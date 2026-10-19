import dayjs from "dayjs"

import { FORMAT_TIME } from "@/constant/time"

export const ledgerStatusTextMap: Record<string, string> = {
  enabled: "启用",
  archived: "封存",
  scrapped: "报废"
}

export const ledgerStatusTagTypeMap: Record<string, "success" | "warning" | "danger" | "info"> = {
  enabled: "success",
  archived: "warning",
  scrapped: "danger"
}

export const ledgerStatusOptions = [
  {
    label: "启用",
    value: "enabled"
  },
  {
    label: "封存",
    value: "archived"
  },
  {
    label: "报废",
    value: "scrapped"
  }
]

export const runningStatusOptions = [
  {
    label: "正常",
    value: 1
  },
  {
    label: "待校验",
    value: 10
  },
  {
    label: "待保养",
    value: 15
  },
  {
    label: "校验异常",
    value: 20
  },
  {
    label: "保养异常",
    value: 25
  },
  {
    label: "待维修",
    value: 30
  },
  {
    label: "待报废",
    value: 35
  }
]

export const runningStatusTagTypeMap: Record<
  number,
  "success" | "warning" | "danger" | "primary" | "info"
> = {
  1: "success",
  10: "warning",
  15: "warning",
  20: "danger",
  25: "danger",
  30: "danger",
  35: "danger"
}

export const formatLedgerStatus = (value?: string) => ledgerStatusTextMap[String(value || "")] || "-"

export const formatRunningStatus = (value?: string) => String(value || "").trim() || "-"

export const unarchiveMethodTextMap: Record<string, string> = {
  offline_verify: "线下验证",
  maintenance: "保养",
  inspection: "校验"
}

export const formatUnarchiveMethod = (value?: string) =>
  unarchiveMethodTextMap[String(value || "")] || "-"

export const formatRunningAlerts = (value?: string[]) =>
  Array.isArray(value) && value.length ? value.join("、") : "-"

export const formatDateTime = (value?: string) => {
  const text = String(value || "").trim()
  if (!text) return "-"
  const parsed = dayjs(text)
  if (parsed.isValid()) {
    return parsed.format(FORMAT_TIME)
  }
  return text.replace("T", " ").replace(/(\.\d+)?Z$/, "")
}
