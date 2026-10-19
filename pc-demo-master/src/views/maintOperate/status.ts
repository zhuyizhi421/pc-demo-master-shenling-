import dayjs from "dayjs"

import { FORMAT_DATE, FORMAT_TIME } from "@/constant/time"

export const formatDateTime = (value?: string) => {
  const text = String(value || "").trim()
  if (!text) return "-"
  const parsed = dayjs(text)
  if (parsed.isValid()) {
    return parsed.format(FORMAT_TIME)
  }
  return text.replace("T", " ").replace(/(\.\d+)?Z$/, "")
}

export const formatDate = (value?: string) => {
  const text = String(value || "").trim()
  if (!text) return "-"
  const parsed = dayjs(text)
  if (parsed.isValid()) {
    return parsed.format(FORMAT_DATE)
  }
  return text.replace("T", " ").replace(/(\.\d+)?Z$/, "").slice(0, 10)
}
