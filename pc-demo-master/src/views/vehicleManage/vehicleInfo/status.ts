import type { IVehiclePageItem } from "@/types/maintain/vehicle"

export type VehicleLedgerStatus = "enabled" | "disabled" | "scrapped"
export type VehicleTaskStatus = "none" | "pending" | "processing" | "completed"

const LEDGER_STATUS_TEXT_MAP: Record<VehicleLedgerStatus, string> = {
  enabled: "启用",
  disabled: "停用",
  scrapped: "报废"
}

export const LEDGER_STATUS_TAG_TYPE_MAP: Record<
  VehicleLedgerStatus,
  "success" | "warning" | "danger" | "info"
> = {
  enabled: "success",
  disabled: "warning",
  scrapped: "danger"
}

const REPAIR_TASK_STATUS_TEXT_MAP: Record<VehicleTaskStatus, string> = {
  none: "无",
  pending: "待维修",
  processing: "维修中",
  completed: "已完成"
}

const SCRAP_TASK_STATUS_TEXT_MAP: Record<VehicleTaskStatus, string> = {
  none: "无",
  pending: "待报废",
  processing: "待报废",
  completed: "已报废"
}

export const TASK_STATUS_TAG_TYPE_MAP: Record<
  VehicleTaskStatus,
  "info" | "warning" | "primary" | "success"
> = {
  none: "info",
  pending: "warning",
  processing: "primary",
  completed: "success"
}

type VehicleLike = Partial<IVehiclePageItem> & {
  ledgerStatus?: string
  repairTaskStatus?: string | number
  scrapTaskStatus?: string | number
  loadProductCount?: number
}

const normalizeTaskStatus = (
  value: string | number | undefined,
  textMap: Record<VehicleTaskStatus, string>
): VehicleTaskStatus | null => {
  const text = String(value ?? "").trim()
  if (!text) return null
  if (text === "none" || text === textMap.none || text === "无") return "none"
  if (text === "pending" || text === textMap.pending) return "pending"
  if (text === "processing" || text === textMap.processing) return "processing"
  if (text === "completed" || text === textMap.completed) return "completed"
  return null
}

export const getVehicleRepairTaskStatus = (row: VehicleLike): VehicleTaskStatus => {
  return normalizeTaskStatus(row.repairTaskStatus, REPAIR_TASK_STATUS_TEXT_MAP) || "none"
}

export const getVehicleScrapTaskStatus = (row: VehicleLike): VehicleTaskStatus => {
  return normalizeTaskStatus(row.scrapTaskStatus, SCRAP_TASK_STATUS_TEXT_MAP) || "none"
}

export const getVehicleLedgerStatus = (row: VehicleLike): VehicleLedgerStatus => {
  const raw = String(row.ledgerStatus || "").trim()
  if (raw === "enabled" || raw === "disabled" || raw === "scrapped") {
    return raw
  }
  if (getVehicleScrapTaskStatus(row) === "completed") {
    return "scrapped"
  }
  if (Number(row.status) === 0) {
    return "disabled"
  }
  return "enabled"
}

export const formatVehicleLedgerStatus = (row: VehicleLike) =>
  LEDGER_STATUS_TEXT_MAP[getVehicleLedgerStatus(row)]

export const formatVehicleRepairTaskStatus = (row: VehicleLike) =>
  REPAIR_TASK_STATUS_TEXT_MAP[getVehicleRepairTaskStatus(row)]

export const formatVehicleScrapTaskStatus = (row: VehicleLike) =>
  SCRAP_TASK_STATUS_TEXT_MAP[getVehicleScrapTaskStatus(row)]

export const getVehicleLoadProductCount = (row: VehicleLike) => {
  if (typeof row.loadProductCount === "number") return row.loadProductCount
  return Array.isArray(row.bindProducts) ? row.bindProducts.length : 0
}
