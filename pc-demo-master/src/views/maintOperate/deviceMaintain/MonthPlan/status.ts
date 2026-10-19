export enum EnumEquipmentMaintenanceMonthPlanStatusType {
  Unreviewed,
  Reviewed,
  Voided
}

export const EnumEquipmentMaintenanceMonthPlanStatusTypeMap: Record<
  EnumEquipmentMaintenanceMonthPlanStatusType,
  string
> = {
  [EnumEquipmentMaintenanceMonthPlanStatusType.Unreviewed]: "未复核",
  [EnumEquipmentMaintenanceMonthPlanStatusType.Reviewed]: "已复核",
  [EnumEquipmentMaintenanceMonthPlanStatusType.Voided]: "已作废"
}

export const EnumEquipmentMaintenanceMonthPlanStatusTagTypeMap: Record<
  EnumEquipmentMaintenanceMonthPlanStatusType,
  string
> = {
  [EnumEquipmentMaintenanceMonthPlanStatusType.Unreviewed]: "warning",
  [EnumEquipmentMaintenanceMonthPlanStatusType.Reviewed]: "success",
  [EnumEquipmentMaintenanceMonthPlanStatusType.Voided]: "info"
}
