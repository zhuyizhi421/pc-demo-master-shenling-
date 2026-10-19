import type { IDepartmentItem } from "@/types/base-info/department"
import type { IFileInfo } from "@/types/base-info/file"
import type { IRequestPageParams } from "@/types/common"

export interface IEquipmentConfigPageListParams
  extends IRequestPageParams<
    Partial<{
      equipmentId: string // 设备ID
      configType: number // 配置项类型（1点检 2巡检 3保养 4设备参数 5文件）
      configName: string // 配置项名称
    }>
  > {}

export interface IEquipmentConfigPageListItem {
  configName: string // 配置项名
  configType: number // 置项类型（1点检2巡检3保养4设备参数）
  createBy: number // 创建人
  createTime: string // 创建时间
  equipmentId: string // 设备id
  id: number
  fileResource: IFileInfo[]
  maintenanceItem: {
    fileDesc: string // 文件描述
    fileIds: string[]
    id: number
    inspectionStandard: {
      standardDesc: string // 检验标准文本描述
      standardMax: number // 区间上限
      standardMaxInclusive: boolean // 标准区间上限是否包含(1-包含 0-不包含)，默认不包含
      standardMin: number // 区间下限
      standardMinInclusive: boolean // 标准区间下限是否包含(1-包含 0-不包含), 默认不包含
      standardType: number // 检验标准 1数值 2文本
      unitId: string // 单位id
      unitName: string // 单位名称
    }
    maintenanceCode: string // 保养项编号
    maintenanceTypeId: string // 保养类型ID
    maintenanceTypeName: string // 保养类型名称
    maintenanceDepartmentIds: string[] // 保养执行处理部门id列表
    maintenanceDepartments: IDepartmentItem[] // 保养执行处理部门
    maintenanceFrequency: number // 频率
    maintenanceName: string // 保养名
    method: string // 保养方法
    ngDepartmentIds: string[] // NG处理部门id列表
    ngDepartments: IDepartmentItem[] // NG处理部门
    remarks: string // 备注
  } // 保养项
  mconfigId: string // 模型配置ID
  patrolItem: {
    fileDesc: string // 文件描述
    files: IFileInfo[]
    inspectionCode: string // 检验项编号
    inspectionDepartments: IDepartmentItem[] // 检验执行部门
    inspectionFrequency: number // 巡检频率
    inspectionName: string // 检验名
    inspectionStandard: {
      standardDesc: string
      standardMax: number
      standardMaxInclusive: boolean
      standardMin: number
      standardMinInclusive: boolean
      standardType: number
      unitId: string // 单位id
      unitName: string // 单位名称
    }
    method: string // 检验方法
    ngDepartments: IDepartmentItem[] // NG处理部门
    remarks: string // 备注
  } // 	巡检项
  remarks: string // 备注
  specificationJson: {
    desc: string
    id: number
    key: string
    remarks: string
    val: string
  }
  spotItem: {
    fileDesc: string
    files: IFileInfo[]
    inspectionFrequency: number
    inspectionName: string
    inspectionStandard: {
      standardDesc: string
      standardMax: number
      standardMaxInclusive: boolean
      standardMin: number
      standardMinInclusive: boolean
      standardType: number
    }
    method: string
    ngDepartments: IDepartmentItem[]
    remarks: string
  } // 	点检项
  updateBy: number
  updateTime: string
}

export interface IEquipmentConfigUpdateParams {
  equipmentId: string
  configType?: number
  equipmentCommonConfigs?: {
    configName?: string
    configType?: number
    equipmentId?: string
    id?: number
    maintenanceConfigValue?: {
      fileDesc: string
      files: {
        createBy: number
        createTime: string
        deploymentId: number
        extension: string
        fileName: string
        hash: string
        id: number
        path: string
        size: number
        sourceName: string
        updateBy: number
        updateTime: string
        version: string
      }[]
      id: number
      inspectionStandard: {
        standardDesc: string
        standardMax: number
        standardMaxInclusive: boolean
        standardMin: number
        standardMinInclusive: boolean
        standardType: number
      }
      maintenanceTypeId: string
      maintenanceTypeName: string
      maintenanceDepartments: {
        createBy: number
        createTime: string
        depName: string
        id: number
        parentDepId: number
        updateBy: number
        updateTime: string
      }[]
      maintenanceFrequency: number
      maintenanceName: string
      method: string
      ngDepartments: {
        createBy: number
        createTime: string
        depName: string
        id: number
        parentDepId: number
        updateBy: number
        updateTime: string
      }[]
      remarks: string
    }
    mconfigId?: number
    patrolConfigValue?: {
      fileDesc: string
      fileIds: number[]
      inspectionDepartmentIds: number[]
      inspectionFrequency: number
      inspectionName: string
      inspectionStandard: {
        standardDesc: string
        standardMax: number
        standardMaxInclusive: boolean
        standardMin: number
        standardMinInclusive: boolean
        standardType: number
      }
      method: string
      ngDepartmentIds: number[]
      remarks: string
    }
    remarks?: string
    specConfigValue?: {
      desc: string
      id: number
      key: string
      remarks: string
      val: string
    }
    spotConfigValue?: {
      fileDesc: string
      fileIds: number[]
      inspectionFrequency: number
      inspectionName: string
      inspectionStandard: {
        standardDesc: string
        standardMax: number
        standardMaxInclusive: boolean
        standardMin: number
        standardMinInclusive: boolean
        standardType: number
      }
      method: string
      ngDepartmentIds: number[]
      remarks: string
    }
  }[]
  fileIds?: string[]
}

export interface IEquipmentConfigListParams
  extends Partial<{
    equipmentId: string // 设备ID
    configType: number // 配置项类型（1点检 2巡检 3保养 4设备参数 5文件）
    configName: string // 配置项名称
  }> {}
