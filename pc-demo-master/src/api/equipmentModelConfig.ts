import axios from "axios"

import { SpotInspectionFrequency } from "@/api/operation/equipment/types"

import type { IRes } from "./interceptor"
export interface IInspectItem {
  id: string
  inspectionName: string
  method: string
  inspectionStandard: Partial<{
    precision: 0
    standardDesc: "string"
    standardMax: 0
    standardMaxInclusive: 0
    standardMin: 0
    standardMinInclusive: 0
    standardType: 0
  }>
  inspectionFrequency: SpotInspectionFrequency | number
  ngDepartmentIds: number[]
  fileIds: number[]
  fileDesc: string
  remarks: string
}

export interface IEquipmentModelConfigItemUpdate {
  equipmentModelId: string
  spotInspectItems: IInspectItem[]
  patrolInspectItems: IInspectItem[]
  maintenanceItems: IInspectItem[]
  specifications: {
    id: string
    key: string
    val: string
    desc: string
    remarks: string
  }[]
  fileIds: number[]
}

export interface IEquipmentModelConfigPagedRes {
  countId: string
  current: number
  maxLimit: number
  optimizeCountSql: boolean
  orders: {
    asc: boolean
    column: string
  }[]
  pages: number
  records: {
    createBy: number
    createTime: string
    equipmentModelId: number
    id: number
    mconfigName: string
    mconfigType: number
    mconfigValue: {
      [key: string]: any
    }
    remarks: string
    updateBy: number
    updateTime: string
  }[]
  searchCount: boolean
  size: number
  total: number
}

export interface IEquipmentModelConfigPagedParams {
  dateRange: {
    endDate: string
    startDate: string
  }
  pageQuery: {
    pageNum: number
    pageSize: number
  }
  queryParam: {
    equipmentModelId: string
    mconfigName?: string
    mconfigType: number
  }
  sort: {
    field: string
    order: string
  }[]
}

export async function getEquipmentModelConfigPaged(
  params: Partial<IEquipmentModelConfigPagedParams>
) {
  const res = await axios.post<IRes<IEquipmentModelConfigPagedRes>>(
    "/equipmentModelConfig/page",
    params
  )
  return res.data.data
}

export async function deleteEquipmentModelConfig(id: string) {
  const res = await axios.post<IRes>("/equipmentModelConfig/delete", { idList: [id] })
  return res.data.data
}

export async function editEquipmentModelConfig(params: any) {
  const res = await axios.post<IRes>("/equipmentModelConfig/update", params)
  return res.data.data
}
