import type { IDepartmentItem } from "@/types/base-info/department"
import type { IEmployeeListItem } from "@/types/base-info/employee"
import type { IFileInfo } from "@/types/base-info/file"

export interface IEquipmentSpotItemInfo {
  createBy: string // 创建人ID
  createTime: string // 创建时间
  equipmentConfigId: string // 设备配置ID
  exceptionTaskId: string // 异常工单的ID
  exceptionTaskNo: string // 异常工单编号
  fileDesc: string // 文件说明
  files: IFileInfo[]
  id: string // 主键ID
  inspectionMethod: string // 方法要求
  inspectionName: string // 检验项名称
  inspectionNo: string // 检验项编号
  inspectionResult: number // 检验结果 (1OK/0NG/2未出结果)，默认为未出结果
  inspectionStandard: {
    standardDesc: string // 检验标准文本描述
    standardMax: number // 区间上限 大于0, -1 表示无该区间
    standardMaxInclusive: number // 标准区间上限是否包含(1-包含 0-不包含)，默认不包含
    standardMin: number // 区间下限 大于0, -1 表示无该区间
    standardMinInclusive: number // 标准区间下限是否包含(1-包含 0-不包含), 默认不包含
    standardType: number // 检验标准 1数值 2文本
    unitId: string // 单位ID
    unitName: string // 单位名称
  }
  inspectionTime: string // 提交时间
  inspectionUsers: IEmployeeListItem[] // 提交人员
  inspectionWorkstation: string // 提交时的工位
  ngDepartments: IDepartmentItem[] // 非正常部门
  practicalValue: number // 实测值
  remarks: string // 备注
  spotTaskId: string // 点检任务ID
  updateBy: string // 更新人ID
  updateTime: string // 更新时间
}
