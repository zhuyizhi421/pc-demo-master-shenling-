import useUserStore from "@/store/modules/user"
const useUser = useUserStore()

export enum AuthType {
  View = 0, // 可查看
  Edit = 1, // 可编辑
  Manage = 2 // 可管理
}

/**
 *
 * @description 用于判断当前路由页面内的查看及编辑权限，编辑返回true，查看返回false,无权限时当前页面也不会展示
 * @description 第一个参数传入编辑权限的权限码，第二个参数传入查看权限的权限码
 * @re
 */
export default function useButtonAuth(
  updateAuthCode: AuthTypeCode,
  seeAuthCode: AuthTypeCode
): globalThis.ComputedRef<AuthType> {
  return computed(() => {
    const canUpdate = useUser.permissionCodes.includes(updateAuthCode)
    const canSee = useUser.permissionCodes.includes(seeAuthCode)
    if (canUpdate && canSee) return AuthType.Manage
    if (canUpdate) {
      return AuthType.Edit
    } else if (canSee) {
      return AuthType.View
    }
    return AuthType.View
  })
}

/**
 *
 * @description 用于判断当前路由页面内的单个权限（如删除、停用等）
 * @description 参数传入权限的权限码
 * @re
 */
export function useButtonSingleAuth(AuthCode: AuthTypeCode): globalThis.ComputedRef<boolean> {
  return computed(() => {
    const canUse = useUser.permissionCodes.includes(AuthCode)
    if (canUse) {
      return true
    } else return false
  })
}

export function useButtonAuthRef(
  updateAuthCode: globalThis.Ref<AuthTypeCode>,
  seeAuthCode: globalThis.Ref<AuthTypeCode>
): globalThis.ComputedRef<AuthType> {
  return computed(() => {
    const canUpdate = useUser.permissionCodes.includes(updateAuthCode.value)
    const canSee = useUser.permissionCodes.includes(seeAuthCode.value)
    if (canUpdate && canSee) return AuthType.Manage
    if (canUpdate) {
      return AuthType.Edit
    } else if (canSee) {
      return AuthType.View
    }
    return AuthType.View
  })
}

export type AuthTypeCode = (typeof authCodes)[number]

const authCodes = [
  // 所有按钮权限的集合，后续有变动也许在此更新
  "SpotCheckExpect_update",
  "DepotAllocate_update",
  "PositionManage_query",
  "VehicleModelManage_update",
  "VehicleModelManage_query",
  "VehicleInfoManage_update",
  "VehicleInfoManage_query",
  "VehicleCategory_query",
  "VehicleCategory_update",
  "VehicleCategory_delete",
  "PositionManage_update",
  "WorkLicense_query",
  "WorkLicense_update",
  "PostManage_query",
  "PostManage_update",
  "DepartmentInfoJob_query",
  "DepartmentInfoJob_update",
  "StaffInfo_query",
  "StaffInfo_update",
  "RolePermission_query",
  "RolePermission_update",
  "UsersManage_query",
  "UsersManage_update",
  "FlowConfig_update",
  "FlowConfig_query",
  "DocumentManage_update",
  "DocumentManage_query",
  "FactoryModel_update",
  "FactoryModel_query",
  "ProductCategory_update",
  "ProductCategory_query",
  "ProductCategory_disable_enable",
  "ProductCategory_delete",
  "ProductManage_update",
  "ProductManage_query",
  "ProductManage_disable_enable",
  "ProductManage_delete",
  "CraftworkInfo_update",
  "CraftworkInfo_query",
  "CraftRoute_update",
  "CraftRoute_query",
  "CraftTypeConfig_update",
  "CraftTypeConfig_query",
  "CraftManage_update",
  "CraftManage_query",
  "UnitManagement_update",
  "UnitManagement_query",
  "AlarmManage_update",
  "AlarmManage_query",
  "SupplierInfo_update",
  "SupplierInfo_query",
  "CustomerInfo_update",
  "CustomerInfo_query",
  "Calendar_update",
  "Calendar_query",
  "SystemConfigEmail_update",
  "SystemConfigEmail_query",
  "SystemConfigEncode_update",
  "SystemConfigEncode_query",
  "SystemConfigEncodeModel_update",
  "SystemConfigEncodeModel_query",
  "DeviceCategory_update",
  "DeviceCategory_query",
  "DeviceFault_update",
  "DeviceFault_query",
  "DeviceInfo_update",
  "DeviceInfo_query",
  "SpotCheckExpect_query",
  "PollCheckExpect_update",
  "PollCheckExpect_query",
  "YearPlan_update",
  "YearPlan_query",
  "MonthPlan_update",
  "WeekPlan_update",
  "DeviceRepair_update",
  "MonthPlan_query",
  "WeekPlan_query",
  "MaintainType_update",
  "MaintainType_query",
  "MaintainType_delete",
  "DeviceRepairBaseConfig_update",
  "DeviceRepairBaseConfig_query",
  "DeviceRepairBaseConfig_delete",
  "DeviceRepair_query",
  "DeviceScrapApply_update",
  "DeviceScrapApply_query",
  "MaintainTask_update",
  "MaintainTask_query",
  "ExceptionalOrder_update",
  "ExceptionalOrder_query",
  "MROModel_update",
  "MROModel_query",
  "MROType_update",
  "MROType_query",
  "MROCategory_query",
  "MROCategory_update",
  "MROCategory_delete",
  "MRORegister_update",
  "MRORegister_query",
  "MROInboundOrder_query",
  "MROInboundOrder_add",
  "MROInboundOrder_update",
  "MROInboundOrder_delete",
  "MROInboundOrder_check",
  "MROInboundOrder_detail",
  "MROPickupOrder_query",
  "MROPickupOrder_add",
  "MROPickupOrder_update",
  "MROPickupOrder_delete",
  "MROPickupOrder_check",
  "MROPickupOrder_detail",
  "MROOutboundOrder_query",
  "MROOutboundOrder_add",
  "MROOutboundOrder_update",
  "MROOutboundOrder_delete",
  "MROOutboundOrder_check",
  "MROOutboundOrder_detail",
  "MROReturnOrder_query",
  "MROReturnOrder_add",
  "MROReturnOrder_update",
  "MROReturnOrder_delete",
  "MROReturnOrder_check",
  "MROReturnOrder_detail",
  "MROInventoryCheck_update",
  "MROInventoryCheck_query",
  "MRODifferenceOrder_update",
  "MRODifferenceOrder_query",
  "MRODifferenceOrder_check",
  "MROAdjustOrder_update",
  "MROAdjustOrder_query",
  "MROAdjustOrder_check",
  "VerifyAbnormalOrders_update",
  "VerifyAbnormalOrders_query",
  "UpkeepErrorOrders_update",
  "UpkeepErrorOrders_query",
  "MROScrapApply_query",
  "MRORepairOrders_update",
  "MRORepairOrders_query",
  "AndonRecord_update",
  "MROScrapApply_update",
  "AndonRecord_query",
  "AndonInfo_update",
  "AndonInfo_query",
  "AndonFault_update",
  "AndonFault_query",
  "ProductInventory_update",
  "ProductInventory_query",
  "DepotAllocate_query",
  "DepotCheck_update",
  "DepotCheck_query",
  "DepotManage_update",
  "DepotManage_query",
  "ProcurementManage_update",
  "ProcurementManage_query",
  "ProcurementReceive_update",
  "ProcurementReceive_query",
  "ProcurementReturn_update",
  "ProcurementReturn_query",
  "ProcurementOrder_update",
  "ProcurementOrder_query",
  "PickingPlan_update",
  "PickingPlan_query",
  "SalesOrders_update",
  "SalesOrders_query",
  "ShippingManagement_update",
  "ShippingManagement_query",
  "ReturnManagement_update",
  "ReturnManagement_query",
  "ProductLots_update",
  "ProductLots_query",
  "ProductionOrders_update",
  "ProductionOrders_query",
  "ScheduleProductPlan_update",
  "ScheduleProductPlan_query",
  "ProductionSchedulingTask_update",
  "ProductionSchedulingTask_query",
  "ProduceArrangePlan_update",
  "ProduceArrangePlan_query",
  "DefectManage_update",
  "DefectManage_query",
  "ProduceArrangeClasses_update",
  "ProduceArrangeClasses_query",
  "ProduceArrangeGroup_update",
  "ProduceArrangeGroup_query",
  "BarcodeMange_update",
  "BarcodeMange_query",
  "AreaPlan_update",
  "AreaPlan_query",
  "OutsourcingOrders_query",
  "OutsourcingOrders_update",
  "OutsourcingReturn_query",
  "OutsourcingReturn_update",
  "PreparationPlan_query",
  "PreparationPlan_update",
  "GlobalConfig_query",
  "GlobalConfig_update",
  "ImplementConfig_query",
  "ImplementConfig_update",
  "BatchModel_query",
  "BatchModel_update",
  "InspectOptionCategory_query",
  "InspectOptionCategory_update",
  "InspectOptionTemplate_query",
  "InspectOptionTemplate_update",
  "ProcessInspect_query",
  "ProcessInspect_update",
  "PackageSpec_query",
  "PackageSpec_update",
  "PackageProcess_query",
  "PackageProcess_update",
  "PackageTask_query",
  "PackageTask_update",
  "PackageSchedule_update",
  "PackageSchedule_query",
  "PackContainerManagement_update",
  "PackContainerManagement_query",

  "ImportData_update",
  "ImportData_query",
  "BomManage_update",
  "BomManage_query"
] as const
