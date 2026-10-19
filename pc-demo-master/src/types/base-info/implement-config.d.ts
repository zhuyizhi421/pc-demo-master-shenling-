/** 自定义下拉框option配置 */
import {
  EnumCraftBizType,
  EnumCustomFormComponentType,
  EnumCustomFormType,
  EnumFirstInspectionNode,
  EnumIncomingMaterialsReceiveMode,
  EnumProductionMaterialsSign,
  EnumProductionScheduleMode
} from "@/constant/enums"

export interface ICustomSelectOption {
  label: string
  value: string
  isActive: boolean
}

/** 自定义字段配置项预览数据 */
export type ICustomConfigPreviewData = Omit<ICustomConfigRow, "previewData"> & {
  accept?: string // 预览时上传文件类型
  curSelectUserType?: number // 预览时当前选择的用户类型
  currentSelectedList?: string[] // 预览时当前选择的用户列表
}

/** 自定义字段配置项 */
export interface ICustomConfigRow {
  id?: string
  isActive: boolean // 启用状态
  formType: EnumCustomFormType // 表单名称类型
  fieldName: string // 字段名称
  fieldType: EnumCustomFormComponentType // 字段类型
  isRequired: boolean // 是否必填
  maxLength?: number // 字符长度限制
  defaultValue?: string | number | boolean | (string | number)[] // 默认值
  unit?: string // 单位
  selectOptions?: ICustomSelectOption[] // 选择器下拉选项
  max?: number //
  min?: number // 最小值
  dateType?: number // 日期类型
  startTime?: number // 开始时间
  endTime?: number // 结束时间
  defaultTimeOperation?: number // 默认时间计算方式，当前基础上+或者-
  startTimeOperation?: number // 开始时间计算方式，当前基础上+或者-
  endTimeOperation?: number // 结束时间计算方式，当前基础上+或者-
  supportTypes?: string[] // 上传类型
  maxSize?: number // 单个文件上传大小
  maxNum?: number // 上传文件数量限制
  isMultiple?: boolean // 是否多选用户
  selectUserTypes?: number[] // 选择用户类型
  previewData?: ICustomConfigPreviewData
}

export interface IFile {
  fileId: string
  fileName: string
  size: number
}

/** 实施配置-物流运营入参 */
export interface IImplementConfigMaterialFlowParams {
  [key: string]: any
  incomingReceiptType: EnumIncomingMaterialsReceiveMode // 来料收货方式 1-关联条码 2=打印条码
  // productionReceiptType: EnumProductionMaterialsSign // 生产物料签收方式 1-无签收 2=入线边库 3=直接签收
}

/** 实施配置-生产运营入参 */
export interface IImplementConfigProductionParams {
  [key: string]: any
  executeMethod: EnumProductionScheduleMode // 生产调度方式 1=调度到生产单位 2=调度到工位
  autoExecute: boolean // 自动按排产数量调度
  allowProductionIfEquipmentException: boolean // 设备点检异常时允许生产
  allowTechGroup: boolean // 是否允许工艺组
  allowParallelTech: boolean // 是否允许且工艺
  enableAreaPlan: boolean // 是否启用区域计划
  allowMultipleEmployee: boolean // 允许多员工同时上岗
  scheduleTimeDimension: number // 排产时间维度 1=按天 2=按小时
}

/** 实施配置-质量运营出参 */
export interface IImplementConfigQualityParams {
  [key: string]: any
  unqualifiedReviewAfterRegister: boolean // 缺陷登记后才能不合格品评审
  scrapDistinguishProductionOrMaterial: boolean // 报废是否区分工废/料废
}

export interface IVersionTemplateItem {
  bizType: EnumCraftBizType // 业务属性：1.加工，2.包装 3.检验 4.指向料工艺
  bizTypeName: string // 业务类型名称
  codeRelate: number // 是否关联条码 0-不关联 1-关联
  defaultCodeRelationType: number // 默认条码关联方式 1关联空条码 2生成新条码 3关联外部码 4沿用主料码
  nature: number // 性质，1.自制，2.委外
  productionSchedulingType: number // 排产控制 0不排产 1排产
  status: string // 状态（enable/disable）
  vehicleRelate: number // 是否关联载具 0-不关联 1-关联 2-不限
}

/** 实施配置-基础配置入参 */
export interface IImplementConfigBaseParams {
  [key: string]: any
  supplierPlatformAddress: string // 供应商平台地址
  versionTemplateList: IVersionTemplateItem[] // 版本模板列表
}

/** 自定义字段-单行输入框、多行输入框出参 */
export interface ICustomFieldInputRes {
  id: string
  fieldCode: string
  formType: EnumCustomFormType
  fieldName: string
  fieldType: EnumCustomFormComponentType
  isRequired: boolean
  maxLength: number
  defaultValue: string
  isActive: boolean
  unit: string
}

/** 自定义字段-单行输入框、多行输入框入参 */
export interface ICustomFieldInputReq extends ICustomFieldInputRes {
  id?: string
  fieldCode?: string
  maxLength?: number
  defaultValue?: string
  unit?: string
}

export interface ICustomFieldSwitchRes {
  id: string
  fieldCode: string
  formType: EnumCustomFormType
  fieldName: string
  fieldType: EnumCustomFormComponentType
  isRequired: boolean
  defaultValue: boolean
  isActive: boolean
}

export interface ICustomFieldSwitchReq extends ICustomFieldSwitchRes {
  id?: string
  fieldCode?: string
}

export interface ICustomFieldSingleSelectRes {
  id: string
  fieldCode: string
  formType: EnumCustomFormType
  fieldName: string
  fieldType: EnumCustomFormComponentType
  isRequired: boolean
  defaultValue: string
  options: ICustomSelectOption[]
  isActive: boolean
  unit: string
}

export interface ICustomFieldSingleSelectReq extends ICustomFieldSingleSelectRes {
  id?: string
  fieldCode?: string
  defaultValue?: string
  unit?: string
}

export interface ICustomFieldMultipleSelectReq extends ICustomFieldSingleSelectReq {
  defaultValue: string[]
}
export interface ICustomFieldMultipleSelectRes extends ICustomFieldSingleSelectRes {
  defaultValue?: string[]
}

export interface ICustomFieldNumberStepRes {
  id: string
  fieldCode: string
  formType: EnumCustomFormType
  fieldName: string
  fieldType: EnumCustomFormComponentType
  isRequired: boolean
  lowerLimit: number
  upperLimit: number
  isActive: boolean
  unit: string
}

export interface ICustomFieldNumberStepReq extends ICustomFieldNumberStepRes {
  id?: string
  fieldCode?: string
  lowerLimit?: number
  upperLimit?: number
  unit?: string
}

export interface ICustomFieldDatePickRes {
  id: string
  fieldCode: string
  formType: EnumCustomFormType
  fieldName: string
  fieldType: EnumCustomFormComponentType
  isRequired: boolean
  isPoint: boolean
  isActive: boolean
  defaultValue: number
  lowerLimit: number
  upperLimit: number
}

export interface ICustomFieldDatePickReq extends ICustomFieldDatePickRes {
  id?: string
  fieldCode?: string
  defaultValue?: number
  lowerLimit?: number
  upperLimit?: number
}

export interface ICustomFieldFileUpdateRes {
  id: string
  fieldCode: string
  formType: EnumCustomFormType
  fieldName: string
  fieldType: EnumCustomFormComponentType
  isRequired: boolean
  supportTypes: string[]
  maxNum: number
  maxSize: number
  isActive: boolean
}

export interface ICustomFieldFileUpdateReq extends ICustomFieldFileUpdateRes {
  id?: string
  fieldCode?: string
  maxNum?: number
  maxSize?: number
}

export interface ICustomFieldEmployeeSelectRes {
  id: string
  fieldCode: string
  formType: EnumCustomFormType
  fieldName: string
  fieldType: EnumCustomFormComponentType
  isRequired: boolean
  isMultiple: boolean
  selectTypes: number[] // 1=按员工 2=按部门 3=按职位
  isActive: boolean
}

export interface ICustomFieldEmployeeSelectReq extends ICustomFieldEmployeeSelectRes {
  id?: string
  fieldCode?: string
}

/** 自定义字段项详情 */
export interface ICustomFieldItemInfo {
  label: string
  value: string
  fieldType: EnumCustomFormComponentType
}
