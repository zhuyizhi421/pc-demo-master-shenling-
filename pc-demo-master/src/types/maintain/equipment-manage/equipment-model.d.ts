import type { IFileInfo } from "@/types/base-info/file"
import type { ISystemFaultInfo } from "@/types/base-info/system-fault"
import type { IRequestPageParams } from "@/types/common"

export type IEquipmentModelPageListParams = IRequestPageParams<
  Partial<{
    equipmentCategoryId: string // 设备分类id
    modelName: string // 类型名称
    modelNo: string // 类型编号
    deviceModel: string // 设备型号
  }>
>

export interface IEquipmentModelDepartmentPosition {
  depId: string
  depName: string
  positionId: string
  positionName: string
}

export interface IEquipmentModelRepairTargetItem {
  id: string
  depName?: string
  positionName?: string
  name?: string
}

export interface IEquipmentModelPageItem {
  createBy: string // 创建人
  createTime: string // 创建时间
  equipmentCategoryId: string // 分类ID
  equipmentCategoryName: string // 分类名称
  exceptionHandlePositionList?: IEquipmentModelDepartmentPosition[] // 异常处理职位
  faults: ISystemFaultInfo[] // 故障
  files: IFileInfo[] // 文件
  id: string // 设备信息ID
  maintenanceExecuteDepartmentId?: string // 保养执行部门ID
  maintenanceExecuteDepartmentName?: string // 保养执行部门名称
  maintenanceExecutePositionId?: string // 保养执行职位ID
  maintenanceExecutePositionName?: string // 保养执行职位名称
  modelImg: string // 设备图片
  modelImgPath: string // 设备图片路径
  modelName: string // 类型名称
  deviceModel: string // 设备型号
  modelNo: string // 类型编号
  modelStatus: number // 设备状态 0停用1启用
  patrolExecuteDepartmentId?: string // 巡检执行部门ID
  patrolExecuteDepartmentName?: string // 巡检执行部门名称
  patrolExecutePositionId?: string // 巡检执行职位ID
  patrolExecutePositionName?: string // 巡检执行职位名称
  repairDepartments: IEquipmentModelRepairTargetItem[] // 指定维修对象
  repairProcdefId?: string // 维修流程
  repairProcdefName?: string // 维修流程
  remarks: string // 备注
  scrapProcdefId: string // 报废流程
  scrapProcdefName: string // 报废流程
  updateBy: string // 更新人
  updateTime: string // 更新时间
}

export type IEquipmentModelCreateParams = Partial<{
  equipmentCategoryId: string // 设备分类ID
  exceptionHandlePositionList: Array<{
    depId: string
    positionId: string
  }> // 异常处理职位
  faultIds: string[] // 故障ID数组
  maintenanceExecuteDepartmentId: string // 保养执行部门ID
  maintenanceExecuteDepartmentName: string // 保养执行部门名称
  maintenanceExecutePositionId: string // 保养执行职位ID
  maintenanceExecutePositionName: string // 保养执行职位名称
  deviceModel: string // 设备型号
  modelImg: string // 设备图片 文件资源ID
  modelName: string // 类型名称
  modelNo: string // 类型编号
  patrolExecuteDepartmentId: string // 巡检执行部门ID
  patrolExecuteDepartmentName: string // 巡检执行部门名称
  patrolExecutePositionId: string // 巡检执行职位ID
  patrolExecutePositionName: string // 巡检执行职位名称
  repairDepartmentIds: string[] // 指定维修职位ID数组（沿用原接口字段名）
  repairProcdefId: string // 维修流程定义ID
  remarks: string // 备注
  scrapProcdefId: string // 报废流程定义ID
}>

export type IEquipmentModelUpdateParams = IEquipmentModelCreateParams & {
  id: string
}
