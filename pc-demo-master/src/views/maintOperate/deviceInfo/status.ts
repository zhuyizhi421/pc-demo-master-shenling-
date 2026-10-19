import type { IEquipmentPageItem } from "@/types/maintain/equipment-manage/equipment-info"
import type { IEquipmentModelPageItem } from "@/types/maintain/equipment-manage/equipment-model"

export type DeviceLedgerStatus = "enabled" | "disabled" | "scrapped"
export type DeviceTaskStatus = "none" | "pending" | "processing" | "completed"

const LEDGER_STATUS_TEXT_MAP: Record<DeviceLedgerStatus, string> = {
  enabled: "启用",
  disabled: "停用",
  scrapped: "报废"
}

export const LEDGER_STATUS_TAG_TYPE_MAP: Record<
  DeviceLedgerStatus,
  "success" | "warning" | "danger" | "info"
> = {
  enabled: "success",
  disabled: "warning",
  scrapped: "danger"
}

const REPAIR_TASK_STATUS_TEXT_MAP: Record<DeviceTaskStatus, string> = {
  none: "无",
  pending: "待维修",
  processing: "维修中",
  completed: "已完成"
}

const SCRAP_TASK_STATUS_TEXT_MAP: Record<DeviceTaskStatus, string> = {
  none: "无",
  pending: "待报废",
  processing: "待报废",
  completed: "已报废"
}

const RUNNING_STATUS_TAG_TYPE_MAP: Record<
  string,
  "success" | "warning" | "danger" | "primary" | "info"
> = {
  正常: "success",
  待点检: "warning",
  待巡检: "warning",
  待保养: "warning",
  点检异常: "danger",
  巡检异常: "danger",
  保养异常: "danger",
  待维修: "danger",
  维修中: "primary",
  待报废: "danger"
}

type EquipmentLike = Partial<IEquipmentPageItem> & {
  ledgerStatus?: string
  repairTaskStatus?: string | number
  scrapTaskStatus?: string | number
  runningStatus?: string
  runningAlerts?: string[]
  displayRunningStatus?: string
  scrapStatus?: number
}

const normalizeTaskStatus = (
  value: string | number | undefined,
  textMap: Record<DeviceTaskStatus, string>
): DeviceTaskStatus | null => {
  const text = String(value ?? "").trim()
  if (!text) return null
  if (text === "none" || text === textMap.none || text === "无") return "none"
  if (text === "pending" || text === textMap.pending) return "pending"
  if (text === "processing" || text === textMap.processing) return "processing"
  if (text === "completed" || text === textMap.completed) return "completed"
  return null
}

export const getDeviceLedgerStatus = (row: EquipmentLike): DeviceLedgerStatus => {
  const raw = String(row.ledgerStatus || "").trim()
  if (raw === "enabled" || raw === "disabled" || raw === "scrapped") {
    return raw
  }
  if (Number(row.repairStatus) === 35 || Number(row.scrapStatus) === 35) {
    return "scrapped"
  }
  if (Number(row.equipmentStatus) === 0) {
    return "disabled"
  }
  return "enabled"
}

export const formatDeviceLedgerStatus = (row: EquipmentLike) =>
  LEDGER_STATUS_TEXT_MAP[getDeviceLedgerStatus(row)]

export const getDeviceRepairTaskStatus = (row: EquipmentLike): DeviceTaskStatus => {
  const normalized = normalizeTaskStatus(row.repairTaskStatus, REPAIR_TASK_STATUS_TEXT_MAP)
  if (normalized) return normalized
  return Number(row.repairStatus) === 29 ? "pending" : "none"
}

export const formatDeviceRepairTaskStatus = (row: EquipmentLike) =>
  REPAIR_TASK_STATUS_TEXT_MAP[getDeviceRepairTaskStatus(row)]

export const getDeviceScrapTaskStatus = (row: EquipmentLike): DeviceTaskStatus => {
  const normalized = normalizeTaskStatus(row.scrapTaskStatus, SCRAP_TASK_STATUS_TEXT_MAP)
  if (normalized) return normalized
  if (Number(row.repairStatus) === 35 || Number(row.scrapStatus) === 35) return "completed"
  if (Number(row.repairStatus) === 32 || Number(row.scrapStatus) === 32) return "pending"
  return "none"
}

export const formatDeviceScrapTaskStatus = (row: EquipmentLike) =>
  SCRAP_TASK_STATUS_TEXT_MAP[getDeviceScrapTaskStatus(row)]

type RunningIssue = {
  key: string
  label: string
  priority: number
}

const buildRunningIssues = (row: EquipmentLike): RunningIssue[] => {
  const issues: RunningIssue[] = []
  const scrapTaskStatus = getDeviceScrapTaskStatus(row)
  const repairTaskStatus = getDeviceRepairTaskStatus(row)

  if (scrapTaskStatus === "pending") {
    issues.push({ key: "scrap_pending", label: "待报废", priority: 1 })
  }
  if (repairTaskStatus === "processing") {
    issues.push({ key: "repair_processing", label: "维修中", priority: 2 })
  }
  if (repairTaskStatus === "pending") {
    issues.push({ key: "repair_pending", label: "待维修", priority: 3 })
  }
  if (Number(row.maintenanceStatus) === 20) {
    issues.push({ key: "maintenance_exception", label: "保养异常", priority: 4 })
  }
  if (Number(row.patrolStatus) === 23) {
    issues.push({ key: "patrol_exception", label: "巡检异常", priority: 5 })
  }
  if (Number(row.spotStatus) === 26) {
    issues.push({ key: "spot_exception", label: "点检异常", priority: 6 })
  }
  if (Number(row.maintenanceStatus) === 11) {
    issues.push({ key: "maintenance_pending", label: "待保养", priority: 7 })
  }
  if (Number(row.patrolStatus) === 14) {
    issues.push({ key: "patrol_pending", label: "待巡检", priority: 8 })
  }
  if (Number(row.spotStatus) === 17) {
    issues.push({ key: "spot_pending", label: "待点检", priority: 9 })
  }

  return issues.sort((a, b) => a.priority - b.priority)
}

export const formatDeviceRunningStatus = (row: EquipmentLike) => {
  if (getDeviceLedgerStatus(row) === "scrapped") return "--"
  const display = String(row.displayRunningStatus || "").trim()
  if (display) return display
  const issues = buildRunningIssues(row)
  return issues.length ? issues[0].label : "正常"
}

export const getDeviceRunningStatusTagType = (row: EquipmentLike) =>
  RUNNING_STATUS_TAG_TYPE_MAP[formatDeviceRunningStatus(row)] || "info"

export const getDeviceRunningAlerts = (row: EquipmentLike) => {
  if (getDeviceLedgerStatus(row) === "scrapped") return []
  const provided = Array.isArray(row.runningAlerts) ? row.runningAlerts.filter(Boolean) : []
  if (provided.length) return provided

  const issues = buildRunningIssues(row)
  return issues.slice(1).map((item) => item.label)
}

export const formatSpotTaskStatus = (value?: number) =>
  Number(value) === 26 ? "点检异常" : Number(value) === 17 ? "待点检" : "正常"

export const formatPatrolTaskStatus = (value?: number) =>
  Number(value) === 23 ? "巡检异常" : Number(value) === 14 ? "待巡检" : "正常"

export const formatMaintenanceTaskStatus = (value?: number) =>
  Number(value) === 20 ? "保养异常" : Number(value) === 11 ? "待保养" : "正常"

export const formatDepartmentPosition = (department?: string, position?: string) => {
  const values = [department, position].filter(Boolean)
  return values.length ? values.join("-") : "-"
}

export const formatDepartmentPositionList = (
  rows?: Array<{
    depName?: string
    positionName?: string
    name?: string
  }>
) => {
  const values = (rows || [])
    .map((item) => formatDepartmentPosition(item.depName, item.positionName || item.name))
    .filter((item) => item !== "-")
  return values.length ? values.join("、") : "-"
}

export const formatBindingWorkstation = (value?: string) => {
  const text = String(value || "").trim()
  if (!text) return "-"

  const segments = text.split(/\s*(?:\/|>|,|，)\s*/).filter(Boolean)
  if (segments.length >= 2) {
    return segments.slice(-2).join("-")
  }
  return text
}

export const getDeviceMainData = (row: EquipmentLike) =>
  (row.equipmentModel || {}) as Partial<IEquipmentModelPageItem>
