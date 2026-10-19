import type { IDepartmentItem } from "@/types/base-info/department"
import type { IEmployeeListItem } from "@/types/base-info/employee"
import type { IFileInfo } from "@/types/base-info/file"

export interface IEquipmentMaintenanceItemInfo {
  createBy: string // 创建人
  createTime: string // 创建时间
  equipmentConfigId: string // 设备配置ID
  exceptionTaskId: string // 异常工单的ID
  exceptionTaskNo: string // 异常工单编号
  fileDesc: string // 文件说明
  files: IFileInfo[] // 文件列表
  id: string // ID
  maintenanceDepartments: IDepartmentItem[] // 保养部门
  maintenanceMethod: string // 方法要求
  maintenanceName: string // 保养项名称
  maintenanceNo: string // 保养项编号
  maintenanceResult: number // 保养结果 (1 OK|0 NG|2 未出结果)
  maintenanceStandard: {
    standardDesc: string // 检验标准文本描述
    standardMax: number // 区间上限 大于0, -1 表示无该区间
    standardMaxInclusive: number // 标准区间上限是否包含(1-包含 0-不包含)，默认不包含
    standardMin: number // 区间下限 大于0, -1 表示无该区间
    standardMinInclusive: number // 标准区间下限是否包含(1-包含 0-不包含), 默认不包含
    standardType: number // 检验标准 1数值 2文本
    unitId: string // 单位ID
    unitName: string // 单位名称
  } // 保养标准
  maintenanceTaskId: string // 保养任务ID
  maintenanceTime: string // 提交时间
  maintenanceUsers: IEmployeeListItem[] // 保养人员
  ngDepartments: IDepartmentItem[] // NG部门
  ngReason: string // NG说明
  practicalValue: string // 实测值
  remarkFiles: IFileInfo[] // 备注文件列表
  remarks: string // 备注
  unitName: string // 单位名称
  updateBy: string // 更新人
  updateTime: string // 更新时间
}
