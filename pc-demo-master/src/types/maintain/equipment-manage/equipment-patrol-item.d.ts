import type { IDepartmentItem } from "@/types/base-info/department"
import type { IEmployeeListItem } from "@/types/base-info/employee"
import type { IFileInfo } from "@/types/base-info/file"

export interface IEquipmentPatrolItemInfo {
  createBy: string // 创建人ID
  createTime: string // 创建时间
  equipmentConfigId: string // 设备配置ID
  exceptionTaskId: string // 异常工单的ID
  exceptionTaskNo: string // 异常工单编号
  fileDesc: string // 文件说明
  files: IFileInfo[] // 文件数组
  id: string // 主键
  inspectionDepartments: IDepartmentItem[] // 检验执行部门
  inspectionMethod: string // 方法要求
  inspectionName: string // 检验项名称
  inspectionNo: string // 检验项编号
  inspectionResult: number // 检验结果 (1OK|2NG)
  inspectionStandard: {
    standardDesc: string // 检验标准文本描述
    standardMax: number // 区间上限 大于0, -1 表示无该区间
    standardMaxInclusive: number // 标准区间上限是否包含(1-包含 0-不包含)，默认不包含
    standardMin: number // 区间下限 大于0, -1 表示无该区间
    standardMinInclusive: number // 标准区间下限是否包含(1-包含 0-不包含), 默认不包含
    standardType: number // 检验标准 1数值 2文本
    unitId: string // 单位ID
    unitName: string // 单位名称
  } // 检验标准
  inspectionTime: string // 提交时间
  inspectionUsers: IEmployeeListItem[] // 检验人员
  ngDepartments: IDepartmentItem[] // NG处理部门数组
  ngReason: string // NG说明
  patrolTaskId: string // 巡检任务ID
  practicalValue: number // 实测值
  remarkFiles: IFileInfo[] // 备注文件
  remarks: string // 备注
  unitName: string // 单位名称
  updateBy: string // 更新人ID
  updateTime: string // 更新时间
}
