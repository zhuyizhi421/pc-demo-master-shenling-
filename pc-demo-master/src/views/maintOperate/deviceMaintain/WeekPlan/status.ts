export enum EnumEquipmentMaintenanceWeekPlanStatusType {
  Unreviewed = 0,
  Reviewed = 1,
  Voided = 2
}

export const EnumEquipmentMaintenanceWeekPlanStatusTypeMap: Record<
  EnumEquipmentMaintenanceWeekPlanStatusType,
  string
> = {
  [EnumEquipmentMaintenanceWeekPlanStatusType.Unreviewed]: "未复核",
  [EnumEquipmentMaintenanceWeekPlanStatusType.Reviewed]: "已复核",
  [EnumEquipmentMaintenanceWeekPlanStatusType.Voided]: "已作废"
}

export const EnumEquipmentMaintenanceWeekPlanStatusTagTypeMap: Record<
  EnumEquipmentMaintenanceWeekPlanStatusType,
  "warning" | "success" | "info"
> = {
  [EnumEquipmentMaintenanceWeekPlanStatusType.Unreviewed]: "warning",
  [EnumEquipmentMaintenanceWeekPlanStatusType.Reviewed]: "success",
  [EnumEquipmentMaintenanceWeekPlanStatusType.Voided]: "info"
}
