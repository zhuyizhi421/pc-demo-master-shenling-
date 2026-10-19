import {
  EquipmentRepairMode,
  equipmentRepairModeToNameMap,
  EquipmentRepairResult,
  equipmentRepairResultToNameMap,
  RepairStatus,
  repairStatusToNameMap
} from "@/api/operation/equipment/types"
import { EnumEquipmentRepairSourceTypeMap } from "@/constant/enums"

export const deviceRepairFaultLevelOptions = [
  { label: "一般", value: 1 },
  { label: "重要", value: 2 },
  { label: "紧急", value: 3 }
] as const

export const deviceRepairImplementOptions = [
  { label: "是", value: 1 },
  { label: "否", value: 0 }
] as const

export const deviceRepairNextRoundReasonOptions = [
  { label: "外协维修", value: "外协维修" },
  { label: "缺配件", value: "缺配件" },
  { label: "技术支持", value: "技术支持" },
  { label: "其他", value: "其他" }
] as const

export const deviceRepairFaultLevelNameMap: Record<number, string> = {
  1: "一般",
  2: "重要",
  3: "紧急"
}

export const deviceRepairStatusOptions = Object.entries(repairStatusToNameMap).map(([value, label]) => ({
  label,
  value: Number(value)
}))

export const deviceRepairResultOptions = Object.entries(equipmentRepairResultToNameMap).map(
  ([value, label]) => ({
    label,
    value: Number(value)
  })
)

export const deviceRepairSourceTypeOptions = Object.entries(EnumEquipmentRepairSourceTypeMap).map(
  ([value, label]) => ({
    label,
    value: Number(value)
  })
)

export const deviceRepairModeOptions = Object.entries(equipmentRepairModeToNameMap).map(
  ([value, label]) => ({
    label,
    value: Number(value)
  })
)

export const formatDeviceRepairStatus = (value?: number | string) =>
  repairStatusToNameMap[Number(value)] || "-"

export const formatDeviceRepairResult = (value?: number | string | "") => {
  if (value === "" || value === undefined || value === null) {
    return "-"
  }
  return equipmentRepairResultToNameMap[Number(value)] || "-"
}

export const formatDeviceRepairMode = (value?: number | string) =>
  equipmentRepairModeToNameMap[Number(value)] || "-"

export const formatDeviceRepairSourceType = (value?: number | string) =>
  EnumEquipmentRepairSourceTypeMap[Number(value)] || "-"

export const formatDeviceRepairFaultLevel = (value?: number | string) =>
  deviceRepairFaultLevelNameMap[Number(value)] || "-"

export const canEditDeviceRepair = (sourceType?: number | string, status?: number | string) =>
  Number(sourceType) === 4 && Number(status) === RepairStatus.Pending

export const canAssignDeviceRepair = (status?: number | string) =>
  Number(status) === RepairStatus.Pending || Number(status) === RepairStatus.Processing

export const canFeedbackDeviceRepair = (status?: number | string) =>
  Number(status) === RepairStatus.Processing

export const canConfirmDeviceRepair = (status?: number | string) =>
  Number(status) === RepairStatus.Finished

export const defaultDeviceRepairMode = EquipmentRepairMode.Internal
export const defaultDeviceRepairResult = EquipmentRepairResult.Resolved
