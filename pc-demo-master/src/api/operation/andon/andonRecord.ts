import axios from "axios"

import type { IListPageResult } from "@/types/common"
import type {
  IAndonRecordDetail,
  IAndonRecordItem,
  IAndonRecordParams
} from "@/types/maintain/andon"

import type { IRes } from "../../interceptor"

export enum EnumAndonRecordStatus {
  WAITING = 611,
  PROCESSING = 612,
  WAITING_CONFIRM = 613,
  CONFIRMED = 614
}

export enum EnumAndonFeedback {
  NO = 0,
  YES = 1,
  VIEW = 2
}
// Andon 记录类型 (631 触发 | 632 处理 | 633 确认 | 634 关闭)
export enum EnumAndonRecordType {
  TRIGGER = 631,
  PROCESS = 632,
  CONFIRM = 633,
  CLOSE = 634
}

export const andonRecordTypeToMap: Record<string, string> = {
  [EnumAndonRecordType.TRIGGER]: "Andon触发",
  [EnumAndonRecordType.PROCESS]: "Andon处理",
  [EnumAndonRecordType.CONFIRM]: "Andon确认",
  [EnumAndonRecordType.CLOSE]: "Andon关闭"
}

export const andonRecordStatusToMap: Record<string, string> = {
  [EnumAndonRecordStatus.WAITING]: "待处理",
  [EnumAndonRecordStatus.PROCESSING]: "处理中",
  [EnumAndonRecordStatus.WAITING_CONFIRM]: "待确认",
  [EnumAndonRecordStatus.CONFIRMED]: "已确认"
}

// 621 允许生产 622暂停生产 623 已解决 624 未解决
export enum AndonExecuteResult {
  ALLOW_PRODUCE = 621,
  PAUSE_PRODUCE = 622,
  SOLVED = 623,
  UNSOLVED = 624
}

export const andonExecuteResultToMap: Record<string, string> = {
  [AndonExecuteResult.ALLOW_PRODUCE]: "允许生产",
  [AndonExecuteResult.PAUSE_PRODUCE]: "暂停生产",
  [AndonExecuteResult.SOLVED]: "已解决",
  [AndonExecuteResult.UNSOLVED]: "未解决"
}

export async function getAndonRecordPaged(params: IAndonRecordParams) {
  const res = await axios.post<IRes<IListPageResult<IAndonRecordItem>>>("/andonRecord/page", params)
  return res.data.data
}

export async function getAndonRecordItemById(id: string) {
  const res = await axios.get<IRes<IAndonRecordDetail>>(`/andonRecord/${id}`)
  return res.data.data
}

export async function feedBackAndon(params: {
  andonRecordId: string
  faultDesc: string
  faultHandlerMethod: string
  faultReason: string
  mroIds: string[]
  remarks?: string
  repairEmpId: string
}) {
  const res = await axios.post<IRes<null>>("/andonRecord/andonFeedback/saveOrUpdate", params)
  return res.data.data
}

export async function getFeedbackInfo(id: string) {
  const res = await axios.get<IRes<any>>(`/andonRecord/andonFeedback/${id}`)
  return res.data.data
}

export enum EnumAndonSheetType {
  // 1Andon类型统计 2Andon次数统计 3Andon故障统计 4Andon总时长统计 5员工响应耗时统计 6员工处理耗时统计 7生产单位Andon次数统计
  ANDON_TYPE = 1,
  ANDON_COUNT = 2,
  ANDON_FAULT = 3,
  ANDON_TOTAL_TIME = 4,
  EMPLOYEE_RESPONSE_TIME = 5,
  EMPLOYEE_PROCESS_TIME = 6,
  PRODUCTION_UNIT_ANDON_COUNT = 7
}

export const AndonSheetOptions = [
  {
    label: "Andon类型统计",
    value: EnumAndonSheetType.ANDON_TYPE,
    legend: "触发次数",
    type: "amount"
  },
  {
    label: "Andon次数统计",
    value: EnumAndonSheetType.ANDON_COUNT,
    legend: "触发次数",
    type: "amount"
  },
  {
    label: "Andon故障统计",
    value: EnumAndonSheetType.ANDON_FAULT,
    legend: "故障次数【每次Andon，最近一次选择的故障】",
    type: "amount"
  },
  {
    label: "Andon总时长统计",
    value: EnumAndonSheetType.ANDON_TOTAL_TIME,
    legend: "总时长【最终解决时间-触发时间】",
    type: "interval"
  },
  {
    label: "员工响应耗时统计",
    value: EnumAndonSheetType.EMPLOYEE_RESPONSE_TIME,
    legend: "总响应时长",
    type: "interval"
  },
  {
    label: "员工处理耗时统计",
    value: EnumAndonSheetType.EMPLOYEE_PROCESS_TIME,
    legend: "总处理时长",
    type: "interval"
  },
  {
    label: "生产单位Andon次数统计",
    value: EnumAndonSheetType.PRODUCTION_UNIT_ANDON_COUNT,
    legend: "触发次数",
    type: "amount"
  }
] as const
