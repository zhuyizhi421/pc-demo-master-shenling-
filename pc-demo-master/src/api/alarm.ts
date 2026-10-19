import axios from "axios"

import type { IAlarmModelItem, IAlarmModelParams } from "@/types/base-info/alarm"
import type { IListPageResult } from "@/types/common"

import type { IRes } from "./interceptor"

export async function getAlarmModelPaged(params: IAlarmModelParams) {
  const res = await axios.get<IRes<IListPageResult<IAlarmModelItem>>>("/alarm/model/listPaged", {
    params
  })
  return res.data.data
}

export async function getAlarmModelList(params: { modelName?: string; isEnabled?: boolean }) {
  const res = await axios.get<
    IRes<
      {
        createBy: string
        createTime: string
        id: string
        isEnabled: boolean
        modelName: string
        modelNo: string
        remarks: string
        totalLevel: number
        updateBy: number
        updateTime: string
      }[]
    >
  >("/alarm/model/list", { params })
  return res.data.data
}

export async function getAlarmModelItemById(id: string) {
  const res = await axios.get<
    IRes<
      IAlarmItem & {
        modelNo: string
        levelConfigList: any[]
        totalLevel: number
        isEnabled: boolean
        id: string
      }
    >
  >(`/alarm/model/getOneById`, { params: { alarmModelId: id } })
  return res.data.data
}

export interface IAlarmItem {
  levelConfigVOList: {
    alarmTriggerDuration: number
    isRepeatAlarm: boolean
    levelNum: number
    notifyObjectIds: number[]
    notifyObjectNames: string[]
    notifyObjectType: number // 1: 员工 2: 部门 3: 职位
    repeatAlarmInterval: number
  }[]
  modelName: string
  modelNo?: string
  remarks: string
}

export async function createAlarmModel(params: IAlarmItem) {
  const res = await axios.post<IRes<null>>("/alarm/model/create", params)
  return res.data.data
}

export async function deleteAlarmModel(id: string) {
  const res = await axios.delete<IRes<null>>(`/alarm/model/delete`, { params: { id } })
  return res.data.data
}

export async function updateAlarmModel(params: IAlarmItem & { id: string }) {
  const res = await axios.put<IRes<null>>("/alarm/model/update", params)
  return res.data.data
}

export async function abledAlarmModel(params: { id: string; newEnabledStatus: boolean }) {
  const res = await axios.put<IRes<null>>(
    `/alarm/model/updateEnabledStatus?id=${params.id}&newEnabledStatus=${params.newEnabledStatus}`
  )
  return res.data.data
}
