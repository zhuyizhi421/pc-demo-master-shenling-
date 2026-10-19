export const START_TIME = new Date(2000, 1, 1, 0, 0, 0)
export const END_TIME = new Date(2000, 1, 1, 23, 59, 59)
export const TIME_RANGE: [Date, Date] = [START_TIME, END_TIME]
export const FORMAT_TIME = "YYYY-MM-DD HH:mm:ss"
export const FORMAT_DATE = "YYYY-MM-DD"

// 获取指定日期的时间段，从开始时间00：00：00 ~ 结束时间23：59：59
export const getTimeRange = (start: number = 0, end: number = 0, type = "d") => {
  return [
    dayjs().add(start, type).format(FORMAT_DATE) + " 00:00:00",
    dayjs().add(end, type).format(FORMAT_DATE) + " 23:59:59"
  ]
}

// 获取指定日期的时间段
export const getDateRange = (start: number = 0, end: number = 0, type = "d") => {
  return [dayjs().add(start, type).format(FORMAT_DATE), dayjs().add(end, type).format(FORMAT_DATE)]
}
