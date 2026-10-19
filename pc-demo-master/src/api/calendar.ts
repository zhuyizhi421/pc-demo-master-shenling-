import axios from "axios"

import type { IRes } from "./interceptor"

interface DateInfoRes {
  calendarDate: string
  holiday: HolidayRes
  status: string
  weekDate: string
}
export async function getDateInfo(date: string) {
  const res = await axios.get<IRes<DateInfoRes>>("/calendar/date", {
    params: {
      date
    }
  })
  return res.data.data
}

export interface HolidayRes {
  endDate: string
  id: string
  startDate: string
}
export async function getHolidayList(params: { start: string; end: string }) {
  const res = await axios.get<IRes<HolidayRes[]>>("/calendar/holiday", { params })
  return res.data.data
}

interface HolidayParams {
  endDate: string
  holidayName?: string
  startDate: string
}

export async function createHoliday(params: HolidayParams) {
  const res = await axios.post<IRes>("/calendar/holiday", params)
  return res.data.data
}

export async function editHoliday(id: string, params: HolidayParams) {
  const res = await axios.put<IRes>(`/calendar/holiday/${id}`, params)
  return res.data.data
}

export async function deleteHoliday(id: string) {
  const res = await axios.delete<IRes>(`/calendar/holiday/${id}`)
  return res.data.data
}
