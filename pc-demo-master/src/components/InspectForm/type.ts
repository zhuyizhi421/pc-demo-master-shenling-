export enum EnumFormType {
  Batch,
  Create,
  Edit
}

export const FormTypeTitleMap = {
  [EnumFormType.Batch]: "新建检验要求",
  [EnumFormType.Create]: "新建检验要求",
  [EnumFormType.Edit]: "编辑检验要求"
} as const

export enum SourceType {
  Default = 1,
  ProcessInspect //来源过程检的弹窗，接口需要替换
}
export interface InspectDemandForm {
  show?: boolean
  id?: string // 更新时需要的
  status?: number
  inspectItemName?: string
  inspectItemCode?: string
  inspectItemId: string
  sampleNum?: number
  inspectRate?: number
  inspectType: number
  inspectionStandard: {
    standardType: number
    standardDesc: string
    standardMaxInclusive: number
    standardMax: number
    standardMinInclusive: number
    standardMin: number
    quantitativeMode?: "lower" | "upper" | "range"
    standardValue?: number | string | null
    upperTolerance?: number | string | null
    lowerTolerance?: number | string | null
    upperToleranceSign?: "+" | "-"
    lowerToleranceSign?: "+" | "-"
    unitId: string
  }
  productModelId: string
  techVersionId?: string
  methodDesc: string
  laboratoryId: string // 检验场所
  imageIds: string[]
  imageUrls: string[]
  pollingTrigger?: number // 巡检触发方式，0-不自动触发，1-按时间，2-按数量，默认按时间频率
  triggerAmount?: number // 巡检触发数量
  firstInspectionCondition?: number[] // 首检自动触发条件，1-换天，2-换班，3-换型，4-换单，5-更换MRO
  isSampleReturn?: boolean // 样品是否还回
  isSpc?: boolean // 是否SPC
  remark?: string // 备注
}
// 过程检类型
export enum InspectProcessTypeEnum {
  "首检" = 1,
  "首检专检" = 11,
  "巡检" = 2,
  "末检" = 3,
  "末检专检" = 13
}
// export const InspectProcessTypeList = [1, 11, 2, 3, 13]
