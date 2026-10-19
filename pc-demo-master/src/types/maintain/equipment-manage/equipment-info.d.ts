import { EnumDeviceTaskStatusType, EnumDeviceUseStatusType } from "@/constant/enums"
import type { IRequestPageParams } from "@/types/common"
import type { IEquipmentModelPageItem } from "@/types/maintain/equipment-manage/equipment-model"

export type IEquipmentPageParams = IRequestPageParams<
  Partial<{
    equipmentCategoryId: string // 设备分类ID
    equipmentModelId: string // 设备信息ID
    equipmentName: string // 设备名称
    equipmentNo: string // 设备编号
    equipmentModelNo: string // 类型编号
    equipmentStatus: EnumDeviceUseStatusType // 设备使用状态， 0停用1启用
    taskStatus: EnumDeviceTaskStatusType // 维护状态
    taskStatusList: EnumDeviceTaskStatusType[] // 维护状态
  }>
>

export interface IEquipmentPageItem {
  barCode: string // 标签码
  barCodeId: string // 标签码id
  createBy: string // 创建人的 ID，如果未提供则默认为 NULL
  createTime: string // 创建时间|设备添加时间，默认为当前时间戳，不允许为空
  equipmentModel: IEquipmentModelPageItem // 设备模型
  equipmentModelId: string // 设备信息ID，不允许为空
  equipmentName: string // 设备名称，不允许为空
  equipmentNo: string // 设备编号，必须唯一
  equipmentStatus: number // 设备状态， 0停用|1启用
  fmEntityCodes: string // 工厂建模位置编号
  fmEntityIds: string[] // 工厂建模位置ID
  fmEntityNames: string // 工厂建模位置名称
  handlerStatus: string // 展示状态,经过优先级处理后的状态，设备使用状态
  id: string // 设备ID
  ledgerStatus?: string // 台账状态（后续接口补充）
  maintenanceStatus: number // 保养状态 1正常 < 11待保养 < 20保养异常
  manufacturerNo: string // 原厂编号
  oeeControl: number // 是否参加OEE计算 0否1是
  patrolStatus: number // 巡检状态 1正常 < 14待巡检 < 23巡检异常
  remarks: string // 备注
  repairStatus: number // 维修状态 1正常 < 29待维修 < 32待报废 < 35已报废
  repairTaskStatus?: string | number // 维修任务状态（后续接口补充）
  runningAlerts?: string[] // 运转提醒（后续接口补充）
  runningStatus?: string // 运转状态（后续接口补充）
  scadaControl: number // SCADA是否接入 0否1是
  scadaIdentification: string // SCADA标识
  scrapStatus?: number // 报废状态（后续接口补充）
  scrapTaskStatus?: string | number // 报废任务状态（后续接口补充）
  spotStatus: number // 点检状态 1正常 < 17待点检 < 26点检异常
  displayRunningStatus?: string // 运转状态展示文案（后续接口补充）
  startMaintenanceDate: string // 开始参与保养日期
  startPatrolDate: string // 开始参与巡检日期
  updateBy: string // 更新人的 ID，如果未提供则默认为 NULL
  updateTime: string // 更新时间，默认为当前时间戳，不允许为空
}

export interface IEquipmentCreateParams
  extends Partial<{
    autoGenerateBarcode: number // 是否自动生成标签码，默认为0-否
    barcode: string // 设备标签码
    equipmentModelId: string // 设备信息ID，不允许为空
    equipmentName: string // 设备名称，不允许为空
    equipmentNo: string // 设备编号
    manufacturerNo: string // 原厂编号
    oeeControl: number // 是否参加OEE计算 0否1是
    remarks: string // 备注
    scadaControl: number // SCADA是否接入 0否1是
    scadaIdentification: string // SCADA标识
    startMaintenanceDate: string // 开始参与保养日期
    startPatrolDate: string // 开始参与巡检日期
  }> {}

export interface IEquipmentUpdateParams extends IEquipmentCreateParams {
  id: string // 设备ID
}
