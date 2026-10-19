import type { IDepartmentItem } from "@/types/base-info/department"
import type { IEmployeeListItem } from "@/types/base-info/employee"
import type { IFileInfo } from "@/types/base-info/file"
import type { IRequestPageParams } from "@/types/common"

export interface IMroMaintenanceTaskPageListParams
  extends IRequestPageParams<
    Partial<{
      barCode: string // mro标签码
      curDep: number // 是否只显示当前员工部门数据, 1是
      empId: string // 员工id
      maintenanceNo: string // 保养任务单号
      maintenanceResult: number // 保养结果（0未出结果/1OK/2NG）
      maintenanceResultList: number[] // 保养结果列表
      mroInformationId: string // mro实体的id
      mroNo: string // mro 编号
      maintenanceStatus: number // 任务状态
      taskStatusList: number[] // 任务状态列表
    }>
  > {}

export interface IMroMaintenanceTaskItem {
  createBy: string // 创建人的 ID，如果未提供则默认为 NULL
  createTime: string // 创建时间，默认为当前时间戳，不允许为空
  exceptionTaskId: string // 异常工单的ID
  fileDesc: string // 文件说明
  files: IFileInfo[] // 文件列表
  id: string // 主键
  maintenanceDepartments: IDepartmentItem[] // 保养部门
  maintenanceMethod: string // 方法要求
  maintenanceName: string // 保养项名称
  maintenanceNo: string // 保养项编号
  maintenanceResult: number // 保养结果 (1OK/2未出结果/0 NG)
  maintenanceStandard: {
    standardDesc: string // 检验标准文本描述
    standardMax: number // 区间上限 大于0, -1 表示无该区间
    standardMaxInclusive: number // 标准区间上限是否包含(1-包含 0-不包含)，默认不包含
    standardMin: number // 区间下限 大于0, -1 表示无该区间
    standardMinInclusive: number // 标准区间下限是否包含(1-包含 0-不包含), 默认不包含
    standardType: number // 检验标准 1数值 2文本
    unitId: string // 单位ID
    unitName: string // 单位名称
  } // 维护标准
  maintenanceTaskId: string // 保养任务的ID
  maintenanceTime: string // 提交时间/保养完成时间
  maintenanceUsers: IEmployeeListItem[] // 保养人员
  mroItemConfigId: string // MRO 配置项的ID
  mroItemConfigName: string // MRO配置项的名称
  ngDepartments: IDepartmentItem[] // NG部门
  ngReason: string // NG说明
  practicalValue: string // 实测值
  remarkFiles: IFileInfo[] // 备注文件列表
  remarks: string // 备注
  updateBy: string // 更新人的 ID，如果未提供则默认为 NULL
  updateTime: string // 更新时间，默认为当前时间戳，不允许为空
}

export interface IMroMaintenanceTaskPageListItem {
  barCode: string // 标签码
  barCodeId: string // 标签码id
  createBy: string // 创建人的 ID，如果未提供则默认为 NULL
  createTime: string // 创建时间，默认为当前时间戳，不允许为空
  curLocation: number // MRO当前位置(1在库2生产单位3在途)，默认为在库
  departments: string // 部门
  id: string // 主键
  items: IMroMaintenanceTaskItem[] // Mro保养目列表
  locationName: string // 库位名
  maintenanceComplete: string // 保养结束时间
  maintenanceNo: string // 保养任务单号
  maintenanceResult: number // 保养结果（0NG|1OK|2未出结果）
  maintenanceStart: string // 保养开始时间
  maintenanceStatus: number // 保养任务状态（1待执行|2执行中|3已完成|4未发布|0已过期）
  taskSource: string // 任务单来源
  mroInformationId: string // MRO信息的ID
  mroModelId: string // Mro型号
  mroModelName: string // Mro型号名称
  mroNo: string // MRO 序列号
  mroModelNo: string // MRO 编号
  mroSpec: string // MRO规格
  mroClassifyName: string // MRO分类
  mroTypeName: string // MRO类型
  executePosition: string // 执行职位
  planStartTime: string // 计划开始时间
  submitterName: string // 提交人
  checkByName: string // 复核人
  checkTime: string // 复核时间
  voidByName: string // 作废人
  voidReason: string // 作废原因
  voidTime: string // 作废时间
  remarks: string // 备注
  updateBy: string // 更新人的 ID，如果未提供则默认为 NULL
  updateTime: string // 更新时间，默认为当前时间戳，不允许为空
  warehouseId: string // 仓库id
  warehouseLocationId: string // 库位id
  warehouseName: string // 仓库名
  workStationId: string // 工位id，针对在生产单位的MRO
  workStationName: string // 生产单位名
}

export interface IMroMaintenanceTaskItemPageListParams
  extends IRequestPageParams<
    Partial<{
      maintenanceNo: string // 保养项编号
      maintenanceResult: number // 保养结果（0未出结果/1OK/2NG）
      maintenanceTaskId: string // 保养任务的ID
    }>
  > {}
