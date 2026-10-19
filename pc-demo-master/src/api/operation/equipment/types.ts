export enum DeviceInitSettingTabs {
  check = 1,
  patrol,
  maintain,
  base,
  file
}

export enum InspectionResult {
  Complete,
  NotComplete
}

export const inspectionResultToNameMap: Record<number, string> = {
  [InspectionResult.Complete]: "已完成",
  [InspectionResult.NotComplete]: "未完成"
}

export enum ExceptionTaskStatus {
  Wait = 0,
  Finished
}

export const exceptionTaskStatusToNameMap: Record<number, string> = {
  [ExceptionTaskStatus.Wait]: "待处理",
  [ExceptionTaskStatus.Finished]: "已完成"
}

export enum ExceptionTaskSolutionType {
  Normal = 1,
  Maintain,
  Repair
}

export const exceptionTaskSolutionTypeToNameMap: Record<number, string> = {
  [ExceptionTaskSolutionType.Normal]: "无碍",
  [ExceptionTaskSolutionType.Maintain]: "需保养",
  [ExceptionTaskSolutionType.Repair]: "需维修"
}

// #region 设备维修单

export enum RepairStatus {
  Pending = 0,
  Processing,
  Finished,
  Closed
}

export const repairStatusToNameMap: Record<number, string> = {
  [RepairStatus.Pending]: "待处理",
  [RepairStatus.Processing]: "维修中",
  [RepairStatus.Finished]: "已完成",
  [RepairStatus.Closed]: "已关闭"
}

export const repairStatusTagTypeMap: Record<number, string> = {
  [RepairStatus.Pending]: "warning",
  [RepairStatus.Processing]: "primary",
  [RepairStatus.Finished]: "success",
  [RepairStatus.Closed]: "info"
}

export enum EquipmentRepairResult {
  Scrap = 0,
  Resolved = 1,
  NextRound = 2
}

export const equipmentRepairResultToNameMap: Record<number, string> = {
  [EquipmentRepairResult.Scrap]: "报废",
  [EquipmentRepairResult.Resolved]: "已修复",
  [EquipmentRepairResult.NextRound]: "转下一轮维修"
}

export const equipmentRepairResultTagTypeMap: Record<number, string> = {
  [EquipmentRepairResult.Scrap]: "danger",
  [EquipmentRepairResult.Resolved]: "success",
  [EquipmentRepairResult.NextRound]: "warning"
}

export enum EquipmentRepairMode {
  Internal = 1,
  External = 2
}

export const equipmentRepairModeToNameMap: Record<number, string> = {
  [EquipmentRepairMode.Internal]: "内部维修",
  [EquipmentRepairMode.External]: "委外维修"
}

// #endregion

// #region 设备配置相关（初始化配置 和 设备信息里的配置）

export enum InspectionStandardType {
  Number = 1,
  Text = 2
}

export const inspectionStandardTypeToNameMap: Record<number, string> = {
  [InspectionStandardType.Number]: "定量",
  [InspectionStandardType.Text]: "定性"
}

export enum SpotInspectionFrequency {
  Daily = 1,
  TimePoint = 3
}

export const spotInspectionFrequencyMap = {
  [SpotInspectionFrequency.Daily]: "按天",
  [SpotInspectionFrequency.TimePoint]: "时间点"
}

// #endregion
